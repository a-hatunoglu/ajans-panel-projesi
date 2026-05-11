"use client";

import { useState, useCallback } from "react";
import { Plus, Share2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useAuth } from "@/providers/auth-provider"
import { canManageCompanies } from "@/lib/roles";;
import { useCompanySocialAccounts } from "../../api/queries";
import { CompanyInlineStatePanel } from "../company-inline-state-panel";
import { CompanySocialAccountListItem } from "../company-social-account-list-item";
import { useI18n } from "@/i18n/provider";

const CreateSocialAccountDialog = dynamic(
  () => import("../create-social-account-dialog").then((m) => m.CreateSocialAccountDialog),
  { ssr: false }
);

interface CompanySocialAccountsTabProps {
  companyId: string;
}

export function CompanySocialAccountsTab({
  companyId,
}: CompanySocialAccountsTabProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const role = user?.role || "guest";
  const canCreate = canManageCompanies(user?.role, user?.agencyRole ?? undefined);
  const { data, isLoading, isError } = useCompanySocialAccounts(companyId);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreateClick = useCallback(() => {
    setCreateDialogOpen(true);
  }, []);

  const handleCreateClose = useCallback(() => {
    setCreateDialogOpen(false);
  }, []);

  const isEmpty = !isLoading && !isError && data && data.accounts.length === 0;

  return (
    <section className="animate-in fade-in duration-500 rounded-xl border border-white/5 bg-zinc-950 p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-200">
            {t("companyDetail.social.title")}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            {t("companyDetail.social.description")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isLoading && !isError && data && (
            <div className="text-xs text-zinc-500">
              {t("companyDetail.social.connectedCount", {
                count: data.accounts.length,
              })}
            </div>
          )}

          {canCreate && (
            <button
              type="button"
              onClick={handleCreateClick}
              className="h-9 px-4 flex items-center gap-2 rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              {t("companyDetail.social.create.cta")}
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <CompanyInlineStatePanel message={t("companyDetail.social.loading")} />
      )}

      {/* Error */}
      {!isLoading && isError && (
        <CompanyInlineStatePanel message={t("companyDetail.social.error")} />
      )}

      {/* Empty — admin CTA */}
      {isEmpty && canCreate && (
        <div className="rounded-xl border border-white/5 bg-zinc-950 p-12 text-center flex flex-col items-center">
          <div className="h-10 w-10 rounded-lg bg-zinc-800/80 border border-white/5 flex items-center justify-center mb-4">
            <Share2 className="w-5 h-5 text-zinc-500" />
          </div>
          <h2 className="mb-2 text-lg font-medium text-zinc-100">
            {t("companyDetail.social.emptyAdmin.title")}
          </h2>
          <p className="mx-auto max-w-md text-sm text-zinc-500 mb-6">
            {t("companyDetail.social.emptyAdmin.description")}
          </p>
          <button
            type="button"
            onClick={handleCreateClick}
            className="h-9 px-4 flex items-center gap-2 rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-all"
          >
            <Plus className="w-4 h-4" />
            {t("companyDetail.social.create.cta")}
          </button>
        </div>
      )}

      {/* Empty — non-admin */}
      {isEmpty && !canCreate && (
        <CompanyInlineStatePanel message={t("companyDetail.social.empty")} />
      )}

      {/* Populated list */}
      {!isLoading && !isError && data && data.accounts.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-white/5 bg-zinc-900/20">
          {data.accounts.map((account, index) => (
            <div
              key={account.id}
              className={index === data.accounts.length - 1 ? "" : "border-b border-white/5"}
            >
              <CompanySocialAccountListItem account={account} />
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <CreateSocialAccountDialog
        companyId={companyId}
        open={createDialogOpen}
        onClose={handleCreateClose}
      />
    </section>
  );
}
