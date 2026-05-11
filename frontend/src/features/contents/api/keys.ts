// ─── Content Query Keys ──────────────────────────────────────
export const contentKeys = {
  all: ["contents"] as const,
  lists: () => [...contentKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...contentKeys.lists(), filters ?? {}] as const,
  details: () => [...contentKeys.all, "detail"] as const,
  detail: (id: string) => [...contentKeys.details(), id] as const,
  versions: (id: string) => [...contentKeys.detail(id), "versions"] as const,
  comments: (id: string) => [...contentKeys.detail(id), "comments"] as const,
};

// ─── Calendar Query Keys ─────────────────────────────────────
export const calendarKeys = {
  all: ["calendar"] as const,
  week: (weekStart: string, role: string) =>
    [...calendarKeys.all, "week", weekStart, role] as const,
};
