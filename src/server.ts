import { app } from './app';
import { env } from './config';
import { logger } from './config/logger';
import { disconnectDatabase } from './config/database';
import { startJobs } from './jobs';
import { initSocketServer } from './config/socket';

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Sunucu ${env.NODE_ENV} modunda çalışıyor: http://localhost:${env.PORT}`);
  logger.info(`📡 API: http://localhost:${env.PORT}${env.API_PREFIX}`);
  logger.info(`❤️  Health: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
  startJobs();
});

// Initialize Socket.io
initSocketServer(server);

// ─── Graceful Shutdown ───────────────────────────────────────

async function shutdown(signal: string) {
  logger.info(`${signal} sinyali alındı. Sunucu kapatılıyor...`);

  server.close(async () => {
    await disconnectDatabase();
    logger.info('Sunucu kapatıldı.');
    process.exit(0);
  });

  // 10 saniye içinde kapanmazsa zorla kapat
  setTimeout(() => {
    logger.error('Sunucu zamanında kapatılamadı, zorla kapatılıyor.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Yakalanmamış Promise rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Yakalanmamış exception:', err);
  process.exit(1);
});
