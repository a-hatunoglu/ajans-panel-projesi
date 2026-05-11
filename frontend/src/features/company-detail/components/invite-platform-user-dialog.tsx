"use client";

import { useState, useMemo, useCallback } from "react";
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
  onSuccessReturn: () => void;
}

const OPERATIONAL_ROLES = ["editor", "designer", "client"] as const;

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
    },
  });

  const inviteMutation = useInvitePlatformUserMutation();
  const attachMutation = useAddCompanyUserMutation(companyId);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const isPending = inviteMutation.isPending || attachMutation.isPending;

  const handleClose = useCallback(() => {
    if (isPending) return;
    setSubmitError(null);
    setShowSuccess(false);
    setSelectedRoles([]);
    reset();
    onClose();
  }, [isPending, reset, onClose]);

  const handleSuccessClose = useCallback(() => {
    setShowSuccess(false);
    setSelectedRoles([]);
    reset();
    onSuccessReturn();
  }, [reset, onSuccessReturn]);

  const toggleRole = useCallback((role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }, []);

  const onSubmit = async (data: InviteFormValues) => {
    if (selectedRoles.length === 0) return;
    setSubmitError(null);

    try {
      // 1. Sistem kullanıcısı oluştur — global rol her zaman "member"
      const inviteRes = await inviteMutation.mutateAsync({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "user",
      });
      const newUserId = inviteRes.user.id;

      // 2. Şirkete operasyonel rollerle ekle
      await attachMutation.mutateAsync({
        userId: newUserId,
        roles: selectedRoles,
      });

      // 3. Başarı göster
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

  const roleLabels: Record<string, string> = {
    editor: t("companyDetail.users.invite.roles.editor"),
    designer: t("companyDetail.users.invite.roles.designer"),
    client: t("companyDetail.users.invite.roles.client"),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md mx-4 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {showSuccess ? (
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

              <div className="flex flex-col gap-4">
                {/* Ad / Soyad */}
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

                {/* E-posta */}
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

                {/* Operasyonel Roller — Checkbox */}
                <div>
                  <p className="mb-2 text-xs font-medium text-zinc-400">
                    {t("companyDetail.users.invite.form.role")}
                  </p>
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
                    <p className="mt-2 text-xs text-amber-400/80">
                      {t("companyDetail.users.add.rolesRequired")}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isPending || !isValid || selectedRoles.length === 0}
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
