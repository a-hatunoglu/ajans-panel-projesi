import type { Locale } from "./config";
import type { I18nMessages } from "./messages";

export type TranslationValues = Record<string, string | number>;

export type TranslateFn = (key: string, values?: TranslationValues) => string;

export interface I18nContextValue {
  locale: Locale;
  messages: I18nMessages;
  t: TranslateFn;
  setLocale: (locale: Locale) => void;
  isChangingLocale: boolean;
}
