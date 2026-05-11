import { z } from 'zod';

export const createAgencySchema = z.object({
  name: z.string().min(1, 'Ajans adı zorunludur.').max(200),
  slug: z.string().min(1, 'Slug zorunludur.').max(200).regex(/^[a-z0-9-]+$/, 'Slug sadece küçük harf, rakam ve tire içerebilir.'),
  email: z.string().email('Geçerli bir e-posta giriniz.').nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  website: z.string().url('Geçerli bir URL giriniz.').nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  // Admin user for the new agency
  adminEmail: z.string().email('Admin e-posta adresi geçerli olmalıdır.'),
  adminFirstName: z.string().min(1, 'Admin adı zorunludur.').max(100),
  adminLastName: z.string().min(1, 'Admin soyadı zorunludur.').max(100),
  adminPassword: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.').max(128),
});

export const updateAgencySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  website: z.string().url().nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const agencyIdParamSchema = z.object({
  id: z.string().uuid('Geçersiz ajans ID formatı.'),
});

export const addAgencyUserSchema = z.object({
  email: z.string().email('Geçerli bir e-posta giriniz.'),
  firstName: z.string().min(1, 'Ad zorunludur.').max(100),
  lastName: z.string().min(1, 'Soyad zorunludur.').max(100),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.').max(128),
  role: z.enum(['agency_admin', 'agency_member'], { required_error: 'Rol seçiniz.' }),
});

export const agencyUserParamsSchema = z.object({
  id: z.string().uuid('Geçersiz ajans ID formatı.'),
  userId: z.string().uuid('Geçersiz kullanıcı ID formatı.'),
});

export const updateAgencyUserRoleSchema = z.object({
  role: z.enum(['agency_admin', 'agency_member'], { required_error: 'Rol seçiniz.' }),
});

export type CreateAgencyInput = z.infer<typeof createAgencySchema>;
export type UpdateAgencyInput = z.infer<typeof updateAgencySchema>;
export type AddAgencyUserInput = z.infer<typeof addAgencyUserSchema>;
export type UpdateAgencyUserRoleInput = z.infer<typeof updateAgencyUserRoleSchema>;
