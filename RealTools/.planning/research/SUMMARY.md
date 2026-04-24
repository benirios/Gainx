# Project Research Summary

**Project:** RealTools — CRE Deal Management SaaS
**Domain:** Commercial real estate broker productivity / deal management SaaS
**Researched:** 2026-04-24
**Confidence:** HIGH

## Executive Summary

RealTools is a single-tenant SaaS product for individual CRE brokers. Its core differentiator is a unified Deal Hub — one URL containing deal data, notes, files, a hosted Offering Memorandum, and per-buyer engagement tracking. No existing tool (Buildout, Dealpath, Apto, generic CRMs) combines all of these in one workspace. The MVP is correctly scoped: the feature set in PROJECT.md covers all table-stakes CRE broker expectations and the two most valuable differentiators (hosted OM URL + per-buyer tracking) without overbuilding.

The recommended architecture is a Next.js 15 App Router monolith deployed on Vercel, with Supabase handling auth, Postgres (RLS-enforced), and Storage. There is no separate backend service. The split between authenticated broker routes and the public-facing OM page is the central architectural constraint — middleware must explicitly exclude `/om/*` and `/api/track/*` from auth protection, and the OM page must use the Supabase service role key (not a user session) to read deal data. This is non-negotiable infrastructure that must be correct from day one.

The top risk is auth security, specifically using the wrong Supabase client pattern. Using `getSession()` instead of `getUser()` server-side, or importing from the deprecated `@supabase/auth-helpers-nextjs` package, introduces silent security vulnerabilities that only fail in production. The second major risk is tracking reliability: email tracking pixels fail against Gmail pre-fetch and Apple Mail Privacy Protection. The correct approach — confirmed by research — is URL-based tracking as the primary mechanism: the OM email contains the link `/om/[deal-id]?ref=[tracking-token]`, and the OM page records the visit on page load. The pixel is a secondary supplement, not the primary signal.

---

## Key Findings

### Recommended Stack

The stack is fully decided and high-confidence. No alternatives are under consideration. The only library choice with non-trivial consequence is `@supabase/ssr` (required, replacing the deprecated `@supabase/auth-helpers-nextjs`). All other library decisions are conventional for the 2025 Next.js ecosystem.

**Core technologies:**

- **Next.js 15 (App Router)**: full-stack framework; Server Components for data fetching, Server Actions for mutations, Route Handlers for GET-only endpoints (tracking pixel, auth callback)
- **@supabase/ssr**: SSR-safe Supabase client; provides `createServerClient` for middleware/Server Components and `createBrowserClient` for Client Components; deprecated predecessor must not be used
- **Supabase Postgres with RLS**: all tables must have RLS enabled at creation; service role key used only server-side for unauthenticated contexts (OM page, tracking endpoint)
- **Supabase Storage (two-bucket)**: `deal-files` (private, signed URLs) for broker documents; `om-images` (public) for images embedded in the public OM page
- **Resend + React Email**: transactional email with React component templates; Resend does not provide per-recipient open tracking as of the knowledge cutoff — implement custom tracking
- **Vercel**: native Next.js platform; edge middleware runs session refresh without Lambda cold starts
- **shadcn/ui + TailwindCSS**: component primitives copied into codebase (not an npm dep); no full component library
- **react-hook-form + zod**: form state + validation; single schema shared between client validation and Server Action input parsing
- **TanStack Table v8**: headless table logic for deal dashboard and buyer list; styled with Tailwind
- **date-fns**: lightweight date formatting; Moment.js must not be used

### Expected Features

Every table-stakes feature is already in the PROJECT.md active list. The v1 scope is correctly calibrated.

**Must have (table stakes) — all currently in scope:**
- Deal list / dashboard with status tracking (active / negotiating / closed)
- Per-deal notes (add, edit, delete)
- File storage per deal (Supabase Storage)
- Buyer/contact list with tags (asset class, geography, budget)
- OM / marketing package as a hosted HTML page
- Send OM link via email to selected buyers
- Activity log per deal (OM sent, note added, file uploaded)
- Deal address / property details as structured fields

