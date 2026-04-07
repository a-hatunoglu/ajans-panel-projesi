"use client";

import { PageStatePanel } from "@/components/shared/page-state-panel";
import { useAuth } from "@/providers/auth-provider";
import { PageContainer } from "@/components/shared/page-container";
import { StatCards } from "@/features/dashboard/components/stat-cards";
import { NeedsAttentionList } from "@/features/dashboard/components/needs-attention-list";
import { UpcomingSchedule } from "@/features/dashboard/components/upcoming-schedule";
import { DashboardInlineStatePanel } from "@/features/dashboard/components/dashboard-inline-state-panel";
import { useDashboardData } from "@/features/dashboard/api/queries";
import { useI18n } from "@/i18n/provider";

export default function DashboardPage() {
  const { t } = useI18n();
  const { user, isLoading: isAuthLoading } = useAuth();
  const role = user?.role || "guest";
  const {
    data,
    isLoading,
    isError,
  } = useDashboardData(role, !isAuthLoading);

  if (isAuthLoading || (isLoading && !data)) {
    return (
      <PageStatePanel
        title={t("dashboard.loadingTitle")}
        description={t("dashboard.loadingDescription")}
      />
    );
  }

  if (isError && !data) {
    return (
      <PageStatePanel
        title={t("dashboard.errorTitle")}
        description={t("dashboard.errorDescription")}
      />
    );
  }

  if (!data) {
    return (
      <PageStatePanel
        title={t("dashboard.errorTitle")}
        description={t("dashboard.errorDescription")}
      />
    );
  }

  const inlineErrorMessage =
    isError && data ? t("dashboard.errorDescription") : null;

  return (
    <PageContainer className="animate-in fade-in duration-500 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight text-white mb-1">{t("dashboard.pageTitle")}</h1>
        <p className="text-sm text-zinc-400">{t("dashboard.pageSubtitle")}</p>
      </div>

      {inlineErrorMessage && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {inlineErrorMessage}
        </div>
      )}

      <div className="space-y-8">
        <StatCards stats={data.stats} />

        <div className="grid grid-cols-1 gap-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium tracking-tight text-zinc-200">{t("dashboard.attentionTitle")}</h2>
            </div>
            {data.sections.attention ? (
              <NeedsAttentionList items={data.attentionItems} />
            ) : (
              <DashboardInlineStatePanel
                message={t("dashboard.attentionUnavailable")}
              />
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium tracking-tight text-zinc-200">{t("dashboard.scheduleTitle")}</h2>
            </div>
            {data.sections.schedule ? (
              <UpcomingSchedule items={data.scheduleItems} />
            ) : (
              <DashboardInlineStatePanel
                message={t("dashboard.scheduleUnavailable")}
              />
            )}
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
