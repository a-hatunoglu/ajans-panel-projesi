import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as systemHealthController from './system-health.controller';

const router = Router();

// All routes require authentication (role check is in the service layer)
router.use(authenticate);

// GET /api/v1/system/health?refresh=true  → Full scan (owner/admin only)
router.get('/', systemHealthController.getFullReport);

// GET /api/v1/system/health/counts → Quick registry counts (owner/admin only)
router.get('/counts', systemHealthController.getRegistryCounts);

export { router as systemHealthRoutes };
