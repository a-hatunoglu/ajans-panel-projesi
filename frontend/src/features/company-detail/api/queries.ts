import { useQuery } from "@tanstack/react-query";
import { addDays, endOfDay, isToday, startOfDay } from "date-fns";
import { apiClient } from "@/lib/api-client";
import type {
  CompanyActivityListData,
  CompanyCalendarDay,
  CompanyContentsItem,
  CompanyContentsListData,
  CompanyDetailData,
  CompanyMemberRole,
  CompanyPaymentsListData,
  CompanySocialAccountsData,
  CompanyWorkflowCountStatus,
  CompanyWorkflowCounts,
  CompanyWorkflowSnapshot,
  CompanyUsersData,
} from "../types";
import type {
  ContentAssignment,
  ContentDateKind,
  ContentStatus,
  ContentsListMeta,
  Platform,
} from "@/features/contents/types";
import type { PaymentStatus } from "@/features/payments/types";

type CompanyRecord = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
};

type CompanyResponse = {
  success: boolean;
  data: {
    company: CompanyRecord;
  };
};

type SocialAccountResponse = {
  success: boolean;
  data: {
    accounts: Array<{ id: string }>;
  };
};

type CompanySocialAccountRecord = {
  id: string;
  platform: Platform;
  accountName: string;
  isActive: boolean;
};

type CompanySocialAccountsResponse = {
  success: boolean;
  data: {
    accounts: CompanySocialAccountRecord[];
  };
};

type CompanyContentRecord = {
  id: string;
  title: string;
  status: ContentStatus;
  createdAt: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  updatedAt: string;
  socialAccount: {
    platform: Platform | null;
    accountName: string;
  } | null;
  assignedDesigner: ContentAssignment | null;
  assignedEditor: ContentAssignment | null;
};

type CompanyContentsResponse = {
  success: boolean;
  data: CompanyContentRecord[];
  meta: ContentsListMeta;
};

type CompanyUserRecord = {
  id: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    role: CompanyMemberRole;
    isActive: boolean;
  };
};

type CompanyUsersResponse = {
  success: boolean;
  data: {
    members: CompanyUserRecord[];
  };
};

type CompanyCalendarRecord = {
  id: string;
  title: string;
  status: ContentStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  socialAccount: {
    platform: Platform | null;
    accountName: string;
  } | null;
};

type CompanyCalendarResponse = {
  success: boolean;
  data: {
    contents: CompanyCalendarRecord[];
  };
};

type CompanyPaymentRecord = {
  id: string;
  amount: string | number;
  currency: string;
  dueDate: string;
  status: PaymentStatus;
  paidAt: string | null;
  periodStart: string | null;
  periodEnd: string | null;
};

type CompanyPaymentsResponse = {
  success: boolean;
  data: CompanyPaymentRecord[];
  meta: ContentsListMeta;
};

type CompanyActivityUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
} | null;

type CompanyActivityRecord = {
  id: string;
  action: string;
  resourceType: string | null;
  createdAt: string;
  user: CompanyActivityUser;
};

type CompanyActivityResponse = {
  success: boolean;
  data: CompanyActivityRecord[];
  meta: ContentsListMeta;
};

const COMPANY_CONTENTS_PER_PAGE = 20;
const COMPANY_PAYMENTS_PER_PAGE = 20;
const COMPANY_ACTIVITY_PER_PAGE = 20;
const COMPANY_WORKFLOW_FETCH_PER_PAGE = 100;

function mapCompanyDetail(
  company: CompanyRecord,
  socialAccountsConnected: number
): CompanyDetailData {
  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    logoUrl: company.logoUrl,
    website: company.website,
    phone: company.phone,
    email: company.email,
    address: company.address,
    notes: company.notes,
    isActive: company.isActive,
    socialAccountsConnected,
  };
}

function mapContentListDate(content: {
  createdAt: string;
  scheduledAt: string | null;
  publishedAt: string | null;
}) {
  if (content.publishedAt) {
    return {
      dateAt: content.publishedAt,
      dateKind: "published" as ContentDateKind,
    };
  }

  if (content.scheduledAt) {
    return {
      dateAt: content.scheduledAt,
      dateKind: "scheduled" as ContentDateKind,
    };
  }

  return {
    dateAt: content.createdAt,
    dateKind: "created" as ContentDateKind,
  };
}

function mapCompanyContentItem(content: CompanyContentRecord): CompanyContentsItem {
  const { dateAt, dateKind } = mapContentListDate(content);

  return {
    id: content.id,
    title: content.title,
    status: content.status,
    platform: content.socialAccount?.platform ?? null,
    socialAccountName: content.socialAccount?.accountName ?? null,
    assignedDesigner: content.assignedDesigner,
    assignedEditor: content.assignedEditor,
    dateAt,
    dateKind,
  };
}

