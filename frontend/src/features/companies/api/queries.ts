import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Company as CompanyType } from "../types";

type CompaniesResponse = {
  success: boolean;
  data: CompanyType[];
  meta?: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
};

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await apiClient<CompaniesResponse>("/companies");
      return response.data;
    },
  });
}

export function useCompaniesTrash(enabled = true) {
  return useQuery({
    queryKey: ["companies-trash"],
    enabled,
    queryFn: async () => {
      const response = await apiClient<CompaniesResponse>("/companies/trash");
      return response.data;
    },
  });
}
