# Repo Rules — Social Media Agency Management Platform

## Purpose
This repository contains a two-surface product:

1. **Marketing / Landing surface**
2. **Authenticated App surface**

The project is a premium, dark-first, role-based social media agency management platform.

These rules exist to keep implementation consistent, prevent scope drift, and enforce product, technical, and design decisions already made.

---

## 1. Global Product Rules

### 1.1 Product Structure
- This project uses **one frontend codebase**.
- The frontend contains **two surfaces**:
  - marketing / landing
  - authenticated app
- These surfaces must live in the **same Next.js project**, but with **separate layouts**.

### 1.2 App Structure
- The authenticated app is **one shared app**, not separate apps for agency and client users.
- Role-based rendering and navigation must be used instead of separate frontend applications.
- Clients, editors, designers, admins, and owner all use the same app shell with filtered surface access.

### 1.3 Primary Product Goal
- The product is an **operational command center**, not a generic admin template.
- The UI must optimize:
  - clarity
  - speed
  - calmness
  - operational awareness
- Avoid turning pages into feature dumps, dashboard clutter, or widget collections.

---

## 2. Locked Technical Decisions

### 2.1 Frontend Framework
- Use **Next.js App Router**.
- Do not switch to Vite, Pages Router, or multiple frontend apps unless explicitly approved.

### 2.2 Styling Stack
- Use:
  - **Tailwind CSS**
  - **shadcn/ui**
  - **Lucide icons**
  - **Motion / Framer Motion**
- Do not introduce alternative UI libraries unless necessary and explicitly justified.

### 2.3 Auth Rules
- Authentication is **HttpOnly cookie based**.
- Frontend must **never** rely on `localStorage` for auth token storage.
- Frontend must **never** read or parse auth cookies directly.
- Session/user state must come from:
  - server validation
  - session endpoint
  - server-provided initial user/session data

### 2.4 API Client Rules
- API requests use same-origin / cookie-based requests.
- `credentials: 'include'` must be used where appropriate.
- Do not build the frontend around manually attaching bearer tokens from local storage.
- Centralized unauthorized handling is allowed.
- Route protection and API 401 handling are separate concerns and must not be conflated.

### 2.5 State Management Rules
- Do **not** introduce Redux or Zustand at the start of the project.
- Preferred state strategy:
  - server state → TanStack Query
  - local UI state → `useState`
  - filter/shareable state → URL query params
  - small cross-tree UI state → context/provider only if needed
- Add a global state library only if a real need emerges.

### 2.6 Forms
- Use **React Hook Form + Zod**.
- Keep frontend validation aligned with backend validation patterns.
- Avoid ad hoc manual form validation logic.

### 2.7 Data Layer
- Use **TanStack Query** for server state and caching.
- Avoid scattering raw fetch logic throughout page components.
- Prefer feature-based API modules/hooks.

### 2.8 Calendar Rule
- Calendar library choice is **not locked yet**.
- Do not prematurely commit the architecture to a specific calendar package.
- Leave room for a future adapter layer.

---

## 3. Locked Route Rules

### 3.1 Route Surfaces
Use route groups / layouts to separate surfaces.

Expected route intent:

- marketing surface
  - `/`
  - `/features`
  - `/workflow`
  - `/platforms`
  - `/contact`

- auth surface
  - `/login`

- authenticated app
  - `/app`
  - `/app/companies`
  - `/app/companies/[id]`
  - `/app/contents`
  - `/app/contents/[id]`
  - `/app/calendar`
  - `/app/notifications`
  - `/app/payments`
  - `/app/activity`
  - `/app/settings`

### 3.2 Dashboard Route
- The dashboard route is **`/app`**
- Do **not** create `/dashboard` as the main dashboard route.

---

## 4. Build Order Rules

Frontend implementation must follow this order unless explicitly changed:

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

### Build Order Constraints
- Do not jump to landing early.
- Do not start heavy page polish before shell and auth foundation are stable.
- Do not build calendar before core content and company flows are established.

---

## 5. Design Rules (Non-negotiable)

### 5.1 Design Direction
The visual direction is:
- **Linear + Vercel inspired**
- dark-first
- premium
- controlled
- low-noise
- technically confident

### 5.2 Avoid
Do not allow the UI to drift toward:
- generic SaaS template styling
- loud admin dashboard aesthetics
- Notion-like cluttered block-heavy layouts
- overly playful / toy-like interaction design
- glassmorphism-heavy surfaces
- neon overload
- excessive gradients
- oversized rounded components
- decorative charts that do not help operations

