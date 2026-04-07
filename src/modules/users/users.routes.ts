import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { UserRole } from '../../shared/types/enums';
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

// ─── Profil (Kendi) ──────────────────────────────────────────

// GET /users/me — Kendi profilim
router.get('/me', usersController.getMe);

// PUT /users/me — Profilimi güncelle
router.put('/me', validate({ body: updateMeSchema }), usersController.updateMe);

// PUT /users/me/password — Şifremi değiştir
router.put('/me/password', validate({ body: changePasswordSchema }), usersController.changePassword);

// ─── Yönetim (Owner, Admin) ─────────────────────────────────

// POST /users/invite — Kullanıcı davet et
router.post(
  '/invite',
  authorize(UserRole.OWNER, UserRole.ADMIN),
  validate({ body: inviteUserSchema }),
  usersController.inviteUser,
);

// GET /users — Kullanıcı listesi
router.get(
  '/',
  authorize(UserRole.OWNER, UserRole.ADMIN),
  usersController.listUsers,
);

// GET /users/:id — Kullanıcı detay
router.get(
  '/:id',
  authorize(UserRole.OWNER, UserRole.ADMIN),
  validate({ params: userIdParamSchema }),
  usersController.getUserById,
);

// PUT /users/:id — Kullanıcı düzenle
router.put(
  '/:id',
  authorize(UserRole.OWNER, UserRole.ADMIN),
  validate({ params: userIdParamSchema, body: updateUserSchema }),
  usersController.updateUser,
);

// PUT /users/:id/deactivate — Devre dışı bırak
router.put(
  '/:id/deactivate',
  authorize(UserRole.OWNER, UserRole.ADMIN),
  validate({ params: userIdParamSchema }),
  usersController.deactivateUser,
);

// POST /users/:id/reset-password — Şifre sıfırlama linki gönder
router.post(
  '/:id/reset-password',
  authorize(UserRole.OWNER, UserRole.ADMIN),
  validate({ params: userIdParamSchema }),
  usersController.sendResetLink,
);

export { router as userRoutes };