function getFullName(firstName: string, lastName: string, email: string) {
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || email;
}

function formatActorName(user: CompanyActivityUser) {
  if (!user) {
    return "System";
  }

  return getFullName(user.firstName, user.lastName, user.email) || "System";
}

function mapCompanyUserItem(member: CompanyUserRecord) {
  return {
    membershipId: member.id,
    userId: member.user.id,
    name: getFullName(
      member.user.firstName,
      member.user.lastName,
      member.user.email,
    ),
    email: member.user.email,
    avatarUrl: member.user.avatarUrl,
    role: member.user.role,
    isActive: member.user.isActive,
  };
}

function mapCompanySocialAccountItem(account: CompanySocialAccountRecord) {
  return {
    id: account.id,
    platform: account.platform,
    accountName: account.accountName,
    isActive: account.isActive,
  };
}

function mapCompanyPaymentItem(payment: CompanyPaymentRecord) {
  return {
    id: payment.id,
    amount: Number(payment.amount),
    currency: payment.currency,
    status: payment.status,
    dueDate: payment.dueDate,
    paidAt: payment.paidAt,
    periodStart: payment.periodStart,
    periodEnd: payment.periodEnd,
  };
}

function createEmptyCompanyCalendarWeek(weekStart: Date): CompanyCalendarDay[] {
  const normalizedWeekStart = startOfDay(weekStart);

  return Array.from({ length: 7 }, (_, index) => {
    const dayDate = addDays(normalizedWeekStart, index);

    return {
      date: dayDate.toISOString(),
      isToday: isToday(dayDate),
      items: [],
    };
  });
}

