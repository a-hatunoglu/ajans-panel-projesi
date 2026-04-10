import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Platform } from "@/features/contents/types";

// ─── Create Social Account ──────────────────────────────────

export type CreateSocialAccountPayload = {
  platform: Platform;
  accountName: string;
  profileUrl?: string | null;
};

type CreateSocialAccountResponse = {
  success: boolean;
  data: {
    id: string;
    platform: Platform;
    accountName: string;
  };
};

export function useCreateSocialAccountMutation(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSocialAccountPayload) => {
      return apiClient<CreateSocialAccountResponse>(
        `/companies/${companyId}/social-accounts`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["company-social-accounts", companyId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["company-detail", companyId],
        }),
      ]);
    },
  });
}

// ─── Add Company User ────────────────────────────────────────

export type AddCompanyUserPayload = {
  userId: string;
};

type AddCompanyUserResponse = {
  success: boolean;
  data: {
    id: string;
  };
};

export function useAddCompanyUserMutation(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddCompanyUserPayload) => {
      return apiClient<AddCompanyUserResponse>(
        `/companies/${companyId}/users`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["company-users", companyId],
      });
    },
  });
}

// ─── System Users (for picker) ───────────────────────────────

export type SystemUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
};

type SystemUsersResponse = {
  success: boolean;
  data: SystemUser[] | { users: SystemUser[] };
  meta?: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
};

export function useSystemUsers(enabled: boolean) {
  return useQuery({
    queryKey: ["system-users"],
    enabled,
    queryFn: async () => {
      const response = await apiClient<SystemUsersResponse>("/users", {
        params: { perPage: "200" },
      });
      
      const payload = response.data;
      // Handle potential backend wrapper variations safely
      if (Array.isArray(payload)) {
        return payload;
      }
      if (payload && typeof payload === "object" && "users" in payload) {
        return payload.users;
      }
      
      return [];
    },
  });
}

// ─── Invite Platform User ────────────────────────────────────────

type InviteUserPayload = {
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "editor" | "designer" | "client";
};

type InviteUserResponse = {
  success: boolean;
  data: {
    user: SystemUser;
    inviteToken: string;
  };
};

export function useInvitePlatformUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: InviteUserPayload) => {
      const response = await apiClient<InviteUserResponse>("/users/invite", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return response.data;
    },
    onSuccess: () => {
      // Refresh the system users list so the newly invited user becomes available
      queryClient.invalidateQueries({ queryKey: ["system-users"] });
    },
  });
}

// ─── Update Company ──────────────────────────────────────────

export type UpdateCompanyPayload = {
  name?: string;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
};

export function useUpdateCompanyMutation(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateCompanyPayload) => {
      return apiClient(`/companies/${companyId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["company-detail", companyId],
        }),
        queryClient.invalidateQueries({ queryKey: ["companies"] }),
      ]);
    },
  });
}

// ─── Update User ─────────────────────────────────────────────

export type UpdateUserPayload = {
  firstName?: string;
  lastName?: string;
  role?: "admin" | "editor" | "designer" | "client";
};

export function useUpdateUserMutation(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      ...payload
    }: UpdateUserPayload & { userId: string }) => {
      return apiClient(`/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["company-users", companyId],
        }),
        queryClient.invalidateQueries({ queryKey: ["system-users"] }),
      ]);
    },
  });
}
