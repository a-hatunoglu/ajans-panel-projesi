---
name: frontend-prompt-packager
description: Use this skill when converting review decisions, locked repo rules, and current project state into a single safe-to-send prompt for frontend planning or implementation.
---

# Frontend Prompt Packager

## Goal
Turn current project context into a single safe, explicit, copy-paste-ready prompt.

This skill exists to solve a known failure mode in this repository:
- decisions are reviewed
- corrections are discussed
- but the next prompt does not fully carry them forward

Use this skill whenever the task is:
- "write the next prompt"
- "package this for the AI"
- "turn our decisions into one final prompt"
- "prepare the implementation prompt"
- "rewrite the prompt with corrections included"

---

## Repository Context
The repository already has locked decisions that must not be silently dropped:

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
- effects are rare and tightly limited
- build order is locked
- landing comes after core app surfaces
- calendar library not chosen yet

---

## Core Rule
Never produce a “final prompt” unless all required corrections are explicitly embedded in it.

It is not enough that:
- the corrections were discussed
- the corrections were accepted
- the reviewer said “approved with fixes”

A prompt is only valid if the actual text of the prompt carries the corrections forward.

---

## Packaging Workflow

### Step 1 — Gather inputs
Before writing the prompt, identify:
1. the current project phase
2. the exact requested task
3. locked repo rules relevant to the task
4. required corrections from the latest review
5. scope boundaries
6. output expectations

### Step 2 — Separate mandatory vs optional
Only mandatory items must be embedded into the final prompt as hard constraints.

Optional improvements may be omitted or placed under a softer note.

### Step 3 — Embed, don’t summarize
Do not merely mention that corrections exist.

Instead:
- rewrite the actual task prompt
- inject the corrections directly as explicit instructions
- ensure the receiving model cannot miss them

### Step 4 — Make it sendable
The final prompt must be:
- copy-paste ready
- internally consistent
- scoped
- unambiguous
- aligned with build order
- aligned with auth, route, and design rules

---

## Required Output Format
Whenever using this skill, always answer in this structure:

### A. Current Task
A one-paragraph summary of what the next AI call is supposed to do.

### B. Mandatory Carry-Forward Items
A bullet list of the corrections/constraints that must be present in the final prompt.

### C. Final Prompt
A single clean prompt that is ready to send.

### D. Sendability Check
State explicitly:
- whether the prompt is safe to send
- whether any mandatory correction is still missing

---

## Packaging Standards

### Always include when relevant
- route rules
- auth rules
- build order constraints
- current batch boundaries
- review corrections
- explicit “do not expand scope” warnings
- expected output format

### Never allow
- hidden assumptions
- mentally-applied corrections
- vague “continue from here” prompts
- prompts that can drift into later phases
- prompts that contradict locked repo rules

---

## Prompt Quality Rules

### Good prompt
A good packaged prompt:
- is specific
- is bounded
- includes hard constraints
- names exact files/phases/routes where relevant
- tells the model what NOT to do
- defines expected output structure

### Bad prompt
A bad packaged prompt:
- assumes prior context will be remembered perfectly
- leaves corrections implicit
- mixes multiple phases
- includes contradictory technical decisions
- allows optional ideas to masquerade as requirements

---

## Special Rule for This Repository
If the next prompt follows a review step, explicitly verify:

1. Were there blockers?
2. Were there required corrections?
3. Are those corrections present inside the final prompt text?
4. Is the final prompt aligned with repo rules?

If any answer is “no”, the prompt is not ready.

---

## Success Criteria
This skill succeeds when:
- the next prompt is truly safe to send
- no required correction is left outside the prompt
- scope drift risk is minimized
- batch boundaries remain intact
- repeated review-to-prompt mistakes are prevented