**Should have (differentiators) — in scope:**
- Per-buyer OM open tracking — the terminal-node feature; what makes RealTools actionable vs. just informational
- Hosted public OM URL (`/om/[deal-id]`) — shareable, always-current, trackable; meaningfully better than PDF attachments
- Tag-based buyer matching — filter buyer pool before sending; replaces color-coded Excel tabs

**Recommended additions (low effort, high value, not yet in scope):**
- OM open count badge on deal list dashboard (shows "3 buyers opened" without clicking into deal)
- Last-activity timestamp per deal (surfaces stale deals)

**Defer to v2+ with conviction:**
- PDF OM export — revisit only if 3+ users churn citing it
- Buyer CSV import — revisit at 50+ buyers in system
- Pipeline/Kanban view — revisit at 20+ active deals
- Team/multi-user access — v2 pricing tier unlock
- Real-time activity log — polling is sufficient for v1; Realtime adds 2-3x implementation complexity
- Email template editor, AI copy assist, document e-signing, billing

### Architecture Approach

The architecture is a single Next.js monolith with a strict public/private route split. Authenticated broker routes (`/dashboard`, `/deals/*`) are protected by `middleware.ts` using `createServerClient` + `getUser()`. The public OM route (`/om/[deal-id]`) and tracking endpoint (`/api/track/[token]`) are explicitly excluded from the middleware matcher and use the service role key server-side. There is no separate API service — Server Actions handle all authenticated mutations; Route Handlers handle the two GET-only cases (tracking pixel, Supabase auth callback).

**Major components:**

1. **Dashboard (`/dashboard`)** — Server Component; lists all broker deals, status badges, activity summary; New Deal CTA opens modal
2. **Deal Hub (`/deals/[id]`)** — Server Component page; child Client Components handle interactive mutations (status change, note add, file upload, buyer select + send); single page-level fetch for all deal data to avoid N+1
3. **Public OM Page (`/om/[deal-id]`)** — Server Component; service role Supabase client; no `cookies()` call anywhere in render tree; includes `<img src="/api/track/[token]">` for pixel tracking; renders deal data + om-images bucket images
4. **Tracking endpoint (`/api/track/[token]`)** — Route Handler (GET); returns 1x1 transparent GIF; writes to `deal_buyers.om_opened_at` and `activities` using service role; idempotent (only writes if `om_opened_at IS NULL`)
5. **Send OM flow** — Server Action; generates `tracking_token` per buyer in `deal_buyers`; sends Resend email containing OM URL with `?ref=[token]` appended; OM page reads token from query param and embeds it in pixel
6. **Buyers CRM** — Client Component; tag-based filtering, buyer selection for a deal send; backed by `buyers` and `deal_buyers` tables

**Data model (locked):**

```
deals (user_id FK)
  - notes (deal_id FK, user_id FK)
  - deal_files (deal_id FK)
  - activities (deal_id FK) — append-only, service role writes only
  - deal_buyers (deal_id + buyer_id composite PK)
      - tracking_token UUID — unique per deal+buyer pair
      - om_sent_at TIMESTAMPTZ
      - om_opened_at TIMESTAMPTZ — set on first pixel/URL hit

buyers (user_id FK) — global to broker, reusable across deals
  - tags TEXT[] — array field, OR logic for filtering
```

### Critical Pitfalls

**Top 5 — must be addressed before or during Phase 1:**

1. **Wrong Supabase auth client in middleware** — Using `createClient` (browser client) or importing from `@supabase/auth-helpers-nextjs` in `middleware.ts` silently fails: protected routes become accessible to unauthenticated users. Use `createServerClient` from `@supabase/ssr` exclusively; ban the deprecated package from the project. Phase: 1.

