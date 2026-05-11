import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { settingsKeys } from "./keys";

export type SystemUserItem = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

type GetSystemUsersResponse = {
  success: boolean;
  data: SystemUserItem[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
};

export function useSystemUsers(page = 1, perPage = 20) {
  return useQuery({
    queryKey: [...settingsKeys.systemUsers, page, perPage],
    queryFn: async () => {
      const response = await apiClient<GetSystemUsersResponse>("/users", {
        params: {
          page: String(page),
          perPage: String(perPage),
        },
      });
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
