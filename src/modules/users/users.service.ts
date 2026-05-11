import { prisma } from '../../config/database';
import { hashPassword, comparePassword } from '../../shared/utils/password';
import { generateRandomToken, hashToken, INVITE_TOKEN_TTL_MS, RESET_TOKEN_TTL_MS } from '../../shared/utils/token';
import { UserRole, AgencyRole } from '../../shared/types/enums';
import {
  AppError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
} from '../../shared/errors/app-error';
import { canManageRole } from '../../middleware/authorize';
import { InviteUserInput, UpdateMeInput, ChangePasswordInput, UpdateUserInput } from './users.schema';
import { parsePagination, createPaginationMeta, PaginationQuery } from '../../shared/utils/pagination';
import { sendInviteEmail, sendResetEmail } from '../../shared/services/mailer';

const USER_SAFE_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  role: true,
  isActive: true,
  forcePasswordChange: true,
  hasCompletedOnboarding: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Resolve effective role for authorization.
 * Agency admins have role='user' but agencyRole='agency_admin'.
 * We pick whichever is higher in the hierarchy.
 */
function resolveEffectiveRole(userRole: string, agencyRole?: string): string {
  const ROLE_WEIGHT: Record<string, number> = {
    [UserRole.PLATFORM_OWNER]: 10,
    [AgencyRole.AGENCY_ADMIN]: 5,
    [AgencyRole.AGENCY_MEMBER]: 2,
    [UserRole.USER]: 1,
  };
  const w1 = ROLE_WEIGHT[userRole] ?? 0;
  const w2 = agencyRole ? (ROLE_WEIGHT[agencyRole] ?? 0) : 0;
  return w2 > w1 && agencyRole ? agencyRole : userRole;
}

// ─── Get Me ──────────────────────────────────────────────────

export async function getMe(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: USER_SAFE_SELECT,
  });

  if (!user) throw new NotFoundError('Kullanıcı bulunamadı.');

  // Enrich with company roles for UI display
  const companyMemberships = await prisma.companyUser.findMany({
    where: { userId, user: { deletedAt: null } },
    include: {
      roles: { select: { role: true } },
      company: { select: { id: true, name: true, agencyId: true, deletedAt: true } },
    },
  });

  const companyRoles = companyMemberships
    .filter((m) => m.company.deletedAt === null)
    .flatMap((m) => m.roles.map((r) => r.role));

  // Deduplicate
  const uniqueCompanyRoles = [...new Set(companyRoles)];

  // Enrich with ALL agency memberships (supports multi-agency users)
  const agencyMemberships = await prisma.agencyUser.findMany({
    where: {
      userId,
      agency: { isActive: true, deletedAt: null },
    },
    select: {
      agencyId: true,
      role: true,
      agency: { select: { id: true, name: true, slug: true } },
    },
  });

  const agencies = agencyMemberships.map((m) => ({
    id: m.agency.id,
    name: m.agency.name,
    slug: m.agency.slug,
    role: m.role,
  }));

  // Primary agency: first membership or fallback from CompanyUser for clients
  let primaryAgencyId: string | null = agencies.length > 0 ? agencies[0].id : null;
  let primaryAgencyRole: string | null = agencies.length > 0 ? agencies[0].role : null;

  // Client fallback: if no AgencyUser record, resolve from CompanyUser
  if (!primaryAgencyId && companyMemberships.length > 0) {
    const activeCompany = companyMemberships.find((m) => m.company.deletedAt === null);
    if (activeCompany) {
      primaryAgencyId = activeCompany.company.agencyId;
      primaryAgencyRole = null; // Client has no agency-level role
    }
  }

  return {
    ...user,
    companyRoles: uniqueCompanyRoles,
    agencies,
    agencyId: primaryAgencyId,
    agencyRole: primaryAgencyRole,
  };
}

// ─── Update Me ───────────────────────────────────────────────

export async function updateMe(userId: string, data: UpdateMeInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: USER_SAFE_SELECT,
  });
  return user;
}

// ─── Change Password ─────────────────────────────────────────

export async function changePassword(userId: string, data: ChangePasswordInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    throw new AppError('Şifre değiştirme işlemi yapılamadı.', 400, 'NO_PASSWORD_SET');
  }

  const valid = await comparePassword(data.currentPassword, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError('Mevcut şifre hatalı.');
  }

  const newHash = await hashPassword(data.newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { 
      passwordHash: newHash,
      forcePasswordChange: false 
    },
  });

  return { message: 'Şifre başarıyla değiştirildi.' };
}

// ─── Invite User ─────────────────────────────────────────────

export async function inviteUser(data: InviteUserInput, actorRole: string, agencyId?: string, agencyRole?: string) {
  const effectiveRole = resolveEffectiveRole(actorRole, agencyRole);

  // Platform Owner kontrolü — sadece platform owner admin atayabilir
  if (data.role === UserRole.PLATFORM_OWNER && effectiveRole !== UserRole.PLATFORM_OWNER) {
    throw new ForbiddenError('Sadece Platform Owner, Admin rolü atayabilir.');
  }

  const roleToSet = data.role && Object.values(UserRole).includes(data.role as UserRole)
    ? data.role 
    : UserRole.USER;

  if (!canManageRole(effectiveRole, roleToSet)) {
    throw new ForbiddenError('Bu rolde kullanıcı davet etme yetkiniz yok.');
  }

  // E-posta kontrolü
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new ConflictError('Bu e-posta adresi zaten kullanılıyor.');
  }

  let user;
  
  if (data.tempPassword) {
    // Provision with temporary password
    const passwordHash = await hashPassword(data.tempPassword);
    
    user = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: roleToSet,
        isActive: true,
        forcePasswordChange: true,
        passwordHash,
      },
      select: USER_SAFE_SELECT,
    });
  } else {
    // Standard invite token mapping
    const rawToken = generateRandomToken();
    const tokenHash = hashToken(rawToken);

    user = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: roleToSet,
        isActive: false, // Davet kabul edilene kadar pasif
        inviteToken: tokenHash,
        inviteExpiresAt: new Date(Date.now() + INVITE_TOKEN_TTL_MS),
      },
      select: USER_SAFE_SELECT,
    });

    // Send invite email — awaited so delivery failure propagates
    await sendInviteEmail(data.email, data.firstName, rawToken);
  }

  // Auto-assign to actor's agency if agencyId is provided
  if (agencyId) {
    await prisma.agencyUser.create({
      data: {
        agencyId,
        userId: user.id,
        role: 'agency_member',
      },
    });
  }

  return { user };
}

