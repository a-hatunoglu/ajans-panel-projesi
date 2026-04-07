"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { PageContainer } from "@/components/shared/page-container";
import { PageStatePanel } from "@/components/shared/page-state-panel";
import { useAuth } from "@/providers/auth-provider";
import { useContentDetail } from "@/features/content-detail/api/queries";
import {
  useAddContentCommentMutation,
  useApproveContentMutation,
  useRejectContentMutation,
  useSubmitForReviewMutation,
} from "@/features/content-detail/api/mutations";
import { ContentHeader } from "@/features/content-detail/components/content-header";
import { ContentBody } from "@/features/content-detail/components/content-body";
import { ContentWorkflowSidebar } from "@/features/content-detail/components/content-workflow-sidebar";
import { getContentPermissions } from "@/features/content-detail/permissions";
import { useI18n } from "@/i18n/provider";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function ContentDetailPage() {
  const { t } = useI18n();
  const { user, isLoading: isAuthLoading } = useAuth();
  const params = useParams<{ id: string }>();
  const contentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data, isLoading, isError, error } = useContentDetail(contentId);
  const [commentDraft, setCommentDraft] = useState("");
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const submitForReviewMutation = useSubmitForReviewMutation(contentId);
  const approveMutation = useApproveContentMutation(contentId);
  const rejectMutation = useRejectContentMutation(contentId);
  const addCommentMutation = useAddContentCommentMutation(contentId);

  if (!contentId) {
    return (
      <PageStatePanel
        title={t("contentDetail.invalidTitle")}
        description={t("contentDetail.invalidDescription")}
        className="max-w-6xl"
      />
    );
  }

  if (isLoading) {
    return (
      <PageStatePanel
        title={t("contentDetail.loadingTitle")}
        description={t("contentDetail.loadingDescription")}
        className="max-w-6xl"
      />
    );
  }

  if (isError || !data) {
    const message =
      error instanceof Error
        ? error.message
        : t("contentDetail.errorDescription");

    return (
      <PageStatePanel
        title={t("contentDetail.errorTitle")}
        description={message}
        className="max-w-6xl"
      />
    );
  }

  const permissions = getContentPermissions(data, user, isAuthLoading);
  const isWorkflowActionPending =
    submitForReviewMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending;

  async function handleSubmitForReview() {
    setWorkflowError(null);

    try {
      await submitForReviewMutation.mutateAsync();
    } catch (mutationError) {
      setWorkflowError(getErrorMessage(mutationError, t("contentDetail.workflow.actionError")));
    }
  }

  async function handleApprove() {
    setWorkflowError(null);

    try {
      const comment = commentDraft.trim();
      await approveMutation.mutateAsync(comment || undefined);
      setCommentDraft("");
    } catch (mutationError) {
      setWorkflowError(getErrorMessage(mutationError, t("contentDetail.workflow.actionError")));
    }
  }

  async function handleRequestRevision() {
    const comment = commentDraft.trim();

    if (!comment) {
      setWorkflowError(t("contentDetail.workflow.revisionCommentRequired"));
      return;
    }

    setWorkflowError(null);

    try {
      await rejectMutation.mutateAsync(comment);
      setCommentDraft("");
    } catch (mutationError) {
      setWorkflowError(getErrorMessage(mutationError, t("contentDetail.workflow.actionError")));
    }
  }

  async function handleSendComment() {
    const comment = commentDraft.trim();

    if (!comment) {
      return;
    }

    setWorkflowError(null);

    try {
      await addCommentMutation.mutateAsync(comment);
      setCommentDraft("");
    } catch (mutationError) {
      setWorkflowError(getErrorMessage(mutationError, t("contentDetail.workflow.actionError")));
    }
  }

  return (
    <PageContainer className="animate-in fade-in duration-500 pb-12 max-w-6xl">
      <ContentHeader
        data={data}
        canSubmitForReview={permissions.canSubmitForReview}
        canApprove={permissions.canApprove}
        canRequestRevision={permissions.canRequestRevision}
        canEdit={permissions.canEdit}
        canSchedule={permissions.canSchedule}
        canPublish={permissions.canPublish}
        isWorking={isWorkflowActionPending}
        onSubmitForReview={handleSubmitForReview}
        onApprove={handleApprove}
        onRequestRevision={handleRequestRevision}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContentBody data={data} />
        </div>

        <div className="lg:col-span-1">
          <ContentWorkflowSidebar
            data={data}
            commentDraft={commentDraft}
            onCommentDraftChange={(value) => {
              setCommentDraft(value);
              if (workflowError) {
                setWorkflowError(null);
              }
            }}
            onSendComment={handleSendComment}
            canComment={permissions.canComment}
            isSendingComment={addCommentMutation.isPending || isWorkflowActionPending}
            workflowError={workflowError}
          />
        </div>
      </div>
    </PageContainer>
  );
}
