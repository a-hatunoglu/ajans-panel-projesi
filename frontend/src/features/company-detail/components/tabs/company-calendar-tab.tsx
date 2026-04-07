"use client";

import { useEffect, useMemo, useState } from "react";
import { addWeeks, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCompanyCalendarWeek } from "../../api/queries";
import { CompanyInlineStatePanel } from "../company-inline-state-panel";
import { CompanyCalendarDayRail } from "../company-calendar-day-rail";
import { useFormatters } from "@/lib/formatters";
import { useI18n } from "@/i18n/provider";

interface CompanyCalendarTabProps {
  companyId: string;
}

function getCurrentWeekStart() {
  return startOfWeek(new Date(), { weekStartsOn: 1 });
}

export function CompanyCalendarTab({ companyId }: CompanyCalendarTabProps) {
  const { t } = useI18n();
  const { formatWeekRange } = useFormatters();
  const [weekStart, setWeekStart] = useState(getCurrentWeekStart);

  useEffect(() => {
    setWeekStart(getCurrentWeekStart());
  }, [companyId]);

  const weekLabel = useMemo(
    () => formatWeekRange(weekStart),
    [formatWeekRange, weekStart],
  );
  const { data: days = [], isLoading, isError } = useCompanyCalendarWeek(
    companyId,
    weekStart,
  );
  const isWeekEmpty =
    !isLoading &&
    !isError &&
    days.length > 0 &&
    days.every((day) => day.items.length === 0);

  return (
    <section className="animate-in fade-in duration-500 rounded-xl border border-white/5 bg-zinc-950 p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-200">
            {t("companyDetail.calendar.title")}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            {t("companyDetail.calendar.description")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900/50 p-0.5">
            <button
              type="button"
              onClick={() => setWeekStart((current) => addWeeks(current, -1))}
              aria-label={t("companyDetail.calendar.previousWeek")}
              title={t("companyDetail.calendar.previousWeek")}
              className="p-1.5 text-zinc-400 transition-colors hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setWeekStart((current) => addWeeks(current, 1))}
              aria-label={t("companyDetail.calendar.nextWeek")}
              title={t("companyDetail.calendar.nextWeek")}
              className="p-1.5 text-zinc-400 transition-colors hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <span className="text-sm font-medium tracking-tight text-zinc-200">
            {weekLabel}
          </span>
        </div>
      </div>

      {isLoading && (
        <CompanyInlineStatePanel message={t("companyDetail.calendar.loading")} />
      )}

      {isError && (
        <CompanyInlineStatePanel
          message={t("companyDetail.calendar.error")}
        />
      )}

      {!isLoading && !isError && days.length > 0 && (
        <div className="space-y-3">
          {isWeekEmpty && (
            <CompanyInlineStatePanel
              message={t("companyDetail.calendar.emptyWeek")}
            />
          )}

          <CompanyCalendarDayRail days={days} />
        </div>
      )}
    </section>
  );
}
