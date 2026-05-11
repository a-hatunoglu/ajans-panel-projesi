import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { ForbiddenError, NotFoundError } from '../../shared/errors/app-error';
import { UserRole, CompanyRole } from '../../shared/types/enums';
import { parsePagination, createPaginationMeta } from '../../shared/utils/pagination';
import { assertCompanyAccess } from '../../shared/helpers/access-control';
import { logActivity } from '../activity-logs/activity-logs.service';
import { ActorContext } from '../../shared/types/actor-context';
import { ActivityAction } from '../../shared/constants/activity-actions';
import { PaymentsListQuery, CreatePaymentInput, UpdatePaymentInput, ChangePaymentStatusInput } from './payments.schema';

type GlobalPaymentRow = {
  id: string;
  companyId: string;
  companyName: string;
  amount: Prisma.Decimal | string | number;
  currency: string;
  periodStart: Date | null;
  periodEnd: Date | null;
  dueDate: Date;
  status: string;
  paidAt: Date | null;
  createdAt: Date;
};

export async function listGlobal(actor: ActorContext, query: PaymentsListQuery) {
  const isPlatformOwner = actor.role === UserRole.PLATFORM_OWNER;
  const isAgencyAdmin = actor.agencyRole === 'agency_admin';
  if (!isPlatformOwner && !isAgencyAdmin) {
    throw new ForbiddenError('Ödemeleri görüntüleme yetkiniz yok.');
  }

  const pagination = parsePagination(query);
  const where: Prisma.PaymentWhereInput = {
    deletedAt: null,
    company: {
      is: {
        deletedAt: null,
        ...(isPlatformOwner ? {} : { agencyId: actor.agencyId ?? undefined }),
      },
    },
  };

  if (query.status) {
    where.status = query.status;
  }

  if (query.companyId) {
    where.companyId = query.companyId;
  }

  const statusFilter = query.status
    ? Prisma.sql`AND p.status = ${query.status}`
    : Prisma.empty;
  const companyFilter = query.companyId
    ? Prisma.sql`AND p.company_id = ${query.companyId}::uuid`
    : Prisma.empty;

  const [payments, total] = await Promise.all([
    prisma.$queryRaw<GlobalPaymentRow[]>(Prisma.sql`
      SELECT
        p.id,
        p.company_id AS "companyId",
        c.name AS "companyName",
        p.amount,
        p.currency,
        p.period_start AS "periodStart",
        p.period_end AS "periodEnd",
        p.due_date AS "dueDate",
        p.status,
        p.paid_at AS "paidAt",
        p.created_at AS "createdAt"
      FROM payments p
      INNER JOIN companies c ON c.id = p.company_id
      WHERE c.deleted_at IS NULL
      AND p.deleted_at IS NULL
      ${!isPlatformOwner && actor.agencyId ? Prisma.sql`AND c.agency_id = ${actor.agencyId}::uuid` : Prisma.empty}
      ${statusFilter}
      ${companyFilter}
      ORDER BY
        CASE
          WHEN p.status = 'paid' AND p.paid_at IS NOT NULL THEN p.paid_at
          ELSE p.due_date::timestamp
        END DESC,
        p.created_at DESC
      OFFSET ${pagination.skip}
      LIMIT ${pagination.take}
    `),
    prisma.payment.count({ where }),
  ]);

  return {
    payments: payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      dueDate: payment.dueDate,
      paidAt: payment.paidAt,
      periodStart: payment.periodStart,
      periodEnd: payment.periodEnd,
      createdAt: payment.createdAt,
      company: {
        id: payment.companyId,
        name: payment.companyName,
      },
    })),
    meta: createPaginationMeta(total, pagination),
  };
}

