import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { UserRole } from '../../shared/types/enums';
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

// GET /payments
directPaymentsRouter.get(
  '/',
  authorize(UserRole.OWNER, UserRole.ADMIN),
  validate({ query: paymentsListQuerySchema }),
  paymentsController.listGlobal
);

// PUT /payments/:id
directPaymentsRouter.put(
  '/:id',
  validate({ params: paymentIdParamSchema, body: updatePaymentSchema }),
  paymentsController.update
);

// PUT /payments/:id/status
directPaymentsRouter.put(
  '/:id/status',
  validate({ params: paymentIdParamSchema, body: changePaymentStatusSchema }),
  paymentsController.changeStatus
);

// DELETE /payments/:id
directPaymentsRouter.delete(
  '/:id',
  validate({ params: paymentIdParamSchema }),
  paymentsController.hardDelete
);
