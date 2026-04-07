import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import * as notificationsController from './notifications.controller';
import { listNotificationsQuerySchema, notificationIdParamSchema } from './notifications.schema';

const router = Router();

// Tüm rotalar giriş gerektirir
router.use(authenticate);

// GET /api/v1/notifications/unread-count
router.get('/unread-count', notificationsController.getUnreadCount);

// GET /api/v1/notifications
router.get(
  '/',
  validate({ query: listNotificationsQuerySchema }),
  notificationsController.list,
);

// PUT /api/v1/notifications/read-all
router.put('/read-all', notificationsController.markAllAsRead);

// PUT /api/v1/notifications/:id/read
router.put(
  '/:id/read',
  validate({ params: notificationIdParamSchema }),
  notificationsController.markAsRead,
);

export const notificationsRoutes = router;
