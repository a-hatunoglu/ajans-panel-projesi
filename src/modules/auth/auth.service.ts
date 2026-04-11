import { prisma } from '../../config/database';
import { hashPassword, comparePassword } from '../../shared/utils/password';
import {
  generateAccessToken,
  generateRandomToken,
  hashToken,
  REFRESH_TOKEN_TTL_MS,
  RESET_TOKEN_TTL_MS,
} from '../../shared/utils/token';
import { UserRole } from '../../shared/types/enums';
import {
  AppError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '../../shared/errors/app-error';
import { RegisterInput, LoginInput, AcceptInviteInput, ResetPasswordInput, ForgotPasswordInput } from './auth.schema';
import { sendResetEmail } from '../../shared/services/mailer';
import { logActivity } from '../activity-logs/activity-logs.service';
import { ActivityAction } from '../../shared/constants/activity-actions';

// Hassas alanları hariç tutan select
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

// ─── Register (Sadece ilk Owner) ─────────────────────────────

export async function register(data: RegisterInput) {
  const existingCount = await prisma.user.count({ where: { deletedAt: null } });
  if (existingCount > 0) {
    throw new AppError(
      'Sistem zaten başlatılmış. Yeni kayıt yapılamaz.',
      400,
      'SYSTEM_ALREADY_INITIALIZED',
    );
  }

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new ConflictError('Bu e-posta adresi zaten kullanılıyor.');
  }

  const passwordHashed = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash: passwordHashed,
      firstName: data.firstName,
      lastName: data.lastName,
      role: UserRole.OWNER,
    },
    select: USER_SAFE_SELECT,
  });

  return user;
}

// ─── Login ───────────────────────────────────────────────────

interface LoginMeta {
  userAgent?: string;
  ipAddress?: string;
}

export async function login(data: LoginInput, meta: LoginMeta) {
  const user = await prisma.user.findFirst({
    where: { email: data.email, deletedAt: null },
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedError('E-posta veya şifre hatalı.');
  }

  if (!user.passwordHash) {
    throw new UnauthorizedError('Hesabınız henüz aktive edilmemiş. Davet linkini kullanın.');
  }

  const valid = await comparePassword(data.password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError('E-posta veya şifre hatalı.');
  }

  // Access token (JWT)
  const accessToken = generateAccessToken({ userId: user.id, role: user.role });

  // Refresh token (random → DB hash)
  const refreshToken = generateRandomToken();
  const refreshTokenHash = hashToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refreshTokenHash,
      userAgent: meta.userAgent ?? null,
      ipAddress: meta.ipAddress ?? null,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const { passwordHash: _ph, inviteToken: _it, inviteExpiresAt: _ie, resetToken: _rt, resetExpiresAt: _re, deletedAt: _da, ...safeUser } = user;

  await logActivity({
    userId: user.id,
    role: user.role,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent
  }, {
    action: ActivityAction.AUTH_LOGIN,
    resourceType: 'user',
    resourceId: user.id,
  });

  return { user: safeUser, accessToken, refreshToken };
}

// ─── Refresh Token ───────────────────────────────────────────

export async function refreshAccessToken(rawRefreshToken: string, meta: LoginMeta) {
  const tokenHash = hashToken(rawRefreshToken);

  const stored = await prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: {
        select: { id: true, role: true, isActive: true, deletedAt: true },
      },
    },
  });

  if (!stored || !stored.user.isActive || stored.user.deletedAt) {
    // Muhtemel token çalınması — kullanıcının tüm tokenlarını sil
    if (stored) {
      await prisma.refreshToken.deleteMany({ where: { userId: stored.userId } });
    }
    throw new UnauthorizedError('Geçersiz veya süresi dolmuş refresh token.');
  }

  // Eski token'ı sil (rotation)
  await prisma.refreshToken.delete({ where: { id: stored.id } });

  // Yeni token çifti oluştur
  const accessToken = generateAccessToken({ userId: stored.user.id, role: stored.user.role });

  const newRefreshToken = generateRandomToken();
  const newRefreshHash = hashToken(newRefreshToken);

  await prisma.refreshToken.create({
    data: {
      userId: stored.userId,
      tokenHash: newRefreshHash,
      userAgent: meta.userAgent ?? null,
      ipAddress: meta.ipAddress ?? null,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  return { accessToken, refreshToken: newRefreshToken };
}

// ─── Logout ──────────────────────────────────────────────────

export async function logout(rawRefreshToken: string | undefined) {
  if (!rawRefreshToken) return;

  const tokenHash = hashToken(rawRefreshToken);
  
  const stored = await prisma.refreshToken.findFirst({
    where: { tokenHash },
    include: { user: true }
  });

  if (stored) {
    await prisma.refreshToken.deleteMany({ where: { tokenHash } });
    
    await logActivity({
      userId: stored.userId,
      role: stored.user.role,
      ipAddress: stored.ipAddress ?? undefined,
      userAgent: stored.userAgent ?? undefined
    }, {
      action: ActivityAction.AUTH_LOGOUT,
      resourceType: 'user',
      resourceId: stored.userId,
    });
  }
}

// ─── Accept Invite ───────────────────────────────────────────

export async function acceptInvite(data: AcceptInviteInput) {
  const tokenHash = hashToken(data.token);

  const user = await prisma.user.findFirst({
    where: {
      inviteToken: tokenHash,
      inviteExpiresAt: { gt: new Date() },
      deletedAt: null,
    },
  });

  if (!user) {
    throw new NotFoundError('Geçersiz veya süresi dolmuş davet linki.');
  }

  const passwordHashed = await hashPassword(data.password);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: passwordHashed,
      inviteToken: null,
      inviteExpiresAt: null,
      isActive: true,
    },
    select: USER_SAFE_SELECT,
  });

  return updated;
}

// ─── Reset Password (Token ile) ──────────────────────────────

export async function resetPassword(data: ResetPasswordInput) {
  const tokenHash = hashToken(data.token);

  const user = await prisma.user.findFirst({
    where: {
      resetToken: tokenHash,
      resetExpiresAt: { gt: new Date() },
      deletedAt: null,
    },
  });

  if (!user) {
    throw new NotFoundError('Geçersiz veya süresi dolmuş sıfırlama linki.');
  }

  const passwordHashed = await hashPassword(data.password);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: passwordHashed,
      resetToken: null,
      resetExpiresAt: null,
    },
  });

  // Tüm refresh tokenları sil (güvenlik)
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

  return { message: 'Şifre başarıyla sıfırlandı.' };
}

// ─── Forgot Password (Self-Service) ──────────────────────────

export async function forgotPassword(data: ForgotPasswordInput) {
  const user = await prisma.user.findFirst({
    where: { email: data.email, deletedAt: null },
  });

  // Enumeration protection: always return the same generic message.
  const responseMessage = { message: 'Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama linki gönderildi.' };

  // Only proceed if user exists and is active.
  if (!user || !user.isActive) {
    return responseMessage;
  }

  const rawToken = generateRandomToken();
  const tokenHash = hashToken(rawToken);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: tokenHash,
      resetExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  await sendResetEmail(user.email, user.firstName, rawToken);

  return responseMessage;
}
