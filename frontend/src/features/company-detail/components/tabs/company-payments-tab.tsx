"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useAuth } from "@/providers/auth-provider"
import { canManageCompanies } from "@/lib/roles";
import { useCompanyPayments, useCompanyDetail } from "../../api/queries";
import { CompanyInlineStatePanel } from "../company-inline-state-panel";
import { CompanyPaymentListItem } from "../company-payment-list-item";
import { ContentsPagination } from "@/features/contents/components/contents-pagination";
import { useI18n } from "@/i18n/provider";

const CreatePaymentDialog = dynamic(
  () => import("@/features/payments/components/create-payment-dialog").then((m) => m.CreatePaymentDialog),
  { ssr: false }
);

interface CompanyPaymentsTabProps {
  companyId: string;
}

export function CompanyPaymentsTab({ companyId }: CompanyPaymentsTabProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const canManage = canManageCompanies(user?.role, user?.agencyRole ?? undefined);

  const [page, setPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: companyData } = useCompanyDetail(companyId);
  const { data, isLoading, isFetching, isError } = useCompanyPayments(
    companyId,
    page,
  );

  useEffect(() => {
    setPage(1);
  }, [companyId]);

  return (
    <section className="animate-in fade-in duration-500 rounded-xl border border-white/5 bg-zinc-950 p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-200">
            {t("companyDetail.payments.title")}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            {t("companyDetail.payments.description")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canManage && (
            <button
              type="button"
              onClick={() => setCreateDialogOpen(true)}
              className="h-9 px-4 flex items-center gap-2 rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              {t("payments.create.title", { defaultValue: "Yeni Ödeme" })}
            </button>
          )}
        </div>
      </div>

      {isLoading && (
        <CompanyInlineStatePanel
          message={t("companyDetail.payments.loading")}
        />
      )}

      {isError && (
        <CompanyInlineStatePanel
          message={t("companyDetail.payments.error")}
        />
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <CompanyInlineStatePanel message={t("companyDetail.payments.empty")} />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-white/5 bg-zinc-900/20">
          {data.items.map((item, index) => (
            <div
              key={item.id}
              className={index === data.items.length - 1 ? "" : "border-b border-white/5"}
            >
              <CompanyPaymentListItem item={item} canManage={canManage} />
            </div>
          ))}

          <div className="border-t border-white/5">
            <ContentsPagination
              meta={data.meta}
              isFetching={isFetching}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {canManage && companyData && (
        <CreatePaymentDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onSuccess={() => setCreateDialogOpen(false)}
          fixedCompany={{ id: companyId, name: companyData.name }}
        />
      )}
    </section>
  );
}
