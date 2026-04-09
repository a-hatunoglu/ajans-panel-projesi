"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Settings, LogOut, Bell } from "lucide-react";
import Link from "next/link";
import { MobileAppNav } from "@/components/shared/mobile-app-nav";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/i18n/provider";
import { useUnreadCount } from "@/features/notifications/api/queries";

function NotificationBell() {
  const { t } = useI18n();
  const { data: unreadCount } = useUnreadCount();
  const count = unreadCount ?? 0;

  return (
    <Link
      href="/app/notifications"
      className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200 shrink-0"
      aria-label={t("topbar.notifications")}
    >
      <Bell className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

export function Topbar() {
  const { user, isLoading, logout } = useAuth();
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const displayName = isLoading
    ? t("common.loadingUser")
    : ((user?.firstName || "") + " " + (user?.lastName || "")).trim() ||
      user?.email ||
      t("common.guest");

  const roleKey = user?.role as
    | "owner"
    | "admin"
    | "editor"
    | "designer"
    | "client"
    | undefined;
  const roleLabel = roleKey
    ? t(`labels.userRole.${roleKey}`)
    : null;

  const close = useCallback(() => setIsOpen(false), []);

  // Close on click-outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        close();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, close]);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/80 px-4 backdrop-blur sm:px-6">
      <div className="flex h-16 items-center justify-between gap-3">
        <div className="lg:hidden">
          <MobileAppNav />
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-3 sm:gap-4">
          <NotificationBell />
          <LocaleSwitcher className="shrink-0" />

          {/* Account trigger */}
          <div className="relative">
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-lg p-1.5 -m-1.5 transition-colors hover:bg-white/5 cursor-pointer group"
              aria-expanded={isOpen}
              aria-haspopup="true"
            >
              <UserAvatar 
                avatarUrl={user?.avatarUrl} 
                firstName={user?.firstName} 
                lastName={user?.lastName} 
                email={user?.email} 
                size="sm" 
                className="group-hover:border-white/20"
              />

              <span className="hidden max-w-[14rem] truncate text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors sm:block">
                {displayName}
              </span>
            </button>

            {/* Popover */}
            {isOpen && (
              <div
                ref={popoverRef}
                role="menu"
                className="absolute right-0 top-full mt-2 w-64 origin-top-right animate-in fade-in zoom-in-95 duration-150 rounded-xl border border-white/5 bg-zinc-950 shadow-xl shadow-black/40"
              >
                {/* Identity block */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <UserAvatar 
                      avatarUrl={user?.avatarUrl} 
                      firstName={user?.firstName} 
                      lastName={user?.lastName} 
                      email={user?.email} 
                      size="md" 
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-100">
                        {((user?.firstName || "") + " " + (user?.lastName || "")).trim() || t("common.guest")}
                      </p>
                      {user?.email && (
                        <p className="mt-0.5 truncate text-xs text-zinc-500">
                          {user.email}
                        </p>
                      )}
                      {roleLabel && (
                        <span className="mt-1.5 inline-block rounded-md border border-white/5 bg-zinc-900 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                          {roleLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/5" />

                {/* Actions */}
                <div className="p-1.5">
                  <Link
                    href="/app/settings"
                    onClick={close}
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100"
                  >
                    <Settings className="h-4 w-4" />
                    {t("topbar.settings")}
                  </Link>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100 disabled:opacity-50 disabled:cursor-wait"
                  >
                    <LogOut className="h-4 w-4" />
                    {isLoggingOut
                      ? t("topbar.signingOut")
                      : t("topbar.signOut")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
