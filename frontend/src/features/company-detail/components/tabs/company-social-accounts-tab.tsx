"use client";

import { useCompanySocialAccounts } from "../../api/queries";
import { CompanyInlineStatePanel } from "../company-inline-state-panel";
import { CompanySocialAccountListItem } from "../company-social-account-list-item";
import { useI18n } from "@/i18n/provider";

interface CompanySocialAccountsTabProps {
  companyId: string;
}

export function CompanySocialAccountsTab({
  companyId,
}: CompanySocialAccountsTabProps) {
  const { t } = useI18n();
  const { data, isLoading, isError } = useCompanySocialAccounts(companyId);

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

        {!isLoading && !isError && data && (
          <div className="text-xs text-zinc-500">
            {t("companyDetail.social.connectedCount", {
              count: data.accounts.length,
            })}
          </div>
        )}
      </div>

      {isLoading && (
        <CompanyInlineStatePanel message={t("companyDetail.social.loading")} />
      )}

      {isError && (
        <CompanyInlineStatePanel
          message={t("companyDetail.social.error")}
        />
      )}

      {!isLoading && !isError && data && data.accounts.length === 0 && (
        <CompanyInlineStatePanel message={t("companyDetail.social.empty")} />
      )}

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
    </section>
  );
}
