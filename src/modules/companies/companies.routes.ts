import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { agencyScope } from '../../middleware/agency-scope';
import { companyAccess, deletedCompanyAccess } from '../../middleware/company-access';
import { UserRole, AgencyRole } from '../../shared/types/enums';
import {
  createCompanySchema,
  updateCompanySchema,
  companyIdParamSchema,
  addCompanyUserSchema,
  companyUserParamsSchema,
  updateCompanyUserRolesSchema,
} from './companies.schema';
import * as companiesController from './companies.controller';

const router = Router();

// Tüm route'lar auth + agency scope gerektirir
router.use(authenticate);
router.use(agencyScope());

// ─── Çöp Kutusu (⚠️ :id route'larından ÖNCE) ────────────────

// GET /companies/trash — Silinmiş şirketleri listele
router.get(
  '/trash',
  authorize(UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN),
  companiesController.listTrash,
);

// ─── Şirket CRUD ─────────────────────────────────────────────

// GET /companies — Şirketleri listele
router.get('/', companiesController.listCompanies);

// POST /companies — Yeni şirket oluştur
router.post(
  '/',
  authorize(UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN),
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

// GET /companies/:id/analytics — Şirket analitiği
router.get(
  '/:id/analytics',
  validate({ params: companyIdParamSchema }),
  companyAccess(),
  companiesController.getCompanyAnalytics,
);

// PUT /companies/:id — Şirket güncelle
router.put(
  '/:id',
  authorize(UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN),
  validate({ params: companyIdParamSchema, body: updateCompanySchema }),
  companiesController.updateCompany,
);

// DELETE /companies/:id — Soft delete (çöp kutusuna taşı)
router.delete(
  '/:id',
  authorize(UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN),
  validate({ params: companyIdParamSchema }),
  companiesController.softDeleteCompany,
);

// POST /companies/:id/restore — Geri yükle
router.post(
  '/:id/restore',
  authorize(UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN),
  validate({ params: companyIdParamSchema }),
  deletedCompanyAccess(),
  companiesController.restoreCompany,
);

// DELETE /companies/:id/permanent — Kalıcı sil (sadece Platform Owner)
router.delete(
  '/:id/permanent',
  authorize(UserRole.PLATFORM_OWNER),
  validate({ params: companyIdParamSchema }),
  deletedCompanyAccess(),
  companiesController.permanentDeleteCompany,
);

// ─── Şirket Kullanıcıları ────────────────────────────────────

// GET /companies/:id/users — Şirket kullanıcılarını listele
router.get(
  '/:id/users',
  validate({ params: companyIdParamSchema }),
  companyAccess(),
  companiesController.listCompanyUsers,
);

// POST /companies/:id/users — Kullanıcı ekle
router.post(
  '/:id/users',
  authorize(UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN),
  validate({ params: companyIdParamSchema, body: addCompanyUserSchema }),
  companyAccess(),
  companiesController.addCompanyUser,
);

// DELETE /companies/:id/users/:userId — Kullanıcı çıkar
router.delete(
  '/:id/users/:userId',
  authorize(UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN),
  validate({ params: companyUserParamsSchema }),
  companyAccess(),
  companiesController.removeCompanyUser,
);

// PUT /companies/:id/users/:userId/roles — Kullanıcı rollerini güncelle
router.put(
  '/:id/users/:userId/roles',
  authorize(UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN),
  validate({ params: companyUserParamsSchema, body: updateCompanyUserRolesSchema }),
  companyAccess(),
  companiesController.updateCompanyUserRoles,
);

export { router as companyRoutes };
