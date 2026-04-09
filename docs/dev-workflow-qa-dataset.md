# Dev Workflow QA Dataset

This fixture is for local development and demo/showcase purposes only. It is not intended for production use.

## Run

From the repo root:

```powershell
npm run dev:seed:workflow-qa
```

## What it creates or ensures

Password for all test users:

- `LocalDev123!`

Users:

- `enes@test.com` -> `owner`
- `ayla.admin@test.com` -> `admin`
- `ece.editor@test.com` -> `editor`
- `deniz.designer@test.com` -> `designer`
- `cem.client@test.com` -> `client`

---

### Company 1: Atlas Local Dev

- id: `0349f0bd-aa25-4cc0-8ea1-4dac3c9c340b`
- name: `Atlas Local Dev`
- slug: `atlas-local-dev`
- members: all 5 users

Social account:

- id: `15a2ebe9-c6e4-465c-bf54-2709da1caa69`
- account: `@atlaslocaldev`
- platform: `instagram`

QA contents:

- `8501b9f4-ab59-4789-ae24-aea4b3d50184` -> `[QA] Workflow Draft` -> `draft`
- `8851a9fa-f457-44f0-a24c-42dac3a0a76e` -> `[QA] Workflow In Review` -> `in_review`
- `52801ac6-1ebe-44e1-86d2-5a84dd633abd` -> `[QA] Workflow Revise` -> `revise`
- `70afac3f-54ff-4796-a8b5-d5fd5ce6d9a1` -> `[QA] Workflow Approved` -> `approved`
- `44a6e6eb-67c4-49cf-bbf0-f2a81f9e7d4f` -> `[QA] Workflow Scheduled` -> `scheduled`
- `c3f8d1a2-5e47-4b9c-a6d3-8f2e1c9b7a05` -> `[QA] Workflow Published` -> `published`

QA payments:

- `6c40f49b-66e0-4446-8847-2b55445aa1d1` -> `pending` -> `TRY 12,500.00`
- `1f58215f-7923-48b8-a557-b1b2166c72cf` -> `paid` -> `TRY 9,800.00`
- `3a7b8c9d-1e2f-4a5b-6c7d-8e9f0a1b2c3d` -> `overdue` -> `TRY 15,000.00`

---

### Company 2: Momentum Digital

- id: `a6e1c4d9-2f88-4b29-9e3c-75dfe0a11b42`
- name: `Momentum Digital`
- slug: `momentum-digital`
- members: owner, admin, editor, designer (NOT client — demonstrates role filtering)

Social account:

- id: `b7c3d8e1-4f92-4a1d-8e5f-93c6a7b2d034`
- account: `@momentumdigital`
- platform: `linkedin`

QA contents:

- `e1a2b3c4-d5e6-4f78-9a0b-c1d2e3f40001` -> `Momentum — Q2 Campaign Draft` -> `draft`
- `e1a2b3c4-d5e6-4f78-9a0b-c1d2e3f40002` -> `Momentum — Brand Awareness Post` -> `in_review`
- `e1a2b3c4-d5e6-4f78-9a0b-c1d2e3f40003` -> `Momentum — Product Launch Scheduled` -> `scheduled`

QA payments:

- `4b8c9d0e-2f3a-4b5c-7d8e-9f0a1b2c3d4e` -> `pending` -> `TRY 8,500.00`

---

### Notifications (7 records)

Seeded for owner, editor, and designer users. All titles prefixed with `[Demo]` for idempotent re-seeding.

Types covered:
- `content_in_review` (unread, 2 records — one per company)
- `content_approved` (unread, 3 records — one for owner, one for editor, one for designer)
- `content_published` (read, 1 record)
- `payment_overdue` (read, 1 record)

Idempotency: existing notifications with `title LIKE '[Demo]%'` for the seeded user IDs are deleted before re-insertion.

---

### Activity Logs (10 records)

Seeded across owner, admin, editor, and designer users. All records tagged with `{ _demo: true }` in the `details` JSON field for idempotent re-seeding.

Actions covered:
- `company.create` (2 records — one per company)
- `social_account.create`
- `content.create` (2 records — one per company)
- `content.update`
- `content.status_change` (with `oldStatus`/`newStatus` details)
- `content.approve`
- `content.assign`
- `payment.create`

Chronological spread: 7 days, from oldest to newest.

Idempotency: existing activity logs with `details._demo === true` for the seeded user IDs are deleted before re-insertion.

---

## Baseline content state after each seed run

- no QA comments remain on the fixed QA content IDs
- each QA content is reset to exactly one initial version snapshot
- the approved fixture stays approved with no schedule target
- the scheduled fixtures keep their fixed schedule targets for publish QA
- the published fixture retains its full lifecycle dates (approvedAt, scheduledAt, publishedAt)

## Assignment shape

- all QA contents are created by the `owner`
- `assignedDesignerId` points to the real `designer`
- `assignedEditorId` points to the real `editor`

## Idempotency and collision handling

- The script is idempotent.
- Users are ensured by email:
  - if the email already exists, that row is updated and reused
  - otherwise a new row is created
- Companies are ensured by slug:
  - if the slug already exists, that row is updated and reused
  - otherwise a new row is created
- Social accounts are ensured by ID, then by company + account name.
- QA contents are ensured by fixed content IDs.
- Any active duplicate QA contents with the same QA titles in the same company but different IDs are soft-deleted.
- QA comments and QA versions for the fixed content IDs are reset so the detail-screen workflow dataset returns to a deterministic baseline.
- Notifications are cleared by `[Demo]` title prefix before re-insertion.
- Activity logs are cleared by `_demo` JSON tag before re-insertion.

## Intended use

This dataset exists to support:

- content-detail workflow mutation QA
- role-based verification for owner, admin, editor, designer, and client
- global payments smoke checks with deterministic company-scoped rows
- deterministic local smoke checks without manual DB edits or UI setup
- demo/showcase readiness — every visible app surface has populated data
- multi-company density for companies list, dashboard stats, and cross-company notifications
