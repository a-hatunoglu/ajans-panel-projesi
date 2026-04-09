import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CreatePaymentInput, ChangePaymentStatusInput } from "../types";

type CreatePaymentResponse = {
  success: boolean;
  data: {
    payment: {
      id: string;
      companyId: string;
      amount: string | number;
      currency: string;
      status: string;
      dueDate: string;
    };
  };
};

type ChangeStatusResponse = {
  success: boolean;
  data: {
    payment: {
      id: string;
      status: string;
      paidAt: string | null;
    };
  };
};

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      ...payload
    }: CreatePaymentInput & { companyId: string }) => {
      return apiClient<CreatePaymentResponse>(
        `/companies/${companyId}/payments`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["payments"] });
      await queryClient.invalidateQueries({ queryKey: ["company-payments"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useChangePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      paymentId,
      ...payload
    }: ChangePaymentStatusInput & { paymentId: string }) => {
      return apiClient<ChangeStatusResponse>(
        `/payments/${paymentId}/status`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["payments"] });
      await queryClient.invalidateQueries({ queryKey: ["company-payments"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
