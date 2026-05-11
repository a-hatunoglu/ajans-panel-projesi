"use client";

import { useAuth } from "@/providers/auth-provider";
import { canManageCompanies } from "@/lib/roles";
import { useI18n } from "@/i18n/provider";
import { PageStatePanel } from "@/components/shared/page-state-panel";
import { SystemUsersTable } from "@/features/settings/components/system-users-table";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SystemUsersPage() {
  const { user, isLoading } = useAuth();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <PageStatePanel
        title={t("common.loading")}
        description={t("common.pleaseWait")}
      />
    );
  }

  if (!user || (!canManageCompanies(user?.role, user?.agencyRole ?? undefined))) {
    return (
      <PageStatePanel
        title={t("error.403.title")}
        description={t("error.403.description")}
      />
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto py-6">
      <div className="mb-8">
        <Link 
          href="/app/settings" 
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("settings.users.backToSettings")}
        </Link>
        <h1 className="text-2xl font-medium tracking-tight text-white mb-1">
          {t("settings.users.title")}
        </h1>
        <p className="text-sm text-zinc-400">
          {t("settings.users.description")}
        </p>
      </div>

      <div className="rounded-xl border border-white/5 bg-zinc-950">
        <SystemUsersTable />
      </div>
    </div>
  );
}
