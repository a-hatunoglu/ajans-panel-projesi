import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { agencyScope } from '../../middleware/agency-scope';
import { UserRole, AgencyRole } from '../../shared/types/enums';
import {
  inviteUserSchema,
  updateMeSchema,
  changePasswordSchema,
  updateUserSchema,
  userIdParamSchema,
} from './users.schema';
import * as usersController from './users.controller';

const router = Router();

// Tüm users route'ları auth gerektirir
router.use(authenticate);
router.use(agencyScope());

// ─── Profil (Kendi) ──────────────────────────────────────────

// GET /users/me — Kendi profilim
router.get('/me', usersController.getMe);

// PUT /users/me — Profilimi güncelle
router.put('/me', validate({ body: updateMeSchema }), usersController.updateMe);

// PUT /users/me/password — Şifremi değiştir
router.put('/me/password', validate({ body: changePasswordSchema }), usersController.changePassword);

// PUT /users/me/onboarding-complete — Onboarding turunu tamamla
router.put('/me/onboarding-complete', usersController.completeOnboarding);

// ─── Yönetim (Platform Owner, Agency Admin) ──────────────────

// POST /users/invite — Kullanıcı davet et
router.post(
  '/invite',
  authorize(UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN),
  validate({ body: inviteUserSchema }),
  usersController.inviteUser,
);

// GET /users — Kullanıcı listesi
router.get(
  '/',
  authorize(UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN),
  usersController.listUsers,
);

// GET /users/:id — Kullanıcı detay
router.get(
  '/:id',
  authorize(UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN),
  validate({ params: userIdParamSchema }),
  usersController.getUserById,
);

// PUT /users/:id — Kullanıcı düzenle
router.put(
  '/:id',
  authorize(UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN),
  validate({ params: userIdParamSchema, body: updateUserSchema }),
  usersController.updateUser,
);

// PUT /users/:id/deactivate — Devre dışı bırak
router.put(
  '/:id/deactivate',
  authorize(UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN),
  validate({ params: userIdParamSchema }),
  usersController.deactivateUser,
);

// POST /users/:id/reset-password — Şifre sıfırlama linki gönder
router.post(
  '/:id/reset-password',
  authorize(UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN),
  validate({ params: userIdParamSchema }),
  usersController.sendResetLink,
);

export { router as userRoutes };
