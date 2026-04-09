"use client";

import { Search, Filter, Plus } from "lucide-react";
import { useUiCopy } from "@/lib/copy";
import { useI18n } from "@/i18n/provider";

interface CompaniesToolbarProps {
  isAdmin: boolean;
  onCreateClick?: () => void;
}

export function CompaniesToolbar({ isAdmin, onCreateClick }: CompaniesToolbarProps) {
  const uiCopy = useUiCopy();
  const { t } = useI18n();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 mb-4">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            disabled
            placeholder={uiCopy.searchUnavailable}
            className="h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/50 pl-9 pr-4 text-sm text-zinc-500 placeholder:text-zinc-500 transition-colors cursor-not-allowed opacity-70"
          />
        </div>
        <button
          type="button"
          disabled
          title={uiCopy.disabledActionTitle}
          className="h-9 px-3 flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/50 text-sm font-medium text-zinc-500 transition-colors shrink-0 cursor-not-allowed opacity-70"
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">{t("companies.toolbar.filter")}</span>
        </button>
      </div>

      {isAdmin && (
        <button
          type="button"
          onClick={onCreateClick}
          className="h-9 px-4 flex items-center gap-2 rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          {t("companies.toolbar.addCompany")}
        </button>
      )}
    </div>
  );
}
