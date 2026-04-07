export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  createdAt: string;
  isRead: boolean;
};

export type NotificationsListMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type NotificationsReadStateFilter = "all" | "read" | "unread";

export type NotificationsListQueryParams = {
  page?: number;
  perPage?: number;
  isRead?: boolean;
};

export type NotificationsListData = {
  items: NotificationItem[];
  meta: NotificationsListMeta;
  unreadCount: number;
};