2. **`getSession()` used server-side instead of `getUser()`** — `getSession()` trusts the cookie without server-side JWT validation; an expired or crafted token passes the check. `getUser()` makes a Supabase Auth network call to validate. Establish as a lint rule before any route is built. Phase: 1.

3. **RLS disabled or misconfigured on any table** — Supabase tables have RLS off by default. CRE data is high-sensitivity; cross-user data exposure destroys broker trust. Every migration includes `ENABLE ROW LEVEL SECURITY` + policy as a single atomic commit; never test via Supabase dashboard (it bypasses RLS). Phase: 1.

4. **OM middleware exclusion missing** — If the auth middleware uses a catch-all matcher, `/om/[deal-id]` gets intercepted and buyers are redirected to login. Explicitly exclude `/om` and `/api/track` from middleware matcher. Must be correct before the OM page exists. Phase: 1.

5. **Tracking pixel as primary open tracking signal** — Gmail pre-fetches images at send time (immediate false positive); Apple Mail Privacy Protection pre-fetches for all recipients; Outlook blocks images by default. Use URL-based tracking as the PRIMARY signal: OM email contains `/om/[deal-id]?ref=[tracking-token]`; OM page records visit on load. Pixel is a secondary supplement only. Phase: 3.

---

## Implications for Roadmap

Research confirms a strict dependency chain. Each layer depends on the previous. The order below is not a suggestion — it is forced by the data model and security constraints.

### Phase 1: Foundation — Auth, Schema, RLS

**Rationale:** Everything depends on auth. RLS depends on auth. The middleware exclusion must be correct before any page is built. Schema cascade deletes must be in initial migrations (not retrofitted). Highest-risk phase for irreversible mistakes.

**Delivers:** Working sign-up / sign-in / sign-out; complete DB schema with RLS policies; correct middleware with `/om` exclusion; service role key isolated to server-only modules; `ON DELETE CASCADE` on all FK relationships; required indexes on `deals.user_id`, `activities.deal_id`, `deal_buyers.tracking_token`.

**Locked decisions to make in this phase:**
- `@supabase/ssr` + `createServerClient` only in server-side code
- `getUser()` only for server-side auth checks (lint rule)
- Middleware matcher explicitly excludes `/om` and `/api/track`
- Service role key in `server-only` modules only; never in `NEXT_PUBLIC_*`
- RLS + policy in every migration, no exceptions
- Two-bucket storage strategy decided: `deal-files` (private) and `om-images` (public)

**Research flag:** Standard patterns — no additional research needed.

---

### Phase 2: Deal Hub — Deals, Notes, Files, OM Page

**Rationale:** Deals are the root object; notes, files, and the OM page all depend on deals existing. OM page must come before tracking (tracking pixel needs a page to live in).

**Delivers:** Deal creation form + dashboard list; Deal Hub page shell; notes CRUD; file upload to `deal-files` bucket with signed URL display; public OM page at `/om/[deal-id]` (service role, no cookies, force-dynamic); OM template using om-images bucket.

**Must avoid:** Private bucket for sensitive files (signed URLs for display); every Server Action calls `revalidatePath`; OM page must not call `cookies()` anywhere in render tree; use service-role Supabase client in OM route only.

**Research flag:** Standard patterns — no additional research needed.

---

### Phase 3: Buyers CRM + Send OM + Tracking

**Rationale:** Buyers must exist before sending. Send OM requires both buyers and the OM page. Tracking depends on the OM URL existing. This phase delivers the core product differentiator.

**Delivers:** Buyers CRUD with tag assignment; tag-based buyer filter (OR logic); deal_buyers join table population; Send OM flow (generate tracking tokens, send Resend email with OM URL + `?ref=[token]`); tracking endpoint returning 1x1 GIF; OM page reads `ref` param and records page visit; activity log per deal.

