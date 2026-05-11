"use client";

import { PageStatePanel } from "@/components/shared/page-state-panel";
import { useAuth } from "@/providers/auth-provider"
import { canManageCompanies, isPlatformOwner } from "@/lib/roles";
import { PageContainer } from "@/components/shared/page-container";
import { useDashboardData } from "@/features/dashboard/api/queries";
import { useDashboardLayout } from "@/features/dashboard/hooks/use-dashboard-layout";
import { DashboardEditBar } from "@/features/dashboard/components/dashboard-edit-bar";
import { DashboardGrid } from "@/features/dashboard/components/dashboard-grid";
import { useI18n } from "@/i18n/provider";
import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { t } = useI18n();
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const role = user?.role || "guest";

  // Platform owner without active agency context → redirect to platform panel
  useEffect(() => {
    if (isAuthLoading || !user) return;
    if (isPlatformOwner(user.role)) {
      const activeAgencyId =
        typeof window !== "undefined"
          ? localStorage.getItem("agencyos-active-agency-id")
          : null;
      if (!activeAgencyId) {
        router.replace("/app/platform");
      }
    }
  }, [user, isAuthLoading, router]);
  const {
    data,
    isLoading,
    isError,
  } = useDashboardData(role, !isAuthLoading);

  const {
    layout,
    isEditing,
    startEditing,
    cancelEditing,
    saveEditing,
    toggleWidget,
    moveWidget,
    resizeWidget,
    resetToDefault,
    getWidgetDef,
  } = useDashboardLayout(user?.id, role, user?.agencyRole);

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
  const isOwnerOrAdmin = canManageCompanies(user?.role, user?.agencyRole ?? undefined);

  return (
    <PageContainer className="animate-in fade-in duration-500 pb-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-white mb-1">{t("dashboard.pageTitle")}</h1>
          <p className="text-sm text-zinc-400">{t("dashboard.pageSubtitle")}</p>
        </div>
        {!isFirstRun && (
          <DashboardEditBar
            isEditing={isEditing}
            onStartEditing={startEditing}
            onSave={saveEditing}
            onCancel={cancelEditing}
            onReset={resetToDefault}
          />
        )}
      </div>

      {inlineErrorMessage && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {inlineErrorMessage}
        </div>
      )}

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
        <DashboardGrid
          layout={layout}
          data={data}
          isEditing={isEditing}
          onToggle={toggleWidget}
          onMove={moveWidget}
          onResize={resizeWidget}
          getWidgetDef={getWidgetDef}
        />
      )}
    </PageContainer>
  );
}
