"use client";

import { useCompanyAnalytics } from "../api/queries";
import { CompanyInlineStatePanel } from "./company-inline-state-panel";
import { Activity, Clock, FileText, Globe } from "lucide-react";
import { useI18n } from "@/i18n/provider";

export function CompanyAnalytics({ companyId }: { companyId: string }) {
  const { t } = useI18n();
  const { data, isLoading, isError } = useCompanyAnalytics(companyId);

  if (isLoading) {
    return <CompanyInlineStatePanel message={t("companyDetail.overview.analytics.loading", { defaultValue: "Analitik veriler yükleniyor..." })} />;
  }

  if (isError || !data) {
    return <CompanyInlineStatePanel message={t("companyDetail.overview.analytics.error", { defaultValue: "Analitik veriler yüklenirken bir hata oluştu." })} />;
  }

  const statCards = [
    {
      id: "totalContents",
      label: "Toplam İçerik",
      value: data.totalContents,
      icon: <FileText className="h-4 w-4 text-emerald-500" />,
    },
    {
      id: "pendingApprovals",
      label: "Onay Bekleyen",
      value: data.pendingApprovals,
      icon: <Clock className="h-4 w-4 text-orange-500" />,
    },
    {
      id: "scheduledContents",
      label: "Planlanan",
      value: data.scheduledContents,
      icon: <Activity className="h-4 w-4 text-blue-500" />,
    },
    {
      id: "activeSocialAccounts",
      label: "Bağlı Hesaplar",
      value: data.activeSocialAccounts,
      icon: <Globe className="h-4 w-4 text-purple-500" />,
    },
  ];

  return (
    <section className="rounded-xl border border-white/5 bg-zinc-950 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-zinc-200">
          Analitik Özeti
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Şirketin güncel durumuna dair istatistikler.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.id} className="flex flex-col gap-2 rounded-lg border border-white/5 bg-zinc-900/30 p-4">
            <div className="flex items-center gap-2">
              {stat.icon}
              <span className="text-xs font-medium text-zinc-400">{stat.label}</span>
            </div>
            <span className="text-2xl font-semibold text-zinc-100">{stat.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
