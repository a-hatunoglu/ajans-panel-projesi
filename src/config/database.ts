import { PrismaClient } from '@prisma/client';
import { env } from './index';
import { logger } from './logger';

const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development'
    ? [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ]
    : [{ emit: 'event', level: 'error' }],
});

if (env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug(`Prisma Query: ${e.query} — ${e.duration}ms`);
  });
}

prisma.$on('error', (e) => {
  logger.error(`Prisma Error: ${e.message}`);
});

export { prisma };

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Veritabanı bağlantısı kapatıldı.');
}
