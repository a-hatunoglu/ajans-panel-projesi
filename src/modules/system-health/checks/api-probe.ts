/**
 * API Probe — internal loopback health check for API endpoints.
 *
 * Sends GET requests to probeable endpoints using the actor's auth cookie,
 * so all auth-protected routes can be tested from the owner/admin perspective.
 */

import { API_REGISTRY, ApiRegistryEntry } from '../registries/api-registry';
import { env } from '../../../config';

export type HealthSeverity = 'healthy' | 'warning' | 'critical';

export type ApiProbeResult = {
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

const PROBE_TIMEOUT_MS = 5000;

function buildInternalUrl(path: string): string {
  const port = env.PORT || 3000;
  return `http://127.0.0.1:${port}${env.API_PREFIX}${path}`;
}

async function probeEndpoint(
  entry: ApiRegistryEntry,
  authCookie: string,
): Promise<ApiProbeResult> {
  const base: Omit<ApiProbeResult, 'severity' | 'message' | 'responseTimeMs' | 'statusCode' | 'probed'> = {
    id: `api-${entry.method.toLowerCase()}-${entry.path.replace(/\//g, '-')}`,
    name: entry.name,
    method: entry.method,
    path: entry.path,
    module: entry.module,
  };

  if (!entry.probe) {
    return {
      ...base,
      severity: 'healthy',
      message: 'Endpoint registered (not probed — non-GET)',
      responseTimeMs: null,
      statusCode: null,
      probed: false,
    };
  }

  const url = buildInternalUrl(entry.path);
  const start = performance.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Cookie: authCookie,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const elapsed = Math.round(performance.now() - start);

    if (response.ok) {
      return {
        ...base,
        severity: 'healthy',
        message: `${response.status} OK (${elapsed}ms)`,
        responseTimeMs: elapsed,
        statusCode: response.status,
        probed: true,
      };
    }

    // 4xx/5xx
    const severityForCode: HealthSeverity = response.status >= 500 ? 'critical' : 'warning';
    return {
      ...base,
      severity: severityForCode,
      message: `HTTP ${response.status} (${elapsed}ms)`,
      responseTimeMs: elapsed,
      statusCode: response.status,
      probed: true,
    };
  } catch (error) {
    const elapsed = Math.round(performance.now() - start);
    const isTimeout = error instanceof Error && error.name === 'AbortError';

    return {
      ...base,
      severity: 'critical',
      message: isTimeout ? `Timeout (>${PROBE_TIMEOUT_MS}ms)` : `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
      responseTimeMs: elapsed,
      statusCode: null,
      probed: true,
    };
  }
}

/**
 * Probe all registered API endpoints.
 */
export async function runApiProbes(authCookie: string): Promise<ApiProbeResult[]> {
  const results = await Promise.allSettled(
    API_REGISTRY.map((entry) => probeEndpoint(entry, authCookie)),
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }

    const entry = API_REGISTRY[index];
    return {
      id: `api-${entry.method.toLowerCase()}-${entry.path.replace(/\//g, '-')}`,
      name: entry.name,
      method: entry.method,
      path: entry.path,
      module: entry.module,
      severity: 'critical' as HealthSeverity,
      message: `Probe failed: ${result.reason}`,
      responseTimeMs: null,
      statusCode: null,
      probed: true,
    };
  });
}
