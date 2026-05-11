import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { NotFoundError } from '../../shared/errors/app-error';
import { parsePagination, createPaginationMeta } from '../../shared/utils/pagination';
import { logger } from '../../config/logger';
import { ListNotificationsQuery } from './notifications.schema';
import { emitToUser } from '../../config/socket';
// ─── Internal Notification Helper ────────────────────────────

export interface CreateNotificationParams {
  userId: string;
  actorId?: string;
  companyId?: string;
  type: string;
  title: string;
  message?: string;
  resourceType?: string;
  resourceId?: string;
}

/**
 * İç Sistem Bildirim Yaratıcısı
 * Hatayı fırlatmaz, sessizce başarısız olur ki ana akışı (commit) bloklamasın.
 */
export async function createNotification(params: CreateNotificationParams): Promise<void> {
  // Self-notification (kendi kendine bildirim) engelleme
  if (params.actorId && params.userId === params.actorId) {
    return;
  }

  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        companyId: params.companyId,
        type: params.type,
        title: params.title,
        message: params.message,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
      },
    });

    emitToUser(params.userId, 'notification:new', notification);
  } catch (err) {
    logger.error('Bildirim oluşturulamadı:', err);
  }
}

// ─── CRUD ──────────────────────────────────────────────────

export async function list(userId: string, query: ListNotificationsQuery) {
  const pagination = parsePagination(query);

  const where: Prisma.NotificationWhereInput = { userId };
  
  if (query.isRead !== undefined) {
    where.isRead = String(query.isRead).toLowerCase() === 'true';
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.notification.count({ where }),
  ]);

  return { notifications, meta: createPaginationMeta(total, pagination) };
}

export async function getUnreadCount(userId: string) {
  return await prisma.notification.count({
    where: { userId, isRead: false },
  });
}

export async function markAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    throw new NotFoundError('Bildirim bulunamadı veya yetkiniz yok.');
  }

  if (notification.isRead) {
    return notification;
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true, readAt: new Date() },
  });

  return updated;
}

export async function markAllAsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  return { message: `${result.count} bildirim okundu olarak işaretlendi.`, count: result.count };
}
