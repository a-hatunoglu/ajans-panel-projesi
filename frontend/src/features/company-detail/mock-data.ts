import type { TranslateFn } from "@/i18n/types";
import { TabItem } from "./types";

export function getCompanyTabs(t: TranslateFn): TabItem[] {
  return [
    { id: "overview", label: t("companyDetail.tabs.overview"), allowedRoles: ["platform_owner", "agency_admin", "user"] },
    { id: "social", label: t("companyDetail.tabs.social"), allowedRoles: ["platform_owner", "agency_admin", "user"] },
    { id: "contents", label: t("companyDetail.tabs.contents"), allowedRoles: ["platform_owner", "agency_admin", "user"] },
    { id: "calendar", label: t("companyDetail.tabs.calendar"), allowedRoles: ["platform_owner", "agency_admin", "user"] },
    { id: "payments", label: t("companyDetail.tabs.payments"), allowedRoles: ["platform_owner", "agency_admin"] },
    { id: "users", label: t("companyDetail.tabs.users"), allowedRoles: ["platform_owner", "agency_admin"] },
    { id: "activity", label: t("companyDetail.tabs.activity"), allowedRoles: ["platform_owner", "agency_admin"] },
  ];
}
