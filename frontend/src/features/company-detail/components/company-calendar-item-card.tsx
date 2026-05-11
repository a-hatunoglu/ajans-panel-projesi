"use client";

import type { CompanyCalendarItem } from "../types";
import { useUiCopy } from "@/lib/copy";
import { useFormatters } from "@/lib/formatters";
import { useLabels } from "@/lib/labels";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";

interface CompanyCalendarItemCardProps {
  item: CompanyCalendarItem;
}


function getContextLabel(
  item: CompanyCalendarItem,
  platformLabel: string,
  unavailableLabel: string,
) {
  if (!item.platform && !item.socialAccountName) {
    return unavailableLabel;
  }

  if (!item.socialAccountName) {
    return platformLabel;
  }

  if (!item.platform) {
    return item.socialAccountName;
  }

  return `${platformLabel} / ${item.socialAccountName}`;
}

export function CompanyCalendarItemCard({
  item,
}: CompanyCalendarItemCardProps) {
  const uiCopy = useUiCopy();
  const { formatTimeOfDay } = useFormatters();
  const { getContentStatusLabel, getPlatformLabel } = useLabels();
  const platformLabel = getPlatformLabel(item.platform);
  const statusLabel = getContentStatusLabel(item.status);
  const contextLabel = getContextLabel(item, platformLabel, uiCopy.platformUnavailable);

  return (
    <div className="relative flex w-full cursor-default flex-col gap-2 overflow-hidden rounded-md border border-white/5 bg-zinc-900/40 p-3 text-left">
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-zinc-700" />

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-zinc-300">
          {formatTimeOfDay(item.displayAt)}
        </span>
        <ContentStatusBadge status={item.status} label={statusLabel} />
      </div>

      <div className="flex flex-col">
        <span className="truncate text-sm font-medium text-zinc-100">
          {item.title}
        </span>
        <span className="mt-0.5 truncate text-[11px] text-zinc-500">
          {contextLabel}
        </span>
      </div>
    </div>
  );
}
