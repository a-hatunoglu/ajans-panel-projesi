"use client";

import { Settings, X, Check, RotateCcw } from "lucide-react";
import { useI18n } from "@/i18n/provider";

interface DashboardEditBarProps {
  isEditing: boolean;
  onStartEditing: () => void;
  onSave: () => void;
  onCancel: () => void;
  onReset: () => void;
}

export function DashboardEditBar({
  isEditing,
  onStartEditing,
  onSave,
  onCancel,
  onReset,
}: DashboardEditBarProps) {
  const { t } = useI18n();

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={onStartEditing}
        data-tour="dashboard-edit"
        className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors"
        title={t("dashboard.layout.editButton")}
      >
        <Settings className="w-3.5 h-3.5" />
        {t("dashboard.layout.editButton")}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
      <span className="text-xs text-zinc-500 mr-1 hidden sm:inline">
        {t("dashboard.layout.editingLabel")}
      </span>

      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        <span className="hidden sm:inline">{t("dashboard.layout.resetButton")}</span>
      </button>

      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
      >
        <X className="w-3 h-3" />
        {t("dashboard.layout.cancelButton")}
      </button>

      <button
        type="button"
        onClick={onSave}
        className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium bg-white text-black hover:bg-zinc-200 transition-colors"
      >
        <Check className="w-3 h-3" />
        {t("dashboard.layout.saveButton")}
      </button>
    </div>
  );
}
