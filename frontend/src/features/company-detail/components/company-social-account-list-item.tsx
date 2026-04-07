"use client";

import type { CompanySocialAccountItem } from "../types";
import { useLabels } from "@/lib/labels";

interface CompanySocialAccountListItemProps {
  account: CompanySocialAccountItem;
}

function getPlatformBadge(label: string) {
  return (
    <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">
      {label}
    </span>
  );
}

function getActivityBadge(isActive: boolean, label: string) {
  if (isActive) {
    return (
      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
        {label}
      </span>
    );
  }

  return (
    <span className="rounded-full border border-zinc-700/50 bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
      {label}
    </span>
  );
}

function getAccountInitials(accountName: string) {
  const trimmed = accountName.trim();
  if (!trimmed) {
    return "@";
  }

  return trimmed.slice(0, 2).toUpperCase();
}

export function CompanySocialAccountListItem({
  account,
}: CompanySocialAccountListItemProps) {
  const { getActiveStateLabel, getPlatformLabel } = useLabels();
  const platformLabel = getPlatformLabel(account.platform);
  const activityLabel = getActiveStateLabel(account.isActive);
  const initials = getAccountInitials(account.accountName);

  return (
    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/5 bg-zinc-900 text-xs font-medium text-zinc-300">
          {initials}
        </div>

        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-zinc-100">
            {account.accountName}
          </div>
          <div className="truncate text-xs text-zinc-500">
            {platformLabel}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {getPlatformBadge(platformLabel)}
        {getActivityBadge(account.isActive, activityLabel)}
      </div>
    </div>
  );
}
