import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { agencyScope } from '../../middleware/agency-scope';
import { validate } from '../../middleware/validate';
import { UserRole, AgencyRole } from '../../shared/types/enums';
import {
  createAgencySchema,
  updateAgencySchema,
  agencyIdParamSchema,
  addAgencyUserSchema,
  agencyUserParamsSchema,
  updateAgencyUserRoleSchema,
} from './agencies.schema';
import * as agenciesController from './agencies.controller';

const router = Router();

// All routes require auth + agency scope
router.use(authenticate);
router.use(agencyScope());

// GET /agencies — List all agencies (platform owner only)
router.get(
  '/',
  authorize(UserRole.PLATFORM_OWNER),
  agenciesController.listAgencies,
);

// POST /agencies — Create a new agency (platform owner only)
router.post(
  '/',
  authorize(UserRole.PLATFORM_OWNER),
  validate({ body: createAgencySchema }),
  agenciesController.createAgency,
);

// GET /agencies/:id — Agency detail (platform_owner OR agency_admin of that agency)
router.get(
  '/:id',
  authorize(UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN),
  validate({ params: agencyIdParamSchema }),
  agenciesController.getAgency,
);

// PUT /agencies/:id — Update agency (platform owner only)
router.put(
  '/:id',
  authorize(UserRole.PLATFORM_OWNER),
  validate({ params: agencyIdParamSchema, body: updateAgencySchema }),
  agenciesController.updateAgency,
);

// DELETE /agencies/:id — Soft delete (platform owner only)
router.delete(
  '/:id',
  authorize(UserRole.PLATFORM_OWNER),
  validate({ params: agencyIdParamSchema }),
  agenciesController.deleteAgency,
);

// PUT /agencies/:id/restore — Restore from trash (platform owner only)
router.put(
  '/:id/restore',
  authorize(UserRole.PLATFORM_OWNER),
  validate({ params: agencyIdParamSchema }),
  agenciesController.restoreAgency,
);

// POST /agencies/:id/users — Add user to agency (platform_owner OR agency_admin)
router.post(
  '/:id/users',
  authorize(UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN),
  validate({ params: agencyIdParamSchema, body: addAgencyUserSchema }),
  agenciesController.addAgencyUser,
);

// PUT /agencies/:id/users/:userId — Update agency user role
router.put(
  '/:id/users/:userId',
  authorize(UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN),
  validate({ params: agencyUserParamsSchema, body: updateAgencyUserRoleSchema }),
  agenciesController.updateAgencyUserRole,
);

// DELETE /agencies/:id/users/:userId — Remove user from agency
router.delete(
  '/:id/users/:userId',
  authorize(UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN),
  validate({ params: agencyUserParamsSchema }),
  agenciesController.removeAgencyUser,
);

export { router as agencyRoutes };
