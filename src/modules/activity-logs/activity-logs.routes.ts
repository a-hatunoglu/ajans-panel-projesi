import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import * as activityLogsController from './activity-logs.controller';
import { listActivityLogsQuerySchema } from './activity-logs.schema';

const router = Router();
router.use(authenticate);

// GET /activity-logs/me
router.get(
  '/me',
  validate({ query: listActivityLogsQuerySchema }),
  activityLogsController.listMe
);

// GET /activity-logs
router.get(
  '/',
  validate({ query: listActivityLogsQuerySchema }),
  activityLogsController.listGlobal
);

// We will export the controller explicitly so app.ts or companies.routes.ts can mount
// /companies/:companyId/activity-logs. In this implementation we will mount it in app.ts.

export default router;
