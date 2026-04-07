"use client";

import type { ChangeEvent } from "react";
import type { PaymentCompanyOption, PaymentStatus } from "../types";
import { useLabels } from "@/lib/labels";
import { useI18n } from "@/i18n/provider";

type PaymentsStatusValue = PaymentStatus | "all";

interface PaymentsFiltersProps {
  companyOptions: PaymentCompanyOption[];
  companyValue: string;
  isCompanyOptionsLoading: boolean;
  statusValue: PaymentsStatusValue;
  onCompanyChange: (companyId: string) => void;
  onStatusChange: (status: PaymentsStatusValue) => void;
}

const STATUS_OPTIONS: PaymentStatus[] = ["pending", "paid", "overdue"];

export function PaymentsFilters({
  companyOptions,
  companyValue,
  isCompanyOptionsLoading,
  statusValue,
  onCompanyChange,
  onStatusChange,
}: PaymentsFiltersProps) {
  const { t } = useI18n();
  const { getPaymentStatusLabel } = useLabels();

  function handleCompanyChange(event: ChangeEvent<HTMLSelectElement>) {
    onCompanyChange(event.target.value);
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    onStatusChange(event.target.value as PaymentsStatusValue);
  }

  return (
    <div className="mb-4 flex flex-col gap-3 py-4 md:flex-row md:items-center">
      <select
        value={companyValue}
        onChange={handleCompanyChange}
        className="h-9 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary md:w-56"
        aria-label={t("payments.filters.client")}
        disabled={isCompanyOptionsLoading && companyOptions.length === 0}
      >
        <option value="">{t("payments.filters.allClients")}</option>
        {companyOptions.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </select>

      <select
        value={statusValue}
        onChange={handleStatusChange}
        className="h-9 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary md:w-44"
        aria-label={t("payments.filters.status")}
      >
        <option value="all">{t("payments.filters.allStatuses")}</option>
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {getPaymentStatusLabel(status)}
          </option>
        ))}
      </select>
    </div>
  );
}
