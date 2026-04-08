# Frontend Runtime Contract

This frontend is a Next.js App Router application for the authenticated agency app and marketing site.

## Local development

The local default is:

- frontend: `http://localhost:5173`
- backend API: `http://localhost:3000/api/v1`

From the repo root, start the backend:

```powershell
npm run dev
```

From the `frontend` directory, start the frontend:

```powershell
npm run dev
```

Open `http://localhost:5173`.

## Frontend env contract

The frontend uses these env vars:

- `NEXT_PUBLIC_API_URL`
- `API_REWRITE_TARGET`

Rules:

- Leave it unset for same-origin deployments where the frontend can call `/api/v1` on its own origin.
- Set it for split-origin deployments where the frontend must call a different backend origin.
- Treat it as a build-time input. Rebuild the frontend when it changes.
- For `API_REWRITE_TARGET`, provide backend origin without `/api/v1` when Next.js should rewrite `/api/v1/*` requests.

Local example:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
API_REWRITE_TARGET=
```

## Supported deployment modes

### 1. Same-origin reverse proxy

Use this when the frontend and backend are served behind one public origin.

- Leave `NEXT_PUBLIC_API_URL` unset.
- Route `/api/v1` to the backend.
- If using Next.js rewrites for this, set `API_REWRITE_TARGET=https://your-backend-domain.com`.

### 2. Split-origin same-site deployment

Use this when the frontend and backend are on different origins but still within the same site boundary.

- Set `NEXT_PUBLIC_API_URL` to the full backend API origin.
- Align backend `CLIENT_URL` with the frontend origin.
- Align backend `CORS_ORIGINS` so it includes the frontend origin.

Auth uses credentialed HttpOnly cookies. Different-site deployments are deferred and are not documented as a supported mode in this batch.

## Build and start

Build the frontend:

```powershell
npm run build
```

Start the production server:

```powershell
npm run start
```

Use the standard Next.js `PORT` environment variable if your host assigns a port at runtime.
