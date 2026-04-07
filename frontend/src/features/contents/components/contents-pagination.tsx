"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ContentsListMeta } from "../types";
import { useI18n } from "@/i18n/provider";

interface ContentsPaginationProps {
  meta: ContentsListMeta;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}

export function ContentsPagination({
  meta,
  isFetching,
  onPageChange,
}: ContentsPaginationProps) {
  const { t } = useI18n();
  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.perPage + 1;
  const to = meta.total === 0 ? 0 : Math.min(meta.page * meta.perPage, meta.total);
  const canGoPrevious = meta.page > 1;
  const canGoNext = meta.page < meta.totalPages;

  return (
    <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs text-zinc-500">
        {t("contents.pagination.summary", {
          from,
          to,
          total: meta.total,
        })}
        {isFetching && (
          <span className="ml-2 text-zinc-400">
            {t("contents.pagination.updating")}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="text-xs text-zinc-500">
          {t("contents.pagination.pageCounter", {
            page: meta.page,
            totalPages: meta.totalPages,
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(meta.page - 1)}
            disabled={!canGoPrevious}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {t("contents.pagination.previous")}
          </button>

          <button
            type="button"
            onClick={() => onPageChange(meta.page + 1)}
            disabled={!canGoNext}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("contents.pagination.next")}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