function mapCompanyCalendarWeek(
  contents: CompanyCalendarRecord[],
  weekStart: Date,
): CompanyCalendarDay[] {
  const days = createEmptyCompanyCalendarWeek(weekStart);
  const dayIndexByDate = new Map(days.map((day, index) => [day.date, index]));

  const items = contents
    .map((content) => {
      const displayAt = content.scheduledAt ?? content.publishedAt;

      if (!displayAt) {
        return null;
      }

      const displayDate = new Date(displayAt);

      if (Number.isNaN(displayDate.getTime())) {
        return null;
      }

      return {
        bucketKey: startOfDay(displayDate).toISOString(),
        sortAt: displayDate.getTime(),
        item: {
          id: content.id,
          title: content.title,
          status: content.status,
          platform: content.socialAccount?.platform ?? null,
          socialAccountName: content.socialAccount?.accountName ?? null,
          displayAt,
        },
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((left, right) => left.sortAt - right.sortAt);

  for (const entry of items) {
    const dayIndex = dayIndexByDate.get(entry.bucketKey);

    if (dayIndex === undefined) {
      continue;
    }

    days[dayIndex].items.push(entry.item);
  }

  return days;
}

async function fetchCompanyContentsPage(companyId: string, page: number, perPage: number) {
  return apiClient<CompanyContentsResponse>(`/companies/${companyId}/contents`, {
    params: {
      page: String(page),
      perPage: String(perPage),
    },
  });
}

async function fetchAllCompanyContents(companyId: string) {
  const firstPage = await fetchCompanyContentsPage(
    companyId,
    1,
    COMPANY_WORKFLOW_FETCH_PER_PAGE,
  );

  if (firstPage.meta.totalPages <= 1) {
    return firstPage.data;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.meta.totalPages - 1 }, (_, index) =>
      fetchCompanyContentsPage(
        companyId,
        index + 2,
        COMPANY_WORKFLOW_FETCH_PER_PAGE,
      ),
    ),
  );

  return [
    ...firstPage.data,
    ...remainingPages.flatMap((response) => response.data),
  ];
}

function createWorkflowCounts(): CompanyWorkflowCounts {
  return {
    draft: 0,
    in_review: 0,
    revise: 0,
    approved: 0,
    scheduled: 0,
  };
}

function isWorkflowCountStatus(status: ContentStatus): status is CompanyWorkflowCountStatus {
  return status !== "published";
}

export function useCompanyDetail(id?: string) {
  return useQuery({
    queryKey: ["company-detail", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const [companyResponse, socialAccountsResponse] = await Promise.all([
        apiClient<CompanyResponse>(`/companies/${id}`),
        apiClient<SocialAccountResponse>(`/companies/${id}/social-accounts`),
      ]);

      return mapCompanyDetail(
        companyResponse.data.company,
        socialAccountsResponse.data.accounts.length
      );
    },
  });
}

export function useCompanyWorkflowSnapshot(companyId?: string) {
  return useQuery({
    queryKey: ["company-workflow-snapshot", companyId],
    enabled: Boolean(companyId),
    queryFn: async (): Promise<CompanyWorkflowSnapshot> => {
      const contents = await fetchAllCompanyContents(companyId!);
      const counts = createWorkflowCounts();

      const recentItems = contents
        .map((content) => {
          if (isWorkflowCountStatus(content.status)) {
            counts[content.status] += 1;
          }

          const { dateAt, dateKind } = mapContentListDate(content);

          return {
            id: content.id,
            title: content.title,
            status: content.status,
            platform: content.socialAccount?.platform ?? null,
            assignedDesigner: content.assignedDesigner,
            assignedEditor: content.assignedEditor,
            dateAt,
            dateKind,
            updatedAt: content.updatedAt,
          };
        })
        .sort(
          (left, right) =>
            new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
        )
        .slice(0, 5);

      return {
        counts,
        recentItems,
      };
    },
  });
}

export function useCompanyContents(companyId?: string, page = 1) {
  return useQuery({
    queryKey: ["company-contents", companyId, page, COMPANY_CONTENTS_PER_PAGE],
    enabled: Boolean(companyId),
    placeholderData: (previousData) => previousData,
    queryFn: async (): Promise<CompanyContentsListData> => {
      const response = await fetchCompanyContentsPage(
        companyId!,
        page,
        COMPANY_CONTENTS_PER_PAGE,
      );

      return {
        items: response.data.map(mapCompanyContentItem),
        meta: response.meta,
      };
    },
  });
}

export function useCompanyUsers(companyId?: string) {
  return useQuery({
    queryKey: ["company-users", companyId],
    enabled: Boolean(companyId),
    queryFn: async (): Promise<CompanyUsersData> => {
      const response = await apiClient<CompanyUsersResponse>(
        `/companies/${companyId}/users`,
      );

      return {
        members: response.data.members.map(mapCompanyUserItem),
      };
    },
  });
}

export function useCompanySocialAccounts(companyId?: string) {
  return useQuery({
    queryKey: ["company-social-accounts", companyId],
    enabled: Boolean(companyId),
    queryFn: async (): Promise<CompanySocialAccountsData> => {
      const response = await apiClient<CompanySocialAccountsResponse>(
        `/companies/${companyId}/social-accounts`,
      );

      return {
        accounts: response.data.accounts.map(mapCompanySocialAccountItem),
      };
    },
  });
}

export function useCompanyCalendarWeek(companyId?: string, weekStart?: Date) {
  return useQuery({
    queryKey: ["company-calendar", companyId, weekStart?.toISOString()],
    enabled: Boolean(companyId && weekStart),
    placeholderData: (previousData) => previousData,
    queryFn: async (): Promise<CompanyCalendarDay[]> => {
      const startDate = startOfDay(weekStart!).toISOString();
      const endDate = endOfDay(addDays(weekStart!, 6)).toISOString();

      const response = await apiClient<CompanyCalendarResponse>(
        `/companies/${companyId}/contents/calendar`,
        {
          params: {
            startDate,
            endDate,
          },
        },
      );

      return mapCompanyCalendarWeek(response.data.contents, weekStart!);
    },
  });
}

export function useCompanyPayments(companyId?: string, page = 1) {
  return useQuery({
    queryKey: ["company-payments", companyId, page, COMPANY_PAYMENTS_PER_PAGE],
    enabled: Boolean(companyId),
    placeholderData: (previousData) => previousData,
    queryFn: async (): Promise<CompanyPaymentsListData> => {
      const response = await apiClient<CompanyPaymentsResponse>(
        `/companies/${companyId}/payments`,
        {
          params: {
            page: String(page),
            perPage: String(COMPANY_PAYMENTS_PER_PAGE),
          },
        },
      );

      return {
        items: response.data.map(mapCompanyPaymentItem),
        meta: response.meta,
      };
    },
  });
}

export function useCompanyActivity(companyId?: string, page = 1) {
  return useQuery({
    queryKey: ["company-activity", companyId, page, COMPANY_ACTIVITY_PER_PAGE],
    enabled: Boolean(companyId),
    placeholderData: (previousData) => previousData,
    queryFn: async (): Promise<CompanyActivityListData> => {
      const response = await apiClient<CompanyActivityResponse>(
        `/companies/${companyId}/activity-logs`,
        {
          params: {
            page: String(page),
            perPage: String(COMPANY_ACTIVITY_PER_PAGE),
          },
        },
      );

      return {
        items: response.data.map((log) => ({
          id: log.id,
          actorName: formatActorName(log.user),
          action: log.action,
          resourceType: log.resourceType,
          createdAt: log.createdAt,
        })),
        meta: response.meta,
      };
    },
  });
}
