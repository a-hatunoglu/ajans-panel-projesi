---
name: frontend-review-validator
description: Use this skill when reviewing frontend plans, briefs, scaffolding, or implementation results for this repository. It validates output against locked repo rules, catches drift, and forces explicit carry-forward corrections.
---

# Frontend Review Validator

## Goal
Review frontend outputs for this repository and detect:
- architecture drift
- route drift
- auth mistakes
- scope expansion
- design-rule violations
- missing carry-forward corrections

Use this skill whenever the task is:
- "review this plan"
- "is this implementation okay?"
- "analyze this output"
- "validate this batch"
- "check whether this matches our rules"
- any similar evaluation request

---

## Repository Context
The following are locked decisions and must be treated as review anchors:

- one frontend codebase
- one shared authenticated app
- landing + app in same Next.js project
- dashboard route is `/app`
- Next.js App Router
- HttpOnly cookie auth only
- no localStorage auth
- no early Redux/Zustand
- TanStack Query for server state
- React Hook Form + Zod
- dark-first Linear/Vercel-inspired UI direction
- border-heavy, low-noise interface
- effects are tightly limited
- landing comes after core app surfaces
- calendar library not chosen yet

---

## Review Method

### 1. Check for hard violations first
Always check these before anything else:

#### Route violations
Examples:
- introducing `/dashboard`
- splitting role apps
- wrong route structure

#### Auth violations
Examples:
- localStorage token handling
- reading/parsing cookies in browser
- bearer token model replacing cookie model

#### State violations
Examples:
- adding Redux/Zustand too early
- storing server state manually outside TanStack Query

#### Scope violations
Examples:
- implementing multiple batches at once
- adding landing in app-foundation stage
- building calendar too early

#### Design violations
Examples:
- admin-template styling
- excessive glow
- overly flashy motion
- app surfaces using landing-like effects

### 2. Check for prompt carry-forward integrity
This repository has a known failure mode:
review notes are sometimes discussed but not carried into the next prompt or implementation.

You must explicitly verify:
- were required corrections actually applied?
- were they only “mentally accepted” or truly reflected?
- is the next-step plan aligned with the last review decision?

If a correction is missing, call it out directly.

### 3. Distinguish between:
- blocker
- important correction
- optional improvement

Do not mix them.

---

## Required Output Format
When reviewing, always respond in this structure:

### A. Verdict
Choose one:
- Approved
- Approved with required corrections
- Not approved

### B. Blockers
List only true blockers.

### C. Required Corrections
List only the corrections that must happen before proceeding.

### D. Optional Improvements
List non-blocking ideas separately.

### E. Prompt Carry-Forward Check
State clearly whether the important corrections were actually carried into the current artifact/prompt.

### F. Next Safe Step
Recommend the next step only after the review result is clear.

---

## Review Standards

### Be strict about these
- `/app` must remain the dashboard route
- auth must remain HttpOnly cookie based
- session provider must not pretend to read cookies client-side
- foundation batches must stay small
- build order must be respected
- app UI must stay calm and operational
- effects must remain rare and controlled

### Be flexible about these
- exact wording style
- minor phrasing issues
- harmless structural variations
- non-blocking naming differences

---

## Prompt Discipline Rule
If the review results in required corrections and a follow-up prompt is going to be generated, explicitly ensure:

1. the corrections are listed
2. the corrections are embedded into the final prompt
3. the final prompt is safe to send

Never allow a situation where:
- corrections are discussed
- but not actually carried into the next prompt

If that happens, mark it clearly.

---

## Success Criteria
A good review:
- catches real drift
- separates blockers from polish
- preserves project consistency
- reduces repeated mistakes
- prevents “thinking it was fixed” when it was not

A bad review:
- gives vague approval
- ignores locked decisions
- fails to catch drift
- lets corrections disappear between turns