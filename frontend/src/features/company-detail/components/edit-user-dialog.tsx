"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2, UserCog } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useAuth } from "@/providers/auth-provider";
import { useUpdateUserMutation } from "../api/mutations";
import type { CompanyUserItem } from "../types";

const EDITABLE_ROLES = ["admin", "editor", "designer", "client"] as const;

function editUserSchema(t: (key: string) => string) {
  return z.object({
    firstName: z
      .string()
      .min(1, t("companyDetail.editUser.validation.firstNameRequired")),
    lastName: z
      .string()
      .min(1, t("companyDetail.editUser.validation.lastNameRequired")),
    role: z.enum(EDITABLE_ROLES, {
      message: t("companyDetail.editUser.validation.roleRequired"),
    }),
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
  const mutation = useUpdateUserMutation(companyId);

  const schema = useMemo(() => editUserSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditUserForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user.name.split(" ")[0] || "",
      lastName: user.name.split(" ").slice(1).join(" ") || "",
      role: (user.role === "owner" ? "admin" : user.role) as EditUserForm["role"],
    },
  });

  // Reset form when user data changes or dialog opens
  useEffect(() => {
    if (open) {
      reset({
        firstName: user.name.split(" ")[0] || "",
        lastName: user.name.split(" ").slice(1).join(" ") || "",
        role: (user.role === "owner" ? "admin" : user.role) as EditUserForm["role"],
      });
      setSubmitError(null);
    }
  }, [open, user, reset]);

  const handleClose = useCallback(() => {
    if (mutation.isPending) return;
    reset();
    setSubmitError(null);
    onClose();
  }, [mutation.isPending, reset, onClose]);

  const onSubmit = async (data: EditUserForm) => {
    setSubmitError(null);

    try {
      await mutation.mutateAsync({
        userId: user.userId,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      });

      // Sync auth context when editing self
      if (currentUser && user.userId === currentUser.id) {
        const roleChanged = data.role !== currentUser.role;

        updateUser({
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
        });

        if (roleChanged) {
          // Role change invalidates nav/permissions — reload to reset shell
          window.location.href = "/app";
          return;
        }
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
            disabled={mutation.isPending}
            className="h-7 w-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          {submitError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-500 font-medium">
              {submitError}
            </div>
          )}

          {/* First Name + Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="edit-user-firstname"
                className="text-xs font-medium text-zinc-300"
              >
                {t("companyDetail.editUser.form.firstName")} *
              </label>
              <input
                id="edit-user-firstname"
                type="text"
                disabled={mutation.isPending}
                className={inputClassName}
                {...register("firstName")}
              />
              {errors.firstName && (
                <span className="text-xs text-red-500">
                  {errors.firstName.message}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="edit-user-lastname"
                className="text-xs font-medium text-zinc-300"
              >
                {t("companyDetail.editUser.form.lastName")} *
              </label>
              <input
                id="edit-user-lastname"
                type="text"
                disabled={mutation.isPending}
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

          {/* Role */}
          <div className="space-y-1.5">
            <label
              htmlFor="edit-user-role"
              className="text-xs font-medium text-zinc-300"
            >
              {t("companyDetail.editUser.form.role")} *
            </label>
            <select
              id="edit-user-role"
              disabled={mutation.isPending}
              className={inputClassName}
              {...register("role")}
            >
              <option value="admin">{t("companyDetail.editUser.form.roles.admin")}</option>
              <option value="editor">{t("companyDetail.editUser.form.roles.editor")}</option>
              <option value="designer">{t("companyDetail.editUser.form.roles.designer")}</option>
              <option value="client">{t("companyDetail.editUser.form.roles.client")}</option>
            </select>
            {errors.role && (
              <span className="text-xs text-red-500">
                {errors.role.message}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={mutation.isPending}
              className="h-9 px-4 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
            >
              {t("companyDetail.editUser.form.cancel")}
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !isDirty}
              className="h-9 px-4 flex items-center gap-2 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition-all disabled:opacity-50"
            >
              {mutation.isPending ? (
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
