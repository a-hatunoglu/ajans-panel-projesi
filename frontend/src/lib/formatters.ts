import { addDays, formatDistanceToNow } from "date-fns";
import { enUS, tr } from "date-fns/locale";
import { getIntlLocale, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

type DateValue = Date | number | string;

function toDate(value: DateValue) {
  return value instanceof Date ? value : new Date(value);
}

function getDateFnsLocale(locale: Locale) {
  return locale === "tr" ? tr : enUS;
}

function createDateFormatter(locale: Locale, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), options);
}

function formatDate(locale: Locale, value: DateValue, options: Intl.DateTimeFormatOptions) {
  return createDateFormatter(locale, options).format(toDate(value));
}

export function useFormatters() {
  const { locale } = useI18n();

  return {
    formatCompactDate(value: DateValue) {
      return formatDate(locale, value, {
        month: "short",
        day: "numeric",
      });
    },
    formatShortDate(value: DateValue) {
      return formatDate(locale, value, {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    },
    formatShortDateTime(value: DateValue) {
      return formatDate(locale, value, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: locale === "en",
      });
    },
    formatScheduleDateTime(value: DateValue) {
      return formatDate(locale, value, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: locale === "en",
      });
    },
    formatTimeOfDay(value: DateValue) {
      return formatDate(locale, value, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: locale === "en",
      });
    },
    formatRelativeTime(value: DateValue) {
      return formatDistanceToNow(toDate(value), {
        addSuffix: true,
        locale: getDateFnsLocale(locale),
      });
    },
    formatWeekRange(weekStart: Date) {
      const weekEnd = addDays(weekStart, 6);
      const startLabel = formatDate(locale, weekStart, {
        month: "short",
        day: "numeric",
      });
      const endLabel = formatDate(locale, weekEnd, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      return `${startLabel} - ${endLabel}`;
    },
    formatPaymentPeriod(periodStart: string | null, periodEnd: string | null) {
      if (!periodStart || !periodEnd) {
        return null;
      }

      const startLabel = formatDate(locale, periodStart, {
        month: "short",
        day: "2-digit",
      });
      const endLabel = formatDate(locale, periodEnd, {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });

      return `${startLabel} - ${endLabel}`;
    },
    formatCurrencyAmount(amount: number, currency: string) {
      try {
        return new Intl.NumberFormat(getIntlLocale(locale), {
          style: "currency",
          currency,
        }).format(amount);
      } catch {
        return `${amount.toFixed(2)} ${currency}`;
      }
    },
    formatWeekdayShort(value: DateValue) {
      return formatDate(locale, value, {
        weekday: "short",
      });
    },
  };
}
