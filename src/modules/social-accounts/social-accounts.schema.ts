import { z } from 'zod';
import { SocialPlatform } from '../../shared/types/enums';

const platformValues = [
  SocialPlatform.INSTAGRAM,
  SocialPlatform.FACEBOOK,
  SocialPlatform.X,
  SocialPlatform.LINKEDIN,
  SocialPlatform.TIKTOK,
  SocialPlatform.YOUTUBE,
] as const;

export const createSocialAccountSchema = z.object({
  platform: z.enum(platformValues, {
    errorMap: () => ({ message: 'Geçerli bir platform seçiniz (instagram, facebook, x, linkedin, tiktok, youtube).' }),
  }),
  accountName: z.string().min(1, 'Hesap adı zorunludur.').max(200),
  profileUrl: z.string().url('Geçerli bir URL giriniz.').nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updateSocialAccountSchema = z.object({
  platform: z.enum(platformValues).optional(),
  accountName: z.string().min(1).max(200).optional(),
  profileUrl: z.string().url().nullable().optional(),
  notes: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const socialAccountIdParamSchema = z.object({
  id: z.string().uuid('Geçersiz hesap ID formatı.'),
});

export const companyIdParamSchema = z.object({
  id: z.string().uuid('Geçersiz şirket ID formatı.'),
});

export type CreateSocialAccountInput = z.infer<typeof createSocialAccountSchema>;
export type UpdateSocialAccountInput = z.infer<typeof updateSocialAccountSchema>;
