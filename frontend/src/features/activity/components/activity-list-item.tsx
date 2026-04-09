"use client";

import { ActivityItem } from "../types";
import { useUiCopy } from "@/lib/copy";
import { useFormatters } from "@/lib/formatters";
import { useLabels } from "@/lib/labels";
import { UserAvatar } from "@/components/shared/user-avatar";

export function ActivityListItem({ item }: { item: ActivityItem }) {
  const uiCopy = useUiCopy();
  const { formatRelativeTime } = useFormatters();
  const { getActivityActionLabel, getActivityResourceLabel } = useLabels();
  const timeAgo = formatRelativeTime(item.createdAt);
  const companyLabel = item.companyName || uiCopy.globalScope;

  return (
    <div className="w-full p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-white/5 transition-colors text-left">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <UserAvatar
          name={item.actorName}
          size="sm"
        />

        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 text-sm leading-snug">
            <span className="font-medium text-zinc-200">{item.actorName}</span>
            <span className="text-zinc-500">{getActivityActionLabel(item.action)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span>{getActivityResourceLabel(item.resourceType)}</span>
            <span>|</span>
            <span>{companyLabel}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-start sm:justify-end shrink-0 pl-11 sm:pl-0">
        <span className="text-xs text-zinc-600 whitespace-nowrap">{timeAgo}</span>
      </div>
    </div>
  );
}
