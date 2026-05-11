// ─── Dashboard Widget Registry ───────────────────────────────
// Central definition of all available dashboard widgets, their
// role-based visibility, and default layout configuration.

export type DashboardWidgetId =
  | "stat-cards"
  | "needs-attention"
  | "upcoming-schedule"
  | "activity-feed"
  | "billing-alerts"
  | "system-health";

export type DashboardWidgetDef = {
  id: DashboardWidgetId;
  labelKey: string;
  allowedRoles: string[];
  defaultVisible: boolean;
  defaultOrder: number;
  /** Grid column span: 1 = half width, 2 = full width */
  defaultColSpan: 1 | 2;
  /** If true, the widget's data source is not yet wired to the backend */
  comingSoon?: boolean;
};

export const DASHBOARD_WIDGETS: DashboardWidgetDef[] = [
  {
    id: "stat-cards",
    labelKey: "dashboard.widgets.statCards",
    allowedRoles: ["platform_owner", "user"],
    defaultVisible: true,
    defaultOrder: 0,
    defaultColSpan: 2,
  },
  {
    id: "needs-attention",
    labelKey: "dashboard.widgets.needsAttention",
    allowedRoles: ["platform_owner", "user"],
    defaultVisible: true,
    defaultOrder: 1,
    defaultColSpan: 1,
  },
  {
    id: "upcoming-schedule",
    labelKey: "dashboard.widgets.upcomingSchedule",
    allowedRoles: ["platform_owner", "user"],
    defaultVisible: true,
    defaultOrder: 2,
    defaultColSpan: 1,
  },
  {
    id: "activity-feed",
    labelKey: "dashboard.widgets.activityFeed",
    allowedRoles: ["platform_owner", "agency_admin"],
    defaultVisible: true,
    defaultOrder: 3,
    defaultColSpan: 1,
  },
  {
    id: "billing-alerts",
    labelKey: "dashboard.widgets.billingAlerts",
    allowedRoles: ["platform_owner", "agency_admin"],
    defaultVisible: true,
    defaultOrder: 4,
    defaultColSpan: 1,
  },
  {
    id: "system-health",
    labelKey: "dashboard.widgets.systemHealth",
    allowedRoles: ["platform_owner"],
    defaultVisible: true,
    defaultOrder: 5,
    defaultColSpan: 2,
  },
];

/** Utility: get role-filtered widgets for a user */
export function getWidgetsForRole(role: string, agencyRole?: string | null): DashboardWidgetDef[] {
  return DASHBOARD_WIDGETS.filter(
    (w) => w.allowedRoles.includes(role) || (agencyRole && w.allowedRoles.includes(agencyRole))
  );
}
