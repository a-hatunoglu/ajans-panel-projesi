"use client";

import { Search, Plus } from "lucide-react";
import Link from "next/link";
import type { ChangeEvent } from "react";
import type { ContentStatus, ContentsListSort } from "../types";
import { useLabels } from "@/lib/labels";
import { useI18n } from "@/i18n/provider";

type ContentsToolbarStatusValue = ContentStatus | "all";

interface ContentsToolbarProps {
  canCreate: boolean;
  searchValue: string;
  statusValue: ContentsToolbarStatusValue;
  sortValue: ContentsListSort;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: ContentsToolbarStatusValue) => void;
  onSortChange: (value: ContentsListSort) => void;
}

const STATUS_OPTIONS: ContentStatus[] = [
  "draft",
  "in_review",
  "revise",
  "approved",
  "scheduled",
  "published",
];

export function ContentsToolbar({
  canCreate,
  searchValue,
  statusValue,
  sortValue,
  onSearchChange,
  onStatusChange,
  onSortChange,
}: ContentsToolbarProps) {
  const { t } = useI18n();
  const { getContentStatusLabel } = useLabels();

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    onSearchChange(event.target.value);
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    onStatusChange(event.target.value as ContentsToolbarStatusValue);
  }

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>) {
    onSortChange(event.target.value as ContentsListSort);
  }

  return (
    <div className="mb-4 flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex w-full flex-col gap-2 md:flex-row md:items-center">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="search"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder={t("contents.toolbar.searchPlaceholder")}
            className="h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/50 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label={t("contents.toolbar.search")}
          />
        </div>

        <select
          value={statusValue}
          onChange={handleStatusChange}
          className="h-9 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary md:w-44"
          aria-label={t("contents.toolbar.status")}
        >
          <option value="all">{t("contents.toolbar.allStatuses")}</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {getContentStatusLabel(status)}
            </option>
          ))}
        </select>

        <select
          value={sortValue}
          onChange={handleSortChange}
          className="h-9 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary md:w-44"
          aria-label={t("contents.toolbar.sort")}
        >
          <option value="created_desc">{t("contents.toolbar.sortNewest")}</option>
          <option value="created_asc">{t("contents.toolbar.sortOldest")}</option>
        </select>
      </div>

      {canCreate && (
        <Link
          href="/app/contents/new"
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-white/10 bg-zinc-100 px-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-white"
        >
          <Plus className="h-4 w-4" />
          {t("contents.toolbar.createContent")}
        </Link>
      )}
    </div>
  );
}
