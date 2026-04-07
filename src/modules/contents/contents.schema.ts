import { z } from 'zod';
import { ContentStatus } from '../../shared/types/enums';

const statusValues = [
  ContentStatus.DRAFT,
  ContentStatus.IN_REVIEW,
  ContentStatus.REVISE,
  ContentStatus.APPROVED,
  ContentStatus.SCHEDULED,
  ContentStatus.PUBLISHED,
] as const;

const statusFilterSchema = z.enum(statusValues).or(z.array(z.enum(statusValues)));
const contentsSortValues = ['created_desc', 'created_asc'] as const;
const contentsSortSchema = z.enum(contentsSortValues);

// Content schemas

export const createContentSchema = z.object({
  socialAccountId: z.string().uuid('Geçersiz sosyal hesap ID.'),
  assignedDesignerId: z.string().uuid('Geçersiz designer ID.'),
  assignedEditorId: z.string().uuid('Geçersiz editor ID.'),
  title: z.string().min(1, 'Başlık zorunludur.').max(500),
  body: z.string().nullable().optional(),
});

export const updateContentSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  body: z.string().nullable().optional(),
});

export const changeStatusSchema = z.object({
  status: z.enum(statusValues, {
    errorMap: () => ({ message: 'Geçersiz içerik durumu.' }),
  }),
  scheduledAt: z.coerce.date().optional(),
});

export const assignContentSchema = z.object({
  assignedDesignerId: z.string().uuid('Geçersiz designer ID.').optional(),
  assignedEditorId: z.string().uuid('Geçersiz editor ID.').optional(),
});

export const approveRejectSchema = z.object({
  comment: z.string().min(1, 'Yorum zorunludur.').optional(),
});

export const rejectSchema = z.object({
  comment: z.string().min(1, 'Reddetme nedeni (yorum) zorunludur.'),
});

export const addCommentSchema = z.object({
  body: z.string().min(1, 'Yorum içeriği zorunludur.'),
});

// Param schemas

export const contentIdParamSchema = z.object({
  id: z.string().uuid('Geçersiz içerik ID.'),
});

export const companyIdParamSchema = z.object({
  companyId: z.string().uuid('Geçersiz şirket ID.'),
});

// Types

export type CreateContentInput = z.infer<typeof createContentSchema>;
export type UpdateContentInput = z.infer<typeof updateContentSchema>;
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
export type AssignContentInput = z.infer<typeof assignContentSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;
export type RejectInput = z.infer<typeof rejectSchema>;

export const contentsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  perPage: z.coerce.number().int().min(1).optional(),
  status: statusFilterSchema.optional(),
  sort: contentsSortSchema.optional(),
  search: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().min(1).max(200).optional(),
  ),
});

export type ContentsListQuery = z.infer<typeof contentsListQuerySchema>;

export const calendarQuerySchema = z.object({
  companyId: z.string().uuid('Geçersiz şirket ID.').optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: statusFilterSchema.optional(),
});

export type CalendarQuery = z.infer<typeof calendarQuerySchema>;
