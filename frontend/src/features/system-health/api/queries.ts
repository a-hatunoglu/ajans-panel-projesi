import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { SystemHealthReport } from "../types";

type HealthResponse = {
  success: boolean;
  data: SystemHealthReport;
};

/**
 * Fetches the system health report.
 * - enabled: only for owner/admin
 * - refetchOnWindowFocus: false (manual scan)
 * - staleTime: 60s (matches backend cache TTL)
 */
export function useSystemHealth(enabled = true, refresh = false) {
  return useQuery({
    queryKey: ["system-health", refresh ? "fresh" : "cached"],
    enabled,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (refresh) {
        params.refresh = "true";
      }
      const response = await apiClient<HealthResponse>("/system/health", {
        params,
      });
      return response.data;
    },
  });
}
