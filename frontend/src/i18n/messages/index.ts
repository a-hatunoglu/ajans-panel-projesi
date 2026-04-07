import { FALLBACK_LOCALE, type Locale } from "../config";
import { enMessages } from "./en";
import { trMessages } from "./tr";

export type I18nMessages = typeof enMessages;

export const messagesByLocale: Record<Locale, I18nMessages> = {
  en: enMessages,
  tr: trMessages,
};

export function getMessages(locale: Locale) {
  return messagesByLocale[locale] ?? messagesByLocale[FALLBACK_LOCALE];
}
