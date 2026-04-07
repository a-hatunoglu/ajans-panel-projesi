"use client";

import { useEffect, useMemo, useState } from "react";
import { PageStatePanel } from "@/components/shared/page-state-panel";
import { RestrictedAccessPanel } from "@/components/shared/restricted-access-panel";
import { useAuth } from "@/providers/auth-provider";
import { PageContainer } from "@/components/shared/page-container";
import { PaymentListItem } from "@/features/payments/components/payment-list-item";
import { PaymentsFilters } from "@/features/payments/components/payments-filters";
import { ContentsPagination } from "@/features/contents/components/contents-pagination";
import { usePaymentCompanies, usePayments } from "@/features/payments/api/queries";
import type { PaymentStatus } from "@/features/payments/types";
import { useI18n } from "@/i18n/provider";

const PER_PAGE = 20;

export default function PaymentsPage() {
  const { t } = useI18n();
  const { user, isLoading: isAuthLoading } = useAuth();
  const role = user?.role || "guest";
  const canView = ["owner", "admin"].includes(role);
  const [status, setStatus] = useState<PaymentStatus | "all">("all");
  const [companyId, setCompanyId] = useState("");
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      page,
      perPage: PER_PAGE,
      status: status === "all" ? undefined : status,
      companyId: companyId || undefined,
    }),
    [companyId, page, status],
  );

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
  } = usePayments(queryParams, canView && !isAuthLoading);
  const {
    data: companyOptions = [],
    isLoading: isCompanyOptionsLoading,
  } = usePaymentCompanies(canView && !isAuthLoading);
  const payments = response?.items ?? [];
  const meta = response?.meta ?? null;

  useEffect(() => {
    if (meta && page > meta.totalPages) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  if (isAuthLoading) {
    return (
      <PageStatePanel
        title={t("payments.loadingAuthTitle")}
        description={t("payments.loadingAuthDescription")}
        className="max-w-5xl"
      />
    );
  }

  if (!canView) {
    return (
      <PageContainer className="animate-in fade-in duration-500 pb-12 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-medium tracking-tight text-white mb-1">{t("payments.pageTitle")}</h1>
          <p className="text-sm text-zinc-400">{t("payments.pageSubtitle")}</p>
        </div>
        <RestrictedAccessPanel description={t("payments.restrictedDescription")} />
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageStatePanel
        title={t("payments.loadingTitle")}
        description={t("payments.loadingDescription")}
        className="max-w-5xl"
      />
    );
  }

  if (isError && !response) {
    return (
      <PageStatePanel
        title={t("payments.errorTitle")}
        description={t("payments.errorDescription")}
        className="max-w-5xl"
      />
    );
  }

  const inlineErrorMessage =
    isError && response ? t("payments.errorDescription") : null;
  const hasActiveFilters = status !== "all" || Boolean(companyId);

  return (
    <PageContainer className="animate-in fade-in duration-500 pb-12 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-medium tracking-tight text-white mb-1">{t("payments.pageTitle")}</h1>
        <p className="text-sm text-zinc-400">{t("payments.pageSubtitle")}</p>
      </div>

      <PaymentsFilters
        companyOptions={companyOptions}
        companyValue={companyId}
        isCompanyOptionsLoading={isCompanyOptionsLoading}
        statusValue={status}
        onCompanyChange={(value) => {
          setCompanyId(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
      />

      {inlineErrorMessage && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {inlineErrorMessage}
        </div>
      )}

      <div className="border border-white/5 rounded-xl bg-zinc-950 flex flex-col divide-y divide-white/5 overflow-hidden">
        <div className="hidden sm:flex items-center justify-between py-3 px-4 bg-zinc-900/20 text-xs font-medium uppercase tracking-wide text-zinc-500">
          <div className="w-1/3 min-w-0">{t("payments.table.client")}</div>
          <div className="flex items-center gap-6 w-2/3">
            <div className="w-24">{t("payments.table.date")}</div>
            <div className="w-32">{t("payments.table.amount")}</div>
            <div className="flex-1 text-right">{t("payments.table.status")}</div>
          </div>
        </div>

        {payments.map((payment) => (
          <PaymentListItem key={payment.id} item={payment} />
        ))}

        {payments.length === 0 && (
          <div className="py-12 text-center text-sm text-zinc-500">
            {hasActiveFilters
              ? t("payments.emptyFilteredState")
              : t("payments.emptyState")}
          </div>
        )}

        {meta && meta.total > 0 && (
          <ContentsPagination
            meta={meta}
            isFetching={isFetching}
            onPageChange={setPage}
          />
        )}
      </div>
    </PageContainer>
  );
}
