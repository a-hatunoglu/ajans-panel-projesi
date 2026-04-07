import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { companyAccess } from '../../middleware/company-access';
import { UserRole } from '../../shared/types/enums';
import {
  createSocialAccountSchema,
  updateSocialAccountSchema,
  socialAccountIdParamSchema,
  companyIdParamSchema,
} from './social-accounts.schema';
import * as socialAccountsController from './social-accounts.controller';

// ─── Company-Scoped Routes (/companies/:id/social-accounts) ─

const companyRouter = Router({ mergeParams: true });
companyRouter.use(authenticate);

// GET /companies/:id/social-accounts — Şirketin hesaplarını listele
companyRouter.get(
  '/',
  validate({ params: companyIdParamSchema }),
  companyAccess(),
  socialAccountsController.listByCompany,
);

// POST /companies/:id/social-accounts — Yeni hesap ekle
companyRouter.post(
  '/',
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR),
  validate({ params: companyIdParamSchema, body: createSocialAccountSchema }),
  companyAccess(),
  socialAccountsController.create,
);

// ─── Direct Routes (/social-accounts/:id) ────────────────────

const directRouter = Router();
directRouter.use(authenticate);

// GET /social-accounts/:id — Hesap detay
directRouter.get(
  '/:id',
  validate({ params: socialAccountIdParamSchema }),
  socialAccountsController.getById,
);

// PUT /social-accounts/:id — Hesap güncelle
directRouter.put(
  '/:id',
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR),
  validate({ params: socialAccountIdParamSchema, body: updateSocialAccountSchema }),
  socialAccountsController.update,
);

// DELETE /social-accounts/:id — Soft delete
directRouter.delete(
  '/:id',
  authorize(UserRole.OWNER, UserRole.ADMIN),
  validate({ params: socialAccountIdParamSchema }),
  socialAccountsController.softDelete,
);

export { companyRouter as socialAccountCompanyRoutes, directRouter as socialAccountDirectRoutes };
