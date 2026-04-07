"use client";

import type { CompanyActivityItem } from "../types";
import { useFormatters } from "@/lib/formatters";
import { useLabels } from "@/lib/labels";

interface CompanyActivityListItemProps {
  item: CompanyActivityItem;
}

function getActorInitial(actorName: string) {
  return actorName.charAt(0).toUpperCase() || "S";
}

export function CompanyActivityListItem({
  item,
}: CompanyActivityListItemProps) {
  const { formatRelativeTime } = useFormatters();
  const { getActivityActionLabel, getActivityResourceLabel } = useLabels();

  return (
    <div className="flex w-full flex-col justify-between gap-4 p-4 text-left transition-colors hover:bg-zinc-900/40 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/5 bg-zinc-900 text-zinc-300">
          <span className="text-[10px] font-medium uppercase">
            {getActorInitial(item.actorName)}
          </span>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 text-sm leading-snug">
            <span className="font-medium text-zinc-200">{item.actorName}</span>
            <span className="text-zinc-500">
              {getActivityActionLabel(item.action)}
            </span>
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {getActivityResourceLabel(item.resourceType)}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-start pl-11 sm:justify-end sm:pl-0">
        <span className="whitespace-nowrap text-xs text-zinc-600">
          {formatRelativeTime(item.createdAt)}
        </span>
      </div>
    </div>
  );
}
