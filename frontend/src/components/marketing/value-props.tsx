"use client";

import { Layers, Calendar, MessageSquare, ShieldCheck } from "lucide-react";
import { useI18n } from "@/i18n/provider";

export function ValueProps() {
  const { messages, t } = useI18n();
  const features = [
    {
      icon: <Layers className="w-5 h-5 text-zinc-300" />,
      title: messages.marketing.valueProps.isolatedWorkspaces.title,
      description: messages.marketing.valueProps.isolatedWorkspaces.description,
    },
    {
      icon: <Calendar className="w-5 h-5 text-primary" />,
      title: messages.marketing.valueProps.globalPlanningRail.title,
      description: messages.marketing.valueProps.globalPlanningRail.description,
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-indigo-400" />,
      title: messages.marketing.valueProps.contextualFeedback.title,
      description: messages.marketing.valueProps.contextualFeedback.description,
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      title: messages.marketing.valueProps.roleBasedAccess.title,
      description: messages.marketing.valueProps.roleBasedAccess.description,
    },
  ];

  return (
    <section id="workflow" className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">
            {t("marketing.valueProps.title")}
          </h2>
          <p className="text-lg text-zinc-400">
            {t("marketing.valueProps.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="group p-8 rounded-2xl border border-white/5 bg-zinc-900/20 hover:bg-zinc-900/50 transition-colors flex flex-col gap-4"
            >
              <div className="w-12 h-12 rounded-xl border border-white/10 bg-zinc-900/80 flex items-center justify-center shrink-0">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium text-zinc-100 tracking-tight mt-4">
                {feature.title}
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
