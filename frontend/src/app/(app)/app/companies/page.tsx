"use client";

import { useAuth } from "@/providers/auth-provider";
import { PageContainer } from "@/components/shared/page-container";
import { CompaniesToolbar } from "@/features/companies/components/companies-toolbar";
import { CompanyListItem } from "@/features/companies/components/company-list-item";
import { useCompanies } from "@/features/companies/api/queries";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/provider";

export default function CompaniesPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const role = user?.role || "guest";
  const isAdmin = ["owner", "admin"].includes(role);
  const { data: companies = [], isLoading, isError } = useCompanies();

  return (
    <PageContainer className="animate-in fade-in duration-500 pb-12">
      <div className="mb-2">
        <h1 className="text-2xl font-medium tracking-tight text-white mb-1">{t("companies.pageTitle")}</h1>
        <p className="text-sm text-zinc-400">{t("companies.pageSubtitle")}</p>
      </div>

      <CompaniesToolbar isAdmin={isAdmin} />

      <div className="border border-white/5 rounded-xl bg-zinc-950 flex flex-col divide-y divide-white/5 overflow-hidden">
        <div className="hidden sm:flex items-center gap-8 py-3 px-4 bg-zinc-900/20 text-xs font-medium uppercase tracking-wide text-zinc-500">
          <div className="w-[35%]">{t("companies.table.company")}</div>
          <div className="w-[50%] flex gap-8">
            <div className="w-20">{t("companies.table.status")}</div>
            <div className="w-32">{t("companies.table.website")}</div>
            <div>{t("companies.table.team")}</div>
          </div>
          <div className="w-[15%] text-right"></div>
        </div>

        {isLoading && (
          <div className="py-12 flex justify-center text-zinc-500">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}

        {isError && (
          <div className="py-12 text-center">
            <p className="text-sm text-red-500">{t("companies.errorDescription")}</p>
          </div>
        )}

        {!isLoading && !isError && companies.map((company) => (
          <CompanyListItem
            key={company.id}
            company={company}
          />
        ))}

        {!isLoading && !isError && companies.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-zinc-500">{t("companies.emptyState")}</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
