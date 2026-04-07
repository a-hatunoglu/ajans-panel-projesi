# Release & Deploy Runbook

This guide is for operators and engineers performing the first production release or deploying subsequent updates. It defines the strict sequence of operations and provides crucial guidance for safe rollbacks.

## 1. Pre-flight Verification

Before running a deploy, verify the backend build and boot sequence behaves correctly using the local verification script.

From the repository root:
```sh
npm ci
npm run verify:prod-boot
```
This isolates and proves that:
1. TypeScript compiles successfully.
2. Prisma client generation works.
3. Database migrations execute without locking the main thread.
4. The server successfully boots and answers the `/api/v1/health` endpoint.

If this fails locally or in CI, **do not attempt a deployment.**

---

## 2. Deployment Sequence

For a single-server or standard PaaS deployment, follow this exact order of operations.

### Step 2.1. Prepare the Database (PostgreSQL)
Ensure the production PostgreSQL instance is reachable and the `DATABASE_URL` environment variable is strictly formatted:
`postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`

### Step 2.2. Deploy the Backend
The backend must always deploy before the frontend.

1. Inject environment variables specified in `.env.example` (at minimum `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`).
2. Execute the production startup command:
   ```sh
   npm install --production=false
   npm run build
   npm run start:prod
   ```
   > [!NOTE] 
   > `start:prod` automatically runs `prisma migrate deploy`, safely applying any pending migrations directly to the database before the Express server boots.

3. **Verify:** Check the health endpoint:
   `GET https://your-backend-domain.com/api/v1/health`

### Step 2.3. Deploy the Frontend
Once the backend confirms health, deploy the UI.

1. Ensure the `NEXT_PUBLIC_API_URL` environment variable correctly points to the backend (e.g., `https://your-backend-domain.com/api/v1`).
   *If hosting on the same origin via a reverse proxy, this can be left blank.*
2. Ensure the backend `CORS_ORIGINS` variable allows the UI domain.
3. Execute the frontend build and start:
   ```sh
   npm ci
   npm run build
   npm run start
   ```

### Step 2.4. End-to-End Smoke Test
1. Load the frontend URL in an incognito window.
2. Attempt to register or login using an admin credential.
3. Access the `Dashboard` and visually verify no network errors (HTTP 500s or CORS issues) appear in the browser console.

---

## 3. Rollback Guidance 🚨

If a deployment fails, exhibits broken behavior, or emits high error rates, rollback strategies differ significantly between the Frontend and Backend.

### Frontend Rollbacks: 🟢 Safe
The frontend is stateless. Rolling back the frontend to a previous version/container is **always safe**.
1. Revert the UI deployment/container to the previous working commit.
2. Ensure the `NEXT_PUBLIC_API_URL` variable is still correct.

### Backend Rollbacks: 🟡 Caution Required (Schema Drift)
Rolling back the backend code is generally safe **unless** the problematic deployment included a destructive database migration.

Because `npm run start:prod` automatically runs `prisma migrate deploy`, the database schema might be "ahead" of your rolled-back backend code.

#### Scenario A: The deploy failed *without* executing migrations
1. Immediately revert the deployment to the previous working container/commit.
2. Verify the health endpoint.

#### Scenario B: The deploy succeeded, migrations ran, but the app has bugs
> [!WARNING]
> Do NOT use `prisma migrate resolve --rolled-back` manually on the production database unless you fully understand the consequences. This can result in irrecoverable data loss.

1. **Assess Schema Drift:** Did the newly applied migration drop tables or columns? 
   - If **additive only** (added columns/tables): It is safely backward-compatible. You can simply roll back the Node.js backend container to the previous version. The old code will safely ignore the new columns.
   - If **destructive** (dropped columns, altered constraints): Rolling back the backend will cause crashes, as the old code expects columns that no longer exist.
2. **If Destructive Drift Occurred:** Do not simply roll back the container. You must either:
   - Roll forward with a hotfix commit (Highly Recommended).
   - Restore the PostgreSQL database from the snapshot taken right before the deploy, then roll back the backend container.

### A Note on Local Storage / Sessions
Because the application uses HttpOnly cookies for session management (no `localStorage` for JWTs), rolling back environments will not abruptly log users out or corrupt their client state. If a rollback is performed, active sessions will naturally continue unless the `JWT_ACCESS_SECRET` is intentionally rotated.
