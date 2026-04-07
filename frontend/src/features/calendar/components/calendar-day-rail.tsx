"use client";

import type { CalendarDay } from "../types";
import { CalendarItemCard } from "./calendar-item-card";
import { useUiCopy } from "@/lib/copy";
import { useFormatters } from "@/lib/formatters";

interface CalendarDayRailProps {
  days: CalendarDay[];
  emptyWeekMessage?: string;
}

export function CalendarDayRail({
  days,
  emptyWeekMessage,
}: CalendarDayRailProps) {
  const uiCopy = useUiCopy();
  const { formatCompactDate, formatWeekdayShort } = useFormatters();
  const isWeekEmpty = days.every((day) => day.items.length === 0);

  return (
    <div className="flex flex-col gap-3">
      {isWeekEmpty && emptyWeekMessage && (
        <div className="rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-400">
          {emptyWeekMessage}
        </div>
      )}

      <div className="grid grid-cols-1 divide-y divide-white/5 overflow-hidden rounded-xl border border-white/5 bg-zinc-950 xl:grid-cols-7 xl:divide-x xl:divide-y-0">
        {days.map((day) => (
          <div key={day.date} className="flex min-h-[150px] flex-col p-0 xl:min-h-[600px]">
            <div
              className={`flex flex-col items-center justify-center border-b border-white/5 p-3 text-center ${
                day.isToday ? "bg-zinc-900/30" : "bg-transparent"
              }`}
            >
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  day.isToday ? "text-white" : "text-zinc-500"
                }`}
              >
                {formatWeekdayShort(day.date)}
              </span>
              <span
                className={`mt-0.5 text-sm ${
                  day.isToday ? "text-primary" : "text-zinc-300"
                }`}
              >
                {formatCompactDate(day.date)}
              </span>
              {day.isToday && (
                <div className="mt-1.5 h-1 w-1 rounded-full bg-primary" />
              )}
            </div>

            <div className="no-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto bg-zinc-950 p-3">
              {day.items.map((item) => (
                <CalendarItemCard key={item.id} item={item} />
              ))}
              {day.items.length === 0 && (
                <div className="flex min-h-[72px] flex-1 items-center justify-center rounded-md border border-dashed border-white/5 bg-zinc-900/10">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                    {uiCopy.noItems}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
