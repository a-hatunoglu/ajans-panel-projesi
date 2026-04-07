"use client";

import Link from "next/link";
import { Command } from "lucide-react";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { useI18n } from "@/i18n/provider";

export function MarketingHeader() {
  const { messages, t } = useI18n();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
            <Command className="w-5 h-5 text-black" />
          </div>
          <span className="text-white font-semibold tracking-tight text-lg hidden sm:block">
            {messages.common.appName}
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#platforms" className="hover:text-white transition-colors">{t("marketing.header.platforms")}</a>
          <a href="#workflow" className="hover:text-white transition-colors">{t("marketing.header.workflow")}</a>
        </nav>

        <div className="flex items-center gap-4">
          <LocaleSwitcher className="hidden sm:inline-flex" />
          <Link 
            href="/login" 
            className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
          >
            {t("marketing.header.signIn")}
          </Link>
          <Link 
            href="/login"
            className="h-9 px-4 flex items-center justify-center rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
          >
            {t("marketing.header.getStarted")}
          </Link>
        </div>
      </div>
    </header>
  );
}
