import { prisma } from '../config/database';
import { logger } from '../config/logger';

export async function checkOverdueJob() {
  logger.info('[JOB] checkOverdueJob started');
  try {
    const now = new Date();

    const result = await prisma.payment.updateMany({
      where: {
        status: 'pending',
        dueDate: { lt: now },
      },
      data: {
        status: 'overdue',
      },
    });
    logger.info(`[JOB] checkOverdueJob marked ${result.count} payments as overdue.`);
  } catch (err) {
    logger.error('[JOB] checkOverdueJob failed:', err);
  }
}
