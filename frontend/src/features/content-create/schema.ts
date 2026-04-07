import { z } from "zod";
import type { TranslateFn } from "@/i18n/types";

export function createContentCreateSchema(t: TranslateFn) {
  return z.object({
    companyId: z.string().uuid(t("contentCreate.validation.company")),
    socialAccountId: z.string().uuid(t("contentCreate.validation.socialAccount")),
    title: z
      .string()
      .trim()
      .min(1, t("contentCreate.validation.titleRequired"))
      .max(500, t("contentCreate.validation.titleMax")),
    body: z.string(),
    assignedDesignerId: z.string().uuid(t("contentCreate.validation.assignedDesigner")),
    assignedEditorId: z.string().uuid(t("contentCreate.validation.assignedEditor")),
  });
}

export type ContentCreateSchema = ReturnType<typeof createContentCreateSchema>;
