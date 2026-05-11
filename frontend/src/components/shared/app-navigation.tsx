"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/i18n/provider";
import {
  getNavigationItems,
  getPlatformNavigationItems,
} from "@/lib/navigation";
import { isPlatformOwner } from "@/lib/roles";
import { useUnreadCount } from "@/features/notifications/api/queries";
import { cn } from "@/lib/utils";

type AppNavigationVariant = "desktop" | "mobile";

interface AppNavigationProps {
  variant?: AppNavigationVariant;
  className?: string;
  onNavigate?: () => void;
}

function isNavItemActive(pathname: string, href: string) {
  if (href === "/app" || href === "/app/platform") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Determines whether the platform owner is currently in platform-level view
 * (as opposed to impersonating an agency).
 */
function useIsPlatformView() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user || !isPlatformOwner(user.role)) return false;

  // If on /app/platform routes → definitely platform view
  if (pathname.startsWith("/app/platform")) return true;

  // If no active agency in localStorage → platform view
  if (typeof window !== "undefined") {
    return !localStorage.getItem("agencyos-active-agency-id");
  }
  return true;
}

export function AppNavigation({
  variant = "desktop",
  className,
  onNavigate,
}: AppNavigationProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const pathname = usePathname();
  const userRole = user?.role || "guest";
  const userAgencyRole = user?.agencyRole;
  const isInPlatformView = useIsPlatformView();

  const visibleNavItems = isInPlatformView
    ? getPlatformNavigationItems()
    : getNavigationItems(t).filter((item) =>
        item.allowedRoles.includes(userRole) ||
        (userAgencyRole && item.allowedRoles.includes(userAgencyRole)),
      );

  const { data: unreadCount } = useUnreadCount();
  const hasUnread = (unreadCount ?? 0) > 0;

  return (
    <nav
      className={cn(
        "relative z-10 flex flex-col",
        variant === "desktop" ? "gap-1" : "gap-2",
        className,
      )}
    >
      {visibleNavItems.map((item) => {
        const isActive = isNavItemActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            data-tour={item.tourKey}
            className={cn(
              "flex items-center rounded-md transition-colors",
              variant === "desktop"
                ? "px-2 py-1.5 text-sm"
                : "px-3 py-2.5 text-sm font-medium",
              isActive
                ? "bg-zinc-900 text-white font-medium"
                : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white",
            )}
          >
            {item.label}
            {item.href === "/app/notifications" && hasUnread && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
