import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

// ─── Types ───────────────────────────────────────────────────

export type AgencyListItem = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  companyCount: number;
  userCount: number;
};

export type AgencyUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: string;
  agencyRole: string;
  isActive: boolean;
  lastLoginAt: string | null;
};

export type AgencyDetail = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  stats: {
    companyCount: number;
    userCount: number;
    contentCount: number;
  };
  users: AgencyUser[];
};

type AgenciesListResponse = {
  success: boolean;
  data: AgencyListItem[];
  meta: { page: number; perPage: number; total: number; totalPages: number };
};

type AgencyDetailResponse = {
  success: boolean;
  data: { agency: AgencyDetail };
};

// ─── Queries ─────────────────────────────────────────────────

export const platformKeys = {
  agencies: ["platform-agencies"] as const,
  agencyDetail: (id: string) => ["platform-agency", id] as const,
};

export function useAgencies(params?: { search?: string; status?: string; page?: number }) {
  return useQuery({
    queryKey: [...platformKeys.agencies, params],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (params?.search) queryParams.search = params.search;
      if (params?.status) queryParams.status = params.status;
      if (params?.page) queryParams.page = String(params.page);
      
      const response = await apiClient<AgenciesListResponse>("/agencies", {
        params: queryParams,
      });
      return { agencies: response.data, meta: response.meta };
    },
  });
}

export function useAgencyDetail(id: string) {
  return useQuery({
    queryKey: platformKeys.agencyDetail(id),
    enabled: !!id,
    queryFn: async () => {
      const response = await apiClient<AgencyDetailResponse>(`/agencies/${id}`);
      return response.data.agency;
    },
  });
}
