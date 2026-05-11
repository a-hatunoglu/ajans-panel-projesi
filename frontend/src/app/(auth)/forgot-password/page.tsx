"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api-client";
import { Loader2, Check } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import Link from "next/link";

type ForgotPasswordForm = {
  email: string;
};

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const formSchema = useMemo(() => z.object({
    email: z.string().email(t("auth.forgotPassword.validation.email")),
  }), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setErrorInfo(null);

    try {
      await apiClient("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
      });

      // Show success state. We purposefully don't redirect so they can read the text.
      setIsSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : t("auth.forgotPassword.errorFallback");

      setErrorInfo(message || t("auth.forgotPassword.errorFallback"));
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-sm mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/20">
            <Check className="w-6 h-6" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{t("auth.forgotPassword.successTitle")}</h1>
          <p className="text-sm text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
            {t("auth.forgotPassword.successDescription")}
          </p>
        </div>
        <div className="pt-4">
          <Link
            href="/login"
            className="w-full h-10 flex items-center justify-center gap-2 bg-white text-black font-medium rounded-md hover:bg-zinc-200 focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-white transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
          >
            {t("auth.forgotPassword.backToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">{t("auth.forgotPassword.title")}</h1>
        <p className="text-sm text-zinc-400">{t("auth.forgotPassword.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {errorInfo && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-500 font-medium">
            {errorInfo}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-300" htmlFor="email">{t("auth.forgotPassword.email")}</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
            placeholder={t("auth.forgotPassword.emailPlaceholder")}
            {...register("email")}
            disabled={isLoading}
          />
          {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 flex items-center justify-center gap-2 bg-white text-black font-medium rounded-md hover:bg-zinc-200 focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-white transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("auth.forgotPassword.submitting")}
              </>
            ) : (
              t("auth.forgotPassword.submit")
            )}
          </button>
        </div>
      </form>

      <div className="text-center">
        <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
          {t("auth.forgotPassword.backToLogin")}
        </Link>
      </div>
    </div>
  );
}
