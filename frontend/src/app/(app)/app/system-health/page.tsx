"use client";

import { useState } from "react";
import {
  HeartPulse,
  RefreshCw,
  Server,
  Database,
  Image as ImageIcon,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useSystemHealth } from "@/features/system-health/api/queries";
import { useAuth } from "@/providers/auth-provider";
import type {
  HealthSeverity,
  CategorySummary,
  ApiProbeItem,
  DbIntegrityItem,
  PageRegistryItem,
} from "@/features/system-health/types";
import { useI18n } from "@/i18n/provider";

// ─── Severity Helpers ────────────────────────────────────────

function SeverityIcon({ severity, size = 16 }: { severity: HealthSeverity; size?: number }) {
  switch (severity) {
    case "healthy":
      return <CheckCircle2 size={size} className="text-emerald-500" />;
    case "warning":
      return <AlertTriangle size={size} className="text-amber-500" />;
    case "critical":
      return <XCircle size={size} className="text-red-500" />;
  }
}

function SeverityBadge({ severity }: { severity: HealthSeverity }) {
  const map = {
    healthy: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", label: "Sağlıklı" },
    warning: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", label: "Uyarı" },
    critical: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", label: "Kritik" },
  };
  const s = map[severity];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${s.bg} ${s.border} ${s.text}`}>
      <SeverityIcon severity={severity} size={10} />
      {s.label}
    </span>
  );
}

function CategoryIcon({ category }: { category: string }) {
  const cls = "h-4 w-4 text-zinc-400";
  switch (category) {
    case "api": return <Server className={cls} />;
    case "database": return <Database className={cls} />;
    case "media": return <ImageIcon className={cls} />;
    case "pages": return <LayoutGrid className={cls} />;
    default: return <Server className={cls} />;
  }
}

// ─── Category Summary Card ───────────────────────────────────

function CategoryCard({ summary }: { summary: CategorySummary }) {
  const categoryLabels: Record<string, string> = {
    api: "API Servisleri",
    pages: "Sayfa Rotaları",
    database: "Veritabanı",
    media: "Medya Dosyaları",
  };

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-white/5 bg-zinc-900/40 p-4 text-center">
      <CategoryIcon category={summary.category} />
      <span className="text-xs font-medium text-zinc-300">
        {categoryLabels[summary.category] || summary.label}
      </span>
      <SeverityBadge severity={summary.severity} />
      <div className="flex items-center gap-3 text-[10px] text-zinc-500">
        {summary.healthy > 0 && <span className="text-emerald-400">{summary.healthy} ✓</span>}
        {summary.warning > 0 && <span className="text-amber-400">{summary.warning} ⚠</span>}
        {summary.critical > 0 && <span className="text-red-400">{summary.critical} ✗</span>}
        <span>{summary.total} toplam</span>
      </div>
    </div>
  );
}

// ─── Collapsible Section ─────────────────────────────────────

function CollapsibleSection({
  title,
  icon,
  count,
  severity,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  severity: HealthSeverity;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-white/5 bg-zinc-950/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-sm font-medium text-zinc-200">{title}</span>
          <SeverityBadge severity={severity} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">{count} kontrol</span>
          {open ? (
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-zinc-500" />
          )}
        </div>
      </button>
      {open && <div className="border-t border-white/5">{children}</div>}
    </div>
  );
}

// ─── API Items ───────────────────────────────────────────────

function ApiItemRow({ item }: { item: ApiProbeItem }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.03] px-4 py-2.5 last:border-b-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <SeverityIcon severity={item.severity} size={14} />
        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-400">
          {item.method}
        </span>
        <span className="truncate text-xs font-mono text-zinc-300">{item.path}</span>
        <span className="hidden md:inline text-[11px] text-zinc-500">{item.name}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {item.responseTimeMs !== null && (
          <span className="flex items-center gap-1 text-[10px] text-zinc-500">
            <Clock size={10} />
            {item.responseTimeMs}ms
          </span>
        )}
        <span className="text-[10px] text-zinc-500 w-24 text-right truncate">
          {item.message}
        </span>
      </div>
    </div>
  );
}

// ─── DB Items ────────────────────────────────────────────────

function DbItemRow({ item }: { item: DbIntegrityItem }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.03] px-4 py-2.5 last:border-b-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <SeverityIcon severity={item.severity} size={14} />
        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-400">
          {item.model}
        </span>
        <span className="text-xs text-zinc-300">{item.name}</span>
      </div>
      <span className="text-[11px] text-zinc-500 shrink-0 max-w-[300px] truncate text-right">
        {item.message}
      </span>
    </div>
  );
}

// ─── Pages Table ─────────────────────────────────────────────

function PageItemRow({ page }: { page: PageRegistryItem }) {
  const groupColors: Record<string, string> = {
    app: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    auth: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    legal: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
  };
  const color = groupColors[page.group] || groupColors.app;

  return (
    <div className="flex items-center justify-between border-b border-white/[0.03] px-4 py-2.5 last:border-b-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <CheckCircle2 size={14} className="text-emerald-500/60 shrink-0" />
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${color}`}>
          {page.group}
        </span>
        <span className="text-xs font-mono text-zinc-300 truncate">{page.path}</span>
        <span className="hidden md:inline text-[11px] text-zinc-500 truncate">{page.name}</span>
      </div>
      <span className="text-[10px] text-zinc-600 shrink-0 max-w-[200px] truncate text-right hidden lg:inline">
        {page.description}
      </span>
    </div>
  );
}

