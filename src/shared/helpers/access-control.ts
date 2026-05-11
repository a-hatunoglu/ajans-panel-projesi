import { prisma } from '../../config/database';
import { UserRole } from '../types/enums';
import { NotFoundError, ForbiddenError } from '../errors/app-error';
import { ActorContext } from '../types/actor-context';

/**
 * Aktif (soft-deleted olmayan) şirkete erişim kontrolü (multi-tenancy uyumlu).
 *
 * Platform Owner → her şirkete erişir.
 * Agency Admin → kendi ajansının şirketlerine erişir.
 * Agency Member → company_users ilişkisi gerekli.
 */
export async function assertCompanyAccess(
  companyId: string,
  actor: ActorContext,
): Promise<void> {
  const company = await prisma.company.findFirst({
    where: { id: companyId, deletedAt: null },
    select: { id: true, agencyId: true },
  });

  if (!company) throw new NotFoundError('Şirket bulunamadı.');

  // Platform owner bypasses all checks
  if (actor.role === UserRole.PLATFORM_OWNER) return;

  // Agency scope: company must belong to the actor's agency
  if (actor.agencyId && company.agencyId !== actor.agencyId) {
    throw new ForbiddenError('Bu şirkete erişim yetkiniz yok.');
  }

  // Agency admin can access all companies in their agency
  if (actor.agencyRole === 'agency_admin') return;

  // Agency member needs company_users membership
  const membership = await prisma.companyUser.findUnique({
    where: { companyId_userId: { companyId, userId: actor.userId } },
  });

  if (!membership) throw new ForbiddenError('Bu şirkete erişim yetkiniz yok.');
}
