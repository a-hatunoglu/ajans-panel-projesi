"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api-client";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import Link from "next/link";

interface TokenPasswordFormProps {
  /** The i18n key prefix for this form (e.g. "auth.acceptInvite" or "auth.resetPassword") */
  keyPrefix: string;
  /** The API endpoint to POST to */
  endpoint: string;
}

type FormValues = {
  password: string;
  confirmPassword: string;
};

/**
 * Shared form component for token-based password-setting flows.
 * Used by both accept-invite and reset-password pages.
 *
 * Reads `token` from URL query params. Shows password + confirm fields.
 * On submit, POSTs { token, password } to the given endpoint.
 */
export function TokenPasswordForm({ keyPrefix, endpoint }: TokenPasswordFormProps) {
  const { t } = useI18n();
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Read token from URL
  const token = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("token")
    : null;

  const schema = useMemo(() => z.object({
    password: z.string().min(8, t(`${keyPrefix}.validation.passwordMin`)),
    confirmPassword: z.string().min(1, t(`${keyPrefix}.validation.confirmRequired`)),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t(`${keyPrefix}.validation.passwordMismatch`),
    path: ["confirmPassword"],
  }), [t, keyPrefix]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  // No token in URL — show error state
  if (!token) {
    return (
      <div className="w-full max-w-sm mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
        <div className="h-12 w-12 mx-auto rounded-full bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{t(`${keyPrefix}.missingTokenTitle`)}</h1>
          <p className="text-sm text-zinc-400">{t(`${keyPrefix}.missingTokenDescription`)}</p>
        </div>
        <Link
          href="/login"
          className="inline-flex h-10 px-4 items-center justify-center rounded-md border border-zinc-800 text-sm font-medium text-zinc-300 hover:bg-zinc-900 transition-colors"
        >
          {t(`${keyPrefix}.backToLogin`)}
        </Link>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="w-full max-w-sm mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
        <div className="h-12 w-12 mx-auto rounded-full bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/20">
          <Check className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{t(`${keyPrefix}.successTitle`)}</h1>
          <p className="text-sm text-zinc-400">{t(`${keyPrefix}.successDescription`)}</p>
        </div>
        <Link
          href="/login"
          className="inline-flex h-10 px-4 items-center justify-center rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
        >
          {t(`${keyPrefix}.goToLogin`)}
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setErrorInfo(null);

    try {
      await apiClient(endpoint, {
        method: "POST",
        body: JSON.stringify({ token, password: data.password }),
        skipAuthRetry: true,
        suppressAuthRedirect: true,
      });

      setIsSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : t(`${keyPrefix}.errorFallback`);

      setErrorInfo(message || t(`${keyPrefix}.errorFallback`));
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">{t(`${keyPrefix}.title`)}</h1>
        <p className="text-sm text-zinc-400">{t(`${keyPrefix}.subtitle`)}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorInfo && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-500 font-medium">
            {errorInfo}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300" htmlFor="password">
            {t(`${keyPrefix}.password`)}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
            placeholder={t(`${keyPrefix}.passwordPlaceholder`)}
            {...register("password")}
            disabled={isLoading}
          />
          {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300" htmlFor="confirmPassword">
            {t(`${keyPrefix}.confirmPassword`)}
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
            placeholder={t(`${keyPrefix}.confirmPasswordPlaceholder`)}
            {...register("confirmPassword")}
            disabled={isLoading}
          />
          {errors.confirmPassword && <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 flex items-center justify-center gap-2 bg-white text-black font-medium rounded-md hover:bg-zinc-200 focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-white transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t(`${keyPrefix}.submitting`)}
            </>
          ) : (
            t(`${keyPrefix}.submit`)
          )}
        </button>
      </form>
    </div>
  );
}
