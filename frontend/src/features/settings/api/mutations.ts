import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { User } from "@/providers/auth-provider";

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

