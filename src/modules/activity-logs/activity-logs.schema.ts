import { z } from 'zod';

export const listActivityLogsQuerySchema = z.object({
  page: z.string().optional(),
  perPage: z.string().optional(),
  action: z.string().optional(),
  resourceType: z.string().optional(),
});

export type ListActivityLogsQuery = z.infer<typeof listActivityLogsQuerySchema>;
