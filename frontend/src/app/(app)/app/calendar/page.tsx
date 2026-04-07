"use client";

import { useMemo, useState } from "react";
import { addWeeks, startOfWeek } from "date-fns";
import { useAuth } from "@/providers/auth-provider";
import { PageContainer } from "@/components/shared/page-container";
import { PageStatePanel } from "@/components/shared/page-state-panel";
import { CalendarToolbar } from "@/features/calendar/components/calendar-toolbar";
import { CalendarDayRail } from "@/features/calendar/components/calendar-day-rail";
import { useCalendarWeek } from "@/features/calendar/api/queries";
import { useFormatters } from "@/lib/formatters";
import { useI18n } from "@/i18n/provider";

export default function CalendarPage() {
  const { t } = useI18n();
  const { formatWeekRange } = useFormatters();
  const { user, isLoading: isAuthLoading } = useAuth();
  const role = user?.role || "guest";
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );

  const weekLabel = useMemo(() => formatWeekRange(weekStart), [formatWeekRange, weekStart]);
  const {
    data: days,
    isLoading,
    isError,
  } = useCalendarWeek(weekStart, role, !isAuthLoading);
  const calendarDays = days ?? [];

  if (isAuthLoading || (isLoading && !days)) {
    return (
      <PageStatePanel
        title={t("calendar.loadingTitle")}
        description={t("calendar.loadingDescription")}
      />
    );
  }

  if (isError && !days) {
    return (
      <PageStatePanel
        title={t("calendar.errorTitle")}
        description={t("calendar.errorDescription")}
      />
    );
  }

  const inlineErrorMessage =
    isError && days ? t("calendar.errorDescription") : null;

  return (
    <PageContainer className="animate-in fade-in duration-500 pb-12">
      <div className="mb-2">
        <h1 className="mb-1 text-2xl font-medium tracking-tight text-white">{t("calendar.pageTitle")}</h1>
        <p className="text-sm text-zinc-400">{t("calendar.pageSubtitle")}</p>
      </div>

      <CalendarToolbar
        weekLabel={weekLabel}
        onPreviousWeek={() => setWeekStart((current) => addWeeks(current, -1))}
        onNextWeek={() => setWeekStart((current) => addWeeks(current, 1))}
      />

      {inlineErrorMessage && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {inlineErrorMessage}
        </div>
      )}

      <div className="mt-4">
        <CalendarDayRail
          days={calendarDays}
          emptyWeekMessage={t("calendar.emptyWeek")}
        />
      </div>
    </PageContainer>
  );
}
