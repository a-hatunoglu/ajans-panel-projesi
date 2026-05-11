// ─── Dashboard Query Keys ────────────────────────────────────
export const dashboardKeys = {
  all: ["dashboard"] as const,
  data: (role: string) => [...dashboardKeys.all, role] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
};
