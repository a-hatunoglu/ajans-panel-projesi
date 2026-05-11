"use client";

import { ContentDetailData } from "../types";
import {
  ChevronLeft,
  Edit,
  Check,
  AlertCircle,
  SendHorizontal,
  CalendarDays,
  Upload,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import { useUiCopy } from "@/lib/copy";
import { useLabels } from "@/lib/labels";
import { useI18n } from "@/i18n/provider";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";

const actionButtonBaseClass =
  "flex h-11 w-full items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors sm:h-9 sm:w-auto";



interface ContentHeaderProps {
  data: ContentDetailData;
  canSubmitForReview: boolean;
  canApprove: boolean;
  canRequestRevision: boolean;
  canEdit: boolean;
  canSchedule: boolean;
  canPublish: boolean;
  canUnschedule: boolean;
  isWorking: boolean;
  onSubmitForReview: () => void;
  onApprove: () => void;
  onRequestRevision: () => void;
  onUnschedule: () => void;
}

export function ContentHeader({
  data,
  canSubmitForReview,
  canApprove,
  canRequestRevision,
  canEdit,
  canSchedule,
  canPublish,
  canUnschedule,
  isWorking,
  onSubmitForReview,
  onApprove,
  onRequestRevision,
  onUnschedule,
}: ContentHeaderProps) {
  const { t } = useI18n();
  const uiCopy = useUiCopy();
  const { getContentStatusLabel, getPlatformLabel } = useLabels();
  const statusLabel = getContentStatusLabel(data.status);

  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex flex-col gap-2 text-sm sm:gap-3">
        <Link
          href="/app/contents"
          className="inline-flex w-fit items-center gap-1.5 text-zinc-400 transition-colors hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("contentDetail.header.backToList")}
        </Link>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-zinc-500">
          <span className="font-medium text-zinc-300">
            {data.companyName || uiCopy.companyUnavailable}
          </span>
          <span className="text-zinc-700">/</span>
          <span>{getPlatformLabel(data.platform)}</span>
          {data.socialAccountName && (
            <>
              <span className="text-zinc-700">/</span>
              <span>{data.socialAccountName}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="basis-full text-2xl font-semibold tracking-tight text-white sm:basis-auto">
            {data.title}
          </h1>
          <ContentStatusBadge status={data.status} label={statusLabel} size="md" />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
          {canEdit && (
            <Link
              href={`/app/contents/${data.id}/edit`}
              className={`${actionButtonBaseClass} border border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-900`}
            >
              <Edit className="h-4 w-4" />
              {t("contentDetail.header.editContent")}
            </Link>
          )}

          {canSchedule && (
            <Link
              href={`/app/contents/${data.id}/schedule`}
              className={`${actionButtonBaseClass} border border-violet-500/20 bg-violet-500/10 text-violet-200 hover:bg-violet-500/15`}
            >
              <CalendarDays className="h-4 w-4" />
              {t("contentDetail.header.scheduleContent")}
            </Link>
          )}

          {canPublish && (
            <Link
              href={`/app/contents/${data.id}/publish`}
              className={`${actionButtonBaseClass} border border-white/10 bg-zinc-100 text-zinc-950 hover:bg-white`}
            >
              <Upload className="h-4 w-4" />
              {t("contentDetail.header.publishContent")}
            </Link>
          )}

          {canUnschedule && (
            <button
              type="button"
              onClick={onUnschedule}
              disabled={isWorking}
              className={`${actionButtonBaseClass} border border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70`}
            >
              <Undo2 className="h-4 w-4" />
              {t("contentDetail.header.unscheduleContent")}
            </button>
          )}

          {canRequestRevision && (
            <button
              type="button"
              onClick={onRequestRevision}
              disabled={isWorking}
              className={`${actionButtonBaseClass} border border-orange-500/20 bg-orange-500/10 text-orange-300 hover:bg-orange-500/15 disabled:cursor-not-allowed disabled:opacity-70`}
            >
              <AlertCircle className="h-4 w-4" />
              {t("contentDetail.header.requestRevision")}
            </button>
          )}

          {canApprove && (
            <button
              type="button"
              onClick={onApprove}
              disabled={isWorking}
              className={`${actionButtonBaseClass} px-4 border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-70`}
            >
              <Check className="h-4 w-4" />
              {t("contentDetail.header.approve")}
            </button>
          )}

          {canSubmitForReview && (
            <button
              type="button"
              onClick={onSubmitForReview}
              disabled={isWorking}
              className={`${actionButtonBaseClass} px-4 border border-blue-500/20 bg-blue-500/10 text-blue-300 hover:bg-blue-500/15 disabled:cursor-not-allowed disabled:opacity-70`}
            >
              <SendHorizontal className="h-4 w-4" />
              {t("contentDetail.header.submitForReview")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
