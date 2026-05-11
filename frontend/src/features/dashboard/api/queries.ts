import { useQuery } from "@tanstack/react-query";
import { addDays, endOfDay, startOfDay } from "date-fns";
import { apiClient } from "@/lib/api-client";
import { Company } from "@/features/companies/types";
import { ContentListItemData } from "@/features/contents/types";
import type {
  AttentionItem,
  DashboardActivityItem,
  DashboardBillingItem,
  DashboardData,
  ScheduleItem,
} from "../types";

type BackendPlatform =
  | "instagram"
  | "linkedin"
  | "facebook"
  | "x"
  | "tiktok"
  | "youtube";

type BackendCalendarContent = {
  id: string;
  title: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  company: {
    id: string;
    name: string;
  };
  socialAccount: {
    id: string;
    platform: BackendPlatform;
    accountName: string;
  } | null;
};

type CompaniesResponse = {
  success: boolean;
  data: Company[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
};

type ContentsResponse = {
  success: boolean;
  data: ContentListItemData[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
};

type CalendarResponse = {
  success: boolean;
  data: {
    contents: BackendCalendarContent[];
  };
};

function isGlobalCalendarRole(role: string, agencyRole?: string): boolean {
  return role === "platform_owner" || agencyRole === "agency_admin";
}
function isAdminRole(role: string, agencyRole?: string): boolean {
  return role === "platform_owner" || agencyRole === "agency_admin";
}

// ─── Activity Logs Backend Types ─────────────────────────────

type BackendActivityUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
} | null;

type BackendActivityLog = {
  id: string;
  action: string;
  createdAt: string;
  user: BackendActivityUser;
  company: { id: string; name: string } | null;
};

type ActivityLogsResponse = {
  success: boolean;
  data: BackendActivityLog[];
  meta: { page: number; perPage: number; total: number; totalPages: number };
};

// ─── Payments Backend Types ──────────────────────────────────

type BackendPayment = {
  id: string;
  amount: string | number;
  currency: string;
  dueDate: string;
  status: string;
  paidAt: string | null;
  company: { id: string; name: string } | null;
};

type PaymentsResponse = {
  success: boolean;
  data: BackendPayment[];
  meta: { page: number; perPage: number; total: number; totalPages: number };
};

function isFulfilled<T>(
  result: PromiseSettledResult<T>,
): result is PromiseFulfilledResult<T> {
  return result.status === "fulfilled";
}

async function fetchAllCompanies() {
  const firstPage = await apiClient<CompaniesResponse>("/companies", {
    params: {
      page: "1",
      perPage: "100",
    },
  });

  if (firstPage.meta.totalPages <= 1) {
    return firstPage.data;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.meta.totalPages - 1 }, (_, index) =>
      apiClient<CompaniesResponse>("/companies", {
        params: {
          page: String(index + 2),
          perPage: "100",
        },
      }),
    ),
  );

  return [
    ...firstPage.data,
    ...remainingPages.flatMap((response) => response.data),
  ];
}

function mapAttentionItems(contents: ContentListItemData[]) {
  return contents
    .map((content) => ({
      id: content.id,
      title: content.title,
      companyName: content.companyName,
      status: content.status as AttentionItem["status"],
      dateKind: content.dateKind,
      dateAt: content.dateAt,
      sortAt: new Date(content.dateAt).getTime(),
    }))
    .sort((left, right) => right.sortAt - left.sortAt)
    .slice(0, 5)
    .map(({ sortAt: _sortAt, ...item }) => item);
}

