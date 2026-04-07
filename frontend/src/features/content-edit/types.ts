export type ContentEditFormValues = {
  title: string;
  body: string;
};

export type ContentEditResponse = {
  success: boolean;
  data: {
    content: {
      id: string;
      companyId: string;
      title: string;
      body: string | null;
    };
  };
};
