import type {
  ContentAssignment,
  ContentDateKind,
  ContentStatus,
  ContentsListMeta,
  Platform,
} from "@/features/contents/types";
import type { PaymentStatus } from "@/features/payments/types";

export type TabId = "overview" | "social" | "contents" | "calendar" | "payments" | "users" | "activity";

export type TabItem = {
  id: TabId;
  label: string;
  allowedRoles: string[];
};

export type CompanyDetailData = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  isActive: boolean;
  socialAccountsConnected: number;
};

export type CompanyWorkflowCountStatus =
  | "draft"
  | "in_review"
  | "revise"
  | "approved"
  | "scheduled";

export type CompanyWorkflowCounts = Record<CompanyWorkflowCountStatus, number>;

export type CompanyWorkflowItem = {
  id: string;
  title: string;
  status: ContentStatus;
  platform: Platform | null;
  assignedDesigner: ContentAssignment | null;
  assignedEditor: ContentAssignment | null;
  dateAt: string;
  dateKind: ContentDateKind;
  updatedAt: string;
};

export type CompanyWorkflowSnapshot = {
  counts: CompanyWorkflowCounts;
  recentItems: CompanyWorkflowItem[];
};

export type CompanyContentsItem = {
  id: string;
  title: string;
  status: ContentStatus;
  platform: Platform | null;
  socialAccountName: string | null;
  assignedDesigner: ContentAssignment | null;
  assignedEditor: ContentAssignment | null;
  dateAt: string;
  dateKind: ContentDateKind;
};

export type CompanyContentsListData = {
  items: CompanyContentsItem[];
  meta: ContentsListMeta;
};

export type CompanyMemberRole =
  | "owner"
  | "admin"
  | "editor"
  | "designer"
  | "client";

export type CompanyUserItem = {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: CompanyMemberRole;
  isActive: boolean;
};

export type CompanyUsersData = {
  members: CompanyUserItem[];
};

export type CompanySocialAccountItem = {
  id: string;
  platform: Platform;
  accountName: string;
  isActive: boolean;
};

export type CompanySocialAccountsData = {
  accounts: CompanySocialAccountItem[];
};

export type CompanyCalendarItem = {
  id: string;
  title: string;
  status: ContentStatus;
  platform: Platform | null;
  socialAccountName: string | null;
  displayAt: string;
};

export type CompanyCalendarDay = {
  date: string;
  isToday: boolean;
  items: CompanyCalendarItem[];
};

export type CompanyPaymentItem = {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  dueDate: string;
  paidAt: string | null;
  periodStart: string | null;
  periodEnd: string | null;
};

export type CompanyPaymentsListData = {
  items: CompanyPaymentItem[];
  meta: ContentsListMeta;
};

export type CompanyActivityItem = {
  id: string;
  actorName: string;
  action: string;
  resourceType: string | null;
  createdAt: string;
};

export type CompanyActivityListData = {
  items: CompanyActivityItem[];
  meta: ContentsListMeta;
};

export type UpdateCompanyInput = {
  name?: string;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
};

export type UpdateUserInput = {
  firstName?: string;
  lastName?: string;
  role?: "admin" | "editor" | "designer" | "client";
};
