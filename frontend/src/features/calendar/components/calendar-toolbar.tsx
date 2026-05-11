"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarToolbarProps {
  weekLabel: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export function CalendarToolbar({
  weekLabel,
  onPreviousWeek,
  onNextWeek,
}: CalendarToolbarProps) {
  return (
    <div className="mb-4 flex flex-col items-start justify-between gap-4 py-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900/50 p-0.5">
          <button
            type="button"
            onClick={onPreviousWeek}
            className="p-2.5 text-zinc-400 transition-colors hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNextWeek}
            className="p-2.5 text-zinc-400 transition-colors hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <span className="text-zinc-200 font-medium tracking-tight">
          {weekLabel}
        </span>
      </div>
    </div>
  );
}