import { canManageCompanies } from "@/lib/roles";

// ─── Main Page ───────────────────────────────────────────────

export default function SystemHealthPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const isAllowed = canManageCompanies(user?.role, user?.agencyRole ?? undefined);
  const [refreshKey, setRefreshKey] = useState(false);
  const { data, isLoading, isFetching, refetch } = useSystemHealth(isAllowed, refreshKey);

  function handleScan() {
    setRefreshKey(true);
    refetch();
  }

  if (!isAllowed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-zinc-500">{t("systemHealth.page.noAccess")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      {/* Back + Title */}
      <div className="mb-6">
        <Link
          href="/app"
          className="mb-3 inline-flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ArrowLeft className="h-3 w-3" />
          {t("systemHealth.page.backToDashboard")}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-zinc-400" />
              {t("systemHealth.page.title")}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {t("systemHealth.page.description")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleScan}
            disabled={isFetching}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-white/10 bg-zinc-900 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? t("systemHealth.page.scanning") : t("systemHealth.page.scan")}
          </button>
        </div>
      </div>

      {/* Loading / Empty */}
      {isLoading && !data && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-zinc-500" />
            <p className="text-sm text-zinc-500">{t("systemHealth.page.scanning")}</p>
          </div>
        </div>
      )}

      {!isLoading && !data && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <HeartPulse className="h-8 w-8 text-zinc-600" />
            <p className="text-sm text-zinc-500">{t("systemHealth.page.notScanned")}</p>
            <button
              type="button"
              onClick={handleScan}
              disabled={isFetching}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-white/10 bg-zinc-900 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              {t("systemHealth.page.startScan")}
            </button>
          </div>
        </div>
      )}

      {/* Report */}
      {data && (
        <div className="flex flex-col gap-6">
          {/* Scan Meta */}
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-zinc-900/30 px-4 py-3">
            <div className="flex items-center gap-3">
              <SeverityIcon severity={data.overallSeverity} size={18} />
              <span className="text-sm font-medium text-zinc-200">
                {data.overallSeverity === "healthy"
                  ? t("systemHealth.page.allHealthy")
                  : data.overallSeverity === "warning"
                    ? t("systemHealth.page.hasWarnings")
                    : t("systemHealth.page.hasCritical")}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span>
                {t("systemHealth.page.lastScan")}: {new Date(data.scannedAt).toLocaleTimeString()}
              </span>
              <span>{data.scanDurationMs}ms</span>
            </div>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {data.categories.map((cat) => (
              <CategoryCard key={cat.category} summary={cat} />
            ))}
          </div>

          {/* API Section */}
          <CollapsibleSection
            title="API Servisleri"
            icon={<Server className="h-4 w-4 text-zinc-400" />}
            count={data.api.length}
            severity={data.categories.find((c) => c.category === "api")?.severity || "healthy"}
            defaultOpen
          >
            {data.api.map((item) => (
              <ApiItemRow key={item.id} item={item} />
            ))}
          </CollapsibleSection>

          {/* Pages Section */}
          <CollapsibleSection
            title="Sayfa Rotaları"
            icon={<LayoutGrid className="h-4 w-4 text-zinc-400" />}
            count={data.pages.length}
            severity={data.categories.find((c) => c.category === "pages")?.severity || "healthy"}
          >
            {data.pages.map((page) => (
              <PageItemRow key={page.path} page={page} />
            ))}
          </CollapsibleSection>

          {/* Database Section */}
          <CollapsibleSection
            title="Veritabanı Bütünlüğü"
            icon={<Database className="h-4 w-4 text-zinc-400" />}
            count={data.database.length}
            severity={data.categories.find((c) => c.category === "database")?.severity || "healthy"}
            defaultOpen={data.categories.find((c) => c.category === "database")?.severity !== "healthy"}
          >
            {data.database.map((item) => (
              <DbItemRow key={item.id} item={item} />
            ))}
          </CollapsibleSection>

          {/* Media Section */}
          <CollapsibleSection
            title="Medya Dosyaları"
            icon={<ImageIcon className="h-4 w-4 text-zinc-400" />}
            count={data.media.totalFiles}
            severity={data.media.severity}
            defaultOpen={data.media.severity !== "healthy"}
          >
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <SeverityIcon severity={data.media.severity} size={14} />
                <span className="text-xs text-zinc-300">{data.media.message}</span>
              </div>
              {data.media.brokenFiles.length > 0 && (
                <div className="mt-3 flex flex-col gap-1">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    Erişilemeyen Dosyalar
                  </span>
                  {data.media.brokenFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 rounded bg-red-500/5 px-3 py-1.5 text-xs"
                    >
                      <XCircle size={12} className="text-red-400 shrink-0" />
                      <span className="truncate font-mono text-red-300">{file.url}</span>
                      <Link
                        href={`/app/contents/${file.contentId}`}
                        className="shrink-0 text-[10px] text-zinc-500 hover:text-zinc-300"
                      >
                        İçeriğe git →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
}
