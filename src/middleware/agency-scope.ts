import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { UserRole } from '../shared/types/enums';
import { ForbiddenError } from '../shared/errors/app-error';

/**
 * Agency scope middleware.
 *
 * Resolves the current agency context for the authenticated user:
 * - Platform Owner: can access any agency (uses X-Agency-Id header or first agency)
 * - Agency User: auto-resolves to their assigned agency (supports X-Agency-Id for multi-agency)
 * - Client/CompanyUser: falls back to the company's agencyId when no AgencyUser record exists
 *
 * Sets req.agencyId and req.agencyRole on the request.
 */
export function agencyScope() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        next(new ForbiddenError('Kimlik doğrulama gerekli.'));
        return;
      }

      const isPlatformOwner = req.user.role === UserRole.PLATFORM_OWNER;
      const headerAgencyId = req.headers['x-agency-id'] as string | undefined;

      // ── Platform Owner ────────────────────────────────────
      if (isPlatformOwner) {
        if (headerAgencyId) {
          // Verify the agency exists
          const agency = await prisma.agency.findFirst({
            where: { id: headerAgencyId, deletedAt: null },
            select: { id: true },
          });

          if (agency) {
            req.agencyId = agency.id;
            req.agencyRole = 'agency_admin'; // platform owner acts as admin
            next();
            return;
          }
        }

        // Platform owner without agency context — allow through (for platform routes)
        // They might also have an agency_admin membership
        const membership = await prisma.agencyUser.findFirst({
          where: { userId: req.user.id },
          select: { agencyId: true, role: true },
        });

        if (membership) {
          req.agencyId = membership.agencyId;
          req.agencyRole = membership.role;
        }

        next();
        return;
      }

      // ── Normal User: Agency membership resolution ─────────

      // Step A: If X-Agency-Id header is provided, try to resolve that specific agency
      if (headerAgencyId) {
        const specificMembership = await prisma.agencyUser.findFirst({
          where: {
            userId: req.user.id,
            agencyId: headerAgencyId,
            agency: { isActive: true, deletedAt: null },
          },
          select: { agencyId: true, role: true },
        });

        if (specificMembership) {
          req.agencyId = specificMembership.agencyId;
          req.agencyRole = specificMembership.role;
          next();
          return;
        }
      }

      // Step B: Default — find first agency membership
      const membership = await prisma.agencyUser.findFirst({
        where: {
          userId: req.user.id,
          agency: { isActive: true, deletedAt: null },
        },
        select: { agencyId: true, role: true },
      });

      if (membership) {
        req.agencyId = membership.agencyId;
        req.agencyRole = membership.role;
        next();
        return;
      }

      // Step C: Client fallback — user has no AgencyUser record but may be
      // a CompanyUser (client). Resolve agency context through their company.
      const companyMembership = await prisma.companyUser.findFirst({
        where: {
          userId: req.user.id,
          company: { deletedAt: null, agency: { isActive: true, deletedAt: null } },
        },
        include: {
          company: { select: { agencyId: true } },
        },
      });

      if (companyMembership) {
        req.agencyId = companyMembership.company.agencyId;
        // Client users get no agency-level role — they are scoped to company only
        req.agencyRole = undefined;
        next();
        return;
      }

      // No agency context could be resolved
      next(new ForbiddenError('Herhangi bir ajansa atanmamışsınız.'));
    } catch (err) {
      next(err);
    }
  };
}
