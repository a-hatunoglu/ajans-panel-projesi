import type { TranslateFn } from "@/i18n/types";

export type NavItem = {
  label: string;
  href: string;
  allowedRoles: string[]; // e.g., ['platform_owner', 'user', 'editor', 'designer', 'client']
  tourKey?: string; // data-tour attribute value for onboarding spotlight
};

/** Navigation items for the agency panel (agency admin + users) */
export function getNavigationItems(t: TranslateFn): NavItem[] {
  return [
    {
      label: t("navigation.dashboard"),
      href: "/app",
      allowedRoles: ["platform_owner", "user"],
      tourKey: "sidebar-dashboard",
    },
    {
      label: t("navigation.companies"),
      href: "/app/companies",
      allowedRoles: ["platform_owner", "user"],
      tourKey: "sidebar-companies",
    },
    {
      label: t("navigation.contents"),
      href: "/app/contents",
      allowedRoles: ["platform_owner", "user"],
      tourKey: "sidebar-contents",
    },
    {
      label: t("navigation.calendar"),
      href: "/app/calendar",
      allowedRoles: ["platform_owner", "user"],
      tourKey: "sidebar-calendar",
    },
    {
      label: t("navigation.team"),
      href: "/app/team",
      allowedRoles: ["platform_owner", "agency_admin"],
      tourKey: "sidebar-team",
    },
    {
      label: t("navigation.notifications"),
      href: "/app/notifications",
      allowedRoles: ["platform_owner", "user"],
      tourKey: "sidebar-notifications",
    },
    {
      label: t("navigation.payments"),
      href: "/app/payments",
      allowedRoles: ["platform_owner", "agency_admin"],
      tourKey: "sidebar-payments",
    },
    {
      label: t("navigation.activity"),
      href: "/app/activity",
      allowedRoles: ["platform_owner", "agency_admin"],
      tourKey: "sidebar-activity",
    },
    {
      label: t("navigation.systemHealth"),
      href: "/app/system-health",
      allowedRoles: ["platform_owner"],
    },
  ];
}

/** Navigation items for the platform owner panel */
export function getPlatformNavigationItems(): NavItem[] {
  return [
    {
      label: "Platform",
      href: "/app/platform",
      allowedRoles: ["platform_owner"],
    },
    {
      label: "Ajanslar",
      href: "/app/platform/agencies",
      allowedRoles: ["platform_owner"],
    },
    {
      label: "Sistem Sağlığı",
      href: "/app/system-health",
      allowedRoles: ["platform_owner"],
    },
  ];
}