function mapScheduleItems(contents: BackendCalendarContent[]) {
  return contents
    .map((content) => {
      const displayAt = content.scheduledAt ?? content.publishedAt;

      if (!displayAt) {
        return null;
      }

      const displayDate = new Date(displayAt);

      if (Number.isNaN(displayDate.getTime())) {
        return null;
      }

      return {
        id: content.id,
        title: content.title,
        companyName: content.company.name,
        platform: content.socialAccount?.platform ?? null,
        socialAccountName: content.socialAccount?.accountName ?? null,
        scheduledAt: displayAt,
        sortAt: displayDate.getTime(),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((left, right) => left.sortAt - right.sortAt)
    .slice(0, 5)
    .map(({ sortAt: _sortAt, ...item }) => item satisfies ScheduleItem);
}

async function fetchScheduledCalendarContents(
  role: string,
  companies: Company[] | null,
  startDate: string,
  endDate: string,
) {
  if (isGlobalCalendarRole(role)) {
    const response = await apiClient<CalendarResponse>("/contents/calendar", {
      params: {
        startDate,
        endDate,
      },
    });

    return response.data.contents;
  }

  if (!companies) {
    throw new Error("Dashboard companies unavailable");
  }

  if (companies.length === 0) {
    return [];
  }

  const responses = await Promise.all(
    companies.map((company) =>
      apiClient<CalendarResponse>(`/companies/${company.id}/contents/calendar`, {
        params: {
          startDate,
          endDate,
        },
      }),
    ),
  );

  return Array.from(
    new Map(
      responses
        .flatMap((response) => response.data.contents)
        .map((content) => [content.id, content]),
    ).values(),
  );
}

// ─── Activity Logs Mapping ───────────────────────────────────

function formatActorName(user: BackendActivityUser): string {
  if (!user) return "System";
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  return fullName || user.email || "System";
}

function mapActivityItems(
  logs: BackendActivityLog[],
): DashboardActivityItem[] {
  return logs.slice(0, 8).map((log) => ({
    id: log.id,
    actorName: formatActorName(log.user),
    action: log.action,
    companyName: log.company?.name ?? null,
    createdAt: log.createdAt,
  }));
}

// ─── Billing Items Mapping ───────────────────────────────────

function mapBillingItems(
  payments: BackendPayment[],
): DashboardBillingItem[] {
  const now = new Date();

  return payments
    .filter((p) => p.status === "pending")
    .map((p) => {
      const due = new Date(p.dueDate);
      return {
        id: p.id,
        companyName: p.company?.name ?? "—",
        amount: Number(p.amount),
        currency: p.currency,
        dueDate: p.dueDate,
        status: (due < now ? "overdue" : "pending") as DashboardBillingItem["status"],
      };
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);
}

export function useDashboardData(role: string, enabled = true) {
  return useQuery({
    queryKey: ["dashboard", role],
    enabled,
    staleTime: 30_000, // 30s — dashboard needs fresher data than global 5min default
    placeholderData: (previousData) => previousData,
    queryFn: async (): Promise<DashboardData> => {
      const windowStart = startOfDay(new Date());
      const startDate = windowStart.toISOString();
      const endDate = endOfDay(addDays(windowStart, 6)).toISOString();
      const isAdmin = isAdminRole(role);

      // Phase 1 + Phase 3: Core data AND admin data in parallel
      // Phase 3 has no dependency on Phase 1, so we launch them together.
      const adminFetchPromise = isAdmin
        ? Promise.allSettled([
            apiClient<ActivityLogsResponse>("/activity-logs", {
              params: { perPage: "8" },
            }),
            apiClient<PaymentsResponse>("/payments", {
              params: { status: "pending", perPage: "10" },
            }),
          ])
        : Promise.resolve([] as PromiseSettledResult<never>[]);

      const [coreResults, adminResults] = await Promise.all([
        // Phase 1: Core data (all roles)
        Promise.allSettled([
          fetchAllCompanies(),
          apiClient<ContentsResponse>("/contents", {
            params: {
              status: "in_review",
              perPage: "5",
            },
          }),
          apiClient<ContentsResponse>("/contents", {
            params: {
              status: "revise",
              perPage: "5",
            },
          }),
        ]),
        adminFetchPromise,
      ]);

      const [companiesResult, reviewResult, reviseResult] = coreResults;
      const companies = isFulfilled(companiesResult) ? companiesResult.value : null;
      const reviewContents = isFulfilled(reviewResult) ? reviewResult.value : null;
      const reviseContents = isFulfilled(reviseResult) ? reviseResult.value : null;
      const attentionAvailable = Boolean(reviewContents && reviseContents);

      // Phase 2: Calendar (depends on Phase 1 companies)
      const [calendarResult] = await Promise.allSettled([
        fetchScheduledCalendarContents(role, companies, startDate, endDate),
      ]);
      const scheduleAvailable = isFulfilled(calendarResult);
      const calendarContents = scheduleAvailable ? calendarResult.value : [];

      // Phase 3 results: Admin-only data (already resolved)
      let activityItems: DashboardActivityItem[] = [];
      let billingItems: DashboardBillingItem[] = [];
      let activityAvailable = false;
      let billingAvailable = false;

      if (isAdmin && adminResults.length === 2) {
        const [activityResult, paymentsResult] = adminResults;

        if (isFulfilled(activityResult)) {
          activityAvailable = true;
          activityItems = mapActivityItems(activityResult.value.data);
        }
        if (isFulfilled(paymentsResult)) {
          billingAvailable = true;
          billingItems = mapBillingItems(paymentsResult.value.data);
        }
      }

      const hasUsableData =
        companies !== null ||
        attentionAvailable ||
        scheduleAvailable;

      if (!hasUsableData) {
        throw new Error("Dashboard data unavailable");
      }

      return {
        stats: [
          {
            id: "needs-attention",
            value:
              attentionAvailable && reviewContents && reviseContents
                ? reviewContents.meta.total + reviseContents.meta.total
                : null,
          },
          {
            id: "upcoming-schedule",
            value: scheduleAvailable ? calendarContents.length : null,
          },
          {
            id: "active-companies",
            value: companies ? companies.filter((company) => company.isActive).length : null,
          },
        ],
        attentionItems:
          attentionAvailable && reviewContents && reviseContents
            ? mapAttentionItems([...reviewContents.data, ...reviseContents.data])
            : [],
        scheduleItems: mapScheduleItems(calendarContents),
        activityItems,
        billingItems,
        sections: {
          attention: attentionAvailable,
          schedule: scheduleAvailable,
          activity: activityAvailable,
          billing: billingAvailable,
        },
        hasAnyCompany: companies ? companies.length > 0 : null,
      };
    },
  });
}