// ─── List Users ──────────────────────────────────────────────

export async function listUsers(query: PaginationQuery, agencyId?: string) {
  const pagination = parsePagination(query);

  // If agencyId is set, only return users belonging to that agency
  if (agencyId) {
    const agencyUserIds = await prisma.agencyUser.findMany({
      where: { agencyId },
      select: { userId: true },
    });
    const userIds = agencyUserIds.map((au) => au.userId);

    const where = { id: { in: userIds }, deletedAt: null };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: USER_SAFE_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, meta: createPaginationMeta(total, pagination) };
  }

  // No agency scope — return all (platform owner)
  const where = { deletedAt: null };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: USER_SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, meta: createPaginationMeta(total, pagination) };
}

// ─── Get User By Id ──────────────────────────────────────────

export async function getUserById(id: string) {
  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: USER_SAFE_SELECT,
  });

  if (!user) throw new NotFoundError('Kullanıcı bulunamadı.');
  return user;
}

// ─── Update User ─────────────────────────────────────────────

export async function updateUser(
  targetId: string,
  data: UpdateUserInput,
  actorId: string,
  actorRole: string,
  agencyRole?: string,
) {
  if (targetId === actorId) {
    throw new ForbiddenError('Kendi hesabınızı bu endpoint ile düzenleyemezsiniz. /users/me kullanın.');
  }

  const target = await prisma.user.findFirst({
    where: { id: targetId, deletedAt: null },
  });

  if (!target) throw new NotFoundError('Kullanıcı bulunamadı.');

  const effectiveRole = resolveEffectiveRole(actorRole, agencyRole);

  if (!canManageRole(effectiveRole, target.role)) {
    throw new ForbiddenError('Bu kullanıcıyı düzenleme yetkiniz yok.');
  }

  // Yeni rol atanıyorsa, hiyerarşi kontrolü
  if (data.role && !canManageRole(effectiveRole, data.role)) {
    throw new ForbiddenError('Bu rolü atama yetkiniz yok.');
  }

  // Type-safe destructure and mapping
  const updateData: Partial<Pick<UpdateUserInput, 'firstName' | 'lastName' | 'avatarUrl' | 'role' | 'isActive'>> = {
    ...(data.firstName && { firstName: data.firstName }),
    ...(data.lastName && { lastName: data.lastName }),
    ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
    ...(data.role && { role: data.role }),
    ...(data.isActive !== undefined && { isActive: data.isActive }),
  };

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: updateData,
    select: USER_SAFE_SELECT,
  });

  return updated;
}

// ─── Deactivate User ─────────────────────────────────────────

export async function deactivateUser(targetId: string, actorId: string, actorRole: string, agencyRole?: string) {
  if (targetId === actorId) {
    throw new ForbiddenError('Kendi hesabınızı devre dışı bırakamazsınız.');
  }

  const target = await prisma.user.findFirst({
    where: { id: targetId, deletedAt: null },
  });

  if (!target) throw new NotFoundError('Kullanıcı bulunamadı.');

  const effectiveRole = resolveEffectiveRole(actorRole, agencyRole);

  if (!canManageRole(effectiveRole, target.role)) {
    throw new ForbiddenError('Bu kullanıcıyı devre dışı bırakma yetkiniz yok.');
  }

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: { isActive: false },
    select: USER_SAFE_SELECT,
  });

  // Kullanıcının tüm refresh tokenlarını sil
  await prisma.refreshToken.deleteMany({ where: { userId: targetId } });

  return updated;
}

// ─── Send Reset Password Link ────────────────────────────────

export async function sendResetLink(targetId: string, actorRole: string, agencyRole?: string) {
  const target = await prisma.user.findFirst({
    where: { id: targetId, deletedAt: null },
  });

  if (!target) throw new NotFoundError('Kullanıcı bulunamadı.');

  const effectiveRole = resolveEffectiveRole(actorRole, agencyRole);

  if (!canManageRole(effectiveRole, target.role)) {
    throw new ForbiddenError('Bu kullanıcı için şifre sıfırlama yetkiniz yok.');
  }

  const rawToken = generateRandomToken();
  const tokenHash = hashToken(rawToken);

  await prisma.user.update({
    where: { id: targetId },
    data: {
      resetToken: tokenHash,
      resetExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  // Send reset email — awaited so delivery failure propagates
  await sendResetEmail(target.email, target.firstName, rawToken);

  return { message: 'Şifre sıfırlama linki gönderildi.' };
}

// ─── Complete Onboarding ─────────────────────────────────────

export async function completeOnboarding(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { hasCompletedOnboarding: true },
  });

  return { message: 'Onboarding tamamlandı.' };
}
