"use client";

import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/footer";
import { useI18n } from "@/i18n/provider";
import Link from "next/link";
import { ArrowRight, Building2, GitBranch, Calendar, Shield, UploadCloud, Bell, Activity, CreditCard } from "lucide-react";

const iconMap = {
  companyManagement: Building2,
  contentPipeline: GitBranch,
  calendarView: Calendar,
  roleSystem: Shield,
  mediaUpload: UploadCloud,
  realTimeNotifications: Bell,
  activityLog: Activity,
  billing: CreditCard,
};

export default function FeaturesPage() {
  const { messages } = useI18n();
  const items = messages.marketing.featuresPage.items;

  return (
    <div className="min-h-screen bg-zinc-950 selection:bg-primary/30">
      <MarketingHeader />
      <main>
        <section className="relative pt-32 pb-20 md:pt-44 md:pb-28">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/8 blur-[120px] rounded-full pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-6 leading-[1.1]">
              {messages.marketing.featuresPage.title}
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              {messages.marketing.featuresPage.subtitle}
            </p>
          </div>
        </section>

        <section className="pb-24 md:pb-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(items).map(([key, item]) => {
                const Icon = iconMap[key as keyof typeof iconMap] || Activity;
                return (
                  <div
                    key={key}
                    className="group p-8 rounded-2xl border border-white/5 bg-zinc-950 hover:bg-white/[0.03] transition-colors flex flex-col gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl border border-white/5 bg-zinc-900 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium text-zinc-100 tracking-tight mt-2">
                      {item.title}
                    </h3>
                    <p className="text-zinc-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-16 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-lg bg-white text-black text-base font-medium hover:bg-zinc-200 transition-colors"
              >
                {messages.marketing.hero.primaryCta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
