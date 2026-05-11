"use client";

import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/footer";
import { useI18n } from "@/i18n/provider";
import Link from "next/link";
import { ArrowRight, FileText, Eye, RotateCcw, CheckCircle2, CalendarCheck, Globe } from "lucide-react";

const stepIcons = {
  draft: FileText,
  review: Eye,
  revise: RotateCcw,
  approve: CheckCircle2,
  schedule: CalendarCheck,
  publish: Globe,
};

const stepColors = [
  "text-zinc-400",
  "text-amber-400",
  "text-orange-400",
  "text-emerald-400",
  "text-sky-400",
  "text-primary",
];

export default function WorkflowPage() {
  const { messages } = useI18n();
  const steps = messages.marketing.workflowPage.steps;

  return (
    <div className="min-h-screen bg-zinc-950 selection:bg-primary/30">
      <MarketingHeader />
      <main>
        <section className="relative pt-32 pb-20 md:pt-44 md:pb-28">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-sky-500/6 blur-[120px] rounded-full pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-6 leading-[1.1]">
              {messages.marketing.workflowPage.title}
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              {messages.marketing.workflowPage.subtitle}
            </p>
          </div>
        </section>

        <section className="pb-24 md:pb-32">
          <div className="max-w-3xl mx-auto px-6">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-zinc-800 via-zinc-700 to-zinc-800 hidden md:block" />

              <div className="flex flex-col gap-8">
                {Object.entries(steps).map(([key, step], index) => {
                  const Icon = stepIcons[key as keyof typeof stepIcons] || FileText;
                  const color = stepColors[index] || "text-zinc-400";
                  return (
                    <div key={key} className="relative flex gap-6 group">
                      {/* Step number */}
                      <div className="relative z-10 shrink-0">
                        <div className="w-12 h-12 rounded-xl border border-white/10 bg-zinc-900 flex items-center justify-center group-hover:border-white/20 transition-colors">
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-mono text-zinc-600 uppercase tracking-wider">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <h3 className="text-xl font-medium text-zinc-100 tracking-tight">
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-zinc-400 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-16 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-lg bg-white text-black text-base font-medium hover:bg-zinc-200 transition-colors"
              >
                {messages.marketing.workflowPage.cta}
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
