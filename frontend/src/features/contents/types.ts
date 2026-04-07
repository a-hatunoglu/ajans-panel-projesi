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

export type ContentDateKind = "published" | "scheduled" | "created";

export type ContentAssignment = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type ContentListItemData = {
  id: string;
  title: string;
  status: ContentStatus;
  companyId: string;
  companyName: string;
  platform: Platform | null;
  assignedDesigner: ContentAssignment | null;
  assignedEditor: ContentAssignment | null;
  dateAt: string;
  dateKind: ContentDateKind;
};

export type ContentsListMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type ContentsListSort = "created_desc" | "created_asc";

export type ContentsListQueryParams = {
  page?: number;
  perPage?: number;
  search?: string;
  status?: ContentStatus;
  sort?: ContentsListSort;
};
