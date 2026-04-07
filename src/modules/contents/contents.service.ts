import { Prisma, Content } from '@prisma/client';
import { prisma } from '../../config/database';
import { UserRole, ContentStatus, CommentType } from '../../shared/types/enums';
import { NotFoundError, ForbiddenError, AppError } from '../../shared/errors/app-error';
import { parsePagination, createPaginationMeta, PaginationQuery } from '../../shared/utils/pagination';
import { canTransition, getValidTransitions, isEditable, isDeletable } from './contents.state-machine';
import {
  CreateContentInput,
  UpdateContentInput,
  ChangeStatusInput,
  AssignContentInput,
  AddCommentInput,
  ContentsListQuery,
  CalendarQuery,
} from './contents.schema';
import * as notificationsService from '../notifications/notifications.service';
import { ActorContext } from '../../shared/types/actor-context';
import { logActivity } from '../activity-logs/activity-logs.service';
import { ActivityAction } from '../../shared/constants/activity-actions';
import { assertCompanyAccess } from '../../shared/helpers/access-control';

// ─── Select Shapes ───────────────────────────────────────────

const CONTENT_SELECT = {
  id: true,
  companyId: true,
  socialAccountId: true,
  assignedDesignerId: true,
  assignedEditorId: true,
  createdById: true,
  approvedById: true,
  title: true,
  body: true,
  status: true,
  approvedAt: true,
  scheduledAt: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
};

const CONTENT_DETAIL_SELECT = {
  ...CONTENT_SELECT,
  socialAccount: { select: { id: true, platform: true, accountName: true } },
  assignedDesigner: { select: { id: true, firstName: true, lastName: true, email: true } },
  assignedEditor: { select: { id: true, firstName: true, lastName: true, email: true } },
  createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  _count: { select: { versions: true, comments: true } },
};

const COMMENT_SELECT = {
  id: true,
  contentId: true,
  body: true,
  type: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
};

const VERSION_SELECT = {
  id: true,
  contentId: true,
  title: true,
  body: true,
  status: true,
  version: true,
  createdAt: true,
  createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
};

const CONTENT_LIST_PERSON_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
};

const CONTENT_LIST_SELECT = {
  id: true,
  title: true,
  status: true,
  companyId: true,
  createdAt: true,
  scheduledAt: true,
  publishedAt: true,
  company: { select: { id: true, name: true } },
  socialAccount: { select: { platform: true } },
  assignedDesigner: { select: CONTENT_LIST_PERSON_SELECT },
  assignedEditor: { select: CONTENT_LIST_PERSON_SELECT },
};

// ─── Helpers ─────────────────────────────────────────────────

/**
 * İçeriği bul, şirket erişimini doğrula, actor yetkisini kontrol et.
 */
async function findContentWithAccess(
  contentId: string,
  actor: ActorContext,
) {
  const content = await prisma.content.findFirst({
    where: { id: contentId, deletedAt: null },
    select: {
      ...CONTENT_SELECT,
      company: { select: { id: true, deletedAt: true } },
    },
  });

  if (!content || content.company.deletedAt) {
    throw new NotFoundError('İçerik bulunamadı.');
  }

  // Erişim kontrolü
  const isAdmin = actor.role === UserRole.OWNER || actor.role === UserRole.ADMIN;

  if (!isAdmin) {
    const membership = await prisma.companyUser.findUnique({
      where: { companyId_userId: { companyId: content.companyId, userId: actor.userId } },
    });
    if (!membership) throw new ForbiddenError('Bu içeriğe erişim yetkiniz yok.');
  }

  const { company: _c, ...contentData } = content;
  return contentData;
}

/**
 * Editor / Designer için işlem yetkisi kontrolü.
 * Owner/Admin pas geçer.
 * Client işlem yapamaz (bu fonksiyon sadece mutation işlemlerinde çağrılır).
 */
type ContentAccessSubset = Pick<Content, 'assignedDesignerId' | 'assignedEditorId' | 'createdById'>;

