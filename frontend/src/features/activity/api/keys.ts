// ─── Activity Query Keys ─────────────────────────────────────
export const activityKeys = {
  all: ["activity-logs"] as const,
  lists: () => [...activityKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...activityKeys.lists(), filters ?? {}] as const,
};
