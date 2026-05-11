"use client";

import Link from "next/link";
import { useCompanyWorkflowSnapshot } from "../api/queries";
import type { CompanyWorkflowCountStatus } from "../types";
import { CompanyInlineStatePanel } from "./company-inline-state-panel";
import type { ContentAssignment, ContentStatus } from "@/features/contents/types";
import { useUiCopy } from "@/lib/copy";
import { useLabels } from "@/lib/labels";
import { useFormatters } from "@/lib/formatters";
import { useI18n } from "@/i18n/provider";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
const WORKFLOW_COUNT_STATUSES: CompanyWorkflowCountStatus[] = [
  "draft",
  "in_review",
  "revise",
  "approved",
  "scheduled",
];

function getAssignmentLabel(assignment: ContentAssignment | null, unassignedLabel: string) {
  if (!assignment) {
    return unassignedLabel;
  }

  const fullName = `${assignment.firstName} ${assignment.lastName}`.trim();
  return fullName || assignment.email;
}


function getWorkflowHintTone(status: ContentStatus) {
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

export function CompanyWorkflowSnapshot({ companyId }: { companyId: string }) {
  const { t } = useI18n();
  const uiCopy = useUiCopy();
  const {
    getContentDateKindLabel,
    getContentStatusLabel,
    getContentWorkflowHint,
    getPlatformLabel,
  } = useLabels();
  const { formatShortDate } = useFormatters();
  const { data, isLoading, isError } = useCompanyWorkflowSnapshot(companyId);

  return (
    <section className="rounded-xl border border-white/5 bg-zinc-950 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-zinc-200">
          {t("companyDetail.overview.workflow.title")}
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          {t("companyDetail.overview.workflow.description")}
        </p>
      </div>

      {isLoading ? (
        <CompanyInlineStatePanel
          message={t("companyDetail.overview.workflow.loading")}
        />
      ) : null}

      {isError ? (
        <CompanyInlineStatePanel
          message={t("companyDetail.overview.workflow.error")}
        />
      ) : null}

      {!isLoading && !isError && data && (data.recentItems?.length ?? 0) === 0 ? (
        <CompanyInlineStatePanel
          message={t("companyDetail.overview.workflow.empty")}
        />
      ) : null}

      {!isLoading && !isError && data && (data.recentItems?.length ?? 0) > 0 ? (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {WORKFLOW_COUNT_STATUSES.map((status) => (
              <div
                key={status}
                className="rounded-lg border border-white/5 bg-zinc-900/30 p-3"
              >
                <div className="text-[11px] text-zinc-500">
                  {getContentStatusLabel(status)}
                </div>
                <div className="mt-1 text-2xl font-medium text-zinc-100">
                  {data.counts?.[status] ?? 0}
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              {t("companyDetail.overview.workflow.recentTitle")}
            </div>
            <div className="overflow-hidden rounded-lg border border-white/5 bg-zinc-900/20">
              {(data.recentItems ?? []).map((item) => (
                <Link
                  key={item.id}
                  href={`/app/contents/${item.id}`}
                  className="flex flex-col gap-3 border-b border-white/5 p-4 transition-colors hover:bg-zinc-900/40 last:border-b-0 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-zinc-100">
                      {item.title}
                    </div>
                    <div className={`mt-1 text-[11px] ${getWorkflowHintTone(item.status)}`}>
                      {getContentWorkflowHint(item.status)}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-500">
                      <span>{getPlatformLabel(item.platform)}</span>
                      <span className="text-zinc-700">&bull;</span>
                      <span>
                        {t("contents.list.designer")}:{" "}
                        {getAssignmentLabel(item.assignedDesigner, uiCopy.unassigned)}
                      </span>
                      <span className="text-zinc-700">&bull;</span>
                      <span>
                        {t("contents.list.editor")}:{" "}
                        {getAssignmentLabel(item.assignedEditor, uiCopy.unassigned)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 md:justify-end">
                    <ContentStatusBadge status={item.status} label={getContentStatusLabel(item.status)} />
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wide text-zinc-500">
                        {getContentDateKindLabel(item.dateKind)}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {formatShortDate(item.dateAt)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
