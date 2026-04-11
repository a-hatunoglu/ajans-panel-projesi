import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  API_PREFIX: z.string().default('/api/v1'),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL geçerli bir URL olmalıdır.'),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET en az 32 karakter olmalıdır.'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET en az 32 karakter olmalıdır.'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // App URLs
  APP_URL: z.string().url().default('http://localhost:3000'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().default(5),

  // SMTP (Optional — if not configured, emails are skipped with warning)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('noreply@agencyos.app'),

  // Storage (S3 / R2 / MinIO) - Optional for fallback
  STORAGE_S3_ACCESS_KEY: z.string().optional(),
  STORAGE_S3_SECRET: z.string().optional(),
  STORAGE_S3_REGION: z.string().optional(),
  STORAGE_S3_BUCKET: z.string().optional(),
  STORAGE_S3_ENDPOINT: z.string().optional(), // Used for non-AWS (R2, MinIO, DigitalOcean)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Ortam değişkenleri geçersiz:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
