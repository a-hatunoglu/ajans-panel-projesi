import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { User } from "@/providers/auth-provider";
import { settingsKeys } from "./keys";

type UpdateProfilePayload = {
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
};

type UpdateProfileResponse = {
  success: boolean;
  data: {
    user: User; // Assuming the backend returns the updated user inside 'user'
  };
};

export function useUpdateProfileMutation() {
  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const response = await apiClient<UpdateProfileResponse>("/users/me", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return response.data;
    },
  });
}

// ─── Change Password ──────────────────────────────────────────

type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

type ChangePasswordResponse = {
  success: boolean;
  data: {
    message: string;
  };
};

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const response = await apiClient<ChangePasswordResponse>(
        "/users/me/password",
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
      return response.data;
    },
  });
}

// ─── System User Mutations ────────────────────────────────────

type UpdateSystemUserPayload = {
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
};

type UpdateSystemUserResponse = {
  success: boolean;
  data: { user: User };
};

export function useUpdateSystemUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      ...payload
    }: UpdateSystemUserPayload & { userId: string }) => {
      const response = await apiClient<UpdateSystemUserResponse>(`/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.systemUsers });
    },
  });
}

type InviteSystemUserPayload = {
  firstName: string;
  lastName: string;
  email?: string;
  role: string;
  tempPassword?: string;
};

type InviteSystemUserResponse = {
  success: boolean;
  data: { user: User };
};

export function useInviteSystemUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: InviteSystemUserPayload) => {
      const response = await apiClient<InviteSystemUserResponse>("/users/invite", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.systemUsers });
    },
  });
}
