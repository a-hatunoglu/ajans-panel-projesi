/**
 * System Health Service
 *
 * Orchestrates all health checks and aggregates results into a report.
 * Includes a simple in-memory cache (1 minute TTL).
 */

import { runApiProbes, type ApiProbeResult, type HealthSeverity } from './checks/api-probe';
import { runDbIntegrityChecks, type DbIntegrityResult } from './checks/db-integrity';
import { runMediaChecks, type MediaCheckResult } from './checks/media-check';
import { PAGE_REGISTRY, type PageRegistryEntry } from './registries/page-registry';
import { API_REGISTRY } from './registries/api-registry';
import { UserRole } from '../../shared/types/enums';
import { ForbiddenError } from '../../shared/errors/app-error';
import type { ActorContext } from '../../shared/types/actor-context';

// ─── Types ───────────────────────────────────────────────────

export type CategorySummary = {
  category: 'api' | 'database' | 'media' | 'pages';
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
  api: ApiProbeResult[];
  database: DbIntegrityResult[];
  media: MediaCheckResult;
  pages: PageRegistryEntry[];
  scannedAt: string;
  scanDurationMs: number;
};

// ─── Cache ───────────────────────────────────────────────────

const CACHE_TTL_MS = 60_000; // 1 minute
let cachedReport: SystemHealthReport | null = null;
let cacheTimestamp = 0;

function getCachedReport(): SystemHealthReport | null {
  if (cachedReport && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedReport;
  }
  return null;
}

function setCachedReport(report: SystemHealthReport): void {
  cachedReport = report;
  cacheTimestamp = Date.now();
}

// ─── Helpers ─────────────────────────────────────────────────

function worstSeverity(items: Array<{ severity: HealthSeverity }>): HealthSeverity {
  if (items.some((i) => i.severity === 'critical')) return 'critical';
  if (items.some((i) => i.severity === 'warning')) return 'warning';
  return 'healthy';
}

function buildCategorySummary(
  category: CategorySummary['category'],
  label: string,
  items: Array<{ severity: HealthSeverity }>,
): CategorySummary {
  return {
    category,
    label,
    total: items.length,
    healthy: items.filter((i) => i.severity === 'healthy').length,
    warning: items.filter((i) => i.severity === 'warning').length,
    critical: items.filter((i) => i.severity === 'critical').length,
    severity: worstSeverity(items),
  };
}

// ─── Service ─────────────────────────────────────────────────

function assertOwnerOrAdmin(actor: ActorContext): void {
  if (actor.role !== UserRole.PLATFORM_OWNER && actor.agencyRole !== 'agency_admin') {
    throw new ForbiddenError('Sistem sağlığı raporuna erişim yetkiniz yok.');
  }
}

/**
 * Run a full system health scan.
 *
 * @param actor - Current user context (must be owner or admin)
 * @param authCookie - Raw cookie header for API probing
 * @param bypassCache - If true, skip the cache and run a fresh scan
 */
export async function runFullScan(
  actor: ActorContext,
  authCookie: string,
  bypassCache = false,
): Promise<SystemHealthReport> {
  assertOwnerOrAdmin(actor);

  if (!bypassCache) {
    const cached = getCachedReport();
    if (cached) return cached;
  }

  const start = performance.now();

  const [apiResults, dbResults, mediaResult] = await Promise.all([
    runApiProbes(authCookie),
    runDbIntegrityChecks(),
    runMediaChecks(),
  ]);

  const elapsed = Math.round(performance.now() - start);

  const apiSummary = buildCategorySummary('api', 'API Servisleri', apiResults);
  const dbSummary = buildCategorySummary('database', 'Veritabanı', dbResults);
  const mediaSummary: CategorySummary = {
    category: 'media',
    label: 'Medya Dosyaları',
    total: mediaResult.totalFiles,
    healthy: mediaResult.accessible,
    warning: 0,
    critical: mediaResult.inaccessible,
    severity: mediaResult.severity,
  };
  const pagesSummary: CategorySummary = {
    category: 'pages',
    label: 'Sayfa Rotaları',
    total: PAGE_REGISTRY.length,
    healthy: PAGE_REGISTRY.length,
    warning: 0,
    critical: 0,
    severity: 'healthy',
  };

  const categories = [apiSummary, pagesSummary, dbSummary, mediaSummary];
  const overallSeverity = worstSeverity(categories);

  const report: SystemHealthReport = {
    overallSeverity,
    categories,
    api: apiResults,
    database: dbResults,
    media: mediaResult,
    pages: PAGE_REGISTRY,
    scannedAt: new Date().toISOString(),
    scanDurationMs: elapsed,
  };

  setCachedReport(report);
  return report;
}

/**
 * Get endpoint/page counts for quick summary (no actual probe).
 */
export function getRegistryCounts(actor: ActorContext) {
  assertOwnerOrAdmin(actor);

  return {
    apiEndpoints: API_REGISTRY.length,
    probeableEndpoints: API_REGISTRY.filter((e) => e.probe).length,
    pages: PAGE_REGISTRY.length,
    appPages: PAGE_REGISTRY.filter((p) => p.group === 'app').length,
    authPages: PAGE_REGISTRY.filter((p) => p.group === 'auth').length,
    legalPages: PAGE_REGISTRY.filter((p) => p.group === 'legal').length,
  };
}
