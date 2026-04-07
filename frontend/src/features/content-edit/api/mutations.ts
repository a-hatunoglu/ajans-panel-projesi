import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ContentEditResponse } from "../types";

type UpdateContentPayload = {
  contentId: string;
  companyId: string;
  values: {
    title: string;
    body: string | null;
  };
};

export function useUpdateContentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contentId, values }: UpdateContentPayload) => {
      return apiClient<ContentEditResponse>(`/contents/${contentId}`, {
        method: "PUT",
        body: JSON.stringify(values),
      });
    },
    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["content-detail", variables.contentId],
        }),
        queryClient.invalidateQueries({ queryKey: ["contents"] }),
        queryClient.invalidateQueries({
          queryKey: ["company-workflow-snapshot", variables.companyId],
        }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["activity-logs"] }),
      ]);
    },
  });
}
