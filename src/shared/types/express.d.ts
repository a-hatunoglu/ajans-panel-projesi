import { UserRole } from './enums';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
      company?: {
        id: string;
        name: string;
        slug: string;
      };
    }
  }
}

export {};
