"use client";

import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/footer";
import { useI18n } from "@/i18n/provider";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const platformColors: Record<string, string> = {
  instagram: "from-pink-500/20 to-purple-500/20",
  linkedin: "from-blue-600/20 to-blue-400/20",
  x: "from-zinc-400/20 to-zinc-600/20",
  youtube: "from-red-500/20 to-red-700/20",
  tiktok: "from-cyan-400/20 to-pink-500/20",
  facebook: "from-blue-500/20 to-blue-700/20",
};

export default function PlatformsPage() {
  const { messages } = useI18n();
  const items = messages.marketing.platformsPage.items;

  return (
    <div className="min-h-screen bg-zinc-950 selection:bg-primary/30">
      <MarketingHeader />
      <main>
        <section className="relative pt-32 pb-20 md:pt-44 md:pb-28">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-500/6 blur-[120px] rounded-full pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-6 leading-[1.1]">
              {messages.marketing.platformsPage.title}
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              {messages.marketing.platformsPage.subtitle}
            </p>
          </div>
        </section>

        <section className="pb-24 md:pb-32">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-10 text-center">
              {messages.marketing.platformsPage.supportedTitle}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(items).map(([key, item]) => (
                <div
                  key={key}
                  className="group p-8 rounded-2xl border border-white/5 bg-zinc-950 hover:bg-white/[0.03] transition-colors relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${platformColors[key] || "from-zinc-500/10 to-zinc-700/10"} rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                  <h3 className="text-xl font-medium text-zinc-100 tracking-tight mb-3 relative">
                    {item.name}
                  </h3>
                  <p className="text-zinc-400 leading-relaxed text-sm relative">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-lg bg-white text-black text-base font-medium hover:bg-zinc-200 transition-colors"
              >
                {messages.marketing.platformsPage.cta}
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
