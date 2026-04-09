"use client";

import { useEffect, useMemo, useState } from "react";
import { PageStatePanel } from "@/components/shared/page-state-panel";
import { RestrictedAccessPanel } from "@/components/shared/restricted-access-panel";
import { useAuth } from "@/providers/auth-provider";
import { PageContainer } from "@/components/shared/page-container";
import { ActivityListItem } from "@/features/activity/components/activity-list-item";
import { ActivityFilters } from "@/features/activity/components/activity-filters";
import { ContentsPagination } from "@/features/contents/components/contents-pagination";
import { useActivityLogs } from "@/features/activity/api/queries";
import type {
  ActivityActionFilter,
  ActivityResourceTypeFilter,
} from "@/features/activity/types";
import { useI18n } from "@/i18n/provider";
import { Activity } from "lucide-react";

const PER_PAGE = 20;

export default function ActivityPage() {
  const { t } = useI18n();
  const { user, isLoading: isAuthLoading } = useAuth();
  const role = user?.role || "guest";
  const canView = ["owner", "admin"].includes(role);
  const [action, setAction] = useState<ActivityActionFilter | "all">("all");
  const [resourceType, setResourceType] = useState<ActivityResourceTypeFilter | "all">("all");
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      page,
      perPage: PER_PAGE,
      action: action === "all" ? undefined : action,
      resourceType: resourceType === "all" ? undefined : resourceType,
    }),
    [action, page, resourceType],
  );

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
  } = useActivityLogs(queryParams, canView && !isAuthLoading);
  const activities = response?.items ?? [];
  const meta = response?.meta ?? null;

  useEffect(() => {
    if (meta && page > meta.totalPages) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  if (isAuthLoading) {
    return (
      <PageStatePanel
        title={t("activity.loadingAuthTitle")}
        description={t("activity.loadingAuthDescription")}
        className="max-w-5xl"
      />
    );
  }

  if (!canView) {
    return (
      <PageContainer className="animate-in fade-in duration-500 pb-12 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-medium tracking-tight text-white mb-1">{t("activity.pageTitle")}</h1>
          <p className="text-sm text-zinc-400">{t("activity.pageSubtitle")}</p>
        </div>
        <RestrictedAccessPanel description={t("activity.restrictedDescription")} />
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageStatePanel
        title={t("activity.loadingTitle")}
        description={t("activity.loadingDescription")}
        className="max-w-5xl"
      />
    );
  }

  if (isError && !response) {
    return (
      <PageStatePanel
        title={t("activity.errorTitle")}
        description={t("activity.errorDescription")}
        className="max-w-5xl"
      />
    );
  }

  const inlineErrorMessage =
    isError && response ? t("activity.errorDescription") : null;
  const hasActiveFilters = action !== "all" || resourceType !== "all";

  return (
    <PageContainer className="animate-in fade-in duration-500 pb-12 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-medium tracking-tight text-white mb-1">{t("activity.pageTitle")}</h1>
        <p className="text-sm text-zinc-400">{t("activity.pageSubtitle")}</p>
      </div>

      <ActivityFilters
        actionValue={action}
        resourceTypeValue={resourceType}
        onActionChange={(value) => {
          setAction(value);
          setPage(1);
        }}
        onResourceTypeChange={(value) => {
          setResourceType(value);
          setPage(1);
        }}
      />

      {inlineErrorMessage && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {inlineErrorMessage}
        </div>
      )}

      <div className="border border-white/5 rounded-xl bg-zinc-950 flex flex-col divide-y divide-white/5 overflow-hidden">
        {activities.map((activity) => (
          <ActivityListItem key={activity.id} item={activity} />
        ))}

        {activities.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/5 bg-zinc-800/80">
              <Activity className="h-5 w-5 text-zinc-500" />
            </div>
            <h2 className="mb-2 text-base font-medium text-zinc-300">
              {hasActiveFilters
                ? t("activity.emptyFilteredState")
                : t("activity.emptyState")}
            </h2>
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
