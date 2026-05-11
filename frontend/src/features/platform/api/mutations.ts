import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { platformKeys } from "./queries";

// ─── Types ───────────────────────────────────────────────────

export type CreateAgencyPayload = {
  name: string;
  slug: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminPassword: string;
};

export type UpdateAgencyPayload = {
  name?: string;
  slug?: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  isActive?: boolean;
};

// ─── Mutations ───────────────────────────────────────────────

export function useCreateAgencyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAgencyPayload) => {
      const response = await apiClient<{ success: boolean; data: unknown }>("/agencies", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.agencies });
    },
  });
}

export function useUpdateAgencyMutation(agencyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateAgencyPayload) => {
      const response = await apiClient<{ success: boolean; data: unknown }>(`/agencies/${agencyId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.agencies });
      queryClient.invalidateQueries({ queryKey: platformKeys.agencyDetail(agencyId) });
    },
  });
}

export function useDeleteAgencyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agencyId: string) => {
      const response = await apiClient<{ success: boolean; data: unknown }>(`/agencies/${agencyId}`, {
        method: "DELETE",
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.agencies });
    },
  });
}

export function useRestoreAgencyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agencyId: string) => {
      const response = await apiClient<{ success: boolean; data: unknown }>(`/agencies/${agencyId}/restore`, {
        method: "PUT",
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.agencies });
    },
  });
}

// ─── Agency User Mutations ───────────────────────────────────

export type AddAgencyUserPayload = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: "agency_admin" | "agency_member";
};

export function useAddAgencyUserMutation(agencyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddAgencyUserPayload) => {
      const response = await apiClient<{ success: boolean; data: unknown }>(
        `/agencies/${agencyId}/users`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformKeys.agencyDetail(agencyId),
      });
      queryClient.invalidateQueries({ queryKey: platformKeys.agencies });
    },
  });
}
