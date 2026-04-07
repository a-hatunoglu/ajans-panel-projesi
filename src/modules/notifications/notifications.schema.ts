import { z } from 'zod';

export const notificationIdParamSchema = z.object({
  id: z.string().uuid('Geçersiz bildirim ID.'),
});

const notificationReadStateSchema = z.preprocess((value) => {
  if (typeof value === 'boolean' || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === 'true') {
      return true;
    }

    if (normalizedValue === 'false') {
      return false;
    }
  }

  return value;
}, z.boolean().optional());

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  perPage: z.coerce.number().min(1).max(100).optional(),
  isRead: notificationReadStateSchema,
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
