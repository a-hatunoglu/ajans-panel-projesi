"use client";

import { MobileAppNav } from "@/components/shared/mobile-app-nav";
import { useAuth } from "@/providers/auth-provider";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { useUiCopy } from "@/lib/copy";

export function Topbar() {
  const { user, isLoading } = useAuth();
  const uiCopy = useUiCopy();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/80 px-4 backdrop-blur sm:px-6">
      <div className="flex h-16 items-center justify-between gap-3">
        <div className="lg:hidden">
          <MobileAppNav />
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-3 sm:gap-4">
          <LocaleSwitcher className="shrink-0" />
          <div className="h-6 w-6 shrink-0 rounded-full border border-white/10 bg-zinc-800" />
          <span className="max-w-[8rem] truncate text-sm text-zinc-300 sm:max-w-[14rem]">
            {isLoading ? uiCopy.loadingUser : user?.email || uiCopy.guest}
          </span>
        </div>
      </div>
    </header>
  );
}
