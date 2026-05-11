import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { agencyScope } from '../../middleware/agency-scope';
import { validate } from '../../middleware/validate';
import * as notificationsController from './notifications.controller';
import { listNotificationsQuerySchema, notificationIdParamSchema } from './notifications.schema';

const router = Router();

// Tüm rotalar giriş + agency scope gerektirir
router.use(authenticate);
router.use(agencyScope());

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
