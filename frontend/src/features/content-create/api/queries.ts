import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  ContentCreateCompanyOption,
  ContentCreateMemberOption,
  ContentCreateSocialAccountOption,
} from "../types";

type CompaniesResponse = {
  success: boolean;
  data: Array<{
    id: string;
    name: string;
  }>;
};

type SocialAccountsResponse = {
  success: boolean;
  data: {
    accounts: Array<{
      id: string;
      platform: ContentCreateSocialAccountOption["platform"];
      accountName: string;
      isActive: boolean;
    }>;
  };
};

type CompanyUsersResponse = {
  success: boolean;
  data: {
    members: Array<{
      id: string;
      user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: ContentCreateMemberOption["role"];
        isActive: boolean;
      };
    }>;
  };
};

function getFullName(firstName: string, lastName: string, email: string) {
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || email;
}

export function useCreateCompanyOptions(enabled = true) {
  return useQuery({
    queryKey: ["content-create", "companies"],
    enabled,
    queryFn: async (): Promise<ContentCreateCompanyOption[]> => {
      const response = await apiClient<CompaniesResponse>("/companies");
      return response.data.map((company) => ({
        id: company.id,
        name: company.name,
      }));
    },
  });
}

export function useCreateSocialAccountOptions(companyId?: string, enabled = true) {
  return useQuery({
    queryKey: ["content-create", "social-accounts", companyId],
    enabled: enabled && Boolean(companyId),
    queryFn: async (): Promise<ContentCreateSocialAccountOption[]> => {
      const response = await apiClient<SocialAccountsResponse>(`/companies/${companyId}/social-accounts`);
      return response.data.accounts.map((account) => ({
        id: account.id,
        platform: account.platform,
        accountName: account.accountName,
        isActive: account.isActive,
      }));
    },
  });
}

export function useCreateCompanyMemberOptions(companyId?: string, enabled = true) {
  return useQuery({
    queryKey: ["content-create", "company-members", companyId],
    enabled: enabled && Boolean(companyId),
    queryFn: async (): Promise<ContentCreateMemberOption[]> => {
      const response = await apiClient<CompanyUsersResponse>(`/companies/${companyId}/users`);
      return response.data.members.map((member) => ({
        id: member.user.id,
        name: getFullName(member.user.firstName, member.user.lastName, member.user.email),
        email: member.user.email,
        role: member.user.role,
        isActive: member.user.isActive,
      }));
    },
  });
}
