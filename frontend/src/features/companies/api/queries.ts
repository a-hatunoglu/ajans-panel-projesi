import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Company as CompanyType } from "../types";

type CompaniesResponse = {
  success: boolean;
  data: CompanyType[];
  meta?: {
    page: number;
    limit: number;
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
