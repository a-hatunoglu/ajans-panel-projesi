import { Request, Response, NextFunction } from 'express';
import { UserRole, AgencyRole } from '../shared/types/enums';
import { ForbiddenError } from '../shared/errors/app-error';

/**
 * Global route-level authorization.
 * Checks User.role (platform_owner, user) AND optionally AgencyUser.role.
 *
 * Usage:
 *   authorize(UserRole.PLATFORM_OWNER)                → only platform owner
 *   authorize(UserRole.PLATFORM_OWNER, UserRole.USER) → any authenticated user
 *   authorize(AgencyRole.AGENCY_ADMIN)                → agency admins (checked via req.agencyRole)
 */
export function authorize(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new ForbiddenError('Kimlik doğrulama gerekli.'));
      return;
    }

    // Platform owner always passes
    if (req.user.role === UserRole.PLATFORM_OWNER) {
      next();
      return;
    }

    // Check if the user's global role is in the allowed list
    if (allowedRoles.includes(req.user.role)) {
      next();
      return;
    }

    // Check if user's agency role is in the allowed list
    const agencyRole = req.agencyRole;
    if (agencyRole && allowedRoles.includes(agencyRole)) {
      next();
      return;
    }

    next(new ForbiddenError('Bu işlem için yetkiniz yok.'));
  };
}

/**
 * Multi-tenancy role hierarchy.
 *
 * Platform Owner > Agency Admin > Agency Member
 *
 * Company-scoped operational roles (editor, designer, client) are NOT part
 * of this hierarchy. They are managed through CompanyUserRole.
 */
const ROLE_HIERARCHY: Record<string, number> = {
  [UserRole.PLATFORM_OWNER]: 10,
  [AgencyRole.AGENCY_ADMIN]: 5,
  [AgencyRole.AGENCY_MEMBER]: 2,
  [UserRole.USER]: 1,
};

export function canManageRole(actorRole: string, targetRole: string): boolean {
  return (ROLE_HIERARCHY[actorRole] ?? 0) > (ROLE_HIERARCHY[targetRole] ?? 0);
}

export function canManageUser(actorRole: string, actorId: string, targetRole: string, targetId: string): boolean {
  if (actorId === targetId) return false; // Kendini yönetemez
  return canManageRole(actorRole, targetRole);
}
