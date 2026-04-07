import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { companyAccess, deletedCompanyAccess } from '../../middleware/company-access';
import { UserRole } from '../../shared/types/enums';
import {
  createCompanySchema,
  updateCompanySchema,
  companyIdParamSchema,
  addCompanyUserSchema,
  companyUserParamsSchema,
} from './companies.schema';
import * as companiesController from './companies.controller';

const router = Router();

// Tüm route'lar auth gerektirir
router.use(authenticate);

// ─── Çöp Kutusu (⚠️ :id route'larından ÖNCE) ────────────────

// GET /companies/trash — Silinmiş şirketleri listele
router.get(
  '/trash',
  authorize(UserRole.OWNER, UserRole.ADMIN),
  companiesController.listTrash,
);

// ─── Şirket CRUD ─────────────────────────────────────────────

// GET /companies — Şirketleri listele
router.get('/', companiesController.listCompanies);

// POST /companies — Yeni şirket oluştur
router.post(
  '/',
  authorize(UserRole.OWNER, UserRole.ADMIN),
  validate({ body: createCompanySchema }),
  companiesController.createCompany,
);

// GET /companies/:id — Şirket detayı
router.get(
  '/:id',
  validate({ params: companyIdParamSchema }),
  companyAccess(),
  companiesController.getCompany,
);

// PUT /companies/:id — Şirket güncelle
router.put(
  '/:id',
  authorize(UserRole.OWNER, UserRole.ADMIN),
  validate({ params: companyIdParamSchema, body: updateCompanySchema }),
  companiesController.updateCompany,
);

// DELETE /companies/:id — Soft delete (çöp kutusuna taşı)
router.delete(
  '/:id',
  authorize(UserRole.OWNER, UserRole.ADMIN),
  validate({ params: companyIdParamSchema }),
  companiesController.softDeleteCompany,
);

// POST /companies/:id/restore — Geri yükle
router.post(
  '/:id/restore',
  authorize(UserRole.OWNER, UserRole.ADMIN),
  validate({ params: companyIdParamSchema }),
  deletedCompanyAccess(),
  companiesController.restoreCompany,
);

// DELETE /companies/:id/permanent — Kalıcı sil (sadece Owner)
router.delete(
  '/:id/permanent',
  authorize(UserRole.OWNER),
  validate({ params: companyIdParamSchema }),
  deletedCompanyAccess(),
  companiesController.permanentDeleteCompany,
);

// ─── Şirket Kullanıcıları ────────────────────────────────────

// GET /companies/:id/users — Şirket kullanıcılarını listele
router.get(
  '/:id/users',
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR, UserRole.DESIGNER),
  validate({ params: companyIdParamSchema }),
  companyAccess(),
  companiesController.listCompanyUsers,
);

// POST /companies/:id/users — Kullanıcı ekle
router.post(
  '/:id/users',
  authorize(UserRole.OWNER, UserRole.ADMIN),
  validate({ params: companyIdParamSchema, body: addCompanyUserSchema }),
  companyAccess(),
  companiesController.addCompanyUser,
);

// DELETE /companies/:id/users/:userId — Kullanıcı çıkar
router.delete(
  '/:id/users/:userId',
  authorize(UserRole.OWNER, UserRole.ADMIN),
  validate({ params: companyUserParamsSchema }),
  companyAccess(),
  companiesController.removeCompanyUser,
);

export { router as companyRoutes };
