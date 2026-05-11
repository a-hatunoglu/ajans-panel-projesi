import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { agencyScope } from '../../middleware/agency-scope';
import { UserRole, AgencyRole } from '../../shared/types/enums';
import * as activityLogsController from './activity-logs.controller';
import { listActivityLogsQuerySchema } from './activity-logs.schema';

const router = Router();
router.use(authenticate);
router.use(agencyScope());

// GET /activity-logs/me
router.get(
  '/me',
  validate({ query: listActivityLogsQuerySchema }),
  activityLogsController.listMe
);

// GET /activity-logs
router.get(
  '/',
  authorize(UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN),
  validate({ query: listActivityLogsQuerySchema }),
  activityLogsController.listGlobal
);

// We will export the controller explicitly so app.ts or companies.routes.ts can mount
// /companies/:companyId/activity-logs. In this implementation we will mount it in app.ts.

export default router;