### 5.3 Surface Rules
- Prefer subtle surface tone differences over dramatic shadows.
- Prefer 1px borders and clean separation.
- Shadows are limited and reserved for higher floating layers such as:
  - modal
  - drawer
  - dropdown
- Main app surfaces remain mostly border-driven.

### 5.4 Accent Rules
- App accent color is a **single cool blue family**
- White is a neutral contrast color, not the main accent system
- Status colors must be muted, not neon

### 5.5 Motion Rules
Motion must be:
- short
- controlled
- contextual
- supportive

Do not use motion as decoration.

Allowed uses:
- page transitions
- tab transitions
- drawer/modal entry
- hover/focus micro-interactions
- list removal/addition feedback
- subtle reveal

Avoid:
- flashy entrance sequences
- noisy looping animations
- exaggerated bounce
- theatrical dashboard animations

---

## 6. Effect Rules

The following effects are allowed only in tightly controlled contexts:

### 6.1 Silk
Allowed:
- login atmospheric side/background
- selected marketing/landing hero usage

Not allowed:
- authenticated app work surfaces
- dashboards
- tables
- company detail
- content detail
- calendar

### 6.2 Border Glow
Allowed:
- selected premium CTA cards
- highly limited attention-drawing cards
- subtle hover/focus enhancement only

Not allowed:
- always-on glow
- tables
- dense lists
- calendar event blocks
- sidebar nav items
- general app chrome

### 6.3 LogoLoop
Allowed:
- marketing / landing “managed platforms” or trust/integration section

Not allowed:
- authenticated app UI
- client/company data surfaces

### 6.4 General Rule
Effects are optional enhancement layers, not core UI language.

---

## 7. Responsive Rules

### 7.1 Landing
- landing should feel polished on mobile
- mobile-first care is required

### 7.2 App
- app is desktop-priority responsive
- app must still be usable on mobile
- mobile does not need to mirror desktop density

### 7.3 Responsive Simplification
On smaller screens:
- sidebars may collapse to drawers
- large tables may become scrollable or card-like
- calendar may simplify into list/agenda views
- sticky bottom actions may replace desktop action positioning where appropriate

---

## 8. Role-Based UI Rules

### 8.1 Single Surface Rule
- Keep one app shell
- Filter the UI by role
- Do not fork entirely separate frontends for roles

### 8.2 Role Visibility
Navigation and actions must respect backend permissions.

General expectations:
- Owner/Admin: full surface
- Editor: workflow-focused surface
- Designer: assigned-work-focused surface
- Client: limited, read-only or approval-oriented surface

### 8.3 Important Principle
Frontend role filtering is for UX clarity.
Backend remains the source of truth for authorization.

Do not assume hidden buttons equal security.

---

## 9. Implementation Discipline Rules

### 9.1 Scope Control
When implementing a requested batch:
- do only that batch
- do not silently continue into the next batch
- do not add unrequested extras
- do not “improve” by expanding scope

### 9.2 Review Discipline
If a prior review introduced a correction:
- that correction must be reflected in the next implementation plan or prompt
- do not mentally apply changes without writing them explicitly

### 9.3 Prompt / Plan Hygiene
When revising:
- preserve structure where possible
- change only the targeted parts
- avoid unnecessary rewrites

### 9.4 Code Discipline
Prefer:
- simple
- typed
- explicit
- maintainable
solutions

Avoid:
- premature abstraction
- speculative infrastructure
- unnecessary packages
- hidden magic

---

## 10. Foundation-Phase Rules

During foundation/scaffolding:
- do not implement full page polish
- do not implement calendar complexity
- do not implement landing effects
- do not implement broad shadcn surface beyond what is needed
- do not build complete auth business logic unless the batch requires it

Focus first on:
- app skeleton
- layouts
- providers
- API client foundation
- session flow foundation
- route placeholders
- design tokens / globals

---

## 11. Definition of “Good Output”

A good output for this repository:
- follows locked route rules
- follows locked auth rules
- follows build order
- respects design direction
- keeps role-based single app architecture intact
- avoids template smell
- avoids scope creep
- is reviewable in small batches

A bad output:
- adds unapproved libraries
- changes auth model
- introduces `/dashboard`
- starts landing too early
- adds flashy effects in the app
- creates multiple frontends for roles
- ignores already approved design/architecture decisions

---

## 12. If Unsure
If unsure between:
- simple vs clever → choose simple
- quiet vs flashy → choose quiet
- border vs glow → choose border
- one shared app vs split app → choose one shared app
- later vs now → defer non-essential work

This repository values consistency, calmness, and execution discipline over novelty.