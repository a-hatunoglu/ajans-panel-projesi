"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ScheduleItem } from "../types";
import { useI18n } from "@/i18n/provider";
import { useUiCopy } from "@/lib/copy";
import { useLabels } from "@/lib/labels";
import { useFormatters } from "@/lib/formatters";

function getContextLabel(
  item: ScheduleItem,
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

export function UpcomingSchedule({ items }: { items: ScheduleItem[] }) {
  const { t } = useI18n();
  const uiCopy = useUiCopy();
  const { getPlatformLabel } = useLabels();
  const { formatScheduleDateTime } = useFormatters();

  if (items.length === 0) {
    return (
      <div className="p-8 text-center border border-white/5 rounded-xl bg-zinc-950">
        <p className="text-sm text-zinc-500">{t("dashboard.emptySchedule")}</p>
      </div>
    );
  }

  return (
    <div className="border border-white/5 rounded-xl bg-zinc-950 divide-y divide-white/5">
      {items.map((item) => {
        const platformLabel = getPlatformLabel(item.platform);
        const contextLabel = getContextLabel(item, platformLabel, uiCopy.platformUnavailable);

        return (
          <Link
            key={item.id}
            href={`/app/contents/${item.id}`}
            className="p-4 flex items-center justify-between gap-4 group hover:bg-white/5 transition-colors text-left w-full"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <span className="truncate text-sm text-zinc-200 group-hover:text-white transition-colors">{item.title}</span>
              <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-zinc-500">
                <span className="truncate">{contextLabel}</span>
                <span>|</span>
                <span className="truncate">{item.companyName}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-xs tabular-nums text-zinc-400">
                {formatScheduleDateTime(item.scheduledAt)}
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors hidden sm:block" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
