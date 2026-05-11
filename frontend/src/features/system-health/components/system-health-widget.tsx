"use client";

import { useState } from "react";
import { RefreshCw, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useSystemHealth } from "../api/queries";
import type { CategorySummary, HealthSeverity } from "../types";
import { useI18n } from "@/i18n/provider";

function getSeverityDot(severity: HealthSeverity) {
  switch (severity) {
    case "healthy":
      return <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />;
    case "warning":
      return <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />;
    case "critical":
      return <span className="inline-block h-2 w-2 rounded-full bg-red-500" />;
  }
}

function getCategoryStatusText(cat: CategorySummary) {
  if (cat.critical > 0) {
    return <span className="text-red-400">{cat.critical} kritik</span>;
  }
  if (cat.warning > 0) {
    return <span className="text-amber-400">{cat.warning} uyarı</span>;
  }
  return <span className="text-emerald-400">{cat.healthy}/{cat.total}</span>;
}

function CategoryLabels(): Record<string, string> {
  return {
    api: "API Servisleri",
    pages: "Sayfa Rotaları",
    database: "Veritabanı",
    media: "Medya Dosyaları",
  };
}

export function SystemHealthWidget() {
  const { t } = useI18n();
  const [refreshKey, setRefreshKey] = useState(false);
  const { data, isLoading, isFetching, refetch } = useSystemHealth(true, refreshKey);
  const labels = CategoryLabels();

  function handleScan() {
    setRefreshKey(true);
    refetch();
  }

  return (
    <div className="flex flex-col gap-3 p-5">
      {/* Status + Scan button */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          {data && (
            <span className="flex items-center gap-1.5 text-[10px] text-zinc-500">
              {getSeverityDot(data.overallSeverity)}
              {data.overallSeverity === "healthy"
                ? t("systemHealth.widget.healthy")
                : data.overallSeverity === "warning"
                  ? t("systemHealth.widget.warning")
                  : t("systemHealth.widget.critical")}
            </span>
          )}
          <button
            type="button"
            onClick={handleScan}
            disabled={isFetching}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-white/5 bg-zinc-900/50 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-50"
            title={t("systemHealth.widget.scan")}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading && !data ? (
        <div className="py-4 text-center text-xs text-zinc-500">
          {t("systemHealth.widget.scanning")}
        </div>
      ) : !data ? (
        <div className="py-4 text-center">
          <p className="text-xs text-zinc-500 mb-2">
            {t("systemHealth.widget.notScanned")}
          </p>
          <button
            type="button"
            onClick={handleScan}
            disabled={isFetching}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/5 bg-zinc-900/50 px-3 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
            {t("systemHealth.widget.startScan")}
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {data.categories.map((cat) => (
              <div
                key={cat.category}
                className="flex items-center justify-between rounded-md border border-white/5 bg-zinc-900/30 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  {getSeverityDot(cat.severity)}
                  <span className="text-xs text-zinc-300">
                    {labels[cat.category] || cat.label}
                  </span>
                </div>
                <span className="text-xs font-medium">
                  {getCategoryStatusText(cat)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-zinc-600">
              {t("systemHealth.widget.lastScan")}: {new Date(data.scannedAt).toLocaleTimeString()} ({data.scanDurationMs}ms)
            </span>
            <Link
              href="/app/system-health"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 transition-colors hover:text-zinc-200"
            >
              {t("systemHealth.widget.details")}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
