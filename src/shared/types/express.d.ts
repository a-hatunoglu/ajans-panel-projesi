import { UserRole } from './enums';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
      /** Current agency context (resolved by agencyScope middleware) */
      agencyId?: string;
      /** User's role within the current agency (agency_admin, agency_member) */
      agencyRole?: string;
      company?: {
        id: string;
        name: string;
        slug: string;
        agencyId: string;
      };
      companyRoles?: string[];
    }
  }
}

export {};
