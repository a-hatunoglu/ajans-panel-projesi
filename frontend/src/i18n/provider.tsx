"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  LOCALE_COOKIE_NAME,
  isLocale,
  type Locale,
} from "./config";
import { getMessages, messagesByLocale } from "./messages";
import type { I18nContextValue, TranslationValues } from "./types";

const I18nContext = createContext<I18nContextValue | null>(null);

function getNestedValue(source: Record<string, unknown>, key: string): unknown {
  return key.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, source);
}

function interpolate(template: string, values?: TranslationValues) {
  if (!values) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_match, token) => {
    const value = values[token];
    return value === undefined ? `{${token}}` : String(value);
  });
}

function translate(locale: Locale, key: string, values?: TranslationValues) {
  const primary = getNestedValue(messagesByLocale[locale] as unknown as Record<string, unknown>, key);
  const fallback = getNestedValue(messagesByLocale[FALLBACK_LOCALE] as unknown as Record<string, unknown>, key);
  const resolved = typeof primary === "string" ? primary : typeof fallback === "string" ? fallback : key;

  return interpolate(resolved, values);
}

export function I18nProvider({
  initialLocale = DEFAULT_LOCALE,
  children,
}: {
  initialLocale?: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isChangingLocale, startTransition] = useTransition();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    if (!isLocale(nextLocale) || nextLocale === locale) {
      return;
    }

    document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = nextLocale;
    setLocaleState(nextLocale);

    startTransition(() => {
      router.refresh();
    });
  }, [locale, router]);

  const messages = useMemo(() => getMessages(locale), [locale]);
  const t = useCallback((key: string, values?: TranslationValues) => {
    return translate(locale, key, values);
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    messages,
    t,
    setLocale,
    isChangingLocale,
  }), [isChangingLocale, locale, messages, setLocale, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider.");
  }

  return context;
}
