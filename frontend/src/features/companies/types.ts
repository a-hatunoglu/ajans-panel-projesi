export type Company = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  _count: {
    companyUsers: number;
  };
};
