"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  DASHBOARD_WIDGETS,
  getWidgetsForRole,
  type DashboardWidgetId,
} from "../config/widget-registry";

// ─── Types ───────────────────────────────────────────────────

export type WidgetPreference = {
  id: DashboardWidgetId;
  visible: boolean;
  order: number;
  colSpan: 1 | 2;
};

export type DashboardLayout = WidgetPreference[];

// ─── Storage ─────────────────────────────────────────────────

const STORAGE_KEY_PREFIX = "agencyos-dashboard-layout-";

function getStorageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

function loadLayout(userId: string): DashboardLayout | null {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as DashboardLayout;
  } catch {
    return null;
  }
}

function saveLayout(userId: string, layout: DashboardLayout) {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(layout));
  } catch {
    // localStorage full or disabled — fail silently
  }
}

// ─── Default layout builder ─────────────────────────────────

function buildDefaultLayout(role: string, agencyRole?: string | null): DashboardLayout {
  return getWidgetsForRole(role, agencyRole).map((w) => ({
    id: w.id,
    visible: w.defaultVisible,
    order: w.defaultOrder,
    colSpan: w.defaultColSpan,
  }));
}

/**
 * Reconcile saved layout with current registry:
 * - Remove widgets that are no longer in registry or not allowed for role
 * - Add new widgets that exist in registry but not in saved layout
 */
function reconcileLayout(
  saved: DashboardLayout,
  role: string,
  agencyRole?: string | null
): DashboardLayout {
  const allowed = getWidgetsForRole(role, agencyRole);
  const allowedIds = new Set(allowed.map((w) => w.id));
  const savedIds = new Set(saved.map((w) => w.id));
  const allowedMap = new Map(allowed.map((w) => [w.id, w]));

  // Keep only allowed widgets from saved layout, preserving colSpan
  const kept = saved
    .filter((w) => allowedIds.has(w.id))
    .map((w, idx) => ({
      ...w,
      order: idx,
      colSpan: w.colSpan ?? allowedMap.get(w.id)?.defaultColSpan ?? 1,
    }));

  // Add new widgets that weren't in saved
  const newWidgets = allowed
    .filter((w) => !savedIds.has(w.id))
    .map((w, idx) => ({
      id: w.id,
      visible: w.defaultVisible,
      order: kept.length + idx,
      colSpan: w.defaultColSpan,
    }));

  return [...kept, ...newWidgets];
}

// ─── Hook ────────────────────────────────────────────────────

export function useDashboardLayout(userId: string | undefined, role: string, agencyRole?: string | null) {
  const [isEditing, setIsEditing] = useState(false);
  const [layout, setLayout] = useState<DashboardLayout>(() =>
    buildDefaultLayout(role, agencyRole)
  );
  // Snapshot of layout before entering edit mode (for cancel/revert)
  const snapshotRef = useRef<DashboardLayout | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (!userId) return;
    const saved = loadLayout(userId);
    if (saved) {
      setLayout(reconcileLayout(saved, role, agencyRole));
    } else {
      setLayout(buildDefaultLayout(role, agencyRole));
    }
    setIsHydrated(true);
  }, [userId, role, agencyRole]);

  // ─── Sorted visible widgets ──────────────────────────────
  const visibleWidgets = useMemo(
    () =>
      [...layout]
        .filter((w) => w.visible)
        .sort((a, b) => a.order - b.order),
    [layout]
  );

  const sortedLayout = useMemo(
    () => [...layout].sort((a, b) => a.order - b.order),
    [layout]
  );

  // ─── Edit mode ────────────────────────────────────────────
  const startEditing = useCallback(() => {
    snapshotRef.current = [...layout];
    setIsEditing(true);
  }, [layout]);

  const cancelEditing = useCallback(() => {
    if (snapshotRef.current) {
      setLayout(snapshotRef.current);
    }
    snapshotRef.current = null;
    setIsEditing(false);
  }, []);

  const saveEditing = useCallback(() => {
    if (userId) {
      saveLayout(userId, layout);
    }
    snapshotRef.current = null;
    setIsEditing(false);
  }, [userId, layout]);

  // ─── Widget actions ───────────────────────────────────────
  const toggleWidget = useCallback((widgetId: DashboardWidgetId) => {
    setLayout((prev) =>
      prev.map((w) =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      )
    );
  }, []);

  const moveWidget = useCallback(
    (widgetId: DashboardWidgetId, direction: "up" | "down") => {
      setLayout((prev) => {
        const sorted = [...prev].sort((a, b) => a.order - b.order);
        const idx = sorted.findIndex((w) => w.id === widgetId);
        if (idx < 0) return prev;

        const targetIdx = direction === "up" ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= sorted.length) return prev;

        // Swap orders
        const temp = sorted[idx].order;
        sorted[idx] = { ...sorted[idx], order: sorted[targetIdx].order };
        sorted[targetIdx] = { ...sorted[targetIdx], order: temp };

        return sorted;
      });
    },
    []
  );

  const resizeWidget = useCallback(
    (widgetId: DashboardWidgetId, colSpan: 1 | 2) => {
      setLayout((prev) =>
        prev.map((w) =>
          w.id === widgetId ? { ...w, colSpan } : w
        )
      );
    },
    []
  );

  const resetToDefault = useCallback(() => {
    const defaults = buildDefaultLayout(role, agencyRole);
    setLayout(defaults);
  }, [role, agencyRole]);

  // ─── Widget def lookup ────────────────────────────────────
  const getWidgetDef = useCallback(
    (widgetId: DashboardWidgetId) =>
      DASHBOARD_WIDGETS.find((w) => w.id === widgetId) ?? null,
    []
  );

  return {
    layout: sortedLayout,
    visibleWidgets,
    isEditing,
    isHydrated,
    startEditing,
    cancelEditing,
    saveEditing,
    toggleWidget,
    moveWidget,
    resizeWidget,
    resetToDefault,
    getWidgetDef,
  };
}
