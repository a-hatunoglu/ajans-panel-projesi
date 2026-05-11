// ─── Company Detail Query Keys ───────────────────────────────
export const companyDetailKeys = {
  detail: (id: string) => ["company-detail", id] as const,
  users: (companyId: string) => ["company-detail", companyId, "users"] as const,
  analytics: (companyId: string) =>
    ["company-detail", companyId, "analytics"] as const,
  workflowSnapshot: (companyId: string) =>
    ["company-workflow-snapshot", companyId] as const,
};
