"use client";

import { useParams } from "next/navigation";
import { PageContainer } from "@/components/shared/page-container";
import { PageStatePanel } from "@/components/shared/page-state-panel";
import { RestrictedAccessPanel } from "@/components/shared/restricted-access-panel";
import { ContentPublishPanel } from "@/features/content-publish/components/content-publish-panel";
import { useContentDetail } from "@/features/content-detail/api/queries";
import { getContentPermissions } from "@/features/content-detail/permissions";
import { useLabels } from "@/lib/labels";
import { useI18n } from "@/i18n/provider";
import { useAuth } from "@/providers/auth-provider";

export default function ContentPublishPage() {
  const { t } = useI18n();
  const { getContentStatusLabel } = useLabels();
  const { user, isLoading: isAuthLoading } = useAuth();
  const params = useParams<{ id: string }>();
  const contentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data, isLoading, isError, error } = useContentDetail(contentId);

  if (!contentId) {
    return (
      <PageStatePanel
        title={t("contentPublish.invalidTitle")}
        description={t("contentPublish.invalidDescription")}
        className="max-w-5xl"
      />
    );
  }

  if (isAuthLoading || isLoading) {
    return (
      <PageStatePanel
        title={t("contentPublish.loadingTitle")}
        description={t("contentPublish.loadingDescription")}
        className="max-w-5xl"
      />
    );
  }

  if (isError || !data) {
    const message =
      error instanceof Error ? error.message : t("contentPublish.errorDescription");

    return (
      <PageStatePanel
        title={t("contentPublish.errorTitle")}
        description={message}
        className="max-w-5xl"
      />
    );
  }

  const permissions = getContentPermissions(data, user, false);

  if (!permissions.hasPublishAccessByRole) {
    return (
      <PageContainer className="animate-in fade-in duration-500 pb-12 max-w-5xl">
        <div className="mb-6">
          <h1 className="mb-1 text-2xl font-medium tracking-tight text-white">
            {t("contentPublish.pageTitle")}
          </h1>
          <p className="text-sm text-zinc-400">
            {t("contentPublish.pageSubtitle")}
          </p>
        </div>
        <RestrictedAccessPanel
          description={t("contentPublish.restrictedDescription")}
        />
      </PageContainer>
    );
  }

  if (!permissions.isPublishableStatus) {
    return (
      <PageStatePanel
        title={t("contentPublish.notPublishableTitle")}
        description={t("contentPublish.notPublishableDescription", {
          status: getContentStatusLabel(data.status),
        })}
        className="max-w-5xl"
      />
    );
  }

  return (
    <PageContainer className="animate-in fade-in duration-500 pb-12 max-w-5xl">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-medium tracking-tight text-white">
          {t("contentPublish.pageTitle")}
        </h1>
        <p className="text-sm text-zinc-400">{t("contentPublish.pageSubtitle")}</p>
      </div>

      <ContentPublishPanel data={data} />
    </PageContainer>
  );
}
