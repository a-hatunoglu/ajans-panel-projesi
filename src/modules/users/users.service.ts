import { prisma } from '../../config/database';
import { hashPassword, comparePassword } from '../../shared/utils/password';
import { generateRandomToken, hashToken, INVITE_TOKEN_TTL_MS, RESET_TOKEN_TTL_MS } from '../../shared/utils/token';
import { UserRole } from '../../shared/types/enums';
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
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

// ─── Get Me ──────────────────────────────────────────────────

export async function getMe(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: USER_SAFE_SELECT,
  });

  if (!user) throw new NotFoundError('Kullanıcı bulunamadı.');
  return user;
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
    data: { passwordHash: newHash },
  });

  return { message: 'Şifre başarıyla değiştirildi.' };
}

// ─── Invite User ─────────────────────────────────────────────

export async function inviteUser(data: InviteUserInput, actorRole: string) {
  // Owner davet etme yetkisi kontrolü
  if (data.role === UserRole.ADMIN && actorRole !== UserRole.OWNER) {
    throw new ForbiddenError('Sadece Owner, Admin rolü atayabilir.');
  }

  if (!canManageRole(actorRole, data.role)) {
    throw new ForbiddenError('Bu rolde kullanıcı davet etme yetkiniz yok.');
  }

  // E-posta kontrolü
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new ConflictError('Bu e-posta adresi zaten kullanılıyor.');
  }

  // Davet token'ı oluştur
  const rawToken = generateRandomToken();
  const tokenHash = hashToken(rawToken);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      isActive: false, // Davet kabul edilene kadar pasif
      inviteToken: tokenHash,
      inviteExpiresAt: new Date(Date.now() + INVITE_TOKEN_TTL_MS),
    },
    select: USER_SAFE_SELECT,
  });

  // Send invite email — awaited so delivery failure propagates
  await sendInviteEmail(data.email, data.firstName, rawToken);

  return { user };
}

// ─── List Users ──────────────────────────────────────────────

export async function listUsers(query: PaginationQuery) {
  const pagination = parsePagination(query);

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
) {
  if (targetId === actorId) {
    throw new ForbiddenError('Kendi hesabınızı bu endpoint ile düzenleyemezsiniz. /users/me kullanın.');
  }

  const target = await prisma.user.findFirst({
    where: { id: targetId, deletedAt: null },
  });

  if (!target) throw new NotFoundError('Kullanıcı bulunamadı.');

  if (!canManageRole(actorRole, target.role)) {
    throw new ForbiddenError('Bu kullanıcıyı düzenleme yetkiniz yok.');
  }

  // Yeni rol atanıyorsa, hiyerarşi kontrolü
  if (data.role && !canManageRole(actorRole, data.role)) {
    throw new ForbiddenError('Bu rolü atama yetkiniz yok.');
  }

  const updated = await prisma.user.update({
    where: { id: targetId },
    data,
    select: USER_SAFE_SELECT,
  });

  return updated;
}

// ─── Deactivate User ─────────────────────────────────────────

export async function deactivateUser(targetId: string, actorId: string, actorRole: string) {
  if (targetId === actorId) {
    throw new ForbiddenError('Kendi hesabınızı devre dışı bırakamazsınız.');
  }

  const target = await prisma.user.findFirst({
    where: { id: targetId, deletedAt: null },
  });

  if (!target) throw new NotFoundError('Kullanıcı bulunamadı.');

  if (!canManageRole(actorRole, target.role)) {
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

export async function sendResetLink(targetId: string, actorRole: string) {
  const target = await prisma.user.findFirst({
    where: { id: targetId, deletedAt: null },
  });

  if (!target) throw new NotFoundError('Kullanıcı bulunamadı.');

  if (!canManageRole(actorRole, target.role)) {
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
