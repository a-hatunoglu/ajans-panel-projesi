"use client";

import type { CalendarItem } from "../types";
import { useUiCopy } from "@/lib/copy";
import { useFormatters } from "@/lib/formatters";
import { useLabels } from "@/lib/labels";
import Link from "next/link";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";


function getContextLabel(
  item: CalendarItem,
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

export function CalendarItemCard({ item }: { item: CalendarItem }) {
  const uiCopy = useUiCopy();
  const { formatTimeOfDay } = useFormatters();
  const { getContentStatusLabel, getPlatformLabel } = useLabels();
  const platformLabel = getPlatformLabel(item.platform);
  const statusLabel = getContentStatusLabel(item.status);
  const contextLabel = getContextLabel(item, platformLabel, uiCopy.platformUnavailable);
  
  const assignees = [item.assignedDesigner, item.assignedEditor].filter(Boolean);

  return (
    <Link 
      href={`/app/contents/${item.id}`}
      className="group relative flex w-full flex-col gap-2 overflow-hidden rounded-md border border-white/5 bg-zinc-900/40 p-3 text-left transition-colors hover:bg-zinc-800/60 hover:cursor-pointer"
    >
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-zinc-700 group-hover:bg-primary transition-colors" />

      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-zinc-300">
          {formatTimeOfDay(item.displayAt)}
        </span>
        <ContentStatusBadge status={item.status} label={statusLabel} />
      </div>

      <div className="flex flex-col">
        <span className="truncate text-sm font-medium text-zinc-100 transition-colors group-hover:text-white">
          {item.title}
        </span>
        <span className="mt-0.5 truncate text-[11px] text-zinc-500">
          {contextLabel}
        </span>
        
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="truncate text-[11px] text-zinc-400">
            {item?.companyName || "Bilinmiyor"}
          </span>
          {assignees.length > 0 && (
            <div className="flex -space-x-1.5 overflow-hidden">
              {assignees.map((assignee, index) => assignee && assignee.firstName && (
                <div
                  key={`${assignee.id || index}-${index}`}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-900 bg-zinc-800"
                  title={`${assignee.firstName} ${assignee.lastName || ""}`}
                >
                  <span className="text-[9px] font-medium text-zinc-400">
                    {assignee.firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
