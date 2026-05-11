import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

function assertContentId(contentId?: string) {
  if (!contentId) {
    throw new Error("Content id is required.");
  }

  return contentId;
}

async function invalidateWorkflowQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  contentId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["content-detail", contentId] }),
    queryClient.invalidateQueries({ queryKey: ["contents"] }),
    queryClient.invalidateQueries({ queryKey: ["company-workflow-snapshot"] }),
  ]);
}

export function useSubmitForReviewMutation(contentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const id = assertContentId(contentId);

      return apiClient(`/contents/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "in_review" }),
      });
    },
    onSuccess: async () => {
      const id = assertContentId(contentId);
      await invalidateWorkflowQueries(queryClient, id);
    },
  });
}

export function useApproveContentMutation(contentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (comment?: string) => {
      const id = assertContentId(contentId);

      return apiClient(`/contents/${id}/approve`, {
        method: "POST",
        body: JSON.stringify(comment ? { comment } : {}),
      });
    },
    onSuccess: async () => {
      const id = assertContentId(contentId);
      await invalidateWorkflowQueries(queryClient, id);
    },
  });
}

export function useRejectContentMutation(contentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (comment: string) => {
      const id = assertContentId(contentId);

      return apiClient(`/contents/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ comment }),
      });
    },
    onSuccess: async () => {
      const id = assertContentId(contentId);
      await invalidateWorkflowQueries(queryClient, id);
    },
  });
}

export function useAddContentCommentMutation(contentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: string) => {
      const id = assertContentId(contentId);

      return apiClient(`/contents/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
    },
    onSuccess: async () => {
      const id = assertContentId(contentId);
      await queryClient.invalidateQueries({ queryKey: ["content-detail", id] });
    },
  });
}

export function useUnscheduleMutation(contentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const id = assertContentId(contentId);

      return apiClient(`/contents/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "draft" }),
      });
    },
    onSuccess: async () => {
      const id = assertContentId(contentId);
      await invalidateWorkflowQueries(queryClient, id);
    },
  });
}
