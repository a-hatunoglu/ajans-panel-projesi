"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, UserPlus, Check } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import {
  useInvitePlatformUserMutation,
  useAddCompanyUserMutation,
} from "@/features/company-detail/api/mutations";

interface InvitePlatformUserDialogProps {
  companyId: string;
  open: boolean;
  onClose: () => void;
  onSuccessReturn: () => void; // Called after full success + dismissed
}

export function InvitePlatformUserDialog({
  companyId,
  open,
  onClose,
  onSuccessReturn,
}: InvitePlatformUserDialogProps) {
  const { t } = useI18n();

  const inviteSchema = useMemo(() => {
    return z.object({
      firstName: z.string().min(1, t("companyDetail.users.invite.validation.firstNameRequired")),
      lastName: z.string().min(1, t("companyDetail.users.invite.validation.lastNameRequired")),
      email: z.string().email(t("companyDetail.users.invite.validation.emailRequired")),
      role: z.enum(["admin", "editor", "designer", "client"] as const, {
        message: t("companyDetail.users.invite.validation.invalidRole"),
      }),
    });
  }, [t]);

  type InviteFormValues = z.infer<typeof inviteSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "editor", // safe default
    },
  });

  const inviteMutation = useInvitePlatformUserMutation();
  const attachMutation = useAddCompanyUserMutation(companyId);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const isPending = inviteMutation.isPending || attachMutation.isPending;

  const handleClose = () => {
    if (isPending) return;
    setSubmitError(null);
    setShowSuccess(false);
    reset();
    onClose();
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    reset();
    onSuccessReturn();
  };

  const onSubmit = async (data: InviteFormValues) => {
    setSubmitError(null);
    try {
      // 1. Invite User
      const inviteRes = await inviteMutation.mutateAsync(data);
      const newUserId = inviteRes.user.id;

      // 2. Attach User
      await attachMutation.mutateAsync({ userId: newUserId });

      // 3. Show Success
      setShowSuccess(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t("companyDetail.users.invite.submitError");
      setSubmitError(message);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md mx-4 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {showSuccess ? (
          // --- SUCCESS STATE (Clean confirmation) ---
          <div className="p-8 text-center flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-4 border border-green-500/20">
              <Check className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-medium text-zinc-100 mb-2">
              {t("companyDetail.users.invite.success.title")}
            </h2>
            <p className="text-sm text-zinc-400 mb-6 max-w-[280px]">
              {t("companyDetail.users.invite.success.descriptionNoToken")}
            </p>

            <button
              type="button"
              onClick={handleSuccessClose}
              className="w-full h-10 flex items-center justify-center gap-2 rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors"
            >
              {t("companyDetail.users.invite.success.close")}
            </button>
          </div>
        ) : (
          // --- FORM STATE ---
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-zinc-800 border border-white/5 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-zinc-100">
                    {t("companyDetail.users.invite.title")}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {t("companyDetail.users.invite.description")}
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

            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              {submitError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-500 font-medium">
                  {submitError}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      {t("companyDetail.users.invite.form.firstName")}
                    </label>
                    <input
                      {...register("firstName")}
                      disabled={isPending}
                      className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      {t("companyDetail.users.invite.form.lastName")}
                    </label>
                    <input
                      {...register("lastName")}
                      disabled={isPending}
                      className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    {t("companyDetail.users.invite.form.email")}
                  </label>
                  <input
                    {...register("email")}
                    disabled={isPending}
                    type="email"
                    className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    {t("companyDetail.users.invite.form.role")}
                  </label>
                  <select
                    {...register("role")}
                    disabled={isPending}
                    className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50 appearance-none"
                  >
                    <option value="editor">{t("companyDetail.users.invite.roles.editor")}</option>
                    <option value="designer">{t("companyDetail.users.invite.roles.designer")}</option>
                    <option value="client">{t("companyDetail.users.invite.roles.client")}</option>
                    <option value="admin">{t("companyDetail.users.invite.roles.admin")}</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isPending || !isValid}
                  className="h-9 px-4 flex items-center gap-2 rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {t("companyDetail.users.invite.submit")}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
