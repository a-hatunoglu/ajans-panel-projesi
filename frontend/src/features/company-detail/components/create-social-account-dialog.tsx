"use client";

import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2, Share2 } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import type { TranslateFn } from "@/i18n/types";
import { useCreateSocialAccountMutation } from "@/features/company-detail/api/mutations";
import type { Platform } from "@/features/contents/types";
import { useLabels } from "@/lib/labels";

const PLATFORM_OPTIONS: Platform[] = [
  "instagram",
  "facebook",
  "x",
  "linkedin",
  "tiktok",
  "youtube",
];

function createSocialAccountSchema(t: TranslateFn) {
  return z.object({
    platform: z.enum(
      ["instagram", "facebook", "x", "linkedin", "tiktok", "youtube"],
      { message: t("companyDetail.social.create.validation.platform") }
    ),
    accountName: z
      .string()
      .min(1, t("companyDetail.social.create.validation.accountNameRequired"))
      .max(200),
    profileUrl: z
      .string()
      .url(t("companyDetail.social.create.validation.profileUrlInvalid"))
      .or(z.literal(""))
      .optional(),
  });
}

type CreateSocialAccountForm = z.infer<ReturnType<typeof createSocialAccountSchema>>;

interface CreateSocialAccountDialogProps {
  companyId: string;
  open: boolean;
  onClose: () => void;
}

export function CreateSocialAccountDialog({
  companyId,
  open,
  onClose,
}: CreateSocialAccountDialogProps) {
  const { t } = useI18n();
  const { getPlatformLabel } = useLabels();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const mutation = useCreateSocialAccountMutation(companyId);
  const schema = useMemo(() => createSocialAccountSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSocialAccountForm>({
    resolver: zodResolver(schema),
    defaultValues: { accountName: "", profileUrl: "" },
  });

  const handleClose = useCallback(() => {
    if (mutation.isPending) return;
    reset();
    setSubmitError(null);
    onClose();
  }, [mutation.isPending, reset, onClose]);

  const onSubmit = async (data: CreateSocialAccountForm) => {
    setSubmitError(null);

    try {
      await mutation.mutateAsync({
        platform: data.platform,
        accountName: data.accountName,
        profileUrl: data.profileUrl || null,
      });
      reset();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : t("companyDetail.social.create.submitError");
      setSubmitError(message);
    }
  };

  if (!open) return null;

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
              <Share2 className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-zinc-100">
                {t("companyDetail.social.create.title")}
              </h2>
              <p className="text-xs text-zinc-500">
                {t("companyDetail.social.create.description")}
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-6 py-5">
          {submitError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-500 font-medium">
              {submitError}
            </div>
          )}

          {/* Platform (required) */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="social-platform"
              className="text-xs font-medium text-zinc-300"
            >
              {t("companyDetail.social.create.form.platform")} *
            </label>
            <select
              id="social-platform"
              disabled={mutation.isPending}
              className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50 appearance-none"
              defaultValue=""
              {...register("platform")}
            >
              <option value="" disabled className="text-zinc-600">
                {t("companyDetail.social.create.form.selectPlatform")}
              </option>
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {getPlatformLabel(p)}
                </option>
              ))}
            </select>
            {errors.platform && (
              <span className="text-xs text-red-500">
                {errors.platform.message}
              </span>
            )}
          </div>

          {/* Account Name (required) */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="social-account-name"
              className="text-xs font-medium text-zinc-300"
            >
              {t("companyDetail.social.create.form.accountName")} *
            </label>
            <input
              id="social-account-name"
              type="text"
              autoFocus
              disabled={mutation.isPending}
              placeholder={t("companyDetail.social.create.form.accountNamePlaceholder")}
              className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
              {...register("accountName")}
            />
            {errors.accountName && (
              <span className="text-xs text-red-500">
                {errors.accountName.message}
              </span>
            )}
          </div>

          {/* Profile URL */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="social-profile-url"
              className="text-xs font-medium text-zinc-300"
            >
              {t("companyDetail.social.create.form.profileUrl")}
            </label>
            <input
              id="social-profile-url"
              type="text"
              disabled={mutation.isPending}
              placeholder={t("companyDetail.social.create.form.profileUrlPlaceholder")}
              className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
              {...register("profileUrl")}
            />
            {errors.profileUrl && (
              <span className="text-xs text-red-500">
                {errors.profileUrl.message}
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
              {t("companyDetail.social.create.form.cancel")}
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="h-9 px-4 flex items-center gap-2 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition-all disabled:opacity-50"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t("companyDetail.social.create.form.submitting")}
                </>
              ) : (
                t("companyDetail.social.create.form.submit")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
