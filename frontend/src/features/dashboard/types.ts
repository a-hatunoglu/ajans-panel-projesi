import type { ContentDateKind, Platform } from "@/features/contents/types";

export type StatId = "needs-attention" | "upcoming-schedule" | "active-companies";

export type StatItem = {
  id: StatId;
  value: number | null;
};

export type AttentionItem = {
  id: string;
  title: string;
  companyName: string;
  status: "in_review" | "revise";
  dateKind: ContentDateKind;
  dateAt: string;
};

export type ScheduleItem = {
  id: string;
  title: string;
  companyName: string;
  platform: Platform | null;
  socialAccountName: string | null;
  scheduledAt: string;
};

export type DashboardSections = {
  attention: boolean;
  schedule: boolean;
};

export type ActivityItem = {
  id: string;
  action: string;
  user: string;
  target: string;
  timeAgo: string;
};

export type BillingAlert = {
  id: string;
  companyName: string;
  amount: number;
  dueDate: string;
  status: "OVERDUE" | "SOON";
};

export type DashboardData = {
  stats: StatItem[];
  attentionItems: AttentionItem[];
  scheduleItems: ScheduleItem[];
  sections: DashboardSections;
  hasAnyCompany: boolean | null;
};
