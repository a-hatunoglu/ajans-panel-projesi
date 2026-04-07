import { z } from "zod";
import type { TranslateFn } from "@/i18n/types";

export function createContentEditSchema(t: TranslateFn) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(1, t("contentEdit.validation.titleRequired"))
      .max(500, t("contentEdit.validation.titleMax")),
    body: z.string(),
  });
}

export type ContentEditSchema = ReturnType<typeof createContentEditSchema>;
