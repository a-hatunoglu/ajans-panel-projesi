import { cleanupTrashJob } from './cleanup-trash';
import { checkOverdueJob } from './check-overdue';
import { logger } from '../config/logger';

export function startJobs() {
  logger.info('Background jobs initiated.');
  
  // Her 1 saatte bir overdue check
  setInterval(() => {
    checkOverdueJob();
  }, 1000 * 60 * 60);

  // Her 24 saatte bir trash cleanup
  setInterval(() => {
    cleanupTrashJob();
  }, 1000 * 60 * 60 * 24);

  // Application ayaklanınca kısa süre sonra ikisini birden işletelim.
  setTimeout(() => {
    logger.info('[JOBS] Starting background jobs...');
    checkOverdueJob();
    cleanupTrashJob();
  }, 30000);
}

export { cleanupTrashJob, checkOverdueJob };
