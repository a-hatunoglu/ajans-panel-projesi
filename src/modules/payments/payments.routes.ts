import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { agencyScope } from '../../middleware/agency-scope';
import { companyAccess } from '../../middleware/company-access';
import { UserRole, AgencyRole } from '../../shared/types/enums';
import * as paymentsController from './payments.controller';
import { 
  paymentCompanyIdParamSchema, 
  paymentIdParamSchema, 
  createPaymentSchema, 
  updatePaymentSchema, 
  changePaymentStatusSchema,
  paymentsListQuerySchema,
} from './payments.schema';

// 1. Company scope routes (/companies/:companyId/payments)
export const companyPaymentsRouter = Router({ mergeParams: true });
companyPaymentsRouter.use(authenticate);
companyPaymentsRouter.use(agencyScope());
companyPaymentsRouter.use(companyAccess('companyId'));

// GET /companies/:companyId/payments
companyPaymentsRouter.get(
  '/',
  validate({ params: paymentCompanyIdParamSchema }),
  paymentsController.listByCompany
);

// POST /companies/:companyId/payments
companyPaymentsRouter.post(
  '/',
  validate({ params: paymentCompanyIdParamSchema, body: createPaymentSchema }),
  paymentsController.create
);

// 2. Direct routes (/payments)
export const directPaymentsRouter = Router();
directPaymentsRouter.use(authenticate);
directPaymentsRouter.use(agencyScope());

// GET /payments
directPaymentsRouter.get(
  '/',
  authorize(UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN),
  validate({ query: paymentsListQuerySchema }),
  paymentsController.listGlobal
);

// PUT /payments/:id
directPaymentsRouter.put(
  '/:id',
  authorize(UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN),
  validate({ params: paymentIdParamSchema, body: updatePaymentSchema }),
  paymentsController.update
);

// PUT /payments/:id/status
directPaymentsRouter.put(
  '/:id/status',
  authorize(UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN),
  validate({ params: paymentIdParamSchema, body: changePaymentStatusSchema }),
  paymentsController.changeStatus
);

// DELETE /payments/:id (soft delete)
directPaymentsRouter.delete(
  '/:id',
  authorize(UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN),
  validate({ params: paymentIdParamSchema }),
  paymentsController.softDelete
);
