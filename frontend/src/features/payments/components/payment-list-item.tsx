 "use client";

import { PaymentItem } from "../types";
import { useI18n } from "@/i18n/provider";
import { useLabels } from "@/lib/labels";
import { useFormatters } from "@/lib/formatters";
import { useUiCopy } from "@/lib/copy";
import { useChangePaymentStatus } from "../api/mutations";
import { CheckCircle, Loader2 } from "lucide-react";

interface PaymentListItemProps {
  item: PaymentItem;
  canManage?: boolean;
}

export function PaymentListItem({ item, canManage }: PaymentListItemProps) {
  const { t } = useI18n();
  const { getPaymentDisplayDateLabel, getPaymentStatusLabel } = useLabels();
  const { formatCurrencyAmount, formatPaymentPeriod, formatShortDate } = useFormatters();
  const uiCopy = useUiCopy();
  const statusMutation = useChangePaymentStatus();

  const getStatusDisplay = (status: PaymentItem["status"]) => {
    const label = getPaymentStatusLabel(status);

    switch (status) {
      case "paid":
        return <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 tracking-wider">{label}</span>;
      case "pending":
        return <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded-full border bg-zinc-500/10 text-zinc-400 border-zinc-500/20 tracking-wider">{label}</span>;
      case "overdue":
        return <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded-full border bg-red-500/10 text-red-400 border-red-500/20 tracking-wider">{label}</span>;
    }
  };

  const handleMarkAsPaid = () => {
    if (statusMutation.isPending) return;
    statusMutation.mutate({ paymentId: item.id, status: "paid" });
  };

  const displayDateAt = item.status === "paid" && item.paidAt ? item.paidAt : item.dueDate;
  const periodLabel = formatPaymentPeriod(item.periodStart, item.periodEnd);
  const displayDateLabel = getPaymentDisplayDateLabel(item.status, item.paidAt);
  const showMarkAsPaid = canManage && item.status !== "paid";

  return (
    <div className="w-full p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-white/5 transition-colors text-left">
      <div className="flex flex-col gap-1 sm:w-1/3 min-w-0">
        <span className="text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
          {item.companyName || uiCopy.companyUnavailable}
        </span>
        {periodLabel && (
          <span className="text-xs text-zinc-500 truncate">{periodLabel}</span>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:hidden">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            {displayDateLabel}
          </span>
          <span className="text-xs text-zinc-400">{formatShortDate(displayDateAt)}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            {t("payments.table.amount")}
          </span>
          <span className="text-sm font-medium tabular-nums text-zinc-100">
            {formatCurrencyAmount(item.amount, item.currency)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            {t("payments.table.status")}
          </span>
          <div className="flex items-center gap-2">
            {getStatusDisplay(item.status)}
            {showMarkAsPaid && (
              <button
                type="button"
                onClick={handleMarkAsPaid}
                disabled={statusMutation.isPending}
                className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
              >
                {statusMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCircle className="w-3 h-3" />
                )}
                {t("payments.markAsPaid")}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="hidden items-center justify-between gap-6 sm:flex sm:w-2/3 sm:justify-start sm:shrink-0">
        <div className="flex w-24 shrink-0 flex-col items-start gap-1">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            {displayDateLabel}
          </span>
          <span className="text-xs text-zinc-400">{formatShortDate(displayDateAt)}</span>
        </div>

        <div className="flex w-32 shrink-0 flex-col gap-1 text-right sm:items-start sm:text-left">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            {t("payments.table.amount")}
          </span>
          <span className="text-sm font-medium tabular-nums text-zinc-100">
            {formatCurrencyAmount(item.amount, item.currency)}
          </span>
        </div>

        <div className="flex flex-1 shrink-0 items-center justify-end gap-3 text-right">
          {getStatusDisplay(item.status)}
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

