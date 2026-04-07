"use client";

import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { useI18n } from "@/i18n/provider";
import { useUiCopy } from "@/lib/copy";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const uiCopy = useUiCopy();

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <div className="hidden lg:flex w-[40%] flex-col justify-between p-12 border-r border-white/5 relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-lg font-medium tracking-tight">{uiCopy.appName}</div>
        </div>
        <div className="relative z-10 text-xl font-medium text-zinc-400 max-w-sm">
          {`"${t("auth.layout.quote")}"`}
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="absolute right-6 top-6 lg:right-12 lg:top-12">
          <LocaleSwitcher />
        </div>
        {children}
      </div>
    </div>
  );
}
