/**
 * Database Integrity Checker
 *
 * Runs lightweight Prisma count queries to detect orphan records,
 * status inconsistencies, and FK reference issues.
 */

import { prisma } from '../../../config/database';
import type { HealthSeverity } from './api-probe';

export type DbIntegrityResult = {
  id: string;
  name: string;
  model: string;
  severity: HealthSeverity;
  message: string;
  count: number | null;
};

async function safeCount(label: string, fn: () => Promise<DbIntegrityResult>): Promise<DbIntegrityResult> {
  try {
    return await fn();
  } catch (error) {
    return {
      id: `db-error-${label}`,
      name: label,
      model: 'unknown',
      severity: 'critical',
      message: `Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      count: null,
    };
  }
}

/**
 * Run all database integrity checks.
 */
export async function runDbIntegrityChecks(): Promise<DbIntegrityResult[]> {
  const checks = await Promise.allSettled([
    // ─── User Stats ────────────────────────────────────────
    safeCount('user-count', async () => {
      const total = await prisma.user.count();
      const active = await prisma.user.count({ where: { deletedAt: null } });
      return {
        id: 'db-user-count',
        name: 'User Count',
        model: 'User',
        severity: 'healthy' as HealthSeverity,
        message: `${active} active / ${total} total`,
        count: active,
      };
    }),

    // ─── Orphan Companies (no members) ─────────────────────
    safeCount('orphan-companies', async () => {
      const orphans = await prisma.company.count({
        where: {
          deletedAt: null,
          companyUsers: { none: {} },
        },
      });
      return {
        id: 'db-orphan-companies',
        name: 'Orphan Companies',
        model: 'Company',
        severity: orphans > 0 ? 'warning' as HealthSeverity : 'healthy' as HealthSeverity,
        message: orphans > 0 ? `${orphans} company has no members` : 'All companies have members',
        count: orphans,
      };
    }),

    // ─── Content: scheduled but no scheduledAt ─────────────
    safeCount('content-schedule-mismatch', async () => {
      const mismatched = await prisma.content.count({
        where: {
          deletedAt: null,
          status: 'scheduled',
          scheduledAt: null,
        },
      });
      return {
        id: 'db-content-schedule-mismatch',
        name: 'Scheduled without date',
        model: 'Content',
        severity: mismatched > 0 ? 'warning' as HealthSeverity : 'healthy' as HealthSeverity,
        message: mismatched > 0 ? `${mismatched} contents have status=scheduled but scheduledAt=null` : 'All scheduled contents have dates',
        count: mismatched,
      };
    }),

    // ─── Content: published but no publishedAt ─────────────
    safeCount('content-publish-mismatch', async () => {
      const mismatched = await prisma.content.count({
        where: {
          deletedAt: null,
          status: 'published',
          publishedAt: null,
        },
      });
      return {
        id: 'db-content-publish-mismatch',
        name: 'Published without date',
        model: 'Content',
        severity: mismatched > 0 ? 'warning' as HealthSeverity : 'healthy' as HealthSeverity,
        message: mismatched > 0 ? `${mismatched} contents have status=published but publishedAt=null` : 'All published contents have dates',
        count: mismatched,
      };
    }),

    // ─── Orphan SocialAccounts (company deleted) ───────────
    safeCount('orphan-social-accounts', async () => {
      const orphans = await prisma.socialAccount.count({
        where: {
          company: { deletedAt: { not: null } },
        },
      });
      return {
        id: 'db-orphan-social-accounts',
        name: 'Orphan Social Accounts',
        model: 'SocialAccount',
        severity: orphans > 0 ? 'critical' as HealthSeverity : 'healthy' as HealthSeverity,
        message: orphans > 0 ? `${orphans} social accounts belong to deleted companies` : 'All social accounts have valid companies',
        count: orphans,
      };
    }),

    // ─── Content counts by status ──────────────────────────
    safeCount('content-status-summary', async () => {
      const total = await prisma.content.count({ where: { deletedAt: null } });
      return {
        id: 'db-content-total',
        name: 'Content Total',
        model: 'Content',
        severity: 'healthy' as HealthSeverity,
        message: `${total} active contents`,
        count: total,
      };
    }),

    // ─── Company count ─────────────────────────────────────
    safeCount('company-count', async () => {
      const total = await prisma.company.count({ where: { deletedAt: null } });
      return {
        id: 'db-company-count',
        name: 'Company Count',
        model: 'Company',
        severity: 'healthy' as HealthSeverity,
        message: `${total} active companies`,
        count: total,
      };
    }),

    // ─── Payment stats ─────────────────────────────────────
    safeCount('pending-payments', async () => {
      const pending = await prisma.payment.count({ where: { status: 'pending' } });
      const overdue = await prisma.payment.count({
        where: {
          status: 'pending',
          dueDate: { lt: new Date() },
        },
      });
      const severity: HealthSeverity = overdue > 0 ? 'warning' : 'healthy';
      return {
        id: 'db-pending-payments',
        name: 'Pending Payments',
        model: 'Payment',
        severity,
        message: overdue > 0 ? `${pending} pending, ${overdue} overdue` : `${pending} pending, none overdue`,
        count: pending,
      };
    }),

    // ─── Expired refresh tokens ────────────────────────────
    safeCount('expired-tokens', async () => {
      const expired = await prisma.refreshToken.count({
        where: { expiresAt: { lt: new Date() } },
      });
      return {
        id: 'db-expired-tokens',
        name: 'Expired Refresh Tokens',
        model: 'RefreshToken',
        severity: expired > 100 ? 'warning' as HealthSeverity : 'healthy' as HealthSeverity,
        message: `${expired} expired tokens (cleanup recommended if > 100)`,
        count: expired,
      };
    }),

    // ─── Notification delivery ─────────────────────────────
    safeCount('unread-notifications', async () => {
      const unread = await prisma.notification.count({ where: { isRead: false } });
      return {
        id: 'db-unread-notifications',
        name: 'Unread Notifications',
        model: 'Notification',
        severity: 'healthy' as HealthSeverity,
        message: `${unread} unread notifications`,
        count: unread,
      };
    }),
  ]);

  return checks.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      id: `db-check-${index}`,
      name: `Check #${index}`,
      model: 'unknown',
      severity: 'critical' as HealthSeverity,
      message: `Check failed: ${result.reason}`,
      count: null,
    };
  });
}