export async function listByCompany(companyId: string, actor: ActorContext, query: PaymentsListQuery) {
  // Admin/Owner her zaman erişir
  const isAdmin = actor.role === UserRole.PLATFORM_OWNER || actor.agencyRole === 'agency_admin';
  if (!isAdmin) {
    // Sadece operasyonel rolleri olan (editor/designer) kullanıcılar ödeme göremez
    const roles = actor.companyRoles ?? [];
    const hasOnlyOperationalRoles = roles.length > 0 && roles.every(r => r === CompanyRole.EDITOR || r === CompanyRole.DESIGNER);
    if (hasOnlyOperationalRoles) {
      throw new ForbiddenError('Ödemeleri görüntüleme yetkiniz yok.');
    }
  }
  
  // They must have access to the company
  await assertCompanyAccess(companyId, actor);

  const pagination = parsePagination(query);

  const where: Prisma.PaymentWhereInput = { companyId, deletedAt: null };
  if (query.status) where.status = query.status;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.payment.count({ where }),
  ]);

  return { payments, meta: createPaginationMeta(total, pagination) };
}

export async function create(companyId: string, data: CreatePaymentInput, actor: ActorContext) {
  if (actor.role !== UserRole.PLATFORM_OWNER && actor.agencyRole !== 'agency_admin') {
    throw new ForbiddenError('Ödeme kaydı oluşturma yetkiniz yok.');
  }

  await assertCompanyAccess(companyId, actor);

  const payment = await prisma.payment.create({
    data: {
      companyId,
      amount: data.amount,
      currency: data.currency,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      dueDate: data.dueDate,
      notes: data.notes,
      createdById: actor.userId,
    },
  });

  await logActivity(actor, {
    action: ActivityAction.PAYMENT_CREATE,
    companyId,
    resourceType: 'payment',
    resourceId: payment.id,
  });

  return payment;
}

export async function update(paymentId: string, data: UpdatePaymentInput, actor: ActorContext) {
  if (actor.role !== UserRole.PLATFORM_OWNER && actor.agencyRole !== 'agency_admin') {
    throw new ForbiddenError('Ödeme kaydı güncelleme yetkiniz yok.');
  }

  const payment = await prisma.payment.findFirst({ where: { id: paymentId, deletedAt: null } });
  if (!payment) throw new NotFoundError('Ödeme bulunamadı.');

  await assertCompanyAccess(payment.companyId, actor);

  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data,
  });

  await logActivity(actor, {
    action: ActivityAction.PAYMENT_UPDATE,
    companyId: updated.companyId,
    resourceType: 'payment',
    resourceId: updated.id,
  });

  return updated;
}

export async function changeStatus(paymentId: string, data: ChangePaymentStatusInput, actor: ActorContext) {
  if (actor.role !== UserRole.PLATFORM_OWNER && actor.agencyRole !== 'agency_admin') {
    throw new ForbiddenError('Ödeme durumu değiştirme yetkiniz yok.');
  }

  const payment = await prisma.payment.findFirst({ where: { id: paymentId, deletedAt: null } });
  if (!payment) throw new NotFoundError('Ödeme bulunamadı.');

  await assertCompanyAccess(payment.companyId, actor);

  const updateData: Prisma.PaymentUpdateInput = { status: data.status };
  
  if (data.status === 'paid') {
    updateData.paidAt = data.paidAt || new Date();
  } else {
    updateData.paidAt = null;
  }

  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: updateData,
  });

  await logActivity(actor, {
    action: ActivityAction.PAYMENT_STATUS_CHANGE,
    companyId: updated.companyId,
    resourceType: 'payment',
    resourceId: updated.id,
    details: { oldStatus: payment.status, newStatus: updated.status }
  });

  return updated;
}

export async function softDelete(paymentId: string, actor: ActorContext) {
  if (actor.role !== UserRole.PLATFORM_OWNER && actor.agencyRole !== 'agency_admin') {
    throw new ForbiddenError('Ödeme silme yetkiniz yok.');
  }

  const payment = await prisma.payment.findFirst({ where: { id: paymentId, deletedAt: null } });
  if (!payment) throw new NotFoundError('Ödeme bulunamadı.');

  await assertCompanyAccess(payment.companyId, actor);

  await prisma.payment.update({
    where: { id: paymentId },
    data: { deletedAt: new Date() },
  });

  await logActivity(actor, {
    action: ActivityAction.PAYMENT_DELETE,
    companyId: payment.companyId,
    resourceType: 'payment',
    resourceId: payment.id,
  });

  return { message: 'Ödeme kaydı silindi.' };
}
