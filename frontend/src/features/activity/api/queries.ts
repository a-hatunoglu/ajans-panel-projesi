import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  ActivityItem,
  ActivityListData,
  ActivityListMeta,
  ActivityListQueryParams,
} from "../types";

type BackendActivityUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
} | null;

type BackendActivityCompany = {
  id: string;
  name: string;
} | null;

type BackendActivityLog = {
  id: string;
  action: string;
  resourceType: string | null;
  createdAt: string;
  user: BackendActivityUser;
  company: BackendActivityCompany;
};

type ActivityLogsResponse = {
  success: boolean;
  data: BackendActivityLog[];
  meta: ActivityListMeta;
};

function formatActorName(user: BackendActivityUser) {
  if (!user) {
    return "System";
  }

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  return fullName || user.email || "System";
}

function buildActivityParams(params: ActivityListQueryParams) {
  const queryParams: Record<string, string> = {};

  if (params.page) {
    queryParams.page = String(params.page);
  }

  if (params.perPage) {
    queryParams.perPage = String(params.perPage);
  }

  if (params.action) {
    queryParams.action = params.action;
  }

  if (params.resourceType) {
    queryParams.resourceType = params.resourceType;
  }

  return queryParams;
}

export function useActivityLogs(
  params: ActivityListQueryParams = {},
  enabled = true,
) {
  const {
    page = 1,
    perPage = 20,
    action,
    resourceType,
  } = params;

  return useQuery({
    queryKey: ["activity-logs", action ?? "all", resourceType ?? "all", page, perPage],
    enabled,
    placeholderData: (previousData) => previousData,
    queryFn: async (): Promise<ActivityListData> => {
      const response = await apiClient<ActivityLogsResponse>("/activity-logs", {
        params: buildActivityParams({
          page,
          perPage,
          action,
          resourceType,
        }),
      });

      return {
        items: response.data.map((log): ActivityItem => ({
          id: log.id,
          actorName: formatActorName(log.user),
          action: log.action,
          resourceType: log.resourceType,
          companyName: log.company?.name ?? null,
          createdAt: log.createdAt,
        })),
        meta: response.meta,
      };
    },
  });
}
