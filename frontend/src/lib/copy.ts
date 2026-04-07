import { useI18n } from "@/i18n/provider";

export function useUiCopy() {
  const { messages } = useI18n();
  return messages.common;
}
