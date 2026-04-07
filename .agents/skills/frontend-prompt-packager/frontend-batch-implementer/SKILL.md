---
name: frontend-batch-implementer
description: Use this skill when implementing a specific frontend batch for this repository. It enforces batch boundaries, locked repo decisions, file-by-file output, and validation discipline.
---

# Frontend Batch Implementer

## Goal
Implement only the requested frontend batch for this repository without scope drift.

This skill exists to stop the agent from:
- silently moving into later batches
- adding unrequested polish
- changing locked architectural decisions
- skipping validation and file accounting

Use this skill whenever the task is:
- "implement batch 1"
- "scaffold the frontend foundation"
- "build the auth shell"
- "create the dashboard skeleton"
- "write the files for this phase"
- any similar batch-based implementation request

---

## Repository Context
This repository has already locked the following decisions:

- one frontend codebase
- Next.js App Router
- one shared authenticated app
- landing and app in the same project with separate layouts
- dashboard route is `/app`
- auth is HttpOnly cookie based
- no localStorage auth
- no separate app for clients vs agency
- no Redux/Zustand at the beginning
- TanStack Query for server state
- React Hook Form + Zod for forms
- Tailwind + shadcn/ui + Lucide + Motion
- landing is built after core app surfaces
- calendar library is not locked yet

Never violate these decisions unless the user explicitly changes them.

---

## Batch Rules

### 1. Implement only the requested batch
If asked for Batch 1, do Batch 1 only.

Do not:
- continue into Batch 2
- add extra modules “because they will be needed”
- prematurely wire advanced auth logic
- start landing early
- add calendar implementation early
- add visual effects early
- add unrequested package choices

### 2. Respect the current build order
The frontend build order is:

1. app shell + providers + theme + routing
2. auth + session wiring
3. dashboard
4. companies
5. company detail
6. contents
7. content detail
8. calendar
9. notifications
10. payments
11. activity
12. landing

If the requested work violates the build order, stop and say so.

### 3. Keep implementation foundation-first
Prefer:
- placeholders
- typed interfaces
- small wrappers
- route scaffolding
- provider setup
- composable primitives

Avoid:
- full page polish
- advanced state abstractions
- speculative helpers
- complex animation logic
- feature-complete modules too early

---

## Required Output Format
When implementing a batch, always return results in this structure:

### A. Scope Confirmation
State exactly what batch is being implemented and what is intentionally excluded.

### B. Files Created / Updated
List every file created or updated.

### C. Full File Contents
Provide the full content for each relevant file.

### D. Package Commands
List install commands if needed.

### E. Validation Commands
List commands such as:
- npm run dev
- npx tsc --noEmit
- npm run build

### F. Completion Status
State:
- whether the batch is complete
- what remains for the next batch
- whether any blocked dependency exists

---

## Implementation Discipline

### File discipline
- Do not describe files vaguely.
- Always name exact files.
- Prefer predictable file placement.
- Keep naming consistent with route and layout architecture.

### Technical discipline
- Keep code TypeScript-safe.
- Keep foundation code simple.
- Avoid introducing libraries unless clearly approved.
- Prefer fetch wrapper over axios unless the user explicitly changes the decision.

### Auth discipline
- Do not use localStorage for auth.
- Do not write code that parses HttpOnly cookies in the browser.
- Client auth/session code must assume session comes from validated server/session endpoint data.

### UI discipline
- Do not overbuild visual polish during batch implementation.
- Do not add effects unless explicitly requested in that batch.
- Do not turn placeholders into full designed pages unless requested.

---

## If the request is ambiguous
If the user asks for implementation but does not define the batch clearly:
1. infer the batch from current project stage if possible
2. state the inferred scope clearly
3. implement only that inferred scope
4. do not expand beyond it

---

## Success Criteria
A good batch implementation:
- follows locked repo rules
- stays inside scope
- creates only needed files
- validates cleanly
- leaves the project in a stable next-step state

A bad batch implementation:
- expands scope
- changes locked decisions
- skips file accounting
- mixes multiple batches together
- adds speculative architecture