import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { ForbiddenError, NotFoundError } from '../../shared/errors/app-error';
import { UserRole } from '../../shared/types/enums';
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
  if (actor.role !== UserRole.OWNER && actor.role !== UserRole.ADMIN) {
    throw new ForbiddenError('Ödemeleri görüntüleme yetkiniz yok.');
  }

  const pagination = parsePagination(query);
  const where: Prisma.PaymentWhereInput = {
    company: {
      is: {
        deletedAt: null,
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
  if (actor.role === UserRole.EDITOR || actor.role === UserRole.DESIGNER) {
    throw new ForbiddenError('Ödemeleri görüntüleme yetkiniz yok.');
  }
  
  // They must have access to the company
  await assertCompanyAccess(companyId, actor);

  const pagination = parsePagination(query);

  const where: Prisma.PaymentWhereInput = { companyId };
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
  if (actor.role !== UserRole.OWNER && actor.role !== UserRole.ADMIN) {
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
  if (actor.role !== UserRole.OWNER && actor.role !== UserRole.ADMIN) {
    throw new ForbiddenError('Ödeme kaydı güncelleme yetkiniz yok.');
  }

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
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
  if (actor.role !== UserRole.OWNER && actor.role !== UserRole.ADMIN) {
    throw new ForbiddenError('Ödeme durumu değiştirme yetkiniz yok.');
  }

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
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

export async function hardDelete(paymentId: string, actor: ActorContext) {
  if (actor.role !== UserRole.OWNER) {
    throw new ForbiddenError('Kalıcı silme işlemini sadece Owner yapabilir.');
  }

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new NotFoundError('Ödeme bulunamadı.');

  await prisma.payment.delete({
    where: { id: paymentId }
  });

  // Log activity safely because we don't have constraints breaking this log
  await logActivity(actor, {
    action: ActivityAction.PAYMENT_DELETE,
    companyId: payment.companyId,
    resourceType: 'payment',
    resourceId: payment.id,
  });

  return { message: 'Ödeme kaydı kalıcı olarak silindi.' };
}
