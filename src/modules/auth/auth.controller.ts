import { Request, Response, NextFunction, CookieOptions } from 'express';
import { env } from '../../config';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  ACCESS_TOKEN_TTL_MS,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_TTL_MS,
} from '../../shared/utils/token';
import * as authService from './auth.service';

const BASE_COOKIE_OPTIONS: Pick<CookieOptions, 'httpOnly' | 'secure' | 'sameSite'> = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

const ACCESS_COOKIE_OPTIONS: CookieOptions = {
  ...BASE_COOKIE_OPTIONS,
  path: env.API_PREFIX,
  maxAge: ACCESS_TOKEN_TTL_MS,
};

const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  ...BASE_COOKIE_OPTIONS,
  path: `${env.API_PREFIX}/auth`,
  maxAge: REFRESH_TOKEN_TTL_MS,
};

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    res.cookie(ACCESS_TOKEN_COOKIE_NAME, result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const rawToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
    if (!rawToken) {
      res.status(401).json({
        success: false,
        error: { code: 'NO_REFRESH_TOKEN', message: 'Refresh token bulunamadı.', details: [] },
      });
      return;
    }

    const result = await authService.refreshAccessToken(rawToken, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    res.cookie(ACCESS_TOKEN_COOKIE_NAME, result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({
      success: true,
      data: { accessToken: result.accessToken },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const rawToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
    await authService.logout(rawToken);

    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, {
      ...BASE_COOKIE_OPTIONS,
      path: env.API_PREFIX,
    });
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      ...BASE_COOKIE_OPTIONS,
      path: `${env.API_PREFIX}/auth`,
    });

    res.json({ success: true, data: { message: 'Çıkış yapıldı.' } });
  } catch (err) {
    next(err);
  }
}

export async function acceptInvite(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.acceptInvite(req.body);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.resetPassword(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
