import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Şirket adı zorunludur.').max(200),
  website: z.string().url('Geçerli bir URL giriniz.').nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  email: z.string().email('Geçerli bir e-posta giriniz.').nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updateCompanySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  website: z.string().url().nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  email: z.string().email().nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const companyIdParamSchema = z.object({
  id: z.string().uuid('Geçersiz şirket ID formatı.'),
});

export const addCompanyUserSchema = z.object({
  userId: z.string().uuid('Geçersiz kullanıcı ID formatı.'),
});

export const companyUserParamsSchema = z.object({
  id: z.string().uuid('Geçersiz şirket ID formatı.'),
  userId: z.string().uuid('Geçersiz kullanıcı ID formatı.'),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type AddCompanyUserInput = z.infer<typeof addCompanyUserSchema>;
