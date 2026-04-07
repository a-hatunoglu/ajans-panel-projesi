import { prisma } from '../../config/database';
import { UserRole } from '../types/enums';
import { NotFoundError, ForbiddenError } from '../errors/app-error';
import { ActorContext } from '../types/actor-context';

/**
 * Aktif (soft-deleted olmayan) şirkete erişim kontrolü.
 * Owner/Admin → şirket var mı yeter.
 * Diğer roller → company_users ilişkisi de gerekli.
 */
export async function assertCompanyAccess(
  companyId: string,
  actor: ActorContext,
): Promise<void> {
  const company = await prisma.company.findFirst({
    where: { id: companyId, deletedAt: null },
    select: { id: true },
  });

  if (!company) throw new NotFoundError('Şirket bulunamadı.');

  if (actor.role === UserRole.OWNER || actor.role === UserRole.ADMIN) return;

  const membership = await prisma.companyUser.findUnique({
    where: { companyId_userId: { companyId, userId: actor.userId } },
  });

  if (!membership) throw new ForbiddenError('Bu şirkete erişim yetkiniz yok.');
}
