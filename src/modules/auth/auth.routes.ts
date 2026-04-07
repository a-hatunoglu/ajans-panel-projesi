import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authRateLimiter } from '../../middleware/rate-limit';
import { registerSchema, loginSchema, acceptInviteSchema, resetPasswordSchema } from './auth.schema';
import * as authController from './auth.controller';

const router = Router();

// POST /auth/register - Ilk Owner kaydi (public, rate limited)
router.post(
  '/register',
  authRateLimiter,
  validate({ body: registerSchema }),
  authController.register,
);

// POST /auth/login - Giris (public, rate limited)
router.post(
  '/login',
  authRateLimiter,
  validate({ body: loginSchema }),
  authController.login,
);

// POST /auth/refresh - Token yenileme (public, cookie'den refresh token)
router.post('/refresh', authController.refresh);

// POST /auth/logout - Cikis (cookie tabanli, idempotent)
router.post('/logout', authController.logout);

// POST /auth/accept-invite - Davet kabul (public)
router.post(
  '/accept-invite',
  validate({ body: acceptInviteSchema }),
  authController.acceptInvite,
);

// POST /auth/reset-password - Sifre sifirlama (public, token ile)
router.post(
  '/reset-password',
  validate({ body: resetPasswordSchema }),
  authController.resetPassword,
);

export { router as authRoutes };
