import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  NotificationItem,
  NotificationsListData,
  NotificationsListMeta,
  NotificationsListQueryParams,
} from "../types";

type NotificationsResponse = {
  success: boolean;
  data: NotificationItem[];
  meta: NotificationsListMeta;
};

type UnreadCountResponse = {
  success: boolean;
  data: {
    count: number;
  };
};

function buildNotificationsParams(params: NotificationsListQueryParams) {
  const queryParams: Record<string, string> = {};

  if (params.page) {
    queryParams.page = String(params.page);
  }

  if (params.perPage) {
    queryParams.perPage = String(params.perPage);
  }

  if (params.isRead !== undefined) {
    queryParams.isRead = String(params.isRead);
  }

  return queryParams;
}

export function useNotifications(
  params: NotificationsListQueryParams = {},
) {
  const {
    page = 1,
    perPage = 20,
    isRead,
  } = params;

  return useQuery({
    queryKey: ["notifications", isRead === undefined ? "all" : isRead ? "read" : "unread", page, perPage],
    placeholderData: (previousData) => previousData,
    queryFn: async (): Promise<NotificationsListData> => {
      const [notificationsResponse, unreadCountResponse] = await Promise.all([
        apiClient<NotificationsResponse>("/notifications", {
          params: buildNotificationsParams({
            page,
            perPage,
            isRead,
          }),
        }),
        apiClient<UnreadCountResponse>("/notifications/unread-count"),
      ]);

      return {
        items: notificationsResponse.data,
        meta: notificationsResponse.meta,
        unreadCount: unreadCountResponse.data.count,
      };
    },
  });
}

export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: ["notifications-unread-count"],
    enabled,
    refetchInterval: 60_000,
    queryFn: async (): Promise<number> => {
      const response = await apiClient<UnreadCountResponse>(
        "/notifications/unread-count",
      );
      return response.data.count;
    },
  });
}
