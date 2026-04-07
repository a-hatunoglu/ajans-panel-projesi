"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { usePublishContentMutation } from "../api/mutations";
import type { ContentDetailData } from "@/features/content-detail/types";
import { useI18n } from "@/i18n/provider";
import { useLabels } from "@/lib/labels";
import { useUiCopy } from "@/lib/copy";
import { useFormatters } from "@/lib/formatters";

interface ContentPublishPanelProps {
  data: ContentDetailData;
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      <span className="text-sm text-zinc-200">{value}</span>
    </div>
  );
}

export function ContentPublishPanel({ data }: ContentPublishPanelProps) {
  const router = useRouter();
  const { t } = useI18n();
  const uiCopy = useUiCopy();
  const { formatShortDateTime } = useFormatters();
  const { getPlatformLabel, getContentStatusLabel } = useLabels();
  const publishContentMutation = usePublishContentMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const socialAccountLabel = data.socialAccountName
    ? `${getPlatformLabel(data.platform)} - ${data.socialAccountName}`
    : getPlatformLabel(data.platform);

  async function handlePublish() {
    setSubmitError(null);

    try {
      await publishContentMutation.mutateAsync({
        contentId: data.id,
        companyId: data.companyId,
      });

      router.push(`/app/contents/${data.id}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : t("contentPublish.panel.submitError"),
      );
    }
  }

  return (
    <div className="rounded-xl border border-white/5 bg-zinc-950 p-5 sm:p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-zinc-100">
          {t("contentPublish.panel.cardTitle")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {t("contentPublish.panel.cardDescription")}
        </p>
      </div>

      <div className="mb-6 rounded-lg border border-white/5 bg-zinc-900/40 p-4">
        <div className="mb-3">
          <h3 className="text-sm font-medium text-zinc-200">
            {t("contentPublish.panel.contextTitle")}
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            {t("contentPublish.panel.contextHint")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ReadOnlyField
            label={t("contentPublish.panel.company")}
            value={data.companyName || uiCopy.companyUnavailable}
          />
          <ReadOnlyField
            label={t("contentPublish.panel.socialAccount")}
            value={socialAccountLabel}
          />
          <ReadOnlyField
            label={t("contentPublish.panel.assignedDesigner")}
            value={data.assignedDesigner?.name || uiCopy.unassigned}
          />
          <ReadOnlyField
            label={t("contentPublish.panel.assignedEditor")}
            value={data.assignedEditor?.name || uiCopy.unassigned}
          />
          <ReadOnlyField
            label={t("contentPublish.panel.currentStatus")}
            value={getContentStatusLabel(data.status)}
          />
          <ReadOnlyField
            label={t("contentPublish.panel.scheduledTarget")}
            value={
              data.scheduledAt ? formatShortDateTime(data.scheduledAt) : uiCopy.noDateSet
            }
          />
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
        <p className="text-sm text-amber-100">
          {t("contentPublish.panel.confirmation")}
        </p>
      </div>

      {submitError && (
        <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          {submitError}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/app/contents/${data.id}`}
          className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/50 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900"
        >
          {t("contentPublish.panel.cancel")}
        </Link>

        <button
          type="button"
          onClick={handlePublish}
          disabled={publishContentMutation.isPending}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-zinc-100 px-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {publishContentMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {publishContentMutation.isPending
            ? t("contentPublish.panel.submitting")
            : t("contentPublish.panel.submit")}
        </button>
      </div>
    </div>
  );
}
