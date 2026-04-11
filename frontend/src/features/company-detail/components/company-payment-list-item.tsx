"use client";

import type { CompanyPaymentItem } from "../types";
import { useFormatters } from "@/lib/formatters";
import { useLabels } from "@/lib/labels";
import { useI18n } from "@/i18n/provider";
import { useChangePaymentStatus } from "@/features/payments/api/mutations";
import { CheckCircle, Loader2 } from "lucide-react";

interface CompanyPaymentListItemProps {
  item: CompanyPaymentItem;
  canManage?: boolean;
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
  canManage,
}: CompanyPaymentListItemProps) {
  const { t } = useI18n();
  const { getPaymentDisplayDateLabel, getPaymentStatusLabel } = useLabels();
  const { formatCurrencyAmount, formatPaymentPeriod, formatShortDate } =
    useFormatters();
  const statusMutation = useChangePaymentStatus();

  const handleMarkAsPaid = () => {
    if (statusMutation.isPending) return;
    statusMutation.mutate({ paymentId: item.id, status: "paid" });
  };

  const statusLabel = getPaymentStatusLabel(item.status);
  const displayDateAt =
    item.status === "paid" && item.paidAt ? item.paidAt : item.dueDate;
  const periodLabel = formatPaymentPeriod(item.periodStart, item.periodEnd);
  const showMarkAsPaid = canManage && item.status !== "paid";

  return (
    <div className="group flex w-full flex-col justify-between gap-4 p-4 text-left transition-colors hover:bg-zinc-900/40 sm:flex-row sm:items-center">
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

        <div className="flex flex-1 shrink-0 items-center justify-end gap-3 text-right">
          {getStatusBadge(item.status, statusLabel)}
          {showMarkAsPaid && (
            <button
              type="button"
              onClick={handleMarkAsPaid}
              disabled={statusMutation.isPending}
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-emerald-400 transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
            >
              {statusMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5" />
              )}
              {t("payments.markAsPaid")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
