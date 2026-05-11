"use client";

import { useState } from "react";
import { Trash2, Loader2, X, AlertTriangle } from "lucide-react";
import { useI18n } from "@/i18n/provider";

interface DeleteCompanyDialogProps {
  open: boolean;
  companyName: string;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function DeleteCompanyDialog({
  open,
  companyName,
  onClose,
  onConfirm,
  isPending,
}: DeleteCompanyDialogProps) {
  const { t } = useI18n();
  const [confirmText, setConfirmText] = useState("");

  if (!open) return null;

  const isConfirmed = confirmText.trim().toLowerCase() === companyName.trim().toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={isPending ? undefined : onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md mx-4 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-zinc-100">
                {t("companies.delete.title")}
              </h2>
              <p className="text-xs text-zinc-500">
                {t("companies.delete.subtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="h-7 w-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <p className="text-sm text-zinc-400">
            {t("companies.delete.description", { name: companyName })}
          </p>

          <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-300/80">
            {t("companies.delete.warning")}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500">
              {t("companies.delete.confirmLabel", { name: companyName })}
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isPending}
              placeholder={companyName}
              className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="h-9 px-4 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
          >
            {t("companies.delete.cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!isConfirmed || isPending}
            className="h-9 px-4 flex items-center gap-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {t("companies.delete.deleting")}
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                {t("companies.delete.confirm")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
