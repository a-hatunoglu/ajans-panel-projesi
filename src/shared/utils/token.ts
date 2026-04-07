import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../config';

/**
 * JWT Token Utility
 *
 * Access token: JWT, kısa ömürlü (15dk), Authorization header ile gönderilir.
 * Refresh token: Random bytes, uzun ömürlü (7 gün), HttpOnly cookie + DB hash.
 *
 * Refresh token'lar veritabanında SHA-256 hash olarak saklanır.
 * Token çalınsa bile DB'deki hash olmadan yenileme yapılamaz.
 * Logout veya token rotation ile eski hash'ler silinir.
 */

interface TokenPayload {
  userId: string;
  role: string;
}

export const ACCESS_TOKEN_COOKIE_NAME = 'access_token';
export const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';

function parseDurationToMs(value: string): number {
  const trimmed = value.trim();
  const match = /^(\d+)(ms|s|m|h|d)?$/i.exec(trimmed);

  if (!match) {
    throw new Error(`JWT_ACCESS_EXPIRES_IN degeri desteklenmiyor: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = (match[2] ?? 'ms').toLowerCase();

  switch (unit) {
    case 'ms':
      return amount;
    case 's':
      return amount * 1000;
    case 'm':
      return amount * 60 * 1000;
    case 'h':
      return amount * 60 * 60 * 1000;
    case 'd':
      return amount * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`JWT_ACCESS_EXPIRES_IN birimi desteklenmiyor: ${value}`);
  }
}

export const ACCESS_TOKEN_TTL_MS = parseDurationToMs(env.JWT_ACCESS_EXPIRES_IN);

// ─── Access Token (JWT) ──────────────────────────────────────

export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as unknown as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
}

// ─── Refresh Token (Random + DB Hash) ────────────────────────

export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ─── Refresh Token TTL ───────────────────────────────────────

export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün
export const INVITE_TOKEN_TTL_MS = 48 * 60 * 60 * 1000; // 48 saat
export const RESET_TOKEN_TTL_MS = 1 * 60 * 60 * 1000; // 1 saat
