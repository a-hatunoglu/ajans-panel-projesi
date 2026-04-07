"use client";

import type { NotificationItem } from "../types";
import { useI18n } from "@/i18n/provider";
import { useUiCopy } from "@/lib/copy";
import { useFormatters } from "@/lib/formatters";

interface NotificationListItemProps {
  item: NotificationItem;
  onMarkAsRead?: (notificationId: string) => void;
  isMarkingAsRead?: boolean;
  disableActions?: boolean;
}

export function NotificationListItem({
  item,
  onMarkAsRead,
  isMarkingAsRead = false,
  disableActions = false,
}: NotificationListItemProps) {
  const { t } = useI18n();
  const uiCopy = useUiCopy();
  const { formatRelativeTime } = useFormatters();
  const timeAgo = formatRelativeTime(item.createdAt);
  const message = item.message || uiCopy.noAdditionalDetails;

  return (
    <div className={`p-4 flex flex-col gap-1 transition-colors hover:bg-zinc-900/40 relative group ${item.isRead ? "opacity-70" : ""}`}>
      {!item.isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
      )}

      <div className="flex items-center justify-between gap-4">
        <span className={`text-sm tracking-tight ${item.isRead ? "text-zinc-300 font-medium" : "text-zinc-100 font-semibold"}`}>
          {item.title}
        </span>
        <span className="text-xs text-zinc-500 whitespace-nowrap">{timeAgo}</span>
      </div>

      <p className="text-sm text-zinc-400 leading-relaxed pr-8">
        {message}
      </p>

      {!item.isRead && onMarkAsRead && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => onMarkAsRead(item.id)}
            disabled={disableActions}
            className="text-xs font-medium text-zinc-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:text-zinc-600"
          >
            {isMarkingAsRead
              ? t("notifications.markingAsRead")
              : t("notifications.markAsRead")}
          </button>
        </div>
      )}
    </div>
  );
}
