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
            href="#workflow"
            className="h-12 px-6 flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 text-base font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            {t("marketing.hero.secondaryCta")}
          </Link>
        </div>

        {/* Abstract UI Frame Anchor */}
        <div className="mt-20 w-full max-w-5xl mx-auto rounded-t-xl border-x border-t border-white/10 bg-zinc-950/50 p-2 md:p-4 backdrop-blur-md shadow-2xl relative overflow-hidden h-[300px] md:h-[500px]">
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-zinc-950 to-transparent z-10" />
          <div className="w-full h-full rounded-lg border border-white/5 bg-[#0a0a0a] relative flex flex-col overflow-hidden">
            {/* Faux Topbar */}
            <div className="h-12 border-b border-white/5 bg-zinc-950 flex items-center px-4 gap-2 shrink-0">
              <div className="flex gap-1.5 mr-4">
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
              </div>
              <div className="h-6 w-48 rounded-md bg-white/5" />
            </div>
            {/* Faux Layout */}
            <div className="flex-1 flex p-4 gap-4">
              {/* Sidebar */}
              <div className="w-48 hidden md:flex flex-col gap-2 shrink-0">
                <div className="h-8 rounded w-full bg-white/5" />
                <div className="h-8 rounded w-3/4 bg-white/5" />
                <div className="h-8 rounded w-4/5 bg-white/5" />
                <div className="h-8 rounded w-full bg-white/5 mt-4" />
                <div className="h-8 rounded w-2/3 bg-white/5" />
              </div>
              {/* Content Matrix */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="h-24 rounded-lg bg-white/5 flex-1 border border-white/5" />
                  <div className="h-24 rounded-lg bg-white/5 flex-1 border border-white/5 hidden sm:block" />
                  <div className="h-24 rounded-lg bg-white/5 flex-1 border border-white/5 hidden md:block" />
                </div>
                <div className="flex-1 rounded-lg border border-white/5 bg-white/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
