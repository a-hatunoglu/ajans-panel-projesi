import { useQuery } from "@tanstack/react-query";
import {
  addDays,
  endOfDay,
  isToday,
  startOfDay,
} from "date-fns";
import { apiClient } from "@/lib/api-client";
import { Company } from "@/features/companies/types";
import type { ContentStatus } from "@/features/contents/types";
import { CalendarDay } from "../types";

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
  status: ContentStatus;
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

type CalendarResponse = {
  success: boolean;
  data: {
    contents: BackendCalendarContent[];
  };
};

type CompaniesResponse = {
  success: boolean;
  data: Company[];
};

const GLOBAL_CALENDAR_ROLES = new Set(["owner", "admin"]);

function createEmptyWeek(weekStart: Date): CalendarDay[] {
  const normalizedWeekStart = startOfDay(weekStart);

  return Array.from({ length: 7 }, (_, index) => {
    const dayDate = addDays(normalizedWeekStart, index);

    return {
      date: dayDate.toISOString(),
      isToday: isToday(dayDate),
      items: [],
    };
  });
}

function mapCalendarWeek(contents: BackendCalendarContent[], weekStart: Date) {
  const days = createEmptyWeek(weekStart);
  const dayIndexByDate = new Map(days.map((day, index) => [day.date, index]));

  const items = contents
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
        bucketKey: startOfDay(displayDate).toISOString(),
        sortAt: displayDate.getTime(),
        item: {
          id: content.id,
          title: content.title,
          status: content.status,
          platform: content.socialAccount?.platform ?? null,
          socialAccountName: content.socialAccount?.accountName ?? null,
          companyName: content.company.name,
          displayAt,
        },
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((left, right) => left.sortAt - right.sortAt);

  for (const entry of items) {
    const dayIndex = dayIndexByDate.get(entry.bucketKey);

    if (dayIndex === undefined) {
      continue;
    }

    days[dayIndex].items.push(entry.item);
  }

  return days;
}

export function useCalendarWeek(weekStart: Date, role: string, enabled = true) {
  return useQuery({
    queryKey: ["calendar", weekStart.toISOString(), role],
    enabled,
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      const startDate = startOfDay(weekStart).toISOString();
      const endDate = endOfDay(addDays(weekStart, 6)).toISOString();

      if (GLOBAL_CALENDAR_ROLES.has(role)) {
        const response = await apiClient<CalendarResponse>("/contents/calendar", {
          params: {
            startDate,
            endDate,
          },
        });

        return mapCalendarWeek(response.data.contents, weekStart);
      }

      const companiesResponse = await apiClient<CompaniesResponse>("/companies");
      const companyIds = companiesResponse.data.map((company) => company.id);

      if (companyIds.length === 0) {
        return createEmptyWeek(weekStart);
      }

      const responses = await Promise.all(
        companyIds.map((companyId) =>
          apiClient<CalendarResponse>(`/companies/${companyId}/contents/calendar`, {
            params: {
              startDate,
              endDate,
            },
          }),
        ),
      );

      const dedupedContents = Array.from(
        new Map(
          responses
            .flatMap((response) => response.data.contents)
            .map((content) => [content.id, content]),
        ).values(),
      );

      return mapCalendarWeek(dedupedContents, weekStart);
    },
  });
}
