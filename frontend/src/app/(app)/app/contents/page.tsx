"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SearchX, Building2, FileText, Plus, X, CheckSquare } from "lucide-react";
import { useAuth } from "@/providers/auth-provider"
import { canManageCompanies } from "@/lib/roles";
import { PageContainer } from "@/components/shared/page-container";
import { PageStatePanel } from "@/components/shared/page-state-panel";
import { ContentsToolbar } from "@/features/contents/components/contents-toolbar";
import { ContentListItem } from "@/features/contents/components/content-list-item";
import { ContentsPagination } from "@/features/contents/components/contents-pagination";
import { useContentsList } from "@/features/contents/api/queries";
import { useCreateCompanyOptions } from "@/features/content-create/api/queries";
import type { ContentStatus, ContentsListSort } from "@/features/contents/types";
import { useI18n } from "@/i18n/provider";
import { useLabels } from "@/lib/labels";
import Link from "next/link";
import { generateContentsCsv, downloadCsv } from "@/features/contents/utils/csv-export";

const PER_PAGE = 20;

export default function ContentsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  // member is included because member+editor/designer need to create.
  // member+client will see the button but backend enforces company-level role checks.
  const canCreate = true /* all authenticated users */;
  const { data: companies } = useCreateCompanyOptions(canCreate);
  const hasCompanies = companies ? companies.length > 0 : null;
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ContentStatus | "all">("all");
  const [sort, setSort] = useState<ContentsListSort>("created_desc");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const isOwnerOrAdmin = canManageCompanies(user?.role, user?.agencyRole ?? undefined);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  const queryParams = useMemo(
    () => ({
      page,
      perPage: PER_PAGE,
      search: search || undefined,
      status: status === "all" ? undefined : status,
      sort,
    }),
    [page, search, sort, status],
  );

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
  } = useContentsList(queryParams);

  const contents = useMemo(() => response?.data ?? [], [response?.data]);
  const meta = response?.meta ?? null;
  const { getContentStatusLabel, getPlatformLabel } = useLabels();

  const statusLabelMap = useMemo(() => ({
    draft: getContentStatusLabel("draft"),
    in_review: getContentStatusLabel("in_review"),
    revise: getContentStatusLabel("revise"),
    approved: getContentStatusLabel("approved"),
    scheduled: getContentStatusLabel("scheduled"),
    published: getContentStatusLabel("published"),
  }), [getContentStatusLabel]);

  const platformLabelMap = useMemo(() => ({
    instagram: getPlatformLabel("instagram"),
    linkedin: getPlatformLabel("linkedin"),
    facebook: getPlatformLabel("facebook"),
    x: getPlatformLabel("x"),
    tiktok: getPlatformLabel("tiktok"),
    youtube: getPlatformLabel("youtube"),
  }), [getPlatformLabel]);

  const handleExport = useCallback(() => {
    if (!contents.length) return;
    const csv = generateContentsCsv(contents, t, statusLabelMap, platformLabelMap);
    const timestamp = new Date().toISOString().split("T")[0];
    downloadCsv(csv, `contents-${timestamp}.csv`);
  }, [contents, t, statusLabelMap, platformLabelMap]);

  // Bulk selection handlers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(contents.map((c) => c.id)));
  }, [contents]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  useEffect(() => {
    if (meta && page > meta.totalPages) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  if (isLoading && !response) {
    return (
      <PageStatePanel
        title={t("contents.loadingTitle")}
        description={t("contents.loadingDescription")}
      />
    );
  }

  if (isError && !response) {
    const message =
      error instanceof Error
        ? error.message
        : t("contents.errorDescription");

    return (
      <PageStatePanel
        title={t("contents.errorTitle")}
        description={message}
      />
    );
  }

  const inlineErrorMessage =
    isError && response
      ? error instanceof Error
        ? error.message
        : t("contents.errorDescription")
      : null;

  const hasActiveControls = Boolean(search) || status !== "all";

  return (
    <>
    <PageContainer className="animate-in fade-in duration-500 pb-12">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-medium tracking-tight text-white">
          {t("contents.pageTitle")}
        </h1>
        <p className="text-sm text-zinc-400">{t("contents.pageSubtitle")}</p>
      </div>

      <ContentsToolbar
        canCreate={canCreate}
        searchValue={searchInput}
        statusValue={status}
        sortValue={sort}
        onSearchChange={(value) => {
          setSearchInput(value);
          setPage(1);
          setSelectedIds(new Set());
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
          setSelectedIds(new Set());
        }}
        onSortChange={(value) => {
          setSort(value);
          setPage(1);
          setSelectedIds(new Set());
        }}
        onExport={contents.length > 0 ? handleExport : undefined}
      />

      {inlineErrorMessage && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {inlineErrorMessage}
        </div>
      )}

      <div className="flex flex-col overflow-hidden rounded-xl border border-white/5 bg-zinc-950 divide-y divide-white/5">
        <div className="hidden items-center justify-between bg-zinc-900/20 px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 sm:flex">
          <div className="min-w-0 w-2/5">{t("contents.table.contentContext")}</div>
          <div className="w-auto shrink-0 pr-8 flex items-center gap-6">
            <div className="w-24">{t("contents.table.status")}</div>
            <div className="hidden w-44 md:block">{t("contents.table.assignment")}</div>
            <div className="w-28">{t("contents.table.date")}</div>
          </div>
        </div>

        {contents.map((content) => (
          <ContentListItem
            key={content.id}
            content={content}
            isSelectable={isOwnerOrAdmin}
            isSelected={selectedIds.has(content.id)}
            onToggle={toggleSelect}
          />
        ))}

        {contents.length === 0 && (
          hasActiveControls ? (
            <div className="py-12 flex flex-col items-center text-center">
              <SearchX className="mb-3 h-6 w-6 text-zinc-600" />
              <p className="text-sm text-zinc-500">
                {t("contents.emptyFilteredState")}
              </p>
            </div>
          ) : canCreate && hasCompanies === false ? (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/5 bg-zinc-800/80">
                <Building2 className="h-5 w-5 text-zinc-500" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-zinc-100">
                {t("contents.emptySetup.title")}
              </h3>
              <p className="mx-auto mb-6 max-w-md text-sm text-zinc-500">
                {t("contents.emptySetup.description")}
              </p>
              <Link
                href="/app/companies"
                className="inline-flex h-9 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
              >
                {t("contents.emptySetup.cta")}
              </Link>
            </div>
          ) : canCreate && hasCompanies === true ? (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/5 bg-zinc-800/80">
                <FileText className="h-5 w-5 text-zinc-500" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-zinc-100">
                {t("contents.emptyAdmin.title")}
              </h3>
              <p className="mx-auto mb-6 max-w-md text-sm text-zinc-500">
                {t("contents.emptyAdmin.description")}
              </p>
              <Link
                href="/app/contents/new"
                className="inline-flex h-9 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
              >
                <Plus className="h-4 w-4" />
                {t("contents.emptyAdmin.cta")}
              </Link>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/5 bg-zinc-800/80">
                <FileText className="h-5 w-5 text-zinc-500" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-zinc-100">
                {t("contents.emptyUser.title")}
              </h3>
              <p className="mx-auto mb-6 max-w-md text-sm text-zinc-500">
                {t("contents.emptyUser.description")}
              </p>
            </div>
          )
        )}

        {meta && meta.total > 0 && (
          <ContentsPagination
            meta={meta}
            isFetching={isFetching}
            onPageChange={(p) => {
              setPage(p);
              setSelectedIds(new Set());
            }}
          />
        )}
      </div>
    </PageContainer>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/95 px-4 py-2.5 shadow-2xl shadow-black/50 backdrop-blur">
            <CheckSquare className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="text-sm text-zinc-200">
              {t("contents.bulk.selected", { count: selectedIds.size })}
            </span>

            <div className="h-4 w-px bg-white/10" />

            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-zinc-400 transition-colors hover:text-white"
            >
              {t("contents.bulk.selectAll")}
            </button>

            <button
              type="button"
              onClick={clearSelection}
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
              aria-label={t("contents.bulk.clear")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
