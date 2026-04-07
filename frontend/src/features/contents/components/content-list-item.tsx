"use client";

import { ChevronRight } from "lucide-react";
import { ContentAssignment, ContentDateKind, ContentListItemData } from "../types";
import Link from "next/link";
import { useUiCopy } from "@/lib/copy";
import { useLabels } from "@/lib/labels";
import { useFormatters } from "@/lib/formatters";
import { useI18n } from "@/i18n/provider";

interface ContentListItemProps {
  content: ContentListItemData;
}

function getStatusBadge(status: ContentListItemData["status"], label: string) {
  switch (status) {
    case "draft":
      return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-zinc-500/10 text-zinc-400 border-zinc-500/20">{label}</span>;
    case "in_review":
      return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/20">{label}</span>;
    case "revise":
      return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-orange-500/10 text-orange-400 border-orange-500/20">{label}</span>;
    case "approved":
      return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{label}</span>;
    case "scheduled":
      return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-purple-500/10 text-purple-400 border-purple-500/20">{label}</span>;
    case "published":
      return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-zinc-800 text-zinc-500 border-zinc-700/50">{label}</span>;
  }
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

export function ContentListItem({ content }: ContentListItemProps) {
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

  return (
    <Link
      href={`/app/contents/${content.id}`}
      className="w-full p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-zinc-900/40 transition-colors text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
    >
      <div className="flex flex-col gap-1 min-w-0 flex-1 sm:w-2/5">
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

      <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
        <div className="w-24 shrink-0">
          {getStatusBadge(content.status, statusLabel)}
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
    </Link>
  );
}
