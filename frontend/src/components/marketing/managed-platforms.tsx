"use client";

import { useI18n } from "@/i18n/provider";

export function ManagedPlatforms() {
  const { messages, t } = useI18n();
  const platforms = Object.values(messages.marketing.managedPlatforms.items);

  return (
    <section id="platforms" className="py-12 border-y border-white/5 bg-zinc-950/50 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 text-center flex flex-col items-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-8">
          {t("marketing.managedPlatforms.title")}
        </p>

        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />

        <div className="flex items-center justify-center flex-wrap gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {platforms.map((name, index) => (
            <div key={index} className="flex items-center justify-center text-lg md:text-xl font-bold tracking-tight text-white/80">
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
