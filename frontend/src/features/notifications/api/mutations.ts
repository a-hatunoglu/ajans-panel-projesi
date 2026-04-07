import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

async function invalidateNotifications(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await queryClient.invalidateQueries({ queryKey: ["notifications"] });
}

export function useMarkNotificationAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      return apiClient(`/notifications/${notificationId}/read`, {
        method: "PUT",
      });
    },
    onSuccess: async () => {
      await invalidateNotifications(queryClient);
    },
  });
}

export function useMarkAllNotificationsAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiClient("/notifications/read-all", {
        method: "PUT",
      });
    },
    onSuccess: async () => {
      await invalidateNotifications(queryClient);
    },
  });
}
