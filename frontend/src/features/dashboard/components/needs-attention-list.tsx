"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AttentionItem } from "../types";
import { useUiCopy } from "@/lib/copy";
import { useFormatters } from "@/lib/formatters";
import { useLabels } from "@/lib/labels";

function getBadgeColor(status: AttentionItem["status"]) {
  switch (status) {
    case "in_review":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "revise":
      return "bg-orange-500/10 text-orange-400 border-orange-500/20";
  }
}

export function NeedsAttentionList({ items }: { items: AttentionItem[] }) {
  const uiCopy = useUiCopy();
  const { formatCompactDate } = useFormatters();
  const { getContentDateKindLabel, getContentStatusLabel } = useLabels();

  if (items.length === 0) {
    return (
      <div className="p-8 text-center border border-white/5 rounded-xl bg-zinc-950">
        <p className="text-sm text-zinc-500">{uiCopy.allCaughtUp}</p>
      </div>
    );
  }

  return (
    <div className="border border-white/5 rounded-xl bg-zinc-950 divide-y divide-white/5 flex flex-col">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/app/contents/${item.id}`}
          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-white/5 transition-colors text-left w-full"
        >
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate text-zinc-200 group-hover:text-white transition-colors">
                {item.title}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getBadgeColor(item.status)}`}>
                {getContentStatusLabel(item.status)}
              </span>
            </div>
            <span className="text-xs text-zinc-500">{item.companyName} | {getContentDateKindLabel(item.dateKind)} {formatCompactDate(item.dateAt)}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0 hidden sm:block" />
        </Link>
      ))}
    </div>
  );
}
