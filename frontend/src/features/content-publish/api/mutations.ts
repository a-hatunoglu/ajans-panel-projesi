import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

type PublishContentPayload = {
  contentId: string;
  companyId: string;
};

export function usePublishContentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contentId }: PublishContentPayload) => {
      return apiClient(`/contents/${contentId}/status`, {
        method: "PUT",
        body: JSON.stringify({
          status: "published",
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
