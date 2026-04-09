"use client";

import { Command } from "lucide-react";
import { useI18n } from "@/i18n/provider";

export function MarketingFooter() {
  const { messages, t } = useI18n();

  return (
    <footer className="border-t border-white/5 bg-zinc-950 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center">
                <Command className="w-4 h-4 text-zinc-300" />
              </div>
              <span className="text-white font-medium tracking-tight">{messages.common.appName}</span>
            </div>
            <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
              {t("marketing.footer.description")}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold text-white tracking-tight">{t("marketing.footer.product")}</h4>
            <div className="flex flex-col gap-3 text-sm text-zinc-500">
              <a href="#workflow" className="hover:text-zinc-300 transition-colors">{t("marketing.footer.workflow")}</a>
              <a href="#platforms" className="hover:text-zinc-300 transition-colors">{t("marketing.footer.platforms")}</a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold text-white tracking-tight">{t("marketing.footer.legal")}</h4>
            <div className="flex flex-col gap-3 text-sm text-zinc-500">
              <span className="text-zinc-600 cursor-default">{t("marketing.footer.privacyPolicy")}</span>
              <span className="text-zinc-600 cursor-default">{t("marketing.footer.termsOfService")}</span>
              <span className="text-zinc-600 cursor-default">{t("marketing.footer.cookiePolicy")}</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <span>{t("marketing.footer.copyright", { year: new Date().getFullYear() })}</span>
        </div>
      </div>
    </footer>
  );
}
