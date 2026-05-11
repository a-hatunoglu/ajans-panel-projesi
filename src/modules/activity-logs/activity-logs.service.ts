import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { ActorContext } from '../../shared/types/actor-context';
import { UserRole } from '../../shared/types/enums';
import { ForbiddenError } from '../../shared/errors/app-error';
import { parsePagination, createPaginationMeta } from '../../shared/utils/pagination';
import { logger } from '../../config/logger';
import { ListActivityLogsQuery } from './activity-logs.schema';
export interface LogActivityParams {
  action: string;
  companyId?: string | null;
  resourceType?: string;
  resourceId?: string;
  details?: Prisma.InputJsonValue;
}

export async function logActivity(
  actor: ActorContext,
  params: LogActivityParams
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: actor.userId,
        companyId: params.companyId,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        details: params.details || {},
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });
  } catch (err) {
    logger.error('Activity log failed:', err);
  }
}

export async function listGlobal(actorRole: string, query: ListActivityLogsQuery) {
  if (actorRole !== UserRole.PLATFORM_OWNER && actorRole !== 'agency_admin') {
    throw new ForbiddenError('Sistem loglarını görme yetkiniz yok.');
  }

  const pagination = parsePagination(query);
  const where: Prisma.ActivityLogWhereInput = {};
  if (query.action) where.action = query.action;
  if (query.resourceType) where.resourceType = query.resourceType;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        company: { select: { id: true, name: true } },
      }
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { logs, meta: createPaginationMeta(total, pagination) };
}

export async function listByCompany(companyId: string, actorRole: string, query: ListActivityLogsQuery) {
  if (actorRole !== UserRole.PLATFORM_OWNER && actorRole !== 'agency_admin') {
    throw new ForbiddenError('Şirket bazlı logları görme yetkiniz yok.');
  }

  const pagination = parsePagination(query);
  const where: Prisma.ActivityLogWhereInput = { companyId };
  if (query.action) where.action = query.action;
  if (query.resourceType) where.resourceType = query.resourceType;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } }
      }
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { logs, meta: createPaginationMeta(total, pagination) };
}

export async function listMe(actorId: string, query: ListActivityLogsQuery) {
  const pagination = parsePagination(query);
  const where: Prisma.ActivityLogWhereInput = { userId: actorId };
  if (query.action) where.action = query.action;
  if (query.resourceType) where.resourceType = query.resourceType;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        company: { select: { id: true, name: true } },
      }
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { logs, meta: createPaginationMeta(total, pagination) };
}
