"use client";

import type { ContentDetailData } from "./types";

export type ContentPermissionUser = {
  id: string;
  role: string;
} | null;

export function getContentPermissions(
  data: ContentDetailData,
  user: ContentPermissionUser,
  isAuthLoading: boolean,
) {
  if (isAuthLoading || !user) {
    return {
      canComment: false,
      canSubmitForReview: false,
      canApprove: false,
      canRequestRevision: false,
      canEdit: false,
      canSchedule: false,
      canPublish: false,
      hasEditAccessByRole: false,
      hasScheduleAccessByRole: false,
      hasPublishAccessByRole: false,
      isEditableStatus: false,
      isSchedulableStatus: false,
      isPublishableStatus: false,
    };
  }

  const isOwnerOrAdmin = user.role === "owner" || user.role === "admin";
  const isAssignedDesigner = data.assignedDesigner?.id === user.id;
  const isAssignedEditor = data.assignedEditor?.id === user.id;
  const isEditorWithMutationRights =
    user.role === "editor" && (isAssignedEditor || data.createdById === user.id);
  const isDesignerWithMutationRights =
    user.role === "designer" && isAssignedDesigner;
  const hasEditAccessByRole =
    isOwnerOrAdmin || isEditorWithMutationRights || isDesignerWithMutationRights;
  const hasScheduleAccessByRole = isOwnerOrAdmin || isEditorWithMutationRights;
  const hasPublishAccessByRole = isOwnerOrAdmin || isEditorWithMutationRights;
  const isEditableStatus = data.status === "draft" || data.status === "revise";
  const isSchedulableStatus = data.status === "approved";
  const isPublishableStatus = data.status === "scheduled";
  const canSubmitForReview = isEditableStatus && hasEditAccessByRole;
  const canModerateReview =
    data.status === "in_review" &&
    (user.role === "owner" || user.role === "admin" || user.role === "client");

  return {
    canComment: true,
    canSubmitForReview,
    canApprove: canModerateReview,
    canRequestRevision: canModerateReview,
    canEdit: isEditableStatus && hasEditAccessByRole,
    canSchedule: isSchedulableStatus && hasScheduleAccessByRole,
    canPublish: isPublishableStatus && hasPublishAccessByRole,
    hasEditAccessByRole,
    hasScheduleAccessByRole,
    hasPublishAccessByRole,
    isEditableStatus,
    isSchedulableStatus,
    isPublishableStatus,
  };
}
