"use client";

import React from "react";

import type { DashboardBillingItem } from "../types";
import { useFormatters } from "@/lib/formatters";
import { useI18n } from "@/i18n/provider";

export const BillingAlerts = React.memo(function BillingAlerts({
  items,
}: {
  items: DashboardBillingItem[];
}) {
  const { t } = useI18n();
  const { formatCompactDate } = useFormatters();

  if (items.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-zinc-500">
          {t("dashboard.billingEmpty")}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/[0.04] max-h-[360px] overflow-y-auto">
      {items.map((item) => (
        <div
          key={item.id}
          className="p-4 flex justify-between items-center gap-4 hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-zinc-200 truncate">
              {item.companyName}
            </span>
            <span
              className={`text-xs mt-0.5 ${
                item.status === "overdue" ? "text-red-400" : "text-zinc-500"
              }`}
            >
              {item.status === "overdue"
                ? t("dashboard.billingOverdue")
                : t("dashboard.billingDue")}{" "}
              {formatCompactDate(item.dueDate)}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {item.status === "overdue" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                {t("dashboard.billingOverdueLabel")}
              </span>
            )}
            <span className="text-sm font-semibold tabular-nums text-zinc-100">
              {item.amount.toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
              })}{" "}
              {item.currency}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
});
