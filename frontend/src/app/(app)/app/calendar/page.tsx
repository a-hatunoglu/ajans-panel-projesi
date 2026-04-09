"use client";

import { useMemo, useState } from "react";
import { addWeeks, startOfWeek } from "date-fns";
import { useAuth } from "@/providers/auth-provider";
import { PageContainer } from "@/components/shared/page-container";
import { PageStatePanel } from "@/components/shared/page-state-panel";
import { CalendarToolbar } from "@/features/calendar/components/calendar-toolbar";
import { CalendarDayRail } from "@/features/calendar/components/calendar-day-rail";
import { useCalendarWeek } from "@/features/calendar/api/queries";
import { useCreateCompanyOptions } from "@/features/content-create/api/queries";
import { useFormatters } from "@/lib/formatters";
import { useI18n } from "@/i18n/provider";
import Link from "next/link";
import { CalendarX, Plus } from "lucide-react";

export default function CalendarPage() {
  const { t } = useI18n();
  const { formatWeekRange } = useFormatters();
  const { user, isLoading: isAuthLoading } = useAuth();
  const role = user?.role || "guest";
  const canCreate = ["owner", "admin", "editor", "designer"].includes(role);
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

  const { data: companies } = useCreateCompanyOptions(!isAuthLoading);
  const hasCompanies = companies ? companies.length > 0 : null;

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
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-medium tracking-tight text-white">{t("calendar.pageTitle")}</h1>
        <p className="text-sm text-zinc-400">{t("calendar.pageSubtitle")}</p>
      </div>

      {hasCompanies === false ? (
        <div className="mt-8 rounded-xl border border-white/5 bg-zinc-950 p-12 text-center flex flex-col items-center">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/5 bg-zinc-800/80">
            <CalendarX className="h-5 w-5 text-zinc-500" />
          </div>
          <h2 className="mb-2 text-xl font-medium text-zinc-100">
            {canCreate ? t("calendar.emptySetup.title") : t("calendar.emptyUser.title")}
          </h2>
          <p className="mx-auto max-w-md text-sm text-zinc-500 mb-6">
            {canCreate ? t("calendar.emptySetup.description") : t("calendar.emptyUser.description")}
          </p>
          {canCreate && (
            <Link
              href="/app/companies"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              {t("calendar.emptySetup.cta")}
            </Link>
          )}
        </div>
      ) : (
        <>
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
        </>
      )}
    </PageContainer>
  );
}
