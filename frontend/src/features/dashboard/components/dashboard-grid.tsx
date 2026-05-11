"use client";

import type { DashboardWidgetId } from "../config/widget-registry";
import type { WidgetPreference } from "../hooks/use-dashboard-layout";
import type { DashboardWidgetDef } from "../config/widget-registry";
import type { DashboardData } from "../types";
import { DashboardWidgetWrapper } from "./dashboard-widget-wrapper";
import { DashboardInlineStatePanel } from "./dashboard-inline-state-panel";
import { StatCards } from "./stat-cards";
import { NeedsAttentionList } from "./needs-attention-list";
import { UpcomingSchedule } from "./upcoming-schedule";
import { ActivityFeed } from "./activity-feed";
import { BillingAlerts } from "./billing-alerts";
import { SystemHealthWidget } from "@/features/system-health/components/system-health-widget";
import { useI18n } from "@/i18n/provider";

interface DashboardGridProps {
  layout: WidgetPreference[];
  data: DashboardData;
  isEditing: boolean;
  onToggle: (id: DashboardWidgetId) => void;
  onMove: (id: DashboardWidgetId, direction: "up" | "down") => void;
  onResize: (id: DashboardWidgetId, colSpan: 1 | 2) => void;
  getWidgetDef: (id: DashboardWidgetId) => DashboardWidgetDef | null;
}

function WidgetContent({
  widgetId,
  data,
}: {
  widgetId: DashboardWidgetId;
  data: DashboardData;
}) {
  const { t } = useI18n();

  switch (widgetId) {
    case "stat-cards":
      return <StatCards stats={data.stats} />;

    case "needs-attention":
      return data.sections.attention ? (
        <NeedsAttentionList items={data.attentionItems} />
      ) : (
        <DashboardInlineStatePanel
          message={t("dashboard.attentionUnavailable")}
        />
      );

    case "upcoming-schedule":
      return data.sections.schedule ? (
        <UpcomingSchedule items={data.scheduleItems} />
      ) : (
        <DashboardInlineStatePanel
          message={t("dashboard.scheduleUnavailable")}
        />
      );

    case "activity-feed":
      return data.sections.activity ? (
        <ActivityFeed items={data.activityItems} />
      ) : (
        <DashboardInlineStatePanel
          message={t("dashboard.activityUnavailable")}
        />
      );

    case "billing-alerts":
      return data.sections.billing ? (
        <BillingAlerts items={data.billingItems} />
      ) : (
        <DashboardInlineStatePanel
          message={t("dashboard.billingUnavailable")}
        />
      );

    case "system-health":
      return <SystemHealthWidget />;

    default:
      return null;
  }
}

export function DashboardGrid({
  layout,
  data,
  isEditing,
  onToggle,
  onMove,
  onResize,
  getWidgetDef,
}: DashboardGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {layout.map((pref, index) => {
        const def = getWidgetDef(pref.id);
        if (!def) return null;

        return (
          <DashboardWidgetWrapper
            key={pref.id}
            widgetDef={def}
            colSpan={pref.colSpan}
            isEditing={isEditing}
            isVisible={pref.visible}
            isFirst={index === 0}
            isLast={index === layout.length - 1}
            onToggle={onToggle}
            onMove={onMove}
            onResize={onResize}
          >
            <WidgetContent widgetId={pref.id} data={data} />
          </DashboardWidgetWrapper>
        );
      })}
    </div>
  );
}

