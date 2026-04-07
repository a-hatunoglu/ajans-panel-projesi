"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/i18n/provider";
import { getNavigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type AppNavigationVariant = "desktop" | "mobile";

interface AppNavigationProps {
  variant?: AppNavigationVariant;
  className?: string;
  onNavigate?: () => void;
}

function isNavItemActive(pathname: string, href: string) {
  if (href === "/app") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
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
  const visibleNavItems = getNavigationItems(t).filter((item) =>
    item.allowedRoles.includes(userRole),
  );

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
            className={cn(
              "rounded-md transition-colors",
              variant === "desktop"
                ? "px-2 py-1.5 text-sm"
                : "px-3 py-2.5 text-sm font-medium",
              isActive
                ? "bg-zinc-900 text-white font-medium"
                : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
