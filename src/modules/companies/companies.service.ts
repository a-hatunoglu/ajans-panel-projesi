import { prisma } from '../../config/database';
import { UserRole } from '../../shared/types/enums';
import { NotFoundError, ConflictError } from '../../shared/errors/app-error';
import { generateSlug } from '../../shared/utils/slug';
import { parsePagination, createPaginationMeta, PaginationQuery } from '../../shared/utils/pagination';
import { CreateCompanyInput, UpdateCompanyInput } from './companies.schema';
import { ActorContext } from '../../shared/types/actor-context';
import { logActivity } from '../activity-logs/activity-logs.service';
import { ActivityAction } from '../../shared/constants/activity-actions';
import { assertCompanyAccess } from '../../shared/helpers/access-control';

const COMPANY_SELECT = {
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
  website: true,
  phone: true,
  email: true,
  address: true,
  notes: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

const COMPANY_USER_SELECT = {
  id: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      role: true,
      isActive: true,
    },
  },
};

// ─── Ortak Helpers ───────────────────────────────────────────


/**
 * Benzersiz slug üretici. Aynı prefix'li slug'ları DB'den çekip çarpışma önler.
 */
async function createUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const baseSlug = generateSlug(name);

  const existing = await prisma.company.findMany({
    where: {
      slug: { startsWith: baseSlug },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { slug: true },
  });

  const existingSlugs = existing.map((c) => c.slug);

  if (!existingSlugs.includes(baseSlug)) return baseSlug;

  let counter = 1;
  while (existingSlugs.includes(`${baseSlug}-${counter}`)) {
    counter++;
  }
  return `${baseSlug}-${counter}`;
}

// ─── List Companies ──────────────────────────────────────────

export async function listCompanies(actor: ActorContext, query: PaginationQuery) {
  const pagination = parsePagination(query);

  const isAdmin = actor.role === UserRole.OWNER || actor.role === UserRole.ADMIN;

  const where = isAdmin
    ? { deletedAt: null }
    : {
        deletedAt: null,
        companyUsers: { some: { userId: actor.userId } },
      };

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      select: {
        ...COMPANY_SELECT,
        _count: { select: { companyUsers: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.company.count({ where }),
  ]);

  return { companies, meta: createPaginationMeta(total, pagination) };
}

// ─── Create Company ──────────────────────────────────────────

export async function createCompany(data: CreateCompanyInput, actor: ActorContext) {
  const slug = await createUniqueSlug(data.name);

  const company = await prisma.company.create({
    data: {
      name: data.name,
      slug,
      website: data.website ?? null,
      phone: data.phone ?? null,
      email: data.email ?? null,
      address: data.address ?? null,
      notes: data.notes ?? null,
    },
    select: COMPANY_SELECT,
  });

  await logActivity(actor, {
    action: ActivityAction.COMPANY_CREATE,
    companyId: company.id,
    resourceType: 'company',
    resourceId: company.id,
  });

  await prisma.companyUser.create({
    data: {
      companyId: company.id,
      userId: actor.userId,
    },
  });

  return company;
}

// ─── Get Company ─────────────────────────────────────────────

export async function getCompany(id: string) {
  const company = await prisma.company.findFirst({
    where: { id, deletedAt: null },
    select: {
      ...COMPANY_SELECT,
      _count: { select: { companyUsers: true } },
    },
  });

  if (!company) throw new NotFoundError('Şirket bulunamadı.');
  return company;
}

// ─── Update Company ──────────────────────────────────────────

export async function updateCompany(id: string, data: UpdateCompanyInput, actor: ActorContext) {
  const existing = await prisma.company.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existing) throw new NotFoundError('Şirket bulunamadı.');

  let slug: string | undefined;
  if (data.name && data.name !== existing.name) {
    slug = await createUniqueSlug(data.name, id);
  }

  const company = await prisma.company.update({
    where: { id },
    data: {
      ...data,
      ...(slug ? { slug } : {}),
    },
    select: COMPANY_SELECT,
  });

  await logActivity(actor, {
    action: ActivityAction.COMPANY_UPDATE,
    companyId: company.id,
    resourceType: 'company',
    resourceId: company.id,
  });

  return company;
}

// ─── Soft Delete Company (Transaction + Cascade) ─────────────

export async function softDeleteCompany(id: string, actor: ActorContext) {
  const company = await prisma.company.findFirst({
    where: { id, deletedAt: null },
  });

  if (!company) throw new NotFoundError('Şirket bulunamadı.');

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    // 1. Şirketi soft-delete et
    await tx.company.update({
      where: { id },
      data: { deletedAt: now },
    });

    // 2. Sosyal hesapları soft-delete et
    await tx.socialAccount.updateMany({
      where: { companyId: id, deletedAt: null },
      data: { deletedAt: now },
    });

    // 3. İçerikleri (contents) soft-delete et
    await tx.content.updateMany({
      where: { companyId: id, deletedAt: null },
      data: { deletedAt: now },
    });

    // Not: company_users ilişkileri silinmez, şirket erişimi kapalı olduğu için görünmez
    // Not: Faz 7 deki paymentlar soft delete mantiginda yasamamaktadir.
  });

  await logActivity(actor, {
    action: ActivityAction.COMPANY_DELETE,
    companyId: id,
    resourceType: 'company',
    resourceId: id,
  });

  return { message: 'Şirket ve bağlı tüm kayıtlar çöp kutusuna taşındı.' };
}

