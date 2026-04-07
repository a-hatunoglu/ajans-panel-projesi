"use client";

import { useEffect, useMemo, useState } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageStatePanel } from "@/components/shared/page-state-panel";
import { ContentsPagination } from "@/features/contents/components/contents-pagination";
import { useMarkAllNotificationsAsReadMutation, useMarkNotificationAsReadMutation } from "@/features/notifications/api/mutations";
import { NotificationListItem } from "@/features/notifications/components/notification-list-item";
import { NotificationsFilters } from "@/features/notifications/components/notifications-filters";
import { useNotifications } from "@/features/notifications/api/queries";
import { useUiCopy } from "@/lib/copy";
import { useI18n } from "@/i18n/provider";
import type { NotificationsReadStateFilter } from "@/features/notifications/types";

const PER_PAGE = 20;

export default function NotificationsPage() {
  const { t } = useI18n();
  const uiCopy = useUiCopy();
  const [readState, setReadState] = useState<NotificationsReadStateFilter>("all");
  const [page, setPage] = useState(1);
  const queryParams = useMemo(
    () => ({
      page,
      perPage: PER_PAGE,
      isRead:
        readState === "all"
          ? undefined
          : readState === "read",
    }),
    [page, readState],
  );
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
  } = useNotifications(queryParams);
  const markAllAsRead = useMarkAllNotificationsAsReadMutation();
  const markNotificationAsRead = useMarkNotificationAsReadMutation();
  const notifications = response?.items ?? [];
  const meta = response?.meta ?? null;
  const unreadCount = response?.unreadCount ?? 0;
  const unreadLabel =
    unreadCount > 0
      ? t("notifications.unreadCount", { count: unreadCount })
      : uiCopy.allCaughtUp;

  useEffect(() => {
    if (meta && page > meta.totalPages) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  if (isLoading && !response) {
    return (
      <PageStatePanel
        title={t("notifications.loadingTitle")}
        description={t("notifications.loadingDescription")}
        className="max-w-4xl"
      />
    );
  }

  if (isError && !response) {
    return (
      <PageStatePanel
        title={t("notifications.errorTitle")}
        description={t("notifications.errorDescription")}
        className="max-w-4xl"
      />
    );
  }

  const hasActiveFilters = readState !== "all";
  const inlineErrorMessage =
    isError && response
      ? t("notifications.errorDescription")
      : markAllAsRead.isError || markNotificationAsRead.isError
        ? t("notifications.errorDescription")
        : null;
  const isAnyActionPending =
    markAllAsRead.isPending || markNotificationAsRead.isPending;

  return (
    <PageContainer className="animate-in fade-in duration-500 pb-12 max-w-4xl">
      <div className="mb-2">
        <div>
          <h1 className="mb-1 text-2xl font-medium tracking-tight text-white">{t("notifications.pageTitle")}</h1>
          <p className="text-sm text-zinc-400">
            {t("notifications.pageSubtitle")}{" "}
            <span className="text-zinc-500">{unreadLabel}</span>
          </p>
        </div>
      </div>

      <NotificationsFilters
        readStateValue={readState}
        canMarkAllAsRead={unreadCount > 0}
        isMarkingAllAsRead={markAllAsRead.isPending}
        onReadStateChange={(value) => {
          setReadState(value);
          setPage(1);
        }}
        onMarkAllAsRead={() => {
          markAllAsRead.mutate();
        }}
      />

      {inlineErrorMessage && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {inlineErrorMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-white/5 bg-zinc-950 divide-y divide-white/5">
        {notifications.map((notification) => (
          <NotificationListItem
            key={notification.id}
            item={notification}
            disableActions={isAnyActionPending}
            isMarkingAsRead={
              markNotificationAsRead.isPending &&
              markNotificationAsRead.variables === notification.id
            }
            onMarkAsRead={(notificationId) => {
              markNotificationAsRead.mutate(notificationId);
            }}
          />
        ))}

        {notifications.length === 0 && (
          <div className="py-12 text-center text-sm text-zinc-500">
            {hasActiveFilters
              ? t("notifications.emptyFilteredState")
              : t("notifications.emptyState")}
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
