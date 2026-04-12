import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config';
import { requestLogger } from './middleware/request-logger';
import { globalRateLimiter } from './middleware/rate-limit';
import { errorHandler } from './middleware/error-handler';
import { NotFoundError } from './shared/errors/app-error';

// Route imports
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/users/users.routes';
import { companyRoutes } from './modules/companies/companies.routes';
import { socialAccountCompanyRoutes, socialAccountDirectRoutes } from './modules/social-accounts/social-accounts.routes';
import { contentCompanyRoutes, contentDirectRoutes } from './modules/contents/contents.routes';
import { notificationsRoutes } from './modules/notifications/notifications.routes';
import { companyPaymentsRouter, directPaymentsRouter } from './modules/payments/payments.routes';
import activityLogsRoutes from './modules/activity-logs/activity-logs.routes';
import * as activityLogsController from './modules/activity-logs/activity-logs.controller';
import { authenticate } from './middleware/authenticate';

const app = express();

// ─── Global Middleware ───────────────────────────────────────

// Trust the first proxy (Render, Vercel, etc.) so X-Forwarded-For
// is used for req.ip. Required for express-rate-limit behind a reverse proxy.
app.set('trust proxy', 1);

// Güvenlik başlıkları
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
  }),
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parsing (refresh token için)
app.use(cookieParser());

// İstek loglama
app.use(requestLogger);

// Rate limiting
app.use(globalRateLimiter);

// ─── Routes ──────────────────────────────────────────────────

// Health check
app.get(`${env.API_PREFIX}/health`, (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
    },
  });
});

// Modül route'ları
app.use(`${env.API_PREFIX}/auth`, authRoutes);
app.use(`${env.API_PREFIX}/users`, userRoutes);
app.use(`${env.API_PREFIX}/companies`, companyRoutes);
app.use(`${env.API_PREFIX}/companies/:id/social-accounts`, socialAccountCompanyRoutes);
app.use(`${env.API_PREFIX}/social-accounts`, socialAccountDirectRoutes);
app.use(`${env.API_PREFIX}/companies/:companyId/contents`, contentCompanyRoutes);
app.use(`${env.API_PREFIX}/contents`, contentDirectRoutes);
app.use(`${env.API_PREFIX}/notifications`, notificationsRoutes);
app.use(`${env.API_PREFIX}/companies/:companyId/payments`, companyPaymentsRouter);
app.use(`${env.API_PREFIX}/payments`, directPaymentsRouter);
app.use(`${env.API_PREFIX}/activity-logs`, activityLogsRoutes);
app.get(`${env.API_PREFIX}/companies/:companyId/activity-logs`, authenticate, activityLogsController.listByCompany);

// ─── 404 Handler ─────────────────────────────────────────────
app.use((_req, _res, next) => {
  next(new NotFoundError('İstenen kaynak bulunamadı.'));
});

// ─── Global Error Handler ────────────────────────────────────
app.use(errorHandler);

export { app };
