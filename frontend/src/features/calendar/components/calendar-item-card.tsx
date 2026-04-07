"use client";

import type { CalendarItem } from "../types";
import { useUiCopy } from "@/lib/copy";
import { useFormatters } from "@/lib/formatters";
import { useLabels } from "@/lib/labels";

function getStatusBadge(status: CalendarItem["status"], label: string) {
  switch (status) {
    case "draft":
      return (
        <span className="rounded-full border border-zinc-500/20 bg-zinc-500/10 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
          {label}
        </span>
      );
    case "in_review":
      return (
        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">
          {label}
        </span>
      );
    case "revise":
      return (
        <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-medium text-orange-400">
          {label}
        </span>
      );
    case "approved":
      return (
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
          {label}
        </span>
      );
    case "scheduled":
      return (
        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400">
          {label}
        </span>
      );
    case "published":
      return (
        <span className="rounded-full border border-zinc-700/50 bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
          {label}
        </span>
      );
  }
}

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

  return (
    <div className="group relative flex w-full cursor-default flex-col gap-2 overflow-hidden rounded-md border border-white/5 bg-zinc-900/40 p-3 text-left transition-colors hover:bg-zinc-800/60">
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-zinc-700 group-hover:bg-primary transition-colors" />

      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-zinc-300">
          {formatTimeOfDay(item.displayAt)}
        </span>
        {getStatusBadge(item.status, statusLabel)}
      </div>

      <div className="flex flex-col">
        <span className="truncate text-sm font-medium text-zinc-100 transition-colors group-hover:text-white">
          {item.title}
        </span>
        <span className="mt-0.5 truncate text-[11px] text-zinc-500">
          {contextLabel}
        </span>
        <span className="mt-0.5 truncate text-[11px] text-zinc-400">
          {item.companyName}
        </span>
      </div>
    </div>
  );
}
