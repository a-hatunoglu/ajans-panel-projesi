 "use client";

import { ContentDetailData } from "../types";
import { useUiCopy } from "@/lib/copy";
import { useFormatters } from "@/lib/formatters";
import { useI18n } from "@/i18n/provider";

function AssignmentRow({
  label,
  value,
  unassignedLabel,
}: {
  label: string;
  value: ContentDetailData["assignedDesigner"];
  unassignedLabel: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      <div className="flex items-center gap-2 text-sm text-zinc-200">
        {value ? (
          <>
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/5 bg-zinc-800">
              <span className="text-[9px] font-medium text-zinc-400">
                {value.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col">
              <span>{value.name}</span>
              <span className="text-xs text-zinc-500">{value.email}</span>
            </div>
          </>
        ) : (
          <span className="italic text-zinc-500">{unassignedLabel}</span>
        )}
      </div>
    </div>
  );
}

interface ContentWorkflowSidebarProps {
  data: ContentDetailData;
  commentDraft: string;
  onCommentDraftChange: (value: string) => void;
  onSendComment: () => void;
  canComment: boolean;
  isSendingComment: boolean;
  workflowError: string | null;
}

export function ContentWorkflowSidebar({
  data,
  commentDraft,
  onCommentDraftChange,
  onSendComment,
  canComment,
  isSendingComment,
  workflowError,
}: ContentWorkflowSidebarProps) {
  const { t } = useI18n();
  const uiCopy = useUiCopy();
  const { formatRelativeTime, formatShortDateTime } = useFormatters();

  const getDateTimeLabel = (value: string | null) => {
    if (!value) {
      return null;
    }

    return formatShortDateTime(value);
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border border-white/5 bg-zinc-950 p-5">
        <h3 className="mb-4 text-sm font-medium text-zinc-200">{t("contentDetail.workflow.title")}</h3>
        <div className="flex flex-col gap-4">
          <AssignmentRow label={t("contentDetail.workflow.designer")} value={data.assignedDesigner} unassignedLabel={uiCopy.unassigned} />
          <AssignmentRow label={t("contentDetail.workflow.editor")} value={data.assignedEditor} unassignedLabel={uiCopy.unassigned} />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-500">{t("contentDetail.workflow.scheduledTarget")}</span>
            <span className="text-sm text-zinc-200">
              {getDateTimeLabel(data.scheduledAt) || uiCopy.noDateSet}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-500">{t("contentDetail.workflow.publishedAt")}</span>
            <span className="text-sm text-zinc-200">
              {getDateTimeLabel(data.publishedAt) || uiCopy.notPublishedYet}
            </span>
          </div>
        </div>
      </section>

      <section className="flex min-h-[250px] flex-1 flex-col rounded-xl border border-white/5 bg-zinc-950 p-5">
        <h3 className="mb-4 text-sm font-medium text-zinc-200">{t("contentDetail.workflow.feedbackTitle")}</h3>

        <div className="no-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto pr-2">
          {data.comments.map((comment) => (
            <div
              key={comment.id}
              className={`flex flex-col gap-1 rounded-lg border p-3 text-sm ${
                comment.role === "client"
                  ? "ml-4 border-white/5 bg-zinc-900/30"
                  : "mr-4 border-white/10 bg-zinc-900/60"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-zinc-200">{comment.userName}</span>
                <span className="text-[10px] text-zinc-500">
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>
              <p className="mt-1 leading-relaxed text-zinc-300">{comment.body}</p>
            </div>
          ))}
          {data.comments.length === 0 && (
            <div className="py-6 text-center text-sm text-zinc-500">
              {t("contentDetail.workflow.noComments")}
            </div>
          )}
        </div>

        <div className="mt-4 border-t border-white/5 pt-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              value={commentDraft}
              onChange={(event) => onCommentDraftChange(event.target.value)}
              placeholder={t("contentDetail.workflow.commentsPlaceholder")}
              disabled={!canComment || isSendingComment}
              className="h-10 w-full flex-1 rounded-md border border-white/5 bg-zinc-950 px-3 text-sm text-zinc-200 placeholder:text-zinc-500 disabled:opacity-50 sm:h-9"
              onKeyDown={(event) => {
                if (event.key === "Enter" && canComment && !isSendingComment && commentDraft.trim()) {
                  event.preventDefault();
                  onSendComment();
                }
              }}
            />
            <button
              type="button"
              onClick={onSendComment}
              disabled={!canComment || isSendingComment || !commentDraft.trim()}
              className="h-10 w-full rounded-md border border-white/5 bg-zinc-950 px-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900 disabled:cursor-not-allowed disabled:text-zinc-600 disabled:opacity-50 sm:h-9 sm:w-auto sm:shrink-0"
            >
              {t("contentDetail.workflow.send")}
            </button>
          </div>
          {workflowError && (
            <p className="mt-2 text-xs text-red-400">{workflowError}</p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-white/5 bg-zinc-950 p-5">
        <h3 className="mb-4 text-sm font-medium text-zinc-200">{t("contentDetail.workflow.versionHistory")}</h3>
        <div className="flex flex-col gap-3">
          {data.versions.map((version) => (
            <div key={version.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="rounded border border-white/5 bg-zinc-800/50 px-1.5 py-0.5 text-xs font-medium text-zinc-400">
                  v{version.version}
                </span>
                <span className="text-sm text-zinc-300">{version.authorName}</span>
              </div>
              <span className="text-xs text-zinc-500">
                {formatRelativeTime(version.createdAt)}
              </span>
            </div>
          ))}
          {data.versions.length === 0 && (
            <div className="py-2 text-center text-sm text-zinc-500">
              {t("contentDetail.workflow.noVersions")}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
