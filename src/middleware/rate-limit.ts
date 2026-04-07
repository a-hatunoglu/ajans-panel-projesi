import rateLimit from 'express-rate-limit';
import { env } from '../config';

export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Çok fazla istek gönderdiniz. Lütfen bir süre bekleyin.',
      details: [],
    },
  },
});

// Auth endpointleri için daha sıkı limit (Faz 2'de kullanılacak)
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Çok fazla giriş denemesi. Lütfen 1 dakika bekleyin.',
      details: [],
    },
  },
});
