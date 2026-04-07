import { z } from "zod";
import type { TranslateFn } from "@/i18n/types";

export function createContentScheduleSchema(t: TranslateFn) {
  return z.object({
    scheduledAt: z
      .string()
      .trim()
      .min(1, t("contentSchedule.validation.scheduledAtRequired"))
      .refine((value) => !Number.isNaN(new Date(value).getTime()), {
        message: t("contentSchedule.validation.scheduledAtInvalid"),
      }),
  });
}

export type ContentScheduleSchema = ReturnType<typeof createContentScheduleSchema>;
export type ContentScheduleFormValues = z.infer<ContentScheduleSchema>;
