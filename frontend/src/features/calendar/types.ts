import type { ContentStatus, Platform } from "@/features/contents/types";

export type CalendarItem = {
  id: string;
  title: string;
  status: ContentStatus;
  platform: Platform | null;
  socialAccountName: string | null;
  companyName: string;
  displayAt: string;
};

export type CalendarDay = {
  date: string;
  isToday: boolean;
  items: CalendarItem[];
};
