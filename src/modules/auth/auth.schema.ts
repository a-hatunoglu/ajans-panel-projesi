import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır.'),
  firstName: z.string().min(1, 'Ad zorunludur.').max(100),
  lastName: z.string().min(1, 'Soyad zorunludur.').max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
  password: z.string().min(1, 'Şifre zorunludur.'),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Davet token zorunludur.'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır.'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Sıfırlama token zorunludur.'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır.'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
