"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { PageContainer } from "@/components/shared/page-container";
import { CompaniesToolbar } from "@/features/companies/components/companies-toolbar";
import { CompanyListItem } from "@/features/companies/components/company-list-item";
import { CreateCompanyDialog } from "@/features/companies/components/create-company-dialog";
import { CompaniesTrashSection } from "@/features/companies/components/companies-trash-section";
import { useCompanies } from "@/features/companies/api/queries";
import { canManageCompanies } from "@/lib/roles";
import { Loader2, Building2, Plus } from "lucide-react";
import { useI18n } from "@/i18n/provider";

export default function CompaniesPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const role = user?.role || "guest";
  const agencyRole = user?.agencyRole || undefined;
  const isAdmin = canManageCompanies(role, agencyRole ?? undefined);
  const { data: companies = [], isLoading, isError } = useCompanies();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreateClick = useCallback(() => {
    setCreateDialogOpen(true);
  }, []);

  const handleCreateClose = useCallback(() => {
    setCreateDialogOpen(false);
  }, []);

  const handleCreateSuccess = useCallback(
    (companyId: string) => {
      setCreateDialogOpen(false);
      router.push(`/app/companies/${companyId}`);
    },
    [router]
  );


  return (
    <PageContainer className="animate-in fade-in duration-500 pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-medium tracking-tight text-white mb-1">{t("companies.pageTitle")}</h1>
        <p className="text-sm text-zinc-400">{t("companies.pageSubtitle")}</p>
      </div>

      <CompaniesToolbar isAdmin={isAdmin} onCreateClick={handleCreateClick} />

      {/* ── Mutually exclusive primary state ─────────────────── */}

      {/* Loading */}
      {isLoading && (
        <div className="border border-white/5 rounded-xl bg-zinc-950 py-12 flex justify-center text-zinc-500">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      )}

      {/* Error */}
      {!isLoading && isError && (
        <div className="border border-white/5 rounded-xl bg-zinc-950 py-12 text-center">
          <p className="text-sm text-red-500">{t("companies.errorDescription")}</p>
        </div>
      )}

      {/* Empty — owner/admin bootstrap CTA */}
      {!isLoading && !isError && companies.length === 0 && isAdmin && (
        <div className="border border-white/5 rounded-xl bg-zinc-950 py-16 px-6 flex flex-col items-center text-center animate-in fade-in duration-300">
          <div className="h-12 w-12 rounded-xl bg-zinc-800/80 border border-white/5 flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-zinc-500" />
          </div>
          <h3 className="text-sm font-medium text-zinc-200 mb-1">
            {t("companies.emptyAdmin.title")}
          </h3>
          <p className="text-xs text-zinc-500 max-w-xs mb-6">
            {t("companies.emptyAdmin.description")}
          </p>
          <button
            type="button"
            onClick={handleCreateClick}
            className="h-9 px-4 flex items-center gap-2 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition-all"
          >
            <Plus className="w-4 h-4" />
            {t("companies.emptyAdmin.cta")}
          </button>
        </div>
      )}

      {/* Empty — non-admin */}
      {!isLoading && !isError && companies.length === 0 && !isAdmin && (
        <div className="border border-white/5 rounded-xl bg-zinc-950 py-16 px-6 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-xl bg-zinc-800/80 border border-white/5 flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-zinc-500" />
          </div>
          <p className="text-sm text-zinc-500">{t("companies.emptyState")}</p>
        </div>
      )}

      {/* Populated list */}
      {!isLoading && !isError && companies.length > 0 && (
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

          {companies.map((company) => (
            <CompanyListItem key={company.id} company={company} />
          ))}
        </div>
      )}

      {/* Create company dialog */}
      <CreateCompanyDialog
        open={createDialogOpen}
        onClose={handleCreateClose}
        onSuccess={handleCreateSuccess}
      />

      {/* Trash section — only for owner/admin */}
      {isAdmin && <CompaniesTrashSection />}
    </PageContainer>
  );
}
