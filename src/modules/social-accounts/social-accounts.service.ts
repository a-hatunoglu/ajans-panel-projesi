import { prisma } from '../../config/database';
import { UserRole, CompanyRole } from '../../shared/types/enums';
import { NotFoundError, ForbiddenError } from '../../shared/errors/app-error';
import { UpdateSocialAccountInput, CreateSocialAccountInput } from './social-accounts.schema';
import { ActorContext } from '../../shared/types/actor-context';
import { logActivity } from '../activity-logs/activity-logs.service';
import { ActivityAction } from '../../shared/constants/activity-actions';
import { assertCompanyAccess } from '../../shared/helpers/access-control';

const ACCOUNT_SELECT = {
  id: true,
  companyId: true,
  platform: true,
  accountName: true,
  profileUrl: true,
  notes: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

// ─── Helpers ─────────────────────────────────────────────────


/**
 * Sosyal hesabı bul, şirket erişimini doğrula, rolü kontrol et.
 * Dönen account objesini akış devam ettirmek için kullanır.
 */
async function findAccountWithAccess(
  accountId: string,
  actor: ActorContext,
  requireEdit = false,
) {
  const account = await prisma.socialAccount.findFirst({
    where: { id: accountId, deletedAt: null },
    select: { ...ACCOUNT_SELECT, company: { select: { id: true, deletedAt: true } } },
  });

  if (!account || account.company.deletedAt) {
    throw new NotFoundError('Sosyal medya hesabı bulunamadı.');
  }

  // Erişim kontrolü
  const isAdmin = actor.role === UserRole.PLATFORM_OWNER || actor.agencyRole === 'agency_admin';

  if (!isAdmin) {
    // Şirket üyeliği kontrolü
    const membership = await prisma.companyUser.findUnique({
      where: { companyId_userId: { companyId: account.companyId, userId: actor.userId } },
    });
    if (!membership) {
      throw new ForbiddenError('Bu hesaba erişim yetkiniz yok.');
    }

    // Yazma yetkisi kontrolü (Editor yazabilir, Designer/Client yazamaz)
    if (requireEdit && !(actor.companyRoles ?? []).includes(CompanyRole.EDITOR)) {
      throw new ForbiddenError('Bu işlem için yetkiniz yok.');
    }
  }

  // company alanını response'dan çıkar
  const { company: _company, ...accountData } = account;
  return accountData;
}

// ─── List by Company ─────────────────────────────────────────

export async function listByCompany(companyId: string, actor: ActorContext) {
  await assertCompanyAccess(companyId, actor);

  const accounts = await prisma.socialAccount.findMany({
    where: { companyId, deletedAt: null },
    select: ACCOUNT_SELECT,
    orderBy: { createdAt: 'asc' },
  });

  return accounts;
}

// ─── Create ──────────────────────────────────────────────────

export async function create(
  companyId: string,
  data: CreateSocialAccountInput,
  actor: ActorContext,
) {
  await assertCompanyAccess(companyId, actor);

  if (actor.role !== UserRole.PLATFORM_OWNER && actor.agencyRole !== 'agency_admin') {
     if (!(actor.companyRoles ?? []).includes(CompanyRole.EDITOR)) {
       throw new ForbiddenError('Yeni sosyal hesap ekleme yetkiniz yok. Sadece owner/admin veya editor hesap ekleyebilir.');
     }
  }

  const account = await prisma.socialAccount.create({
    data: {
      companyId,
      platform: data.platform,
      accountName: data.accountName,
      profileUrl: data.profileUrl ?? null,
      notes: data.notes ?? null,
    },
    select: ACCOUNT_SELECT,
  });

  await logActivity(actor, {
    action: ActivityAction.SOCIAL_ACCOUNT_CREATE,
    companyId,
    resourceType: 'social_account',
    resourceId: account.id,
  });

  return account;
}

// ─── Get by ID ───────────────────────────────────────────────

export async function getById(accountId: string, actor: ActorContext) {
  return findAccountWithAccess(accountId, actor);
}

// ─── Update ──────────────────────────────────────────────────

export async function update(
  accountId: string,
  data: UpdateSocialAccountInput,
  actor: ActorContext,
) {
  const accountMeta = await findAccountWithAccess(accountId, actor, true);

  const updated = await prisma.socialAccount.update({
    where: { id: accountId },
    data,
    select: ACCOUNT_SELECT,
  });

  await logActivity(actor, {
    action: ActivityAction.SOCIAL_ACCOUNT_UPDATE,
    companyId: accountMeta.companyId,
    resourceType: 'social_account',
    resourceId: accountId,
  });

  return updated;
}

// ─── Soft Delete ─────────────────────────────────────────────

export async function softDelete(accountId: string, actor: ActorContext) {
  const account = await findAccountWithAccess(accountId, actor, true);

  // Editor silemez, sadece Owner/Admin
  if (actor.role !== UserRole.PLATFORM_OWNER && actor.agencyRole !== 'agency_admin') {
    throw new ForbiddenError('Sosyal hesap silme yetkisi sadece Owner ve Admin rollerine aittir.');
  }

  await prisma.socialAccount.update({
    where: { id: accountId },
    data: { deletedAt: new Date() },
  });

  await logActivity(actor, {
    action: ActivityAction.SOCIAL_ACCOUNT_DELETE,
    companyId: account.companyId,
    resourceType: 'social_account',
    resourceId: accountId,
  });

  return { message: 'Sosyal medya hesabı silindi.' };
}
