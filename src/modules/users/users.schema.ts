import { z } from 'zod';
import { UserRole } from '../../shared/types/enums';

const validRoles = [UserRole.PLATFORM_OWNER, UserRole.USER] as const;

export const inviteUserSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
  firstName: z.string().min(1, 'Ad zorunludur.').max(100),
  lastName: z.string().min(1, 'Soyad zorunludur.').max(100),
  role: z.enum(validRoles, { errorMap: () => ({ message: 'Geçerli bir rol seçiniz (platform_owner, user).' }) }).optional().default(UserRole.USER),
  tempPassword: z.string().min(6, 'Geçici şifre en az 6 karakter olmalıdır.').optional(),
});

export const updateMeSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre zorunludur.'),
  newPassword: z.string().min(8, 'Yeni şifre en az 8 karakter olmalıdır.'),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  role: z.enum(validRoles).optional(),
  isActive: z.boolean().optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid('Geçersiz kullanıcı ID formatı.'),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type UpdateMeInput = z.infer<typeof updateMeSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
