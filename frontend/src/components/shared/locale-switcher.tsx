"use client";

import { LOCALE_META, SUPPORTED_LOCALES, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({
  className,
}: {
  className?: string;
}) {
  const { locale, setLocale, isChangingLocale, t } = useI18n();

  return (
    <div
      aria-label={t("common.localeSwitcherLabel")}
      className={cn("inline-flex items-center gap-1 rounded-md border border-white/5 bg-zinc-900/50 p-1", className)}
    >
      {SUPPORTED_LOCALES.map((item) => {
        const isActive = item === locale;

        return (
          <button
            key={item}
            type="button"
            onClick={() => setLocale(item as Locale)}
            disabled={isChangingLocale}
            className={cn(
              "rounded px-2 py-1 text-xs font-medium transition-colors",
              isActive ? "bg-white text-black" : "text-zinc-400 hover:text-white",
              isChangingLocale && "cursor-wait opacity-80",
            )}
          >
            {LOCALE_META[item].label}
          </button>
        );
      })}
    </div>
  );
}
