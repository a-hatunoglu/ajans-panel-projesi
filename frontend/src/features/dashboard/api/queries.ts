import { useQuery } from "@tanstack/react-query";
import { addDays, endOfDay, startOfDay } from "date-fns";
import { apiClient } from "@/lib/api-client";
import { Company } from "@/features/companies/types";
import { ContentListItemData } from "@/features/contents/types";
import type { AttentionItem, DashboardData, ScheduleItem } from "../types";

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

const GLOBAL_CALENDAR_ROLES = new Set(["owner", "admin"]);

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
  if (GLOBAL_CALENDAR_ROLES.has(role)) {
    const response = await apiClient<CalendarResponse>("/contents/calendar", {
      params: {
        startDate,
        endDate,
        status: "scheduled",
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
          status: "scheduled",
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

export function useDashboardData(role: string, enabled = true) {
  return useQuery({
    queryKey: ["dashboard", role],
    enabled,
    placeholderData: (previousData) => previousData,
    queryFn: async (): Promise<DashboardData> => {
      const windowStart = startOfDay(new Date());
      const startDate = windowStart.toISOString();
      const endDate = endOfDay(addDays(windowStart, 6)).toISOString();

      const [companiesResult, reviewResult, reviseResult] = await Promise.allSettled([
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
      ]);

      const companies = isFulfilled(companiesResult) ? companiesResult.value : null;
      const reviewContents = isFulfilled(reviewResult) ? reviewResult.value : null;
      const reviseContents = isFulfilled(reviseResult) ? reviseResult.value : null;
      const attentionAvailable = Boolean(reviewContents && reviseContents);

      const [calendarResult] = await Promise.allSettled([
        fetchScheduledCalendarContents(role, companies, startDate, endDate),
      ]);
      const scheduleAvailable = isFulfilled(calendarResult);
      const calendarContents = scheduleAvailable ? calendarResult.value : [];

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
        sections: {
          attention: attentionAvailable,
          schedule: scheduleAvailable,
        },
        hasAnyCompany: companies ? companies.length > 0 : null,
      };
    },
  });
}
