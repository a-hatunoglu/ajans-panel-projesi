import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../shared/types/enums';
import { ForbiddenError } from '../shared/errors/app-error';

export function authorize(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new ForbiddenError('Kimlik doğrulama gerekli.'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError('Bu işlem için yetkiniz yok.'));
      return;
    }

    next();
  };
}

/**
 * Rol hiyerarşi kontrolü.
 * Bir kullanıcı kendinden üst veya eşit rol üzerinde işlem yapamaz.
 * Owner > Admin > Editor/Designer > Client
 */
const ROLE_HIERARCHY: Record<string, number> = {
  [UserRole.OWNER]: 4,
  [UserRole.ADMIN]: 3,
  [UserRole.EDITOR]: 2,
  [UserRole.DESIGNER]: 2,
  [UserRole.CLIENT]: 1,
};

export function canManageRole(actorRole: string, targetRole: string): boolean {
  return (ROLE_HIERARCHY[actorRole] ?? 0) > (ROLE_HIERARCHY[targetRole] ?? 0);
}

export function canManageUser(actorRole: string, actorId: string, targetRole: string, targetId: string): boolean {
  if (actorId === targetId) return false; // Kendini yönetemez
  return canManageRole(actorRole, targetRole);
}
