import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { UserRole } from '../shared/types/enums';
import { ForbiddenError, NotFoundError } from '../shared/errors/app-error';

/**
 * Şirket erişim kontrolü middleware'i.
 *
 * - Owner/Admin: tüm şirketlere erişim (şirket var mı kontrolü yapılır)
 * - Editor/Designer/Client: sadece company_users ilişkisi varsa
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
        select: { id: true, name: true, slug: true },
      });

      if (!company) {
        throw new NotFoundError('Şirket bulunamadı.');
      }

      const userRole = req.user?.role;

      // Owner ve Admin tüm şirketlere erişebilir
      if (userRole === UserRole.OWNER || userRole === UserRole.ADMIN) {
        req.company = company;
        next();
        return;
      }

      // Diğer roller: company_users ilişkisi kontrol et
      const membership = await prisma.companyUser.findUnique({
        where: {
          companyId_userId: {
            companyId: company.id,
            userId: req.user!.id,
          },
        },
      });

      if (!membership) {
        throw new ForbiddenError('Bu şirkete erişim yetkiniz yok.');
      }

      req.company = company;
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Soft-deleted şirketlere erişim (çöp kutusu işlemleri için).
 * Sadece Owner ve Admin kullanır.
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
        select: { id: true, name: true, slug: true },
      });

      if (!company) {
        throw new NotFoundError('Silinmiş şirket bulunamadı.');
      }

      req.company = company;
      next();
    } catch (err) {
      next(err);
    }
  };
}
