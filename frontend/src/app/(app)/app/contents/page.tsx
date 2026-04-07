"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { PageContainer } from "@/components/shared/page-container";
import { PageStatePanel } from "@/components/shared/page-state-panel";
import { ContentsToolbar } from "@/features/contents/components/contents-toolbar";
import { ContentListItem } from "@/features/contents/components/content-list-item";
import { ContentsPagination } from "@/features/contents/components/contents-pagination";
import { useContentsList } from "@/features/contents/api/queries";
import type { ContentStatus, ContentsListSort } from "@/features/contents/types";
import { useI18n } from "@/i18n/provider";

const PER_PAGE = 20;

export default function ContentsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const role = user?.role || "guest";
  const canCreate = ["owner", "admin", "editor", "designer"].includes(role);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ContentStatus | "all">("all");
  const [sort, setSort] = useState<ContentsListSort>("created_desc");
  const [page, setPage] = useState(1);

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

  const contents = response?.data ?? [];
  const meta = response?.meta ?? null;

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
    <PageContainer className="animate-in fade-in duration-500 pb-12">
      <div className="mb-2">
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
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onSortChange={(value) => {
          setSort(value);
          setPage(1);
        }}
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
          <ContentListItem key={content.id} content={content} />
        ))}

        {contents.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-zinc-500">
              {hasActiveControls
                ? t("contents.emptyFilteredState")
                : t("contents.emptyState")}
            </p>
          </div>
        )}

        {meta && meta.total > 0 && (
          <ContentsPagination
            meta={meta}
            isFetching={isFetching}
            onPageChange={setPage}
          />
        )}
      </div>
    </PageContainer>
  );
}
