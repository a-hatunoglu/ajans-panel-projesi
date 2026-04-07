import { prisma } from '../config/database';
import { logger } from '../config/logger';

export async function cleanupTrashJob() {
  logger.info('[JOB] cleanupTrashJob started');
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldCompanies = await prisma.company.findMany({
      where: {
        deletedAt: {
          lte: thirtyDaysAgo,
          not: null, // Just to be safe
        },
      },
      select: { id: true }
    });

    if (oldCompanies.length === 0) {
      logger.info('[JOB] cleanupTrashJob: No companies to delete.');
      return;
    }

    const ids = oldCompanies.map((c) => c.id);

    // Hard delete
    const result = await prisma.company.deleteMany({
      where: { id: { in: ids } },
    });

    logger.info(`[JOB] cleanupTrashJob deleted ${result.count} companies permanently.`);
  } catch (err) {
    logger.error('[JOB] cleanupTrashJob failed:', err);
  }
}
