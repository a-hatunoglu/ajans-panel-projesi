"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/provider";

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { t } = useI18n();
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginSchema = useMemo(() => z.object({
    email: z.string().email(t("auth.login.validation.email")),
    password: z.string().min(6, t("auth.login.validation.password")),
  }), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setErrorInfo(null);

    try {
      await apiClient("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });

      window.location.href = "/app";
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : t("auth.login.errorFallback");

      setErrorInfo(message || t("auth.login.errorFallback"));
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">{t("auth.login.title")}</h1>
        <p className="text-sm text-zinc-400">{t("auth.login.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorInfo && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-500 font-medium">
            {errorInfo}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300" htmlFor="email">{t("auth.login.email")}</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
            placeholder={t("auth.login.emailPlaceholder")}
            {...register("email")}
            disabled={isLoading}
          />
          {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300" htmlFor="password">{t("auth.login.password")}</label>
            <button type="button" className="text-xs text-zinc-500 hover:text-zinc-300">{t("auth.login.forgotPassword")}</button>
          </div>
          <input
            id="password"
            type="password"
            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
            placeholder={t("auth.login.passwordPlaceholder")}
            {...register("password")}
            disabled={isLoading}
          />
          {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 flex items-center justify-center gap-2 bg-white text-black font-medium rounded-md hover:bg-zinc-200 focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-white transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("auth.login.submitting")}
            </>
          ) : (
            t("auth.login.submit")
          )}
        </button>
      </form>
    </div>
  );
}
