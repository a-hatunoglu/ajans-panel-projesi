import { z } from 'zod';

const paymentStatusValues = ['pending', 'paid', 'overdue'] as const;
const paymentStatusSchema = z.enum(paymentStatusValues);

export const paymentIdParamSchema = z.object({
  id: z.string().uuid('Geçerli bir UUID girmelisiniz.'),
});

export const paymentCompanyIdParamSchema = z.object({
  companyId: z.string().uuid('Geçerli bir UUID girmelisiniz.'),
});

export const createPaymentSchema = z.object({
  amount: z.number().positive('Ödeme tutarı pozitif olmalıdır.'),
  currency: z.string().length(3).default('TRY'),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
  dueDate: z.coerce.date(),
  notes: z.string().optional(),
});

export const updatePaymentSchema = z.object({
  amount: z.number().positive('Ödeme tutarı pozitif olmalıdır.').optional(),
  currency: z.string().length(3).optional(),
  periodStart: z.coerce.date().nullable().optional(),
  periodEnd: z.coerce.date().nullable().optional(),
  dueDate: z.coerce.date().optional(),
  notes: z.string().nullable().optional(),
});

export const changePaymentStatusSchema = z.object({
  status: paymentStatusSchema,
  paidAt: z.coerce.date().optional(),
});

export const paymentsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  perPage: z.coerce.number().int().min(1).optional(),
  status: paymentStatusSchema.optional(),
  companyId: z.string().uuid('Geçerli bir UUID girmelisiniz.').optional(),
});

export type PaymentsListQuery = z.infer<typeof paymentsListQuerySchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type ChangePaymentStatusInput = z.infer<typeof changePaymentStatusSchema>;
