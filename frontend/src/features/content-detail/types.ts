export type ContentStatus =
  | "draft"
  | "in_review"
  | "revise"
  | "approved"
  | "scheduled"
  | "published";

export type Platform =
  | "instagram"
  | "linkedin"
  | "facebook"
  | "x"
  | "tiktok"
  | "youtube";

export type ContentAssignment = {
  id: string;
  name: string;
  email: string;
};

export type ContentVersion = {
  id: string;
  version: number;
  createdAt: string;
  authorName: string;
  title: string;
  status: ContentStatus;
};

export type ContentComment = {
  id: string;
  userName: string;
  body: string;
  createdAt: string;
  role: "client" | "agency";
  type: "comment" | "approval" | "rejection";
};

export type ContentMediaItem = {
  id: string;
  url: string;
  fileType: string;
  sizeBytes: number;
  createdAt: string;
};

export type ContentDetailData = {
  id: string;
  title: string;
  status: ContentStatus;
  platform: Platform | null;
  companyId: string;
  createdById: string;
  companyName: string | null;
  socialAccountName: string | null;
  body: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  assignedDesigner: ContentAssignment | null;
  assignedEditor: ContentAssignment | null;
  versions: ContentVersion[];
  comments: ContentComment[];
  media: ContentMediaItem[];
};
