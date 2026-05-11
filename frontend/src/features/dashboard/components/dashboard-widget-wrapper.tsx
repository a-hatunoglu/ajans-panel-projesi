"use client";

import { ChevronUp, ChevronDown, Eye, EyeOff, Maximize2, Minimize2 } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import type { DashboardWidgetId, DashboardWidgetDef } from "../config/widget-registry";

/** Widget IDs that render their own card grid (no wrapper card needed) */
const CARDLESS_WIDGETS: DashboardWidgetId[] = ["stat-cards"];

interface DashboardWidgetWrapperProps {
  widgetDef: DashboardWidgetDef;
  colSpan: 1 | 2;
  isEditing: boolean;
  isVisible: boolean;
  isFirst: boolean;
  isLast: boolean;
  onToggle: (id: DashboardWidgetId) => void;
  onMove: (id: DashboardWidgetId, direction: "up" | "down") => void;
  onResize: (id: DashboardWidgetId, colSpan: 1 | 2) => void;
  children: React.ReactNode;
}

export function DashboardWidgetWrapper({
  widgetDef,
  colSpan,
  isEditing,
  isVisible,
  isFirst,
  isLast,
  onToggle,
  onMove,
  onResize,
  children,
}: DashboardWidgetWrapperProps) {
  const { t } = useI18n();

  const spanClass = colSpan === 2 ? "col-span-1 lg:col-span-2" : "col-span-1";
  const isCardless = CARDLESS_WIDGETS.includes(widgetDef.id);

  if (!isEditing) {
    if (!isVisible) return null;

    // Cardless widgets (stat-cards): render as-is, no card wrapper
    if (isCardless) {
      return <div className={spanClass}>{children}</div>;
    }

    // Panel widgets: unified card with integrated title header
    return (
      <div
        className={`${spanClass} flex flex-col rounded-xl border border-white/[0.06] bg-zinc-950/80`}
      >
        {/* Card header */}
        <div className="flex items-center px-5 py-3.5 border-b border-white/[0.04]">
          <h2 className="text-[13px] font-medium text-zinc-300 tracking-tight">
            {t(widgetDef.labelKey)}
          </h2>
        </div>

        {/* Card body */}
        <div className="flex-1 min-h-0">{children}</div>
      </div>
    );
  }

  // ─── Edit mode ──────────────────────────────────────────────
  return (
    <div
      className={`relative rounded-xl border transition-all duration-200 ${spanClass} ${
        isVisible
          ? "border-blue-500/30 bg-blue-500/[0.02]"
          : "border-zinc-800/60 bg-zinc-900/20 opacity-50"
      }`}
    >
      {/* Edit header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-inherit">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-300">
            {t(widgetDef.labelKey)}
          </span>
          {widgetDef.comingSoon && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-700/50">
              {t("dashboard.layout.comingSoon")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Resize toggle */}
          <button
            type="button"
            onClick={() => onResize(widgetDef.id, colSpan === 1 ? 2 : 1)}
            className="h-6 w-6 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            title={colSpan === 1 ? t("dashboard.layout.resizeFull") : t("dashboard.layout.resizeHalf")}
          >
            {colSpan === 1 ? (
              <Maximize2 className="w-3 h-3" />
            ) : (
              <Minimize2 className="w-3 h-3" />
            )}
          </button>

          {/* Separator */}
          <div className="w-px h-3.5 bg-zinc-800 mx-0.5" />

          {/* Move up */}
          <button
            type="button"
            onClick={() => onMove(widgetDef.id, "up")}
            disabled={isFirst}
            className="h-6 w-6 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title={t("dashboard.layout.moveUp")}
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          {/* Move down */}
          <button
            type="button"
            onClick={() => onMove(widgetDef.id, "down")}
            disabled={isLast}
            className="h-6 w-6 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title={t("dashboard.layout.moveDown")}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Visibility toggle */}
          <button
            type="button"
            onClick={() => onToggle(widgetDef.id)}
            className={`h-6 w-6 flex items-center justify-center rounded transition-colors ${
              isVisible
                ? "text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                : "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800"
            }`}
            title={
              isVisible
                ? t("dashboard.layout.hideWidget")
                : t("dashboard.layout.showWidget")
            }
          >
            {isVisible ? (
              <Eye className="w-3.5 h-3.5" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Widget content (collapsed when hidden in edit mode) */}
      <div
        className={`transition-all duration-200 ${
          isVisible ? "p-4" : "h-0 overflow-hidden"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

