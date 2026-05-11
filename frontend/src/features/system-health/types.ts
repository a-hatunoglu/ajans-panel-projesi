// ─── System Health Types ─────────────────────────────────────

export type HealthSeverity = "healthy" | "warning" | "critical";

export type ApiProbeItem = {
  id: string;
  name: string;
  method: string;
  path: string;
  module: string;
  severity: HealthSeverity;
  message: string;
  responseTimeMs: number | null;
  statusCode: number | null;
  probed: boolean;
};

export type DbIntegrityItem = {
  id: string;
  name: string;
  model: string;
  severity: HealthSeverity;
  message: string;
  count: number | null;
};

export type MediaCheckResult = {
  id: string;
  name: string;
  severity: HealthSeverity;
  message: string;
  totalFiles: number;
  accessible: number;
  inaccessible: number;
  brokenFiles: Array<{ id: string; url: string; contentId: string }>;
};

export type PageRegistryItem = {
  name: string;
  path: string;
  group: "app" | "auth" | "legal";
  accessRoles: string[];
  description: string;
};

export type CategorySummary = {
  category: "api" | "database" | "media" | "pages";
  label: string;
  total: number;
  healthy: number;
  warning: number;
  critical: number;
  severity: HealthSeverity;
};

export type SystemHealthReport = {
  overallSeverity: HealthSeverity;
  categories: CategorySummary[];
  api: ApiProbeItem[];
  database: DbIntegrityItem[];
  media: MediaCheckResult;
  pages: PageRegistryItem[];
  scannedAt: string;
  scanDurationMs: number;
};
