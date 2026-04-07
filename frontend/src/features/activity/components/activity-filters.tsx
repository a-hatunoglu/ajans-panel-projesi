"use client";

import type { ChangeEvent } from "react";
import {
  ACTIVITY_ACTION_FILTER_OPTIONS,
  ACTIVITY_RESOURCE_TYPE_FILTER_OPTIONS,
  type ActivityActionFilter,
  type ActivityResourceTypeFilter,
} from "../types";
import { useLabels } from "@/lib/labels";
import { useI18n } from "@/i18n/provider";

type ActivityActionValue = ActivityActionFilter | "all";
type ActivityResourceValue = ActivityResourceTypeFilter | "all";

interface ActivityFiltersProps {
  actionValue: ActivityActionValue;
  resourceTypeValue: ActivityResourceValue;
  onActionChange: (action: ActivityActionValue) => void;
  onResourceTypeChange: (resourceType: ActivityResourceValue) => void;
}

export function ActivityFilters({
  actionValue,
  resourceTypeValue,
  onActionChange,
  onResourceTypeChange,
}: ActivityFiltersProps) {
  const { t } = useI18n();
  const { getActivityActionLabel, getActivityResourceLabel } = useLabels();

  function handleActionChange(event: ChangeEvent<HTMLSelectElement>) {
    onActionChange(event.target.value as ActivityActionValue);
  }

  function handleResourceTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    onResourceTypeChange(event.target.value as ActivityResourceValue);
  }

  return (
    <div className="mb-4 flex flex-col gap-3 py-4 md:flex-row md:items-center">
      <select
        value={actionValue}
        onChange={handleActionChange}
        className="h-9 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary md:w-56"
        aria-label={t("activity.filters.action")}
      >
        <option value="all">{t("activity.filters.allActions")}</option>
        {ACTIVITY_ACTION_FILTER_OPTIONS.map((action) => (
          <option key={action} value={action}>
            {getActivityActionLabel(action)}
          </option>
        ))}
      </select>

      <select
        value={resourceTypeValue}
        onChange={handleResourceTypeChange}
        className="h-9 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary md:w-48"
        aria-label={t("activity.filters.resource")}
      >
        <option value="all">{t("activity.filters.allResources")}</option>
        {ACTIVITY_RESOURCE_TYPE_FILTER_OPTIONS.map((resourceType) => (
          <option key={resourceType} value={resourceType}>
            {getActivityResourceLabel(resourceType)}
          </option>
        ))}
      </select>
    </div>
  );
}
