# Ajans Panel — Backend

Social media agency management platform. Express + Prisma + PostgreSQL backend.

## Prerequisites

- **Node.js** >= 20 (`engines` field in `package.json`)
- **PostgreSQL** 16+ (local via `docker-compose up -d postgres`, or an external instance)
- A `.env` file copied from `.env.example`

## Local development

1. Start infrastructure:

```sh
docker-compose up -d
```

This starts PostgreSQL (port 5432) and MinIO (ports 9000/9001).

2. Create your environment file:

```sh
cp .env.example .env
```

3. Install dependencies and generate Prisma Client:

```sh
npm install
npm run prisma:generate
```

4. Run database migrations:

```sh
npm run prisma:migrate
```

5. Start the dev server:

```sh
npm run dev
```

The backend will be available at `http://localhost:3000`.
Health check: `GET http://localhost:3000/api/v1/health`

## Production build

```sh
npm install
npm run build
```

The `build` script runs `prisma generate && tsc`, compiling TypeScript to `dist/`.

## Production deploy

> **Note:** For the exact deployment sequence (DB -> API -> UI) and Prisma rollback strategies, please read the [Release & Deploy Runbook](./docs/deploy-runbook.md).

```sh
npm run start:prod
```

This runs `prisma migrate deploy && node dist/server.js`:

1. Applies any pending migrations (safe — never creates new migrations)
2. Starts the production server

Alternatively, run these steps separately:

```sh
npm run prisma:migrate:deploy
npm run start
```

## Environment variables

All environment variables are validated at startup via Zod (`src/config/index.ts`). The server will hard-fail with a clear error if required variables are missing or invalid.

### Required (no defaults — must be set)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string. Must be a valid URL. |
| `JWT_ACCESS_SECRET` | Access token signing secret. Minimum 32 characters. Use a cryptographically random string in production. |
| `JWT_REFRESH_SECRET` | Refresh token signing secret. Minimum 32 characters. Must differ from access secret. |

### Optional (have safe defaults)

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | `development`, `production`, or `test`. Controls logging format, cookie security, Prisma query logging. |
| `PORT` | `3000` | Server listen port. |
| `API_PREFIX` | `/api/v1` | Base path for all API routes. |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token lifetime (e.g. `15m`, `1h`). |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifetime (e.g. `7d`, `30d`). |
| `APP_URL` | `http://localhost:3000` | Backend's own URL. Reserved for email templates and link generation. |
| `CLIENT_URL` | `http://localhost:5173` | Frontend URL. Reserved for email templates, invite links, password reset links. |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated list of allowed CORS origins. In production, should include the frontend origin. |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limiting window in milliseconds. |
| `RATE_LIMIT_MAX` | `100` | Max requests per rate limit window. |

### Reserved (in `.env.example` but not yet wired into the backend)

The following variables appear in `.env.example` and `docker-compose.yml` but are **not currently read by the backend config schema or referenced in code**. They are placeholders for planned features:

- `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_REGION` — File storage (MinIO/S3)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` — Email delivery

Setting them has no effect on the backend today. They will be wired when file upload and email features are implemented.

## Health check

```
GET /api/v1/health
```

Response:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-04-07T20:00:00.000Z",
    "uptime": 123.456,
    "environment": "production"
  }
}
```

Use this endpoint for load balancer health checks and deploy verification.

## Logging

- **Development:** Colorized console output, debug level, Prisma query logging enabled.
- **Production:** JSON-formatted output to console + file transports.
  - `logs/error.log` — error level only (10MB rotation, 5 files)
  - `logs/combined.log` — all levels (10MB rotation, 10 files)

The `logs/` directory is created automatically on production startup.

## Auth model

Authentication uses HttpOnly cookies:

- **Access token** — JWT, 15min default. Set as `access_token` cookie scoped to `API_PREFIX`.
- **Refresh token** — Random bytes, 7d default. Stored as SHA-256 hash in database. Set as `refresh_token` cookie scoped to `API_PREFIX/auth`.

Cookies use `sameSite: strict` and `secure: true` in production. The backend also accepts Bearer tokens via `Authorization` header as a fallback.

## Background jobs

The server starts two background jobs on boot (after a 30-second delay):

- **Overdue check** — Runs every hour. Marks overdue content.
- **Trash cleanup** — Runs every 24 hours. Permanently removes soft-deleted records past retention.

These run in-process via `setInterval`. No external job runner is required for single-instance deployments.

## Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload (`tsx watch`) |
| `npm run build` | Generate Prisma Client + compile TypeScript |
| `npm run start` | Start production server (no migration) |
| `npm run start:prod` | Run migrations + start production server |
| `npm run lint` | Run ESLint |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Create + apply migrations (dev only) |
| `npm run prisma:migrate:deploy` | Apply existing migrations (production-safe) |
| `npm run prisma:studio` | Open Prisma Studio GUI |
| `npm run verify:prod-boot` | Build, start in production mode, verify health, shutdown |
