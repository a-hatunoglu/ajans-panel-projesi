"use client";

import { Company } from "../types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { useLabels } from "@/lib/labels";

interface CompanyListItemProps {
  company: Company;
}

function getStatusBadge(isActive: boolean, label: string) {
  if (isActive) {
    return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{label}</span>;
  }

  return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-zinc-500/10 text-zinc-400 border-zinc-500/20">{label}</span>;
}

export function CompanyListItem({ company }: CompanyListItemProps) {
  const { t } = useI18n();
  const { getCompanyMembersLabel, getCompanyStatusLabel } = useLabels();
  const websiteLabel = company.website || "-";
  const statusLabel = getCompanyStatusLabel(company.isActive);

  return (
    <Link
      href={`/app/companies/${company.id}`}
      className="w-full p-4 flex flex-col sm:flex-row sm:items-center gap-4 group hover:bg-zinc-900/40 transition-colors text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
    >
      <div className="flex items-center gap-3 w-full sm:w-[35%] min-w-0">
        <div className="h-10 w-10 flex-shrink-0 rounded-md bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-500 font-medium">
          {company.logoUrl ? null : company.name.charAt(0)}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-zinc-100 truncate group-hover:text-white transition-colors">
            {company.name}
          </span>
          <span className="text-xs text-zinc-500 truncate">{t("companies.list.slug")}: {company.slug}</span>
        </div>
      </div>

      <div className="flex items-center gap-6 sm:gap-8 w-full sm:w-[50%]">
        <div className="w-20">
          {getStatusBadge(company.isActive, statusLabel)}
        </div>

        <div className="w-32">
          <span className="text-xs font-medium text-zinc-300 truncate block">
            {websiteLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5 min-w-[100px]">
          <span className="text-xs text-zinc-400">{getCompanyMembersLabel(company._count.companyUsers)}</span>
        </div>
      </div>

      <div className="hidden sm:flex items-center justify-end w-[15%] gap-2 shrink-0">
        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </div>
    </Link>
  );
}
