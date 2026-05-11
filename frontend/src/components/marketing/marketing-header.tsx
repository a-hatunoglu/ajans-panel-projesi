"use client";

import Link from "next/link";
import { Command, Menu, X } from "lucide-react";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { useI18n } from "@/i18n/provider";
import { useState } from "react";

export function MarketingHeader() {
  const { messages, t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/features", label: t("marketing.header.features") },
    { href: "/workflow", label: t("marketing.header.workflow") },
    { href: "/platforms", label: t("marketing.header.platforms") },
    { href: "/contact", label: t("marketing.header.contact") },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
            <Command className="w-5 h-5 text-black" />
          </div>
          <span className="text-white font-semibold tracking-tight text-lg hidden sm:block">
            {messages.common.appName}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <LocaleSwitcher className="hidden sm:inline-flex" />
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-300 hover:text-white transition-colors hidden sm:block"
          >
            {t("marketing.header.signIn")}
          </Link>
          <Link
            href="/login"
            className="h-9 px-4 flex items-center justify-center rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
          >
            {t("marketing.header.getStarted")}
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-zinc-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-zinc-950/95 backdrop-blur-md px-6 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-zinc-400 hover:text-white py-2 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/5">
            <LocaleSwitcher className="sm:hidden" />
          </div>
        </div>
      )}
    </header>
  );
}
