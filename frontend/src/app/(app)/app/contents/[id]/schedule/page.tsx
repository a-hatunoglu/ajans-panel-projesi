"use client";

import { useParams } from "next/navigation";
import { PageContainer } from "@/components/shared/page-container";
import { PageStatePanel } from "@/components/shared/page-state-panel";
import { RestrictedAccessPanel } from "@/components/shared/restricted-access-panel";
import { ContentScheduleForm } from "@/features/content-schedule/components/content-schedule-form";
import { useContentDetail } from "@/features/content-detail/api/queries";
import { getContentPermissions } from "@/features/content-detail/permissions";
import { useLabels } from "@/lib/labels";
import { useI18n } from "@/i18n/provider";
import { useAuth } from "@/providers/auth-provider";
import { useCompanyRoles } from "@/hooks/use-company-roles";

export default function ContentSchedulePage() {
  const { t } = useI18n();
  const { getContentStatusLabel } = useLabels();
  const { user, isLoading: isAuthLoading } = useAuth();
  const params = useParams<{ id: string }>();
  const contentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data, isLoading, isError, error } = useContentDetail(contentId);
  const { companyRoles } = useCompanyRoles(data?.companyId);

  if (!contentId) {
    return (
      <PageStatePanel
        title={t("contentSchedule.invalidTitle")}
        description={t("contentSchedule.invalidDescription")}
        className="max-w-5xl"
      />
    );
  }

  if (isAuthLoading || isLoading) {
    return (
      <PageStatePanel
        title={t("contentSchedule.loadingTitle")}
        description={t("contentSchedule.loadingDescription")}
        className="max-w-5xl"
      />
    );
  }

  if (isError || !data) {
    const message =
      error instanceof Error ? error.message : t("contentSchedule.errorDescription");

    return (
      <PageStatePanel
        title={t("contentSchedule.errorTitle")}
        description={message}
        className="max-w-5xl"
      />
    );
  }

  const permissions = getContentPermissions(data, user, companyRoles, isAuthLoading);

  if (!permissions.hasScheduleAccessByRole) {
    return (
      <PageContainer className="animate-in fade-in duration-500 pb-12 max-w-5xl">
        <div className="mb-6">
          <h1 className="mb-1 text-2xl font-medium tracking-tight text-white">
            {t("contentSchedule.pageTitle")}
          </h1>
          <p className="text-sm text-zinc-400">
            {t("contentSchedule.pageSubtitle")}
          </p>
        </div>
        <RestrictedAccessPanel
          description={t("contentSchedule.restrictedDescription")}
        />
      </PageContainer>
    );
  }

  if (!permissions.isSchedulableStatus) {
    return (
      <PageStatePanel
        title={t("contentSchedule.notSchedulableTitle")}
        description={t("contentSchedule.notSchedulableDescription", {
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
          {t("contentSchedule.pageTitle")}
        </h1>
        <p className="text-sm text-zinc-400">{t("contentSchedule.pageSubtitle")}</p>
      </div>

      <ContentScheduleForm data={data} />
    </PageContainer>
  );
}
