# Quickstart — Clone to Demo

Get the app running locally with demo data in under 5 minutes.

## Prerequisites

- **Node.js** >= 20
- **Docker** (for PostgreSQL)

---

## 1. Start infrastructure

```sh
docker-compose up -d
```

This starts PostgreSQL (port 5432) and MinIO (ports 9000/9001).

## 2. Create environment file

```sh
cp .env.example .env
```

The defaults work for local development. No edits needed.

## 3. Install dependencies

```sh
npm install
cd frontend && npm install && cd ..
```

## 4. Database setup

```sh
npm run prisma:generate
npm run prisma:migrate
```

## 5. Seed demo data

```sh
npm run dev:seed:workflow-qa
```

This creates 5 users, 2 companies, 9 contents, 4 payments, 7 notifications, and 10 activity logs.

## 6. Start the app

Open **two terminals** from the repo root:

**Terminal 1 — Backend:**
```sh
npm run dev
```

**Terminal 2 — Frontend:**
```sh
cd frontend
npm run dev
```

The app will be available at **http://localhost:5173**.

## 7. Demo login

Open http://localhost:5173 and sign in:

- **Email:** `enes@test.com`
- **Password:** `LocalDev123!`

This is the **owner** account with full platform access.

## 8. All demo accounts

All accounts share the password: `LocalDev123!`

| Email | Role | Best For |
|---|---|---|
| `enes@test.com` | Owner | Full platform demo |
| `ayla.admin@test.com` | Admin | Admin workflow |
| `ece.editor@test.com` | Editor | Editor perspective |
| `deniz.designer@test.com` | Designer | Designer perspective |
| `cem.client@test.com` | Client | Client restricted view |

## 9. Run smoke tests (optional)

```sh
cd frontend
npx playwright install chromium
npm run test:smoke
```

The smoke suite verifies auth, content lifecycle, notifications, payments, and all demo surfaces.

---

## Further reading

- **Backend reference** → [README.md](./README.md)
- **Frontend contract** → [frontend/README.md](./frontend/README.md)
- **Deploy runbook** → [docs/deploy-runbook.md](./docs/deploy-runbook.md)
- **QA dataset details** → [docs/dev-workflow-qa-dataset.md](./docs/dev-workflow-qa-dataset.md)
