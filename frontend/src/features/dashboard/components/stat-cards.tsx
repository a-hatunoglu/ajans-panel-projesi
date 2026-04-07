"use client";

import type { StatItem } from "../types";
import { useI18n } from "@/i18n/provider";

export function StatCards({ stats }: { stats: StatItem[] }) {
  const { t } = useI18n();
  const statLabels: Record<StatItem["id"], string> = {
    "needs-attention": t("dashboard.stats.needsAttention"),
    "upcoming-schedule": t("dashboard.stats.upcomingSchedule"),
    "active-companies": t("dashboard.stats.activeCompanies"),
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="flex flex-col justify-between rounded-xl border border-white/5 bg-zinc-900/50 p-5"
        >
          <div className="text-sm text-zinc-400">{statLabels[stat.id]}</div>
          <div className="mt-2 text-2xl font-medium tabular-nums text-zinc-100">
            {stat.value ?? "--"}
          </div>
          {stat.value === null && (
            <div className="mt-1 text-xs text-zinc-500">
              {t("dashboard.stats.unavailable")}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
