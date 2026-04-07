"use client";

import { AppNavigation } from "@/components/shared/app-navigation";
import { useUiCopy } from "@/lib/copy";

export function Sidebar() {
  const uiCopy = useUiCopy();

  return (
    <aside className="hidden w-64 flex-col border-r border-white/5 bg-zinc-950 p-4 lg:flex">
      <div className="mb-8 px-2 text-sm font-medium tracking-tight">
        {uiCopy.appName}
      </div>
      <AppNavigation variant="desktop" />
    </aside>
  );
}
