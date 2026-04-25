# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-24)

**Core value:** Every deal has one central workspace — broker never has to hunt across email, spreadsheets, and Drive to find deal status or contact buyers.
**Current focus:** Phase 1 — Foundation

## Current Position

Phase: 1 of 3 (Foundation)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-04-24 — Roadmap created (3 phases, 22 requirements mapped)

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: —
- Trend: —

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Phase 1]: Use `@supabase/ssr` + `createServerClient` only — ban deprecated `@supabase/auth-helpers-nextjs`
- [Phase 1]: Use `getUser()` server-side only — never `getSession()` (lint rule)
- [Phase 1]: Middleware matcher must explicitly exclude `/om/*` and `/api/track/*`
- [Phase 1]: Service role key in `server-only` modules only — never in `NEXT_PUBLIC_*`
- [Phase 1]: RLS + policy in every migration, no exceptions
- [Phase 2]: Two-bucket Supabase Storage strategy — `deal-files` (private, signed URLs) and `om-images` (public)
- [Phase 3]: URL-based tracking is PRIMARY signal; pixel is secondary — label UI as "engagement signals"

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 3 pre-check]: Verify current Resend per-recipient tracking capability before building Send OM — URL-based tracking implemented regardless
- [Phase 3 pre-check]: Confirm Supabase Storage signed URL behavior with service role key (known edge cases in Storage RLS)
- [Pre-demo]: Upgrade Supabase to Pro before any stakeholder demo (avoid free tier pause)
- [Phase 2 gate]: Get broker feedback on OM HTML template design before building Send OM in Phase 3 — cheaper to rework between phases

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-04-24
Stopped at: Roadmap created — ready to plan Phase 1
Resume file: None
