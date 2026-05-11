"use client";

import { useState, useCallback } from "react";
import { useCompaniesTrash } from "@/features/companies/api/queries";
import {
  useRestoreCompanyMutation,
  usePermanentDeleteCompanyMutation,
} from "@/features/companies/api/mutations";
import { Trash2, RotateCcw, Loader2, AlertTriangle, X } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useAuth } from "@/providers/auth-provider";
import { isPlatformOwner } from "@/lib/roles";

export function CompaniesTrashSection() {
  const { t } = useI18n();
  const { user } = useAuth();
  const canPermanentlyDelete = isPlatformOwner(user?.role);

  const { data: trashItems = [], isLoading } = useCompaniesTrash();
  const restoreMutation = useRestoreCompanyMutation();
  const permanentDeleteMutation = usePermanentDeleteCompanyMutation();

  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleRestore = useCallback(
    async (companyId: string) => {
      await restoreMutation.mutateAsync(companyId);
    },
    [restoreMutation]
  );

  const handlePermanentDelete = useCallback(async () => {
    if (!permanentDeleteTarget) return;
    try {
      await permanentDeleteMutation.mutateAsync(permanentDeleteTarget.id);
      setPermanentDeleteTarget(null);
    } catch {
      // keep dialog open on error
    }
  }, [permanentDeleteTarget, permanentDeleteMutation]);

  if (trashItems.length === 0 && !isLoading) return null;

  return (
    <>
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-3">
          <Trash2 className="w-4 h-4 text-zinc-500" />
          <h2 className="text-sm font-medium text-zinc-400">
            {t("companies.trash.title")}
          </h2>
          <span className="text-xs text-zinc-600">({trashItems.length})</span>
        </div>

        {isLoading ? (
          <div className="border border-white/5 rounded-xl bg-zinc-950 py-8 flex justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
          </div>
        ) : (
          <div className="border border-white/5 rounded-xl bg-zinc-950 flex flex-col divide-y divide-white/5 overflow-hidden">
            {trashItems.map((company) => (
              <div
                key={company.id}
                className="flex items-center justify-between px-4 py-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 flex-shrink-0 rounded-lg bg-zinc-800/50 border border-white/5 flex items-center justify-center text-xs font-medium text-zinc-500">
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-400 truncate">
                      {company.name}
                    </p>
                    <p className="text-xs text-zinc-600 truncate">
                      {company.slug}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Restore button */}
                  <button
                    type="button"
                    onClick={() => handleRestore(company.id)}
                    disabled={restoreMutation.isPending}
                    className="h-8 px-3 flex items-center gap-1.5 rounded-md border border-white/5 bg-zinc-900/50 text-xs font-medium text-zinc-400 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 disabled:opacity-50"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {t("companies.trash.restore")}
                  </button>

                  {/* Permanent delete — platform owner only */}
                  {canPermanentlyDelete && (
                    <button
                      type="button"
                      onClick={() =>
                        setPermanentDeleteTarget({
                          id: company.id,
                          name: company.name,
                        })
                      }
                      disabled={permanentDeleteMutation.isPending}
                      className="h-8 px-3 flex items-center gap-1.5 rounded-md border border-white/5 bg-zinc-900/50 text-xs font-medium text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      {t("companies.trash.permanentDelete")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permanent delete confirmation */}
      {permanentDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() =>
              !permanentDeleteMutation.isPending &&
              setPermanentDeleteTarget(null)
            }
          />
          <div className="relative w-full max-w-sm mx-4 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                </div>
                <h3 className="text-sm font-medium text-zinc-100">
                  {t("companies.trash.permanentDeleteTitle")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPermanentDeleteTarget(null)}
                disabled={permanentDeleteMutation.isPending}
                className="h-6 w-6 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="px-5 py-4">
              <p className="text-sm text-zinc-400">
                {t("companies.trash.permanentDeleteDescription", {
                  name: permanentDeleteTarget.name,
                })}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setPermanentDeleteTarget(null)}
                disabled={permanentDeleteMutation.isPending}
                className="h-8 px-3 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                {t("companies.delete.cancel")}
              </button>
              <button
                type="button"
                onClick={handlePermanentDelete}
                disabled={permanentDeleteMutation.isPending}
                className="h-8 px-3 flex items-center gap-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-500 transition-all disabled:opacity-50"
              >
                {permanentDeleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t("companies.delete.deleting")}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3 h-3" />
                    {t("companies.trash.permanentDelete")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
