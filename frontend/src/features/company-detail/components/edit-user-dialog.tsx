"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2, UserCog } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useAuth } from "@/providers/auth-provider";
import { 
  useUpdateUserMutation, 
  useUpdateCompanyUserRolesMutation 
} from "../api/mutations";
import type { CompanyUserItem } from "../types";

const OPERATIONAL_ROLES = ["editor", "designer", "client"] as const;

function editUserSchema(t: (key: string) => string) {
  return z.object({
    firstName: z
      .string()
      .min(1, t("companyDetail.editUser.validation.firstNameRequired")),
    lastName: z
      .string()
      .min(1, t("companyDetail.editUser.validation.lastNameRequired")),
  });
}

type EditUserForm = z.infer<ReturnType<typeof editUserSchema>>;

interface EditUserDialogProps {
  companyId: string;
  user: CompanyUserItem;
  open: boolean;
  onClose: () => void;
}

export function EditUserDialog({
  companyId,
  user,
  open,
  onClose,
}: EditUserDialogProps) {
  const { t } = useI18n();
  const { user: currentUser, updateUser } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user.roles);
  const mutationUser = useUpdateUserMutation(companyId);
  const mutationRoles = useUpdateCompanyUserRolesMutation(companyId);

  const isPending = mutationUser.isPending || mutationRoles.isPending;

  const schema = useMemo(() => editUserSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditUserForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });

  // Reset form when user data changes or dialog opens
  useEffect(() => {
    if (open) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
      });
      setSelectedRoles(user.roles);
      setSubmitError(null);
    }
  }, [open, user, reset]);

  const handleClose = useCallback(() => {
    if (isPending) return;
    reset();
    setSelectedRoles(user.roles);
    setSubmitError(null);
    onClose();
  }, [isPending, reset, onClose, user.roles]);

  const toggleRole = useCallback((role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }, []);

  // Track whether roles actually changed
  const rolesChanged = useMemo(() => {
    const sorted1 = [...selectedRoles].sort();
    const sorted2 = [...user.roles].sort();
    if (sorted1.length !== sorted2.length) return true;
    return sorted1.some((r, i) => r !== sorted2[i]);
  }, [selectedRoles, user.roles]);

  const hasChanges = isDirty || rolesChanged;

  const onSubmit = async (data: EditUserForm) => {
    if (selectedRoles.length === 0) return;
    setSubmitError(null);

    try {
      const promises: Promise<unknown>[] = [];

      // Update user name if changed
      if (isDirty) {
        promises.push(
          mutationUser.mutateAsync({
            userId: user.userId,
            firstName: data.firstName,
            lastName: data.lastName,
          })
        );
      }

      // Update company roles if changed
      if (rolesChanged) {
        promises.push(
          mutationRoles.mutateAsync({
            userId: user.userId,
            roles: selectedRoles,
          })
        );
      }

      await Promise.all(promises);

      // Sync auth context when editing self
      if (currentUser && user.userId === currentUser.id && isDirty) {
        updateUser({
          firstName: data.firstName,
          lastName: data.lastName,
        });
      }

      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : t("companyDetail.editUser.submitError");
      setSubmitError(message);
    }
  };

  if (!open) return null;

  const roleLabels: Record<string, string> = {
    editor: t("companyDetail.editUser.form.roles.editor"),
    designer: t("companyDetail.editUser.form.roles.designer"),
    client: t("companyDetail.editUser.form.roles.client"),
  };

  const inputClassName =
    "flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50";

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
            <div className="h-8 w-8 rounded-md bg-zinc-800 border border-white/5 flex items-center justify-center">
              <UserCog className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-zinc-100">
                {t("companyDetail.editUser.title")}
              </h2>
              <p className="text-xs text-zinc-500">
                {user.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="h-7 w-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-6 py-5">
          {submitError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-500 font-medium">
              {submitError}
            </div>
          )}

          {/* First Name + Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-user-firstname"
                className="text-xs font-medium text-zinc-300"
              >
                {t("companyDetail.editUser.form.firstName")} *
              </label>
              <input
                id="edit-user-firstname"
                type="text"
                disabled={isPending}
                className={inputClassName}
                {...register("firstName")}
              />
              {errors.firstName && (
                <span className="text-xs text-red-500">
                  {errors.firstName.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-user-lastname"
                className="text-xs font-medium text-zinc-300"
              >
                {t("companyDetail.editUser.form.lastName")} *
              </label>
              <input
                id="edit-user-lastname"
                type="text"
                disabled={isPending}
                className={inputClassName}
                {...register("lastName")}
              />
              {errors.lastName && (
                <span className="text-xs text-red-500">
                  {errors.lastName.message}
                </span>
              )}
            </div>
          </div>

          {/* Roles — Checkboxes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-300">
              {t("companyDetail.editUser.form.rolesLabel")}
            </label>
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
                    disabled={isPending}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-zinc-200">
                    {roleLabels[role] || role}
                  </span>
                </label>
              ))}
            </div>
            {selectedRoles.length === 0 && (
              <p className="mt-1 text-xs text-amber-400/80">
                {t("companyDetail.users.add.rolesRequired")}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="h-9 px-4 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
            >
              {t("companyDetail.editUser.form.cancel")}
            </button>
            <button
              type="submit"
              disabled={isPending || !hasChanges || selectedRoles.length === 0}
              className="h-9 px-4 flex items-center gap-2 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition-all disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t("companyDetail.editUser.form.submitting")}
                </>
              ) : (
                t("companyDetail.editUser.form.submit")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
