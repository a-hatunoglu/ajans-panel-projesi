"use client";

import type { ChangeEvent } from "react";
import { CheckCheck } from "lucide-react";
import type { NotificationsReadStateFilter } from "../types";
import { useI18n } from "@/i18n/provider";

interface NotificationsFiltersProps {
  readStateValue: NotificationsReadStateFilter;
  canMarkAllAsRead: boolean;
  isMarkingAllAsRead: boolean;
  onReadStateChange: (value: NotificationsReadStateFilter) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationsFilters({
  readStateValue,
  canMarkAllAsRead,
  isMarkingAllAsRead,
  onReadStateChange,
  onMarkAllAsRead,
}: NotificationsFiltersProps) {
  const { t } = useI18n();

  function handleReadStateChange(event: ChangeEvent<HTMLSelectElement>) {
    onReadStateChange(event.target.value as NotificationsReadStateFilter);
  }

  return (
    <div className="mb-4 flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
      <select
        value={readStateValue}
        onChange={handleReadStateChange}
        className="h-9 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary md:w-52"
        aria-label={t("notifications.filters.readState")}
      >
        <option value="all">{t("notifications.filters.all")}</option>
        <option value="unread">{t("notifications.filters.unread")}</option>
        <option value="read">{t("notifications.filters.read")}</option>
      </select>

      <button
        type="button"
        onClick={onMarkAllAsRead}
        disabled={!canMarkAllAsRead || isMarkingAllAsRead}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-white/10 bg-zinc-100 px-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-900/50 disabled:text-zinc-500 md:w-auto"
      >
        <CheckCheck className="h-4 w-4" />
        {isMarkingAllAsRead
          ? t("notifications.markingAllAsRead")
          : t("notifications.markAllAsRead")}
      </button>
    </div>
  );
}
