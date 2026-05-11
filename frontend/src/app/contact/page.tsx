"use client";

import { useState } from "react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/footer";
import { useI18n } from "@/i18n/provider";
import { Mail, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const { messages } = useI18n();
  const ct = messages.marketing.contactPage;
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission (no real backend endpoint for contact)
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 selection:bg-primary/30">
      <MarketingHeader />
      <main>
        <section className="relative pt-32 pb-20 md:pt-44 md:pb-28">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-6 leading-[1.1]">
              {ct.title}
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              {ct.subtitle}
            </p>
          </div>
        </section>

        <section className="pb-24 md:pb-32">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              {/* Form */}
              <div className="lg:col-span-3">
                {submitted ? (
                  <div className="rounded-2xl border border-white/5 bg-zinc-950 p-12 text-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-white mb-3">{ct.success.title}</h2>
                    <p className="text-zinc-400">{ct.success.description}</p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-white/5 bg-zinc-950 p-8 md:p-10 flex flex-col gap-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-zinc-300">{ct.form.name}</label>
                        <input
                          type="text"
                          required
                          placeholder={ct.form.namePlaceholder}
                          className="h-11 rounded-lg border border-white/10 bg-zinc-900 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-zinc-300">{ct.form.email}</label>
                        <input
                          type="email"
                          required
                          placeholder={ct.form.emailPlaceholder}
                          className="h-11 rounded-lg border border-white/10 bg-zinc-900 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-zinc-300">{ct.form.company}</label>
                      <input
                        type="text"
                        placeholder={ct.form.companyPlaceholder}
                        className="h-11 rounded-lg border border-white/10 bg-zinc-900 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-zinc-300">{ct.form.message}</label>
                      <textarea
                        required
                        rows={5}
                        placeholder={ct.form.messagePlaceholder}
                        className="rounded-lg border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-12 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? ct.form.submitting : ct.form.submit}
                    </button>
                  </form>
                )}
              </div>

              {/* Info sidebar */}
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-white/5 bg-zinc-950 p-8 flex flex-col gap-6">
                  <h3 className="text-lg font-medium text-white">{ct.info.title}</h3>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-zinc-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-zinc-300">{ct.info.emailLabel}</p>
                      <a href={`mailto:${ct.info.emailValue}`} className="text-sm text-primary hover:underline">
                        {ct.info.emailValue}
                      </a>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-500">{ct.info.responseTime}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
