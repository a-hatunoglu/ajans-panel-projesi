import type { TranslateFn } from "@/i18n/types";

export type NavItem = {
  label: string;
  href: string;
  allowedRoles: string[]; // e.g., ['owner', 'admin', 'editor', 'designer', 'client']
};

export function getNavigationItems(t: TranslateFn): NavItem[] {
  return [
    {
      label: t("navigation.dashboard"),
      href: "/app",
      allowedRoles: ["owner", "admin", "editor", "designer", "client"],
    },
    {
      label: t("navigation.companies"),
      href: "/app/companies",
      allowedRoles: ["owner", "admin", "editor", "designer"],
    },
    {
      label: t("navigation.contents"),
      href: "/app/contents",
      allowedRoles: ["owner", "admin", "editor", "designer", "client"],
    },
    {
      label: t("navigation.calendar"),
      href: "/app/calendar",
      allowedRoles: ["owner", "admin", "editor", "designer", "client"],
    },
    {
      label: t("navigation.notifications"),
      href: "/app/notifications",
      allowedRoles: ["owner", "admin", "editor", "designer", "client"],
    },
    {
      label: t("navigation.payments"),
      href: "/app/payments",
      allowedRoles: ["owner", "admin"],
    },
    {
      label: t("navigation.activity"),
      href: "/app/activity",
      allowedRoles: ["owner", "admin"],
    },
  ];
}
