# Dev Workflow QA Dataset

This fixture is for local development only. It is not intended for production use.

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

Company:

- id: `0349f0bd-aa25-4cc0-8ea1-4dac3c9c340b`
- name: `Atlas Local Dev`
- slug: `atlas-local-dev`

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

QA payments:

- `6c40f49b-66e0-4446-8847-2b55445aa1d1` -> `pending` -> `TRY 12500.00`
- `1f58215f-7923-48b8-a557-b1b2166c72cf` -> `paid` -> `TRY 9800.00`

Baseline content state after each seed run:

- no QA comments remain on the fixed QA content IDs
- each QA content is reset to exactly one initial version snapshot
- the approved fixture stays approved with no schedule target
- the scheduled fixture keeps its fixed schedule target for publish QA

Assignment shape:

- all QA contents are created by the `owner`
- `assignedDesignerId` points to the real `designer`
- `assignedEditorId` points to the real `editor`

## Idempotency and collision handling

- The script is idempotent.
- Users are ensured by email:
  - if the email already exists, that row is updated and reused
  - otherwise a new row is created
- The company is ensured by slug:
  - if the slug already exists, that row is updated and reused
  - otherwise a new row is created
- The social account is ensured by company + account name.
- QA contents are ensured by fixed content IDs.
- Any active duplicate QA contents with the same QA titles in the same company but different IDs are soft-deleted.
- QA comments and QA versions for the fixed content IDs are reset so the detail-screen workflow dataset returns to a deterministic baseline.

## Intended use

This dataset exists to support:

- content-detail workflow mutation QA
- role-based verification for owner, admin, editor, designer, and client
- global payments smoke checks with deterministic company-scoped rows
- deterministic local smoke checks without manual DB edits or UI setup
