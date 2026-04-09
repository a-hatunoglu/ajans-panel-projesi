"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { NotificationItem } from "../types";
import { useI18n } from "@/i18n/provider";
import { useUiCopy } from "@/lib/copy";
import { useFormatters } from "@/lib/formatters";
import { ExternalLink } from "lucide-react";

interface NotificationListItemProps {
  item: NotificationItem;
  onMarkAsRead?: (notificationId: string) => void | Promise<void>;
  isMarkingAsRead?: boolean;
  disableActions?: boolean;
}

function getResourceHref(
  resourceType: string | null,
  resourceId: string | null,
): string | null {
  if (!resourceType || !resourceId) return null;

  switch (resourceType) {
    case "content":
      return `/app/contents/${resourceId}`;
    case "company":
      return `/app/companies/${resourceId}`;
    case "payment":
      return `/app/payments`;
    default:
      return null;
  }
}

export function NotificationListItem({
  item,
  onMarkAsRead,
  isMarkingAsRead = false,
  disableActions = false,
}: NotificationListItemProps) {
  const { t } = useI18n();
  const uiCopy = useUiCopy();
  const router = useRouter();
  const { formatRelativeTime } = useFormatters();
  const timeAgo = formatRelativeTime(item.createdAt);
  const message = item.message || uiCopy.noAdditionalDetails;

  const resourceHref = getResourceHref(item.resourceType, item.resourceId);
  const isLinkedUnread = resourceHref && !item.isRead && onMarkAsRead;

  const handleLinkedUnreadClick = async (
    e: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    if (!resourceHref || !onMarkAsRead) return;
    e.preventDefault();
    try {
      await onMarkAsRead(item.id);
    } catch {
      // navigate even if mark-as-read fails
    }
    router.push(resourceHref);
  };

  const content = (
    <>
      <div className="flex items-center justify-between gap-4">
        <span
          className={`text-sm tracking-tight ${item.isRead ? "text-zinc-300 font-medium" : "text-zinc-100 font-semibold"}`}
        >
          {item.title}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {resourceHref && (
            <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
          )}
          <span className="text-xs text-zinc-500 whitespace-nowrap">
            {timeAgo}
          </span>
        </div>
      </div>

      <p className="text-sm text-zinc-400 leading-relaxed pr-8">{message}</p>

      {!item.isRead && onMarkAsRead && !resourceHref && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMarkAsRead(item.id);
            }}
            disabled={disableActions}
            className="text-xs font-medium text-zinc-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:text-zinc-600"
          >
            {isMarkingAsRead
              ? t("notifications.markingAsRead")
              : t("notifications.markAsRead")}
          </button>
        </div>
      )}
    </>
  );

  const wrapperClassName = `p-4 flex flex-col gap-1 transition-colors hover:bg-white/5 relative group ${item.isRead ? "opacity-70" : ""}`;

  if (resourceHref) {
    return (
      <Link
        href={resourceHref}
        onClick={isLinkedUnread ? handleLinkedUnreadClick : undefined}
        className={`${wrapperClassName} block no-underline`}
      >
        {!item.isRead && (
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
        )}
        {content}
      </Link>
    );
  }

  return (
    <div className={wrapperClassName}>
      {!item.isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
      )}
      {content}
    </div>
  );
}

