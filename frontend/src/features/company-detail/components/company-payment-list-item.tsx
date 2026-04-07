"use client";

import type { CompanyPaymentItem } from "../types";
import { useFormatters } from "@/lib/formatters";
import { useLabels } from "@/lib/labels";

interface CompanyPaymentListItemProps {
  item: CompanyPaymentItem;
}

function getStatusBadge(status: CompanyPaymentItem["status"], label: string) {
  switch (status) {
    case "paid":
      return (
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-400">
          {label}
        </span>
      );
    case "pending":
      return (
        <span className="rounded-full border border-zinc-500/20 bg-zinc-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
          {label}
        </span>
      );
    case "overdue":
      return (
        <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-red-400">
          {label}
        </span>
      );
  }
}

export function CompanyPaymentListItem({
  item,
}: CompanyPaymentListItemProps) {
  const { getPaymentDisplayDateLabel, getPaymentStatusLabel } = useLabels();
  const { formatCurrencyAmount, formatPaymentPeriod, formatShortDate } =
    useFormatters();
  const statusLabel = getPaymentStatusLabel(item.status);
  const displayDateAt =
    item.status === "paid" && item.paidAt ? item.paidAt : item.dueDate;
  const periodLabel = formatPaymentPeriod(item.periodStart, item.periodEnd);

  return (
    <div className="flex w-full flex-col justify-between gap-4 p-4 text-left transition-colors hover:bg-zinc-900/40 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium tabular-nums text-zinc-100">
          {formatCurrencyAmount(item.amount, item.currency)}
        </div>
        {periodLabel && (
          <div className="mt-0.5 truncate text-xs text-zinc-500">
            {periodLabel}
          </div>
        )}
      </div>

      <div className="flex w-full shrink-0 items-center justify-between gap-4 sm:w-auto sm:justify-start sm:gap-6">
        <div className="flex w-28 shrink-0 flex-col gap-0.5 text-right sm:text-left">
          <span className="text-[10px] uppercase tracking-wide text-zinc-500">
            {getPaymentDisplayDateLabel(item.status, item.paidAt)}
          </span>
          <span className="whitespace-nowrap text-xs text-zinc-400">
            {formatShortDate(displayDateAt)}
          </span>
        </div>

        <div className="flex w-24 shrink-0 justify-end">
          {getStatusBadge(item.status, statusLabel)}
        </div>
      </div>
    </div>
  );
}
