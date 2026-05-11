import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { UserRole } from '../shared/types/enums';
import { ForbiddenError, NotFoundError } from '../shared/errors/app-error';

/**
 * Şirket erişim kontrolü middleware'i (Multi-Tenancy uyumlu).
 *
 * - Platform Owner: tüm şirketlere erişim
 * - Agency Admin/Member: sadece kendi ajansındaki şirketlere
 * - Company-scoped user: sadece company_users ilişkisi varsa
 *
 * req.params'tan companyId alır (paramName ile ayarlanabilir).
 * Doğrulama sonrası req.company set eder.
 */
export function companyAccess(paramName = 'id') {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const companyId = req.params[paramName] as string;

      if (!companyId) {
        throw new NotFoundError('Şirket ID parametresi bulunamadı.');
      }

      const company = await prisma.company.findFirst({
        where: { id: companyId, deletedAt: null },
        select: { id: true, name: true, slug: true, agencyId: true },
      });

      if (!company) {
        throw new NotFoundError('Şirket bulunamadı.');
      }

      const isPlatformOwner = req.user?.role === UserRole.PLATFORM_OWNER;

      // Platform owner can access any company
      if (isPlatformOwner) {
        req.company = company;
        req.companyRoles = [];
        next();
        return;
      }

      // Agency scope check: user must belong to the same agency as the company
      if (req.agencyId && req.agencyId !== company.agencyId) {
        throw new ForbiddenError('Bu şirkete erişim yetkiniz yok.');
      }

      // Check company-level membership for operational roles
      const membership = await prisma.companyUser.findUnique({
        where: {
          companyId_userId: {
            companyId: company.id,
            userId: req.user!.id,
          },
        },
        include: { roles: true },
      });

      // Agency admins can access all companies in their agency
      const isAgencyAdmin = req.agencyRole === 'agency_admin';

      if (!isAgencyAdmin && !membership) {
        throw new ForbiddenError('Bu şirkete erişim yetkiniz yok.');
      }

      req.company = company;
      req.companyRoles = membership ? membership.roles.map((r) => r.role) : [];
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Soft-deleted şirketlere erişim (çöp kutusu işlemleri için).
 * Sadece Platform Owner ve Agency Admin kullanır.
 */
export function deletedCompanyAccess(paramName = 'id') {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const companyId = req.params[paramName] as string;

      if (!companyId) {
        throw new NotFoundError('Şirket ID parametresi bulunamadı.');
      }

      const company = await prisma.company.findFirst({
        where: { id: companyId, deletedAt: { not: null } },
        select: { id: true, name: true, slug: true, agencyId: true },
      });

      if (!company) {
        throw new NotFoundError('Silinmiş şirket bulunamadı.');
      }

      // Agency scope check
      const isPlatformOwner = req.user?.role === UserRole.PLATFORM_OWNER;
      if (!isPlatformOwner && req.agencyId && req.agencyId !== company.agencyId) {
        throw new ForbiddenError('Bu şirkete erişim yetkiniz yok.');
      }

      req.company = company;
      next();
    } catch (err) {
      next(err);
    }
  };
}
