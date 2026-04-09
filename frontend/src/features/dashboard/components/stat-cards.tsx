"use client";

import type { StatItem } from "../types";
import { useI18n } from "@/i18n/provider";
import { AlertCircle, Calendar, Building2 } from "lucide-react";

export function StatCards({ stats }: { stats: StatItem[] }) {
  const { t } = useI18n();
  const statLabels: Record<StatItem["id"], string> = {
    "needs-attention": t("dashboard.stats.needsAttention"),
    "upcoming-schedule": t("dashboard.stats.upcomingSchedule"),
    "active-companies": t("dashboard.stats.activeCompanies"),
  };
  
  const statIcons: Record<StatItem["id"], React.ReactNode> = {
    "needs-attention": <AlertCircle className="w-4 h-4" />,
    "upcoming-schedule": <Calendar className="w-4 h-4" />,
    "active-companies": <Building2 className="w-4 h-4" />,
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="flex flex-col justify-between rounded-xl border border-white/5 bg-zinc-900/50 p-5"
        >
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            {statIcons[stat.id]}
            <span>{statLabels[stat.id]}</span>
          </div>
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
