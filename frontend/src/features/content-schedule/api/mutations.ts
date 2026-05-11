import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

type ScheduleContentPayload = {
  contentId: string;
  companyId: string;
  scheduledAt: string;
};

export function useScheduleContentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contentId,
      scheduledAt,
    }: ScheduleContentPayload) => {
      return apiClient(`/contents/${contentId}/status`, {
        method: "PUT",
        body: JSON.stringify({
          status: "scheduled",
          scheduledAt,
        }),
      });
    },
    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["content-detail", variables.contentId],
        }),
        queryClient.invalidateQueries({ queryKey: ["contents"] }),
        queryClient.invalidateQueries({ queryKey: ["calendar"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({
          queryKey: ["company-workflow-snapshot", variables.companyId],
        }),
      ]);
    },
  });
}
