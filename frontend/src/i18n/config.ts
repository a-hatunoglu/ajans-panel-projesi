export const SUPPORTED_LOCALES = ["tr", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "tr";
export const FALLBACK_LOCALE: Locale = "en";
export const LOCALE_COOKIE_NAME = "agency-locale";

export const LOCALE_META: Record<Locale, { intl: string; label: string; languageName: string }> = {
  tr: {
    intl: "tr-TR",
    label: "TR",
    languageName: "Turkce",
  },
  en: {
    intl: "en-US",
    label: "EN",
    languageName: "English",
  },
};

export function isLocale(value: string | null | undefined): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function normalizeLocale(value: string | null | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function getIntlLocale(locale: Locale) {
  return LOCALE_META[locale].intl;
}
