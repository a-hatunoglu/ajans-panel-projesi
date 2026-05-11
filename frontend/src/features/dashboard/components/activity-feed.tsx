"use client";

import React from "react";

import type { DashboardActivityItem } from "../types";
import { useFormatters } from "@/lib/formatters";
import { useI18n } from "@/i18n/provider";

const ACTION_LABELS: Record<string, string> = {
  "content.create": "içerik oluşturdu",
  "content.update": "içerik güncelledi",
  "content.status_change": "içerik durumunu değiştirdi",
  "content.assign": "içerik atadı",
  "content.approve": "içeriği onayladı",
  "content.reject": "içeriği reddetti",
  "content.comment": "yorum ekledi",
  "company.create": "şirket oluşturdu",
  "company.update": "şirketi güncelledi",
  "company.delete": "şirketi sildi",
  "payment.create": "ödeme kaydı oluşturdu",
  "payment.update": "ödeme kaydını güncelledi",
  "payment.status_change": "ödeme durumunu değiştirdi",
  "user.invite": "kullanıcı davet etti",
  "user.update": "kullanıcı güncelledi",
};

function getActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

export const ActivityFeed = React.memo(function ActivityFeed({
  items,
}: {
  items: DashboardActivityItem[];
}) {
  const { t } = useI18n();
  const { formatRelativeTime } = useFormatters();

  if (items.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-zinc-500">
          {t("dashboard.activityEmpty")}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/[0.04] max-h-[360px] overflow-y-auto">
      {items.map((item) => (
        <div
          key={item.id}
          className="px-4 py-3 flex items-start gap-3 text-sm"
        >
          <div className="relative flex-none w-1.5 h-1.5 mt-1.5 rounded-full bg-blue-500/60" />
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <p className="text-zinc-300 leading-snug">
              <span className="font-medium text-zinc-100">
                {item.actorName}
              </span>{" "}
              {getActionLabel(item.action)}
              {item.companyName && (
                <>
                  {" "}
                  <span className="text-zinc-500">•</span>{" "}
                  <span className="text-zinc-400">{item.companyName}</span>
                </>
              )}
            </p>
            <p className="text-xs text-zinc-600">
              {formatRelativeTime(item.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
});
