export type ActivityItem = {
  id: string;
  actorName: string;
  action: string;
  resourceType: string | null;
  companyName: string | null;
  createdAt: string;
};

export const ACTIVITY_ACTION_FILTER_OPTIONS = [
  "auth.login",
  "auth.logout",
  "company.create",
  "company.update",
  "company.delete",
  "company.restore",
  "company.hard_delete",
  "company.user_add",
  "company.user_remove",
  "social_account.create",
  "social_account.update",
  "social_account.delete",
  "content.create",
  "content.update",
  "content.delete",
  "content.status_change",
  "content.assign",
  "content.approve",
  "content.reject",
  "payment.create",
  "payment.update",
  "payment.status_change",
  "payment.delete",
] as const;

export const ACTIVITY_RESOURCE_TYPE_FILTER_OPTIONS = [
  "user",
  "company",
  "company_user",
  "social_account",
  "content",
  "payment",
] as const;

export type ActivityActionFilter =
  (typeof ACTIVITY_ACTION_FILTER_OPTIONS)[number];

export type ActivityResourceTypeFilter =
  (typeof ACTIVITY_RESOURCE_TYPE_FILTER_OPTIONS)[number];

export type ActivityListMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type ActivityListQueryParams = {
  page?: number;
  perPage?: number;
  action?: ActivityActionFilter;
  resourceType?: ActivityResourceTypeFilter;
};

export type ActivityListData = {
  items: ActivityItem[];
  meta: ActivityListMeta;
};
