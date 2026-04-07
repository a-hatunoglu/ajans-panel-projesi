import type { TranslateFn } from "@/i18n/types";
import { TabItem } from "./types";

export function getCompanyTabs(t: TranslateFn): TabItem[] {
  return [
    { id: "overview", label: t("companyDetail.tabs.overview"), allowedRoles: ["owner", "admin", "editor", "designer", "client"] },
    { id: "social", label: t("companyDetail.tabs.social"), allowedRoles: ["owner", "admin", "editor", "designer", "client"] },
    { id: "contents", label: t("companyDetail.tabs.contents"), allowedRoles: ["owner", "admin", "editor", "designer", "client"] },
    { id: "calendar", label: t("companyDetail.tabs.calendar"), allowedRoles: ["owner", "admin", "editor", "designer", "client"] },
    { id: "payments", label: t("companyDetail.tabs.payments"), allowedRoles: ["owner", "admin"] },
    { id: "users", label: t("companyDetail.tabs.users"), allowedRoles: ["owner", "admin"] },
    { id: "activity", label: t("companyDetail.tabs.activity"), allowedRoles: ["owner", "admin"] },
  ];
}
