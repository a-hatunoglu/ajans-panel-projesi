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
import Link from "next/link";
import { Building2, Plus } from "lucide-react";

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

  const isFirstRun = data.hasAnyCompany === false;
  const isOwnerOrAdmin = ["owner", "admin"].includes(role);

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

        {isFirstRun ? (
          <div className="rounded-xl border border-white/5 bg-zinc-950 p-12 text-center flex flex-col items-center">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/5 bg-zinc-800/80">
              <Building2 className="h-5 w-5 text-zinc-500" />
            </div>
            <h2 className="mb-2 text-xl font-medium text-zinc-100">
              {isOwnerOrAdmin ? t("dashboard.emptyAdmin.title") : t("dashboard.emptyUser.title")}
            </h2>
            <p className="mx-auto max-w-md text-sm text-zinc-500 mb-6">
              {isOwnerOrAdmin ? t("dashboard.emptyAdmin.description") : t("dashboard.emptyUser.description")}
            </p>
            {isOwnerOrAdmin && (
              <Link
                href="/app/companies"
                className="inline-flex h-9 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
              >
                <Plus className="h-4 w-4" />
                {t("dashboard.emptyAdmin.cta")}
              </Link>
            )}
          </div>
        ) : (
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
        )}
      </div>
    </PageContainer>
  );
}