**Critical tracking architecture:**
- Email contains: `https://realtools.io/om/[deal-id]?ref=[tracking-token]`
- OM page reads `ref` param in Server Component and writes to `deal_buyers.om_opened_at` + `activities` on first load (service role, idempotent)
- OM page also embeds `<img src="/api/track/[token]">` as secondary signal
- UI labels open counts as "engagement signals" — not "confirmed open"

**Pre-send checklist (before first real broker test):**
- Resend sending domain verified (DKIM/SPF/DMARC) — allow 24-48h DNS propagation
- Email template includes physical address and unsubscribe link (CAN-SPAM)
- Rate limiting on `/om/` route (even basic IP-based via Vercel middleware)
- Tracking deduplication confirmed (only first event per token recorded)
- Upgrade Supabase to Pro before any stakeholder demo (avoid free tier pause)

**Research flag:** URL-based tracking pattern is specified. Verify current Resend per-recipient tracking capability before building — if native support exists, evaluate alongside custom implementation.

---

### Phase Ordering Rationale

- Auth precedes everything — RLS relies on `auth.uid()`
- Schema + RLS in Phase 1 — retrofitting after data exists is error-prone
- Middleware exclusion in Phase 1 — must be correct before the OM page is created, otherwise bugs are misattributed
- Deals before notes/files — notes and files are children of deals; no deal ID = no attachment target
- OM page before tracking — pixel lives in the OM page
- OM page before Send OM — cannot send a link to a page that doesn't exist
- Activity log in Phase 3 — read-only view of events written by earlier layers; naturally last

### Research Flags

No phase requires additional research-phase invocation. All patterns are HIGH confidence.

**Verify before Phase 3 build (not a blocking research gap):**
- Check current Resend docs for per-recipient open tracking capability
- Confirm Supabase Storage signed URL behavior with service role key (known edge cases in Storage RLS)

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official package deprecations, Next.js App Router semantics, and Supabase SSR patterns are well-established |
| Features | HIGH | Table-stakes features are stable domain knowledge; competitor specifics are MEDIUM (unverified against live sites) |
| Architecture | HIGH | All patterns from official Next.js + Supabase docs; component boundaries and data flow are unambiguous |
| Pitfalls | HIGH | Auth pitfalls explicitly documented by Supabase; tracking limitations well-documented in email industry |

**Overall confidence:** HIGH

### Gaps to Address

- **Resend per-recipient tracking:** Verify current Resend feature set before Phase 3. URL-based tracking is implemented regardless.
- **Next.js 15 Server Action body size limit:** Confirm exact `bodySizeLimit` in `next.config.ts` for Vercel deployment tier before file upload implementation.
- **OM visual design:** Get explicit broker feedback on the HTML template in Phase 2 before building Send OM in Phase 3. Design rework between phases is cheaper than after tracking is wired up.
- **Supabase free tier pause:** Upgrade to Supabase Pro before any stakeholder demo.

---

## Sources

### Primary (HIGH confidence)
- Supabase official docs — `@supabase/ssr` package, middleware patterns, RLS, Storage signed URLs, `getUser()` vs `getSession()` security note
- Next.js 15 App Router official docs — Server Components, Route Handlers, Server Actions, `revalidatePath`, middleware matcher config
- React 19 release documentation — `useActionState`, form actions

### Secondary (MEDIUM confidence)
- Resend API documentation (training data, cutoff Aug 2025) — feature set may have changed; verify per-recipient tracking
- Email industry sources — Gmail pre-fetch behavior, Apple Mail Privacy Protection; pixel tracking limitations well-established
- Competitor product documentation (Buildout, Dealpath, Apto) — training data only; spot-check before Phase 2+ decisions

### Tertiary (LOW confidence)
- Specific npm versions (`^2.x`, `^3.x`) — correct at training cutoff; pin exact versions after `npm install` and commit lockfile

---
*Research completed: 2026-04-24*
*Ready for roadmap: yes*
