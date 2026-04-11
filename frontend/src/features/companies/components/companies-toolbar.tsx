"use client";

import { Plus } from "lucide-react";
import { useI18n } from "@/i18n/provider";

interface CompaniesToolbarProps {
  isAdmin: boolean;
  onCreateClick?: () => void;
}

export function CompaniesToolbar({ isAdmin, onCreateClick }: CompaniesToolbarProps) {
  const { t } = useI18n();

  if (!isAdmin) return null;

  return (
    <div className="flex items-center justify-end py-4 mb-4">
      <button
        type="button"
        onClick={onCreateClick}
        className="h-9 px-4 flex items-center gap-2 rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors shrink-0"
      >
        <Plus className="w-4 h-4" />
        {t("companies.toolbar.addCompany")}
      </button>
    </div>
  );
}
