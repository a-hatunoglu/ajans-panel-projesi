import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  PaymentCompanyOption,
  PaymentItem,
  PaymentsListData,
  PaymentsListMeta,
  PaymentsListQueryParams,
} from "../types";

const PAYMENT_COMPANIES_PER_PAGE = 100;

type BackendPayment = {
  id: string;
  amount: string | number;
  currency: string;
  periodStart: string | null;
  periodEnd: string | null;
  dueDate: string;
  status: PaymentItem["status"];
  paidAt: string | null;
  company: {
    id: string;
    name: string;
  } | null;
};

type PaymentsResponse = {
  success: boolean;
  data: BackendPayment[];
  meta: PaymentsListMeta;
};

type CompaniesResponse = {
  success: boolean;
  data: Array<{
    id: string;
    name: string;
  }>;
  meta: PaymentsListMeta;
};

function buildPaymentParams(params: PaymentsListQueryParams) {
  const queryParams: Record<string, string> = {};

  if (params.page) {
    queryParams.page = String(params.page);
  }

  if (params.perPage) {
    queryParams.perPage = String(params.perPage);
  }

  if (params.status) {
    queryParams.status = params.status;
  }

  if (params.companyId) {
    queryParams.companyId = params.companyId;
  }

  return queryParams;
}

function mapPaymentItem(payment: BackendPayment): PaymentItem {
  return {
    id: payment.id,
    companyName: payment.company?.name ?? null,
    amount: Number(payment.amount),
    currency: payment.currency,
    status: payment.status,
    dueDate: payment.dueDate,
    paidAt: payment.paidAt,
    periodStart: payment.periodStart,
    periodEnd: payment.periodEnd,
  };
}

async function fetchPaymentCompaniesPage(page: number) {
  return apiClient<CompaniesResponse>("/companies", {
    params: {
      page: String(page),
      perPage: String(PAYMENT_COMPANIES_PER_PAGE),
    },
  });
}

async function fetchAllPaymentCompanies() {
  const firstPage = await fetchPaymentCompaniesPage(1);

  if (firstPage.meta.totalPages <= 1) {
    return firstPage.data;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.meta.totalPages - 1 }, (_, index) =>
      fetchPaymentCompaniesPage(index + 2),
    ),
  );

  return [
    ...firstPage.data,
    ...remainingPages.flatMap((response) => response.data),
  ];
}

export function usePayments(
  params: PaymentsListQueryParams = {},
  enabled = true,
) {
  const {
    page = 1,
    perPage = 20,
    status,
    companyId,
  } = params;

  return useQuery({
    queryKey: ["payments", status ?? "all", companyId ?? "all", page, perPage],
    enabled,
    placeholderData: (previousData) => previousData,
    queryFn: async (): Promise<PaymentsListData> => {
      const response = await apiClient<PaymentsResponse>("/payments", {
        params: buildPaymentParams({
          page,
          perPage,
          status,
          companyId,
        }),
      });

      return {
        items: response.data.map(mapPaymentItem),
        meta: response.meta,
      };
    },
  });
}

export function usePaymentCompanies(enabled = true) {
  return useQuery({
    queryKey: ["payment-company-options"],
    enabled,
    queryFn: async (): Promise<PaymentCompanyOption[]> => {
      const companies = await fetchAllPaymentCompanies();

      return companies
        .map((company) => ({
          id: company.id,
          name: company.name,
        }))
        .sort((left, right) => left.name.localeCompare(right.name));
    },
  });
}
