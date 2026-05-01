---
phase: 03-buyers-send-and-tracking
plan: "03"
subsystem: tracking
tags: [tracking, pixel, open-recorder, idempotent, service-role, public-route]
dependency_graph:
  requires:
    - lib/supabase/service.ts (createSupabaseServiceClient)
    - types/supabase.ts (Database types — deal_buyers, buyers, activities)
    - app/om/[id]/page.tsx (extended, pre-existing)
    - middleware.ts (pre-existing /api/track/* exclusion)
  provides:
    - lib/tracking/record-om-open.ts (recordOmOpenByToken — shared idempotent recorder)
    - app/api/track/[token]/route.ts (public pixel route returning 1x1 GIF)
    - app/om/[id]/page.tsx (primary URL tracking + secondary pixel embed)
  affects:
    - Deal Hub activity log (om_opened events consumed by 03-04 ActivityLogSection)
    - deal_buyers table (om_opened_at column set on first open)
    - activities table (om_opened rows inserted on first open)
tech_stack:
  added: []
  patterns:
    - Shared idempotent recorder called from both URL and pixel paths
    - Service-role client for unauthenticated DB writes (no cookies() call)
    - Constant-time pixel response regardless of token validity (STRIDE T-03-07/08)
    - om_opened_at null-check guard for first-open idempotency (T-03-09)
    - Next.js 15 searchParams as Promise<{ref?: string}> pattern
key_files:
  created:
    - lib/tracking/record-om-open.ts
    - app/api/track/[token]/route.ts
  modified:
    - app/om/[id]/page.tsx
decisions:
  - D-12 honored: URL-based tracking is PRIMARY — recordOmOpenByToken called directly in Server Component
  - D-13 honored: Pixel is SECONDARY fallback — <img> embed only when ref present
  - D-09 honored: om_opened activity metadata includes buyer_id, buyer_name, buyer_email
  - T-03-08 mitigated: Unknown tokens return same GIF 200 as valid tokens — no disclosure
  - T-03-09 mitigated: om_opened_at null-check ensures first-open-only semantics
metrics:
  duration: "152 seconds"
  completed: "2026-05-01"
  tasks_completed: 2
  files_created: 2
  files_modified: 1
  commits: 3
---

# Phase 03 Plan 03: OM Open Tracking Summary

**One-liner:** Idempotent per-buyer OM open tracking via shared `recordOmOpenByToken()` recorder — URL primary signal + GIF pixel secondary fallback, both enforcing first-open-only semantics via `om_opened_at` null-check.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Build shared idempotent open recorder and pixel route | f3dfd1c, 9bdf1d0, dcd3549 | lib/tracking/record-om-open.ts, app/api/track/[token]/route.ts |
| 2 | Add primary URL tracking and secondary pixel embed to OM page | 31813c1 | app/om/[id]/page.tsx |

## What Was Built

### `lib/tracking/record-om-open.ts`

Single shared function `recordOmOpenByToken(token)` used by both tracking paths:

1. Looks up `deal_buyers` row by `tracking_token` using service-role client
2. If unknown token → returns silently (no error, no disclosure)
3. If `om_opened_at` is already set → returns silently (idempotency guard)
4. On first open: sets `om_opened_at = now()`, fetches buyer name/email, inserts `om_opened` activity row with full metadata

### `app/api/track/[token]/route.ts`

Public GET route handler (already excluded from middleware auth):
- Calls `recordOmOpenByToken(token)` then unconditionally returns 1x1 transparent GIF
- Response headers: `Content-Type: image/gif`, `Cache-Control: no-store`
- Always HTTP 200 regardless of token validity (prevents token existence probing)

### `app/om/[id]/page.tsx` (extended)

- Added `searchParams: Promise<{ ref?: string }>` to component props (Next.js 15 pattern)
- Calls `recordOmOpenByToken(ref)` on Server Component render when `ref` is present (PRIMARY signal)
- Embeds `<img src="/api/track/${ref}" width="1" height="1" style={{display:'none'}} alt="">` at bottom of page when `ref` is present (SECONDARY signal)

## Decisions Made

- Both URL and pixel paths call the same `recordOmOpenByToken()` — whoever fires first wins; the second call is a no-op due to `om_opened_at` guard
- Service-role client used throughout tracking module — `createSupabaseServerClient()` is explicitly banned here as it calls `cookies()` which throws in unauthenticated context
- Pixel embed uses `eslint-disable @next/next/no-img-element` inline — correct for tracking pixels (Next.js Image optimization not appropriate for 1x1 invisible elements)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed stale eslint-disable directive**
- **Found during:** Task 1 lint verification
- **Issue:** `// eslint-disable-next-line @typescript-eslint/no-explicit-any` was placed above `createSupabaseServiceClient()` call instead of the `supabase.from() as any` cast — generated ESLint warning for unused directive
- **Fix:** Removed the orphaned comment; the four `as any` casts that actually need suppression already had their own inline directives
- **Files modified:** lib/tracking/record-om-open.ts
- **Commit:** 9bdf1d0

**2. [Rule 1 - Bug] Made first-open recording atomic**
- **Found during:** Phase 3 code review
- **Issue:** URL tracking and the fallback pixel can arrive nearly together. The previous read-then-update null check could allow both requests to see `om_opened_at = null` and insert duplicate `om_opened` activities.
- **Fix:** Changed the recorder to claim first open with a conditional `update(...).is('om_opened_at', null).select(...)`; unknown or already-opened tokens return without activity insertion.
- **Files modified:** lib/tracking/record-om-open.ts
- **Commit:** dcd3549

## Known Stubs

None — all tracking paths write real data to the database.

## Threat Flags

No new threat surfaces beyond what the plan's `<threat_model>` already covers. The `/api/track/[token]` endpoint was pre-excluded by middleware. No new auth paths or network endpoints introduced outside plan scope.

## Self-Check: PASSED

- [x] `lib/tracking/record-om-open.ts` exists and exports `recordOmOpenByToken`
- [x] `app/api/track/[token]/route.ts` exists and exports `GET`
- [x] `app/om/[id]/page.tsx` updated with `searchParams`, primary URL call, and pixel embed
- [x] `npx tsc --noEmit` passes (0 errors)
- [x] `npx eslint` passes (0 errors, 0 warnings)
- [x] Commits f3dfd1c, 31813c1, 9bdf1d0, dcd3549 exist in git log
- [x] No unexpected file deletions across any commit
