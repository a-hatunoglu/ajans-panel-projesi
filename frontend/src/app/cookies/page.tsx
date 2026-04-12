"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/i18n/provider";

export default function CookiePolicyPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
          {t("legal.cookiePolicy.title")}
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
          {t("legal.cookiePolicy.description")}
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("legal.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
