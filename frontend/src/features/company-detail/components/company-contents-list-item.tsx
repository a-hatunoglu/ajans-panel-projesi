"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { CompanyContentsItem } from "../types";
import type { ContentAssignment } from "@/features/contents/types";
import { useUiCopy } from "@/lib/copy";
import { useLabels } from "@/lib/labels";
import { useFormatters } from "@/lib/formatters";
import { useI18n } from "@/i18n/provider";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";

interface CompanyContentsListItemProps {
  content: CompanyContentsItem;
}


function getAssignmentLabel(assignment: ContentAssignment | null, unassignedLabel: string) {
  if (!assignment) {
    return unassignedLabel;
  }

  const fullName = `${assignment.firstName} ${assignment.lastName}`.trim();
  return fullName || assignment.email;
}

function getWorkflowHintTone(status: CompanyContentsItem["status"]) {
  switch (status) {
    case "in_review":
      return "text-blue-300/80";
    case "revise":
      return "text-orange-300/80";
    case "approved":
      return "text-emerald-300/80";
    case "scheduled":
      return "text-violet-300/80";
    default:
      return "text-zinc-500";
  }
}

function getContextLabel(
  content: CompanyContentsItem,
  platformLabel: string,
  unavailableLabel: string,
) {
  if (!content.platform && !content.socialAccountName) {
    return unavailableLabel;
  }

  if (!content.socialAccountName) {
    return platformLabel;
  }

  if (!content.platform) {
    return content.socialAccountName;
  }

  return `${platformLabel} / ${content.socialAccountName}`;
}

export function CompanyContentsListItem({
  content,
}: CompanyContentsListItemProps) {
  const { t } = useI18n();
  const uiCopy = useUiCopy();
  const {
    getContentDateKindLabel,
    getContentStatusLabel,
    getContentWorkflowHint,
    getPlatformLabel,
  } = useLabels();
  const { formatShortDate } = useFormatters();
  const statusLabel = getContentStatusLabel(content.status);
  const workflowHint = getContentWorkflowHint(content.status);
  const designerLabel = getAssignmentLabel(content.assignedDesigner, uiCopy.unassigned);
  const editorLabel = getAssignmentLabel(content.assignedEditor, uiCopy.unassigned);
  const platformLabel = getPlatformLabel(content.platform);
  const contextLabel = getContextLabel(content, platformLabel, uiCopy.platformUnavailable);

  return (
    <Link
      href={`/app/contents/${content.id}`}
      className="group flex w-full flex-col justify-between gap-4 p-4 text-left transition-colors hover:bg-zinc-900/40 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary sm:flex-row sm:items-center"
    >
      <div className="min-w-0 flex-1 sm:w-2/5">
        <div className="truncate text-sm font-medium text-zinc-100 transition-colors group-hover:text-white">
          {content.title}
        </div>
        <div className="mt-0.5 truncate text-xs text-zinc-500">
          {contextLabel}
        </div>
        <div className={`mt-1 text-[11px] ${getWorkflowHintTone(content.status)}`}>
          {workflowHint}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-500 md:hidden">
          <span>
            {t("contents.list.designer")}: {designerLabel}
          </span>
          <span className="text-zinc-700">&bull;</span>
          <span>
            {t("contents.list.editor")}: {editorLabel}
          </span>
        </div>
      </div>

      <div className="mt-2 flex w-full shrink-0 items-center justify-between gap-4 sm:mt-0 sm:w-auto sm:justify-start sm:gap-6">
        <div className="w-24 shrink-0">
          <ContentStatusBadge status={content.status} label={statusLabel} />
        </div>

        <div className="hidden w-44 flex-col gap-1 md:flex">
          <span className="truncate text-[11px] text-zinc-300">
            {t("contents.list.designer")}: {designerLabel}
          </span>
          <span className="truncate text-[11px] text-zinc-500">
            {t("contents.list.editor")}: {editorLabel}
          </span>
        </div>

        <div className="flex w-28 shrink-0 flex-col gap-0.5 text-right sm:text-left">
          <span className="text-[10px] uppercase tracking-wide text-zinc-500">
            {getContentDateKindLabel(content.dateKind)}
          </span>
          <span className="whitespace-nowrap text-xs text-zinc-400">
            {formatShortDate(content.dateAt)}
          </span>
        </div>
      </div>

      <div className="hidden w-8 shrink-0 items-center justify-end sm:flex">
        <ChevronRight className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-zinc-400" />
      </div>
    </Link>
  );
}
