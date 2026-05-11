import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

async function invalidateNotifications(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] })
  ]);
}

export function useMarkNotificationAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      return apiClient<{ success: boolean }>(`/notifications/${notificationId}/read`, {
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
      return apiClient<{ success: boolean }>("/notifications/read-all", {
        method: "PUT",
      });
    },
    onSuccess: async () => {
      await invalidateNotifications(queryClient);
    },
  });
}
