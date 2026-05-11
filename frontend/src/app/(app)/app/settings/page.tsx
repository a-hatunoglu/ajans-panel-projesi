"use client";

import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/i18n/provider";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Check } from "lucide-react";
import {
  useUpdateProfileMutation,
  useChangePasswordMutation,
} from "@/features/settings/api/mutations";
import { useEffect, useState, useMemo } from "react";
import { UserAvatar } from "@/components/shared/user-avatar";

// ─── Change Password Section ─────────────────────────────────

function ChangePasswordSection() {
  const { t } = useI18n();
  const [pwSuccess, setPwSuccess] = useState(false);
  const passwordMutation = useChangePasswordMutation();

  const passwordSchema = useMemo(() => {
    return z
      .object({
        currentPassword: z
          .string()
          .min(1, t("settings.changePassword.validation.currentRequired")),
        newPassword: z
          .string()
          .min(8, t("settings.changePassword.validation.newMin")),
        confirmPassword: z
          .string()
          .min(1, t("settings.changePassword.validation.confirmRequired")),
      })
      .refine((data) => data.newPassword === data.confirmPassword, {
        message: t("settings.changePassword.validation.mismatch"),
        path: ["confirmPassword"],
      });
  }, [t]);

  type PasswordFormValues = z.infer<typeof passwordSchema>;

  const {
    register: registerPw,
    handleSubmit: handlePwSubmit,
    formState: { errors: pwErrors, isValid: pwValid },
    reset: resetPw,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      await passwordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      resetPw();
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 3000);
    } catch {
      // Error is surfaced by mutation.isError state
    }
  };

  return (
    <section className="rounded-xl border border-white/5 bg-zinc-950/50 p-6">
      <h2 className="text-lg font-medium text-zinc-100 mb-6">
        {t("settings.changePassword.title")}
      </h2>

      <form
        onSubmit={handlePwSubmit(onPasswordSubmit)}
        className="flex flex-col gap-6 max-w-xl"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            {t("settings.changePassword.currentPassword")}
          </label>
          <input
            type="password"
            autoComplete="current-password"
            {...registerPw("currentPassword")}
            disabled={passwordMutation.isPending}
            className="w-full rounded-md border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50"
            placeholder={t(
              "settings.changePassword.currentPasswordPlaceholder"
            )}
          />
          {pwErrors.currentPassword && (
            <p className="mt-1 text-xs text-red-500">
              {pwErrors.currentPassword.message}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              {t("settings.changePassword.newPassword")}
            </label>
            <input
              type="password"
              autoComplete="new-password"
              {...registerPw("newPassword")}
              disabled={passwordMutation.isPending}
              className="w-full rounded-md border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50"
              placeholder={t(
                "settings.changePassword.newPasswordPlaceholder"
              )}
            />
            {pwErrors.newPassword && (
              <p className="mt-1 text-xs text-red-500">
                {pwErrors.newPassword.message}
              </p>
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              {t("settings.changePassword.confirmPassword")}
            </label>
            <input
              type="password"
              autoComplete="new-password"
              {...registerPw("confirmPassword")}
              disabled={passwordMutation.isPending}
              className="w-full rounded-md border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50"
              placeholder={t(
                "settings.changePassword.confirmPasswordPlaceholder"
              )}
            />
            {pwErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">
                {pwErrors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={passwordMutation.isPending || !pwValid}
            className="h-10 px-4 flex items-center justify-center gap-2 rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {passwordMutation.isPending && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {t("settings.changePassword.submit")}
          </button>

          {passwordMutation.isError && (
            <p className="text-sm text-red-500 font-medium">
              {passwordMutation.error instanceof Error
                ? passwordMutation.error.message
                : t("settings.changePassword.submitError")}
            </p>
          )}

          {pwSuccess && !passwordMutation.isPending && (
            <p className="flex items-center gap-1.5 text-sm text-green-500 font-medium animate-in fade-in zoom-in-95">
              <Check className="w-4 h-4" />
              {t("settings.changePassword.submitSuccess")}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}

// ─── Settings Page ───────────────────────────────────────────

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { t } = useI18n();
  const [successMsg, setSuccessMsg] = useState(false);

  const profileSchema = useMemo(() => {
    return z.object({
      firstName: z.string().min(1, t("settings.profile.validation.firstNameRequired")),
      lastName: z.string().min(1, t("settings.profile.validation.lastNameRequired")),
      avatarUrl: z.union([
        z.literal(""),
        z.string().url(t("settings.profile.validation.invalidUrl"))
      ]).optional().nullable(),
    });
  }, [t]);

  type ProfileFormValues = z.infer<typeof profileSchema>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      avatarUrl: "",
    },
  });

  const watchAvatarUrl = watch("avatarUrl");
  const watchFirstName = watch("firstName");
  const watchLastName = watch("lastName");

  // Load backend data into default values once ready
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user, reset]);

  const mutation = useUpdateProfileMutation();

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const result = await mutation.mutateAsync(data);
      updateUser({
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        avatarUrl: result.user.avatarUrl,
      });
      reset(data); // reset form dirty state
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch {
      // Error is surfaced by mutation.isError state
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
          {t("settings.title")}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {t("settings.description")}
        </p>
      </div>

      <div className="grid gap-8">
        <section className="rounded-xl border border-white/5 bg-zinc-950/50 p-6">
          <h2 className="text-lg font-medium text-zinc-100 mb-6">
            {t("settings.profile.title")}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 max-w-xl">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  {t("settings.profile.firstName")}
                </label>
                <input
                  {...register("firstName")}
                  disabled={mutation.isPending}
                  className="w-full rounded-md border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  {t("settings.profile.lastName")}
                </label>
                <input
                  {...register("lastName")}
                  disabled={mutation.isPending}
                  className="w-full rounded-md border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                {t("settings.profile.avatarUrl")}
              </label>
              <div className="flex items-center gap-4">
                <UserAvatar
                  avatarUrl={watchAvatarUrl}
                  firstName={watchFirstName}
                  lastName={watchLastName}
                  email={user.email}
                  size="md"
                />
                <div className="flex-1">
                  <input
                    {...register("avatarUrl")}
                    disabled={mutation.isPending}
                    placeholder={t("settings.profile.avatarUrlPlaceholder")}
                    className="w-full rounded-md border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50"
                  />
                  {errors.avatarUrl && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.avatarUrl.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                {t("settings.profile.email")}
              </label>
              <input
                type="text"
                disabled
                value={user.email}
                className="w-full rounded-md border border-white/5 bg-zinc-900/20 px-3 py-2 text-sm text-zinc-500 cursor-not-allowed"
              />
              <p className="mt-2 text-xs text-zinc-500">
                {t("settings.profile.emailHint")}
              </p>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={mutation.isPending || !isDirty || !isValid}
                className="h-10 px-4 flex items-center justify-center gap-2 rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("settings.profile.submit")}
              </button>
              
              {mutation.isError && (
                <p className="text-sm text-red-500 font-medium">
                  {t("settings.profile.submitError")}
                </p>
              )}
              
              {successMsg && !mutation.isPending && (
                <p className="flex items-center gap-1.5 text-sm text-green-500 font-medium animate-in fade-in zoom-in-95">
                  <Check className="w-4 h-4" />
                  {t("settings.profile.submitSuccess")}
                </p>
              )}
            </div>
          </form>
        </section>

        <ChangePasswordSection />
      </div>
    </div>
  );
}
