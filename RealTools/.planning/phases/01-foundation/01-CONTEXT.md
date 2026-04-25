# Phase 1: Foundation - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a secure, correctly-wired application shell: broker can sign up, log in, and log out; complete DB schema exists with RLS enabled on every table; middleware correctly protects broker routes while leaving /om/* and /api/track/* open for unauthenticated access; and a full app layout shell (sidebar + main content area) is in place for Phase 2 to populate.

**In scope:**
- Next.js 15 project scaffold (TypeScript, TailwindCSS App Router)
- shadcn/ui installation and base theme configuration
- Supabase project creation + Supabase CLI setup + .env.local wiring
- Sign-up, sign-in, and sign-out flows (email/password via Supabase)
- Auth callback Route Handler (/auth/callback)
- middleware.ts with @supabase/ssr — excludes /om/* and /api/track/* from auth
- DB schema migrations (supabase/migrations/) for all 6 tables + RLS + indexes
- Full app layout shell: sidebar nav (Deals, Buyers, Profile) + main content area + logout
- /dashboard placeholder (shell only — content delivered in Phase 2)

**Out of scope:**
- Deal CRUD, notes, files (Phase 2)
- Buyers CRM, OM page, Send OM, tracking (Phase 3)
- OAuth / magic link auth — email/password only
- Light/dark mode toggle — dark mode only

</domain>

<decisions>
## Implementation Decisions

### Auth Page Design
- **D-01:** Centered card layout — form centered on a neutral/dark background. No split panel.
- **D-02:** Text logo only — "RealTools" in a clean font above the card. No icon, no tagline.
- **D-03:** Zinc/Neutral shadcn/ui color theme — zinc-950 background, zinc-900 card, zinc-50 text, zinc-800 borders, white primary button.
- **D-04:** Dark mode only — no light/dark toggle, no next-themes. `class="dark"` on `<html>` always.

### App Layout Shell
- **D-05:** Full app layout shell delivered in Phase 1 — sidebar + main content area. Phase 2 fills deal content. Avoids layout disruption mid-build.
- **D-06:** Sidebar nav items: Deals, Buyers, Profile. Logout button at bottom of sidebar. Buyers and Profile links are present but link to placeholder pages — content built in later phases.

### Supabase Setup
- **D-07:** Supabase project not yet created — Phase 1 plan includes: create Supabase project (dashboard), obtain NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, initialize Supabase CLI, link project.
- **D-08:** Migrations via Supabase CLI — `supabase migration new` / `supabase db push`. Migration files committed to `supabase/migrations/`. Never write schema via dashboard (bypasses RLS verification).

### Locked from Planning (pre-decided)
- Supabase client: `@supabase/ssr` with `createServerClient` only — `@supabase/auth-helpers-nextjs` is banned.
- Server-side auth check: `getUser()` only — never `getSession()` (silent security hole).
- Middleware: matcher explicitly excludes `/om` and `/api/track` — must be correct before any page is built.
- Service role key: `SUPABASE_SERVICE_ROLE_KEY` in server-only modules only — never `NEXT_PUBLIC_*`.
- RLS: every table gets `ENABLE ROW LEVEL SECURITY` + policy in the same migration, no exceptions.
- Auth redirect: sign-up → /dashboard, sign-in → /dashboard, sign-out → /auth/login.
- Tables: deals, notes, buyers, deal_buyers, activities, deal_files — all 6 in Phase 1 migrations.

### Claude's Discretion
- Auth error feedback style — not discussed. Claude decides: inline field errors using shadcn/ui form validation (react-hook-form + zod pattern) preferred over toast for auth forms.
- Exact sidebar component structure (fixed vs collapsible) — standard fixed sidebar for v1.
- Auth form component organization — Claude decides file structure.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Planning
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, requirements (AUTH-01, AUTH-02, AUTH-03)
- `.planning/REQUIREMENTS.md` — Full requirement specs for AUTH-01–03
- `.planning/research/SUMMARY.md` — Critical pitfalls (top 5 apply to Phase 1), locked decisions, build order rationale
- `.planning/research/ARCHITECTURE.md` — Data model SQL schema, component boundaries, middleware pattern

### Stack / Security Rules
- `CLAUDE.md` — Critical rules: getUser() not getSession(), middleware exclusions, service role key scope, RLS mandatory, no global state

### No external specs — requirements fully captured in decisions above and canonical refs.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project. No existing components, hooks, or utilities.

### Established Patterns
- None established yet — Phase 1 creates the patterns all subsequent phases will follow.

### Integration Points
- All future phases integrate into the app shell created in this phase.
- Phase 2 (Deal Hub) populates /dashboard and adds /deals/[id] routes within the layout shell.
- Phase 3 (Buyers) adds /buyers routes within the same layout shell.
- /om/* and /api/track/* routes live outside the authenticated layout shell — public-facing.

</code_context>

<specifics>
## Specific Ideas

- No specific references or "I want it like X" moments from discussion — open to standard shadcn/ui patterns throughout.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-04-24*
