// ─── Payment Query Keys ──────────────────────────────────────
export const paymentKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...paymentKeys.lists(), filters ?? {}] as const,
  companyPayments: (companyId: string) =>
    [...paymentKeys.all, "company", companyId] as const,
};
