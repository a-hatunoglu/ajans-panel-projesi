"use client";

import React from "react";

import { ChevronRight } from "lucide-react";
import { ContentAssignment, ContentDateKind, ContentListItemData } from "../types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUiCopy } from "@/lib/copy";
import { useLabels } from "@/lib/labels";
import { useFormatters } from "@/lib/formatters";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { useI18n } from "@/i18n/provider";

interface ContentListItemProps {
  content: ContentListItemData;
  isSelectable?: boolean;
  isSelected?: boolean;
  onToggle?: (id: string) => void;
}


function getAssignmentLabel(assignment: ContentAssignment | null, unassignedLabel: string) {
  if (!assignment) {
    return unassignedLabel;
  }

  const fullName = `${assignment.firstName} ${assignment.lastName}`.trim();
  return fullName || assignment.email;
}

function getWorkflowHintTone(status: ContentListItemData["status"]) {
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

export const ContentListItem = React.memo(function ContentListItem({
  content,
  isSelectable = false,
  isSelected = false,
  onToggle,
}: ContentListItemProps) {
  const { t } = useI18n();
  const router = useRouter();
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

  const href = `/app/contents/${content.id}`;
  const rowClassName = "w-full p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-white/5 transition-colors text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-primary";

  const innerContent = (
    <>
      <div className="flex items-center gap-3 min-w-0 flex-1 sm:w-2/5">
        {isSelectable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle?.(content.id);
            }}
            className="flex h-11 w-11 sm:h-5 sm:w-5 items-center justify-center shrink-0"
            aria-label={isSelected ? t("contents.bulk.deselect") : t("contents.bulk.select")}
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                isSelected
                  ? "border-blue-500 bg-blue-500"
                  : "border-zinc-600 bg-transparent hover:border-zinc-400"
              }`}
            >
              {isSelected && (
                <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M3 6l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </button>
        )}
        <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="text-sm font-medium text-zinc-100 truncate group-hover:text-white transition-colors">
          {content.title}
        </span>
        <div className="flex items-center gap-2 text-xs text-zinc-500 truncate mt-0.5">
          <span className="font-medium text-zinc-400">{content.companyName}</span>
          <span>&bull;</span>
          <span>{getPlatformLabel(content.platform)}</span>
        </div>
        <div className={`text-[11px] ${getWorkflowHintTone(content.status)}`}>
          {workflowHint}
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-500 md:hidden">
          <span>
            {t("contents.list.designer")}: {designerLabel}
          </span>
          <span className="text-zinc-700">&bull;</span>
          <span>
            {t("contents.list.editor")}: {editorLabel}
          </span>
        </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
        <div className="w-24 shrink-0">
          <ContentStatusBadge status={content.status} label={statusLabel} />
        </div>

        <div className="w-44 hidden md:flex flex-col gap-1">
          <span className="text-[11px] text-zinc-300 truncate">
            {t("contents.list.designer")}: {designerLabel}
          </span>
          <span className="text-[11px] text-zinc-500 truncate">
            {t("contents.list.editor")}: {editorLabel}
          </span>
        </div>

        <div className="w-28 text-right sm:text-left shrink-0 flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wide text-zinc-500">
            {getContentDateKindLabel(content.dateKind as ContentDateKind)}
          </span>
          <span className="text-xs text-zinc-400 whitespace-nowrap">{formatShortDate(content.dateAt)}</span>
        </div>
      </div>

      <div className="hidden sm:flex items-center justify-end w-8 shrink-0">
        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </div>
    </>
  );

  // When selectable, use div + onClick to avoid nesting button inside anchor (HTML spec violation)
  if (isSelectable) {
    return (
      <div
        role="link"
        tabIndex={0}
        onClick={() => router.push(href)}
        onKeyDown={(e) => { if (e.key === "Enter") router.push(href); }}
        className={`${rowClassName} cursor-pointer`}
      >
        {innerContent}
      </div>
    );
  }

  return (
    <Link href={href} className={rowClassName}>
      {innerContent}
    </Link>
  );
});
