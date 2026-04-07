"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/provider";

export function HeroSection() {
  const { t } = useI18n();

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 opacity-50 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 opacity-30 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium text-zinc-300">{t("marketing.hero.badge")}</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-white mb-6 leading-[1.1]">
          {t("marketing.hero.titleLineOne")} <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
            {t("marketing.hero.titleLineTwo")}
          </span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed font-light">
          {t("marketing.hero.description")}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link 
            href="/login"
            className="h-12 px-6 flex items-center justify-center gap-2 rounded-lg bg-white text-black text-base font-medium hover:bg-zinc-200 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
          >
            {t("marketing.hero.primaryCta")}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          <Link 
            href="/login"
            className="h-12 px-6 flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 text-base font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            {t("marketing.hero.secondaryCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
