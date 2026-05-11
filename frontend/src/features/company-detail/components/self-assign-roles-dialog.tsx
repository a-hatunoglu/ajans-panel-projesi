"use client";

import { useState, useCallback } from "react";
import { X, Loader2, UserCog } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useUpdateCompanyUserRolesMutation } from "../api/mutations";

interface SelfAssignRolesDialogProps {
  companyId: string;
  userId: string;
  userName: string;
  currentRoles: string[];
  open: boolean;
  onClose: () => void;
}

const OPERATIONAL_ROLES = ["editor", "designer", "client"] as const;

export function SelfAssignRolesDialog({
  companyId,
  userId,
  userName,
  currentRoles,
  open,
  onClose,
}: SelfAssignRolesDialogProps) {
  const { t } = useI18n();
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    currentRoles.length > 0 ? currentRoles : ["editor", "designer"]
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const mutation = useUpdateCompanyUserRolesMutation(companyId);

  const toggleRole = useCallback((role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }, []);

  const handleClose = useCallback(() => {
    if (mutation.isPending) return;
    setSubmitError(null);
    onClose();
  }, [mutation.isPending, onClose]);

  const handleConfirm = useCallback(async () => {
    if (selectedRoles.length === 0) return;
    setSubmitError(null);

    try {
      await mutation.mutateAsync({ userId, roles: selectedRoles });
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t("companyDetail.users.selfAssign.error");
      setSubmitError(message);
    }
  }, [selectedRoles, mutation, userId, onClose, t]);

  if (!open) return null;

  const roleLabels: Record<string, string> = {
    editor: t("companyDetail.editUser.form.roles.editor"),
    designer: t("companyDetail.editUser.form.roles.designer"),
    client: t("companyDetail.editUser.form.roles.client"),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md mx-4 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <UserCog className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-zinc-100">
                {t("companyDetail.users.selfAssign.title")}
              </h2>
              <p className="text-xs text-zinc-500">{userName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={mutation.isPending}
            className="h-7 w-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {submitError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-500 font-medium">
              {submitError}
            </div>
          )}

          <p className="text-sm text-zinc-400">
            {t("companyDetail.users.selfAssign.description")}
          </p>

          {/* Role checkboxes */}
          <div className="flex flex-col gap-2">
            {OPERATIONAL_ROLES.map((role) => (
              <label
                key={role}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-zinc-900/20 px-4 py-3 cursor-pointer hover:bg-zinc-900/40 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role)}
                  onChange={() => toggleRole(role)}
                  disabled={mutation.isPending}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span className="text-sm text-zinc-200">
                  {roleLabels[role] || role}
                </span>
              </label>
            ))}
          </div>

          {selectedRoles.length === 0 && (
            <p className="text-xs text-amber-400/80">
              {t("companyDetail.users.add.rolesRequired")}
            </p>
          )}

          {/* Confirm button */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={mutation.isPending || selectedRoles.length === 0}
            className="w-full h-9 flex items-center justify-center gap-2 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {t("companyDetail.users.selfAssign.assigning")}
              </>
            ) : (
              t("companyDetail.users.selfAssign.confirm")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
