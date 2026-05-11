import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  ContentListItemData,
  ContentsListMeta,
  ContentsListQueryParams,
} from "../types";

type ContentsListResponse = {
  success: boolean;
  data: ContentListItemData[];
  meta: ContentsListMeta;
};

function buildContentsParams(params: ContentsListQueryParams) {
  const queryParams: Record<string, string> = {};

  if (params.page) {
    queryParams.page = String(params.page);
  }

  if (params.perPage) {
    queryParams.perPage = String(params.perPage);
  }

  if (params.status) {
    queryParams.status = params.status;
  }

  if (params.sort) {
    queryParams.sort = params.sort;
  }

  if (params.search) {
    queryParams.search = params.search;
  }

  return queryParams;
}

export function useContentsList(params: ContentsListQueryParams = {}) {
  const {
    page = 1,
    perPage = 20,
    search,
    status,
    sort = "created_desc",
  } = params;

  return useQuery({
    queryKey: ["contents", search ?? "", status ?? "all", sort, page, perPage],
    staleTime: 30_000, // 30s — contents change frequently in active workflow
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      return apiClient<ContentsListResponse>("/contents", {
        params: buildContentsParams({
          page,
          perPage,
          search,
          status,
          sort,
        }),
      });
    },
  });
}
