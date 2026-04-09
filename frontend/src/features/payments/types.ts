export type PaymentStatus = "paid" | "pending" | "overdue";

export type PaymentItem = {
  id: string;
  companyName: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  dueDate: string;
  paidAt: string | null;
  periodStart: string | null;
  periodEnd: string | null;
};

export type PaymentsListMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type PaymentsListQueryParams = {
  page?: number;
  perPage?: number;
  status?: PaymentStatus;
  companyId?: string;
};

export type PaymentsListData = {
  items: PaymentItem[];
  meta: PaymentsListMeta;
};

export type PaymentCompanyOption = {
  id: string;
  name: string;
};

export type CreatePaymentInput = {
  amount: number;
  currency: string;
  dueDate: string;
  periodStart?: string;
  periodEnd?: string;
  notes?: string;
};

export type ChangePaymentStatusInput = {
  status: PaymentStatus;
  paidAt?: string;
};
