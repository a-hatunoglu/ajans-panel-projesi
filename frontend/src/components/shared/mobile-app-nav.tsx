"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { AppNavigation } from "@/components/shared/app-navigation";
import { useI18n } from "@/i18n/provider";
import { useUiCopy } from "@/lib/copy";

export function MobileAppNav() {
  const { t } = useI18n();
  const uiCopy = useUiCopy();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    function handleResize() {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={t("common.openNavigation")}
        className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/10 bg-zinc-900/50 text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-white lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={t("common.closeNavigation")}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-app-nav-title"
            className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-white/5 bg-zinc-950 p-4 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div
                id="mobile-app-nav-title"
                className="text-sm font-medium tracking-tight text-white"
              >
                {uiCopy.appName}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={t("common.closeNavigation")}
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/10 bg-zinc-900/50 text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <AppNavigation
              variant="mobile"
              onNavigate={() => setIsOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  );
}
