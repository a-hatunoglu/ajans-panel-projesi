"use client";

import { useCompanyUsers } from "../../api/queries";
import { CompanyInlineStatePanel } from "../company-inline-state-panel";
import { CompanyUserListItem } from "../company-user-list-item";
import { useLabels } from "@/lib/labels";
import { useI18n } from "@/i18n/provider";

interface CompanyUsersTabProps {
  companyId: string;
}

export function CompanyUsersTab({ companyId }: CompanyUsersTabProps) {
  const { t } = useI18n();
  const { getCompanyMembersLabel } = useLabels();
  const { data, isLoading, isError } = useCompanyUsers(companyId);

  return (
    <section className="animate-in fade-in duration-500 rounded-xl border border-white/5 bg-zinc-950 p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-200">
            {t("companyDetail.users.title")}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            {t("companyDetail.users.description")}
          </p>
        </div>

        {!isLoading && !isError && data && (
          <div className="text-xs text-zinc-500">
            {getCompanyMembersLabel(data.members.length)}
          </div>
        )}
      </div>

      {isLoading && (
        <CompanyInlineStatePanel message={t("companyDetail.users.loading")} />
      )}

      {isError && (
        <CompanyInlineStatePanel
          message={t("companyDetail.users.error")}
        />
      )}

      {!isLoading && !isError && data && data.members.length === 0 && (
        <CompanyInlineStatePanel message={t("companyDetail.users.empty")} />
      )}

      {!isLoading && !isError && data && data.members.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-white/5 bg-zinc-900/20">
          {data.members.map((member, index) => (
            <div
              key={member.membershipId}
              className={index === data.members.length - 1 ? "" : "border-b border-white/5"}
            >
              <CompanyUserListItem member={member} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
