export type CreateEligibleRole = "owner" | "admin" | "editor" | "designer" | "client";

export type CreateCurrentUser = {
  id: string;
  role: CreateEligibleRole;
};

export type ContentCreateFormValues = {
  companyId: string;
  socialAccountId: string;
  title: string;
  body: string;
  assignedDesignerId: string;
  assignedEditorId: string;
};

export type ContentCreateCompanyOption = {
  id: string;
  name: string;
};

export type ContentCreateSocialAccountOption = {
  id: string;
  platform: "instagram" | "linkedin" | "facebook" | "x" | "tiktok" | "youtube";
  accountName: string;
  isActive: boolean;
};

export type ContentCreateMemberOption = {
  id: string;
  name: string;
  email: string;
  role: CreateEligibleRole;
  isActive: boolean;
};

export type ContentCreateResponse = {
  success: boolean;
  data: {
    content: {
      id: string;
    };
  };
};
