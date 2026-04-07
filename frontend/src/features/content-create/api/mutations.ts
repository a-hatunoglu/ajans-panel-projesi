import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ContentCreateFormValues, ContentCreateResponse } from "../types";

type CreateContentPayload = Omit<ContentCreateFormValues, "body"> & {
  body: string | null;
};

export function useCreateContentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateContentPayload) => {
      const { companyId, ...body } = payload;

      return apiClient<ContentCreateResponse>(`/companies/${companyId}/contents`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["contents"] }),
        queryClient.invalidateQueries({
          queryKey: ["company-workflow-snapshot", variables.companyId],
        }),
      ]);
    },
  });
}