// ─── Restore Company ─────────────────────────────────────────

export async function restoreCompany(id: string, actor: ActorContext) {
  const company = await prisma.company.findFirst({
    where: { id, deletedAt: { not: null } },
  });

  if (!company) throw new NotFoundError('Çöp kutusunda böyle bir şirket bulunamadı.');

  // company.deletedAt aynı zamanda cascade-silinen child satırların
  // deletedAt değeriyle eşleşir (softDeleteCompany aynı `now` yazar).
  // Bağımsız silinen satırlar farklı timestamp taşır, bu yüzden
  // sadece cascade-silinenleri geri yüklemek için timestamp eşleşmesi kullanılır.
  const batchTimestamp = company.deletedAt;

  await prisma.$transaction(async (tx) => {
    await tx.company.update({
      where: { id },
      data: { deletedAt: null },
    });

    await tx.socialAccount.updateMany({
      where: { companyId: id, deletedAt: batchTimestamp },
      data: { deletedAt: null },
    });

    await tx.content.updateMany({
      where: { companyId: id, deletedAt: batchTimestamp },
      data: { deletedAt: null },
    });
  });

  await logActivity(actor, {
    action: ActivityAction.COMPANY_RESTORE,
    companyId: id,
    resourceType: 'company',
    resourceId: id,
  });

  return getCompany(id);
}

// ─── Permanent Delete ────────────────────────────────────────

export async function permanentDeleteCompany(id: string, actor: ActorContext) {
  const company = await prisma.company.findFirst({
    where: { id, deletedAt: { not: null } },
  });

  if (!company) {
    throw new NotFoundError(
      'Çöp kutusunda böyle bir şirket bulunamadı.',
    );
  }

  // TODO [Faz 6]: Şirkete ait S3/MinIO dosyaları (logolar, içerik görselleri vb.)
  // kalıcı silme öncesi temizlenmelidir. Dosya path'leri social_accounts ve
  // content_versions tablolarından toplanıp S3'ten silinmelidir.
  // Örnek: await storageService.deleteCompanyFiles(id);

  // Cascade: Prisma schema'da onDelete: Cascade olduğu için
  // company_users kayıtları da otomatik silinir.
  await prisma.company.delete({ where: { id } });

  await logActivity(actor, {
    action: ActivityAction.COMPANY_HARD_DELETE,
    companyId: null, // Şirket silindiği için null
    resourceType: 'company',
    resourceId: id,
  });

  return { message: 'Şirket kalıcı olarak silindi.' };
}

// ─── List Trash ──────────────────────────────────────────────

export async function listTrash(query: PaginationQuery) {
  const pagination = parsePagination(query);

  const where = { deletedAt: { not: null } };

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      select: {
        ...COMPANY_SELECT,
        deletedAt: true,
      },
      orderBy: { deletedAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.company.count({ where }),
  ]);

  return { companies, meta: createPaginationMeta(total, pagination) };
}

// ─── List Company Users ──────────────────────────────────────

export async function listCompanyUsers(
  companyId: string,
  actor: ActorContext,
) {
  await assertCompanyAccess(companyId, actor);

  const members = await prisma.companyUser.findMany({
    where: { companyId },
    select: COMPANY_USER_SELECT,
    orderBy: { createdAt: 'asc' },
  });

  return members;
}

// ─── Add User to Company ─────────────────────────────────────

export async function addUserToCompany(
  companyId: string,
  userId: string,
  actor: ActorContext,
) {
  await assertCompanyAccess(companyId, actor);

  const user = await prisma.user.findFirst({
    where: { id: userId, isActive: true, deletedAt: null },
  });
  if (!user) throw new NotFoundError('Kullanıcı bulunamadı veya pasif.');

  const existing = await prisma.companyUser.findUnique({
    where: { companyId_userId: { companyId, userId } },
  });
  if (existing) throw new ConflictError('Kullanıcı zaten bu şirkete ekli.');

  const membership = await prisma.companyUser.create({
    data: { companyId, userId },
    select: COMPANY_USER_SELECT,
  });

  await logActivity(actor, {
    action: ActivityAction.COMPANY_USER_ADD,
    companyId,
    resourceType: 'company_user',
    resourceId: membership.id,
    details: { userId },
  });

  return membership;
}

// ─── Remove User from Company ────────────────────────────────

export async function removeUserFromCompany(
  companyId: string,
  userId: string,
  actor: ActorContext,
) {
  await assertCompanyAccess(companyId, actor);

  const existing = await prisma.companyUser.findUnique({
    where: { companyId_userId: { companyId, userId } },
  });
  if (!existing) throw new NotFoundError('Kullanıcı bu şirkette bulunamadı.');

  await prisma.companyUser.delete({
    where: { companyId_userId: { companyId, userId } },
  });

  await logActivity(actor, {
    action: ActivityAction.COMPANY_USER_REMOVE,
    companyId,
    resourceType: 'company_user',
    resourceId: existing.id,
    details: { removedUserId: userId },
  });

  return { message: 'Kullanıcı şirketten çıkarıldı.' };
}