function assertMutationRights(content: ContentAccessSubset, actor: ActorContext) {
  if (actor.role === UserRole.OWNER || actor.role === UserRole.ADMIN) return;

  if (actor.role === UserRole.CLIENT) {
    throw new ForbiddenError('İçerik üzerinde işlem yapma yetkiniz yok.');
  }

  if (actor.role === UserRole.DESIGNER && content.assignedDesignerId !== actor.userId) {
    throw new ForbiddenError('Sadece size atanan içerikler üzerinde işlem yapabilirsiniz.');
  }

  if (actor.role === UserRole.EDITOR && content.assignedEditorId !== actor.userId && content.createdById !== actor.userId) {
    throw new ForbiddenError('Sadece size atanan veya oluşturduğunuz içerikler üzerinde işlem yapabilirsiniz.');
  }
}

type ContentListDateKind = 'published' | 'scheduled' | 'created';

type ContentListAssignment = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type ContentListDateSource = {
  createdAt: Date;
  scheduledAt: Date | null;
  publishedAt: Date | null;
};

function buildContentListWhere(
  actor: ActorContext,
  query: ContentsListQuery,
): Prisma.ContentWhereInput {
  const isAdmin = actor.role === UserRole.OWNER || actor.role === UserRole.ADMIN;
  const filters: Prisma.ContentWhereInput[] = [
    isAdmin
      ? {
          deletedAt: null,
          company: {
            is: {
              deletedAt: null,
            },
          },
        }
      : {
          deletedAt: null,
          company: {
            is: {
              deletedAt: null,
              companyUsers: {
                some: {
                  userId: actor.userId,
                },
              },
            },
          },
        },
  ];

  if (query.status) {
    filters.push({
      status: Array.isArray(query.status) ? { in: query.status } : query.status,
    });
  }

  if (query.search) {
    filters.push({
      OR: [
        {
          title: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          company: {
            is: {
              name: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
          },
        },
      ],
    });
  }

  return filters.length === 1 ? filters[0] : { AND: filters };
}

function mapContentListDate(content: ContentListDateSource) {
  if (content.publishedAt) {
    return {
      dateAt: content.publishedAt,
      dateKind: 'published' as ContentListDateKind,
    };
  }

  if (content.scheduledAt) {
    return {
      dateAt: content.scheduledAt,
      dateKind: 'scheduled' as ContentListDateKind,
    };
  }

  return {
    dateAt: content.createdAt,
    dateKind: 'created' as ContentListDateKind,
  };
}

function mapContentListAssignment(person: ContentListAssignment | null | undefined) {
  if (!person) {
    return null;
  }

  return {
    id: person.id,
    firstName: person.firstName,
    lastName: person.lastName,
    email: person.email,
  };
}

// ─── Notification Helpers ────────────────────────────────────

async function notifyClients(companyId: string, type: string, title: string, contentId: string, actorId?: string) {
  const clients = await prisma.companyUser.findMany({
    where: { companyId, user: { role: UserRole.CLIENT, isActive: true, deletedAt: null } },
    select: { userId: true },
  });

  for (const client of clients) {
    if (client.userId === actorId) continue;
    await notificationsService.createNotification({
      userId: client.userId,
      actorId,
      companyId,
      type,
      title,
      resourceType: 'content',
      resourceId: contentId,
    });
  }
}

async function notifyUserIfPresent(userId: string | null | undefined, companyId: string, type: string, title: string, contentId: string, actorId?: string) {
  if (!userId) return;
  await notificationsService.createNotification({
    userId,
    actorId,
    companyId,
    type,
    title,
    resourceType: 'content',
    resourceId: contentId,
  });
}

// ─── List Contents (Global) ──────────────────────────────────

export async function listGlobal(
  actor: ActorContext,
  query: ContentsListQuery,
) {
  const pagination = parsePagination(query);
  const where = buildContentListWhere(actor, query);
  const orderBy: Prisma.ContentOrderByWithRelationInput =
    query.sort === 'created_asc' ? { createdAt: 'asc' } : { createdAt: 'desc' };

  const [contents, total] = await Promise.all([
    prisma.content.findMany({
      where,
      select: CONTENT_LIST_SELECT,
      orderBy,
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.content.count({ where }),
  ]);

  const rows = contents.map((content) => {
    const { dateAt, dateKind } = mapContentListDate(content);

    return {
      id: content.id,
      title: content.title,
      status: content.status,
      companyId: content.companyId,
      companyName: content.company.name,
      platform: content.socialAccount?.platform ?? null,
      assignedDesigner: mapContentListAssignment(content.assignedDesigner),
      assignedEditor: mapContentListAssignment(content.assignedEditor),
      dateAt,
      dateKind,
    };
  });

  return { contents: rows, meta: createPaginationMeta(total, pagination) };
}

// ─── List Contents (Company-scoped) ──────────────────────────

export async function listByCompany(
  companyId: string,
  actor: ActorContext,
  query: PaginationQuery,
) {
  await assertCompanyAccess(companyId, actor);

  const pagination = parsePagination(query);

  const where = { companyId, deletedAt: null };

  const [contents, total] = await Promise.all([
    prisma.content.findMany({
      where,
      select: CONTENT_DETAIL_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.content.count({ where }),
  ]);

  return { contents, meta: createPaginationMeta(total, pagination) };
}

// ─── Create Content ──────────────────────────────────────────

export async function create(
  companyId: string,
  data: CreateContentInput,
  actor: ActorContext,
) {
  await assertCompanyAccess(companyId, actor);

  // Sosyal hesap bu şirkete ait mi?
  const socialAccount = await prisma.socialAccount.findFirst({
    where: { id: data.socialAccountId, companyId, deletedAt: null },
  });
  if (!socialAccount) throw new NotFoundError('Sosyal medya hesabı bu şirkette bulunamadı.');

  // Atanan designer var mı ve rolü doğru mu?
  const designer = await prisma.user.findFirst({
    where: { id: data.assignedDesignerId, role: UserRole.DESIGNER, isActive: true, deletedAt: null },
  });
  if (!designer) throw new NotFoundError('Atanan designer bulunamadı veya rolü uyumsuz.');

  // Atanan editor var mı ve rolü doğru mu?
  const editor = await prisma.user.findFirst({
    where: { id: data.assignedEditorId, role: UserRole.EDITOR, isActive: true, deletedAt: null },
  });
  if (!editor) throw new NotFoundError('Atanan editor bulunamadı veya rolü uyumsuz.');

  // Eğer tasarımcı oluşturuyorsa sadece kendisine atanabilir
  if (actor.role === UserRole.DESIGNER) {
    data.assignedDesignerId = actor.userId;
  }
  
  // Eğer editör oluşturuyorsa ve designer seçmediyse vs karışmıyoruz ama editorId opsiyonel olarak kendisine atanır
  if (actor.role === UserRole.EDITOR && !data.assignedEditorId) {
    data.assignedEditorId = actor.userId;
  }

  const content = await prisma.$transaction(async (tx) => {
    const newContent = await tx.content.create({
      data: {
        companyId,
        socialAccountId: data.socialAccountId,
        assignedDesignerId: data.assignedDesignerId,
        assignedEditorId: data.assignedEditorId,
        createdById: actor.userId,
        title: data.title,
        body: data.body ?? null,
        status: ContentStatus.DRAFT,
      },
      select: CONTENT_DETAIL_SELECT,
    });

    await tx.contentVersion.create({
      data: {
        contentId: newContent.id,
        createdById: actor.userId,
        title: data.title,
        body: data.body ?? null,
        status: ContentStatus.DRAFT,
        version: 1,
      },
    });

    return newContent;
  });

  await logActivity(actor, {
    action: ActivityAction.CONTENT_CREATE,
    companyId,
    resourceType: 'content',
    resourceId: content.id,
  });

  return content;
}

// ─── Get Content ─────────────────────────────────────────────

export async function getById(contentId: string, actor: ActorContext) {
  const content = await prisma.content.findFirst({
    where: { id: contentId, deletedAt: null },
    select: {
      ...CONTENT_DETAIL_SELECT,
      company: { select: { id: true, deletedAt: true } },
    },
  });

  if (!content || content.company.deletedAt) {
    throw new NotFoundError('İçerik bulunamadı.');
  }

  const isAdmin = actor.role === UserRole.OWNER || actor.role === UserRole.ADMIN;
  if (!isAdmin) {
    const membership = await prisma.companyUser.findUnique({
      where: { companyId_userId: { companyId: content.companyId, userId: actor.userId } },
    });
    if (!membership) throw new ForbiddenError('Bu içeriğe erişim yetkiniz yok.');
  }

  const { company: _c, ...data } = content;
  return data;
}

// ─── Update Content ──────────────────────────────────────────

export async function update(
  contentId: string,
  data: UpdateContentInput,
  actor: ActorContext,
) {
  const content = await findContentWithAccess(contentId, actor);

  // Sadece draft ve revise durumunda düzenlenebilir
  if (!isEditable(content.status)) {
    throw new AppError(
      `Bu içerik "${content.status}" durumunda olduğu için düzenlenemez.`,
      400,
      'CONTENT_NOT_EDITABLE',
    );
  }

  assertMutationRights(content, actor);

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.content.update({
      where: { id: contentId },
      data,
      select: CONTENT_DETAIL_SELECT,
    });

    const lastVersion = await tx.contentVersion.findFirst({
      where: { contentId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    await tx.contentVersion.create({
      data: {
        contentId,
        createdById: actor.userId,
        title: result.title,
        body: result.body,
        status: result.status,
        version: (lastVersion?.version ?? 0) + 1,
      },
    });

    return result;
  });

  await logActivity(actor, {
    action: ActivityAction.CONTENT_UPDATE,
    companyId: content.companyId,
    resourceType: 'content',
    resourceId: contentId,
  });

  return updated;
}

// ─── Soft Delete Content ─────────────────────────────────────

export async function softDelete(contentId: string, actor: ActorContext) {
  const content = await findContentWithAccess(contentId, actor);

  // Published içerik silinemez
  if (!isDeletable(content.status)) {
    throw new AppError(
      'Yayınlanmış içerik silinemez.',
      400,
      'CONTENT_NOT_DELETABLE',
    );
  }

  assertMutationRights(content, actor);

  await prisma.content.update({
    where: { id: contentId },
    data: { deletedAt: new Date() },
  });

  await logActivity(actor, {
    action: ActivityAction.CONTENT_DELETE,
    companyId: content.companyId,
    resourceType: 'content',
    resourceId: contentId,
  });

  return { message: 'İçerik silindi.' };
}

// ─── Change Status ───────────────────────────────────────────

export async function changeStatus(
  contentId: string,
  data: ChangeStatusInput,
  actor: ActorContext,
) {
  const content = await findContentWithAccess(contentId, actor);

  if (!canTransition(content.status, data.status, actor.role)) {
    const validTargets = getValidTransitions(content.status, actor.role);
    throw new AppError(
      `"${content.status}" → "${data.status}" geçişi yapılamaz. Geçerli hedefler: ${validTargets.join(', ') || 'yok'}.`,
      400,
      'INVALID_STATUS_TRANSITION',
    );
  }

  assertMutationRights(content, actor);

  const updateData: Record<string, unknown> = { status: data.status };

  // Durum bazlı ek alanlar
  if (data.status === ContentStatus.SCHEDULED) {
    if (!data.scheduledAt) {
      throw new AppError('Planlanan içerikler için tarih (scheduledAt) zorunludur.', 400, 'MISSING_SCHEDULED_AT');
    }
    updateData.scheduledAt = data.scheduledAt;
  }
  
  if (data.status === ContentStatus.APPROVED) {
    updateData.approvedById = actor.userId;
    updateData.approvedAt = new Date();
  }
  if (data.status === ContentStatus.PUBLISHED) {
    updateData.publishedAt = new Date();
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedContent = await tx.content.update({
      where: { id: contentId },
      data: updateData,
      select: CONTENT_DETAIL_SELECT,
    });

    const lastVersion = await tx.contentVersion.findFirst({
      where: { contentId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    await tx.contentVersion.create({
      data: {
        contentId,
        createdById: actor.userId,
        title: updatedContent.title,
        body: updatedContent.body,
        status: data.status,
        version: (lastVersion?.version ?? 0) + 1,
      },
    });

    return updatedContent;
  });

  // Notifications hook
  if (data.status === ContentStatus.IN_REVIEW) {
    await notifyClients(content.companyId, 'content_in_review', `İçerik onayınıza sunuldu: ${updated.title}`, content.id, actor.userId);
  } else if (data.status === ContentStatus.PUBLISHED) {
    await notifyClients(content.companyId, 'content_published', `İçerik yayınlandı: ${updated.title}`, content.id, actor.userId);
  }

  await logActivity(actor, {
    action: ActivityAction.CONTENT_STATUS_CHANGE,
    companyId: content.companyId,
    resourceType: 'content',
    resourceId: contentId,
    details: { oldStatus: content.status, newStatus: data.status },
  });

  return updated;
}

// ─── Assign ──────────────────────────────────────────────────

export async function assign(
  contentId: string,
  data: AssignContentInput,
  actor: ActorContext,
) {
  const content = await findContentWithAccess(contentId, actor);

  // Sadece Owner/Admin/Editor atama yapabilir
  if (![UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR].includes(actor.role as UserRole)) {
    throw new ForbiddenError('Atama yapma yetkiniz yok.');
  }

  assertMutationRights(content, actor);

  const updateData: Record<string, string> = {};

  if (data.assignedDesignerId) {
    const designer = await prisma.user.findFirst({
      where: { id: data.assignedDesignerId, role: UserRole.DESIGNER, isActive: true, deletedAt: null },
    });
    if (!designer) throw new NotFoundError('Atanan designer bulunamadı veya rolü uyumsuz.');
    updateData.assignedDesignerId = data.assignedDesignerId;
  }

  if (data.assignedEditorId) {
    const editor = await prisma.user.findFirst({
      where: { id: data.assignedEditorId, role: UserRole.EDITOR, isActive: true, deletedAt: null },
    });
    if (!editor) throw new NotFoundError('Atanan editor bulunamadı veya rolü uyumsuz.');
    updateData.assignedEditorId = data.assignedEditorId;
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError('En az bir atama alanı gereklidir.', 400, 'NO_ASSIGNMENT');
  }

  const updated = await prisma.content.update({
    where: { id: contentId },
    data: updateData,
    select: CONTENT_DETAIL_SELECT,
  });

  await logActivity(actor, {
    action: ActivityAction.CONTENT_ASSIGN,
    companyId: content.companyId,
    resourceType: 'content',
    resourceId: contentId,
    details: updateData,
  });

  return updated;
}

// ─── Approve (Shortcut) ──────────────────────────────────────

export async function approve(
  contentId: string,
  actor: ActorContext,
  comment?: string,
) {
  const content = await findContentWithAccess(contentId, actor);

  if (!canTransition(content.status, ContentStatus.APPROVED, actor.role)) {
    throw new AppError(
      'Bu içerik şu an onaylanamaz.',
      400,
      'CANNOT_APPROVE',
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.content.update({
      where: { id: contentId },
      data: {
        status: ContentStatus.APPROVED,
        approvedById: actor.userId,
        approvedAt: new Date(),
      },
      select: CONTENT_DETAIL_SELECT,
    });

    // Onay yorumu
    await tx.contentComment.create({
      data: {
        contentId,
        userId: actor.userId,
        body: comment || 'İçerik onaylandı.',
        type: CommentType.APPROVAL,
      },
    });

    // Versiyon snapshot
    const lastVersion = await tx.contentVersion.findFirst({
      where: { contentId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    await tx.contentVersion.create({
      data: {
        contentId,
        createdById: actor.userId,
        title: result.title,
        body: result.body,
        status: ContentStatus.APPROVED,
        version: (lastVersion?.version ?? 0) + 1,
      },
    });

    return result;
  });

  await notifyUserIfPresent(updated.assignedDesignerId, updated.companyId, 'content_approved', `İçerik onaylandı: ${updated.title}`, updated.id, actor.userId);
  await notifyUserIfPresent(updated.assignedEditorId, updated.companyId, 'content_approved', `İçerik onaylandı: ${updated.title}`, updated.id, actor.userId);

  await logActivity(actor, {
    action: ActivityAction.CONTENT_APPROVE,
    companyId: updated.companyId,
    resourceType: 'content',
    resourceId: contentId,
  });

  return updated;
}

// ─── Reject (Shortcut) ───────────────────────────────────────

export async function reject(
  contentId: string,
  actor: ActorContext,
  comment?: string,
) {
  const content = await findContentWithAccess(contentId, actor);

  if (!canTransition(content.status, ContentStatus.REVISE, actor.role)) {
    throw new AppError(
      'Bu içerik şu an reddedilemez.',
      400,
      'CANNOT_REJECT',
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.content.update({
      where: { id: contentId },
      data: { status: ContentStatus.REVISE },
      select: CONTENT_DETAIL_SELECT,
    });

    await tx.contentComment.create({
      data: {
        contentId,
        userId: actor.userId,
        body: comment || 'İçerik revize edilmeli.',
        type: CommentType.REJECTION,
      },
    });

    const lastVersion = await tx.contentVersion.findFirst({
      where: { contentId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    await tx.contentVersion.create({
      data: {
        contentId,
        createdById: actor.userId,
        title: result.title,
        body: result.body,
        status: ContentStatus.REVISE,
        version: (lastVersion?.version ?? 0) + 1,
      },
    });

    return result;
  });

  await notifyUserIfPresent(updated.assignedDesignerId, updated.companyId, 'content_rejected', `İçerik revize istendi: ${updated.title}`, updated.id, actor.userId);
  await notifyUserIfPresent(updated.assignedEditorId, updated.companyId, 'content_rejected', `İçerik revize istendi: ${updated.title}`, updated.id, actor.userId);

  await logActivity(actor, {
    action: ActivityAction.CONTENT_REJECT,
    companyId: updated.companyId,
    resourceType: 'content',
    resourceId: contentId,
  });

  return updated;
}

// ─── List Versions ───────────────────────────────────────────

export async function listVersions(contentId: string, actor: ActorContext) {
  await findContentWithAccess(contentId, actor);

  const versions = await prisma.contentVersion.findMany({
    where: { contentId },
    select: VERSION_SELECT,
    orderBy: { version: 'desc' },
  });

  return versions;
}

// ─── List Comments ───────────────────────────────────────────

export async function listComments(contentId: string, actor: ActorContext) {
  await findContentWithAccess(contentId, actor);

  const comments = await prisma.contentComment.findMany({
    where: { contentId },
    select: COMMENT_SELECT,
    orderBy: { createdAt: 'asc' },
  });

  return comments;
}

// ─── Add Comment ─────────────────────────────────────────────

export async function addComment(
  contentId: string,
  data: AddCommentInput,
  actor: ActorContext,
) {
  await findContentWithAccess(contentId, actor);

  const comment = await prisma.contentComment.create({
    data: {
      contentId,
      userId: actor.userId,
      body: data.body,
      type: CommentType.COMMENT,
    },
    select: COMMENT_SELECT,
  });

  return comment;
}

// ─── Calendar Query ──────────────────────────────────────────

export async function getCalendar(query: CalendarQuery, actor: ActorContext) {
  // Access control
  if (query.companyId) {
    await assertCompanyAccess(query.companyId, actor);
  } else if (actor.role !== UserRole.OWNER && actor.role !== UserRole.ADMIN) {
    throw new ForbiddenError('Tüm şirketlerin takvimini görme yetkiniz yok.');
  }

  const where: Prisma.ContentWhereInput = { deletedAt: null };

  if (query.companyId) {
    where.companyId = query.companyId;
  }

  // Default statuses if not provided
  if (query.status) {
    where.status = Array.isArray(query.status) ? { in: query.status } : query.status;
  } else {
    where.status = { in: [ContentStatus.SCHEDULED, ContentStatus.PUBLISHED] };
  }

  if (query.startDate || query.endDate) {
    where.scheduledAt = {};
    if (query.startDate) where.scheduledAt.gte = query.startDate;
    if (query.endDate) where.scheduledAt.lte = query.endDate;
  }

  const contents = await prisma.content.findMany({
    where,
    select: {
      id: true,
      title: true,
      status: true,
      scheduledAt: true,
      publishedAt: true,
      companyId: true,
      company: { select: { id: true, name: true } },
      socialAccount: { select: { id: true, platform: true, accountName: true } },
      assignedDesigner: { select: { id: true, firstName: true, lastName: true } },
      assignedEditor: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  return contents;
}
