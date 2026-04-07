import type { ContentDateKind, ContentStatus, Platform } from "@/features/contents/types";
import type { PaymentStatus } from "@/features/payments/types";
import { getIntlLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

function humanizeToken(token: string) {
  return token
    .split(/[_\-.]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function useLabels() {
  const { locale, t } = useI18n();

  return {
    getPlatformLabel(platform: Platform | null | undefined) {
      switch (platform) {
        case "instagram":
          return t("labels.platforms.instagram");
        case "linkedin":
          return t("labels.platforms.linkedin");
        case "facebook":
          return t("labels.platforms.facebook");
        case "x":
          return t("labels.platforms.x");
        case "tiktok":
          return t("labels.platforms.tiktok");
        case "youtube":
          return t("labels.platforms.youtube");
        default:
          return t("common.platformUnavailable");
      }
    },
    getContentStatusLabel(status: ContentStatus) {
      switch (status) {
        case "draft":
          return t("labels.contentStatus.draft");
        case "in_review":
          return t("labels.contentStatus.inReview");
        case "revise":
          return t("labels.contentStatus.revise");
        case "approved":
          return t("labels.contentStatus.approved");
        case "scheduled":
          return t("labels.contentStatus.scheduled");
        case "published":
          return t("labels.contentStatus.published");
      }
    },
    getContentWorkflowHint(status: ContentStatus) {
      switch (status) {
        case "draft":
          return t("labels.contentWorkflowHint.draft");
        case "in_review":
          return t("labels.contentWorkflowHint.inReview");
        case "revise":
          return t("labels.contentWorkflowHint.revise");
        case "approved":
          return t("labels.contentWorkflowHint.approved");
        case "scheduled":
          return t("labels.contentWorkflowHint.scheduled");
        case "published":
          return t("labels.contentWorkflowHint.published");
      }
    },
    getContentDateKindLabel(dateKind: ContentDateKind) {
      switch (dateKind) {
        case "published":
          return t("labels.contentDateKind.published");
        case "scheduled":
          return t("labels.contentDateKind.scheduled");
        case "created":
          return t("labels.contentDateKind.created");
      }
    },
    getCompanyStatusLabel(isActive: boolean) {
      return isActive ? t("labels.companyStatus.active") : t("labels.companyStatus.paused");
    },
    getUserRoleLabel(role: string) {
      switch (role) {
        case "owner":
          return t("labels.userRole.owner");
        case "admin":
          return t("labels.userRole.admin");
        case "editor":
          return t("labels.userRole.editor");
        case "designer":
          return t("labels.userRole.designer");
        case "client":
          return t("labels.userRole.client");
        default:
          return humanizeToken(role);
      }
    },
    getActiveStateLabel(isActive: boolean) {
      return isActive ? t("labels.userActivity.active") : t("labels.userActivity.inactive");
    },
    getUserActivityLabel(isActive: boolean) {
      return isActive ? t("labels.userActivity.active") : t("labels.userActivity.inactive");
    },
    getPaymentStatusLabel(status: PaymentStatus) {
      switch (status) {
        case "paid":
          return t("labels.paymentStatus.paid");
        case "pending":
          return t("labels.paymentStatus.pending");
        case "overdue":
          return t("labels.paymentStatus.overdue");
      }
    },
    getPaymentDisplayDateLabel(status: PaymentStatus, paidAt: string | null) {
      return status === "paid" && paidAt ? t("labels.paymentDate.paid") : t("labels.paymentDate.due");
    },
    getActivityActionLabel(action: string) {
      switch (action) {
        case "auth.login":
          return t("labels.activityActions.authLogin");
        case "auth.logout":
          return t("labels.activityActions.authLogout");
        case "company.create":
          return t("labels.activityActions.companyCreate");
        case "company.update":
          return t("labels.activityActions.companyUpdate");
        case "company.delete":
          return t("labels.activityActions.companyDelete");
        case "company.restore":
          return t("labels.activityActions.companyRestore");
        case "company.hard_delete":
          return t("labels.activityActions.companyHardDelete");
        case "company.user_add":
          return t("labels.activityActions.companyUserAdd");
        case "company.user_remove":
          return t("labels.activityActions.companyUserRemove");
        case "social_account.create":
          return t("labels.activityActions.socialAccountCreate");
        case "social_account.update":
          return t("labels.activityActions.socialAccountUpdate");
        case "social_account.delete":
          return t("labels.activityActions.socialAccountDelete");
        case "content.create":
          return t("labels.activityActions.contentCreate");
        case "content.update":
          return t("labels.activityActions.contentUpdate");
        case "content.delete":
          return t("labels.activityActions.contentDelete");
        case "content.status_change":
          return t("labels.activityActions.contentStatusChange");
        case "content.assign":
          return t("labels.activityActions.contentAssign");
        case "content.approve":
          return t("labels.activityActions.contentApprove");
        case "content.reject":
          return t("labels.activityActions.contentReject");
        case "payment.create":
          return t("labels.activityActions.paymentCreate");
        case "payment.update":
          return t("labels.activityActions.paymentUpdate");
        case "payment.status_change":
          return t("labels.activityActions.paymentStatusChange");
        case "payment.delete":
          return t("labels.activityActions.paymentDelete");
        default:
          return humanizeToken(action).toLocaleLowerCase(getIntlLocale(locale));
      }
    },
    getActivityResourceLabel(resourceType: string | null) {
      if (!resourceType) {
        return t("labels.activityResource.system");
      }

      return humanizeToken(resourceType);
    },
    getCompanyMembersLabel(count: number) {
      return t("companies.list.members", { count });
    },
  };
}
