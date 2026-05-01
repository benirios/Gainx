---
phase: 03-buyers-send-and-tracking
plan: "02"
subsystem: email-distribution
tags: [resend, server-actions, deal-buyers, tracking, activity-log]
requires:
  - phase: 03-buyers-send-and-tracking
    provides: buyers CRM and OM tracking endpoints
provides:
  - Deal Hub Send OM modal
  - Resend-backed per-buyer OM email delivery
  - Stable tracked OM links through deal_buyers tracking tokens
  - om_sent activity events after successful delivery
affects: [deal-hub, buyers, activity-log, om-tracking]
tech-stack:
  added: []
  patterns: [server-only vendor singleton, useActionState modal action, service-role activity insert]
key-files:
  created:
    - lib/resend.ts
    - lib/email/om-email.ts
    - lib/actions/send-om-action.ts
    - components/deals/send-om-modal.tsx
  modified:
    - app/(app)/deals/[id]/page.tsx
key-decisions:
  - "Create/reuse deal_buyer tracking tokens before sending, then stamp om_sent_at and insert om_sent activities only after Resend succeeds."
  - "Use NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_SITE_URL, VERCEL_URL, then localhost fallback to build tracked OM URLs."
patterns-established:
  - "Server action validates deal ownership and selected buyer ownership before any send."
  - "Resend delivery uses one personalized batch payload per buyer with /om/[deal-id]?ref=[token]."
requirements-completed: [BUYER-04, SEND-01, SEND-02, ACT-01]
duration: 35min
completed: 2026-05-01
---

# Phase 03: Send OM Flow Summary

**Deal Hub can send personalized tracked OM links to selected buyers through Resend, with sent status visible in the modal.**

## Performance

- **Duration:** 35 min
- **Started:** 2026-05-01T17:05:00Z
- **Completed:** 2026-05-01T17:40:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Added a server-only Resend client and OM email HTML/text builder.
- Implemented `sendOmAction` with selected buyer validation, stable deal_buyer token creation, Resend batch delivery, `om_sent_at` update, and `om_sent` activity insert.
- Added the Deal Hub `SendOmModal` with buyer checklist, sent badges, pending state, validation errors, and success toast.
- Extended Deal Hub server data fetching to load broker buyers and per-deal send status in the existing parallel query pattern.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create send OM backend pipeline** - `a3fb06a` (feat)
2. **Task 2: Build Send OM modal with sent badges and re-send support** - `431d922` (feat)
3. **Task 3: Wire Send OM modal into Deal Hub data flow** - `7ae38c9` (feat)

## Files Created/Modified

- `lib/resend.ts` - Server-only Resend singleton.
- `lib/email/om-email.ts` - Personalized OM email HTML/text builders.
- `lib/actions/send-om-action.ts` - Deal ownership validation, buyer association, tracked URL generation, Resend batch send, and activity logging.
- `components/deals/send-om-modal.tsx` - Client modal for buyer selection and send submission.
- `app/(app)/deals/[id]/page.tsx` - Deal Hub buyer/status queries and modal placement in header actions.

## Decisions Made

- `om_sent_at` and `om_sent` activities are written after Resend succeeds so the activity log represents actual send completion.
- Existing `tracking_token` values are preserved by upserting only `deal_id` and `buyer_id`, then reading the generated or existing token.
- Missing `RESEND_API_KEY` returns a server-action validation error instead of creating associations or activity rows.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Correctness] Logged send status only after provider success**
- **Found during:** Task 1 (Create send OM backend pipeline)
- **Issue:** The plan listed association, activity insert, then Resend send. That order could create `om_sent` activity rows even when Resend failed.
- **Fix:** Create/reuse tracking tokens first, call `resend.batch.send`, then update `om_sent_at` and insert `om_sent` activities only after send success.
- **Files modified:** `lib/actions/send-om-action.ts`
- **Verification:** `npx tsc --noEmit`; grep verified `batch.send` and `om_sent` paths.
- **Committed in:** `a3fb06a`

---

**Total deviations:** 1 auto-fixed (1 correctness)
**Impact on plan:** Activity and sent-status semantics are more accurate. No scope expansion.

## Issues Encountered

- The plan's lint command used `npm run lint -- --file ...`, but this project uses ESLint v9 directly and rejects `--file`. Equivalent file-targeted lint passed with `npm run lint -- lib/actions/send-om-action.ts components/deals/send-om-modal.tsx`.

## Verification

- `npx tsc --noEmit` passed.
- `grep -n "sendOmAction\|batch.send\|om_sent" lib/actions/send-om-action.ts` passed.
- `grep -n "Send OM\|Sent \|buyerIds" components/deals/send-om-modal.tsx` passed.
- `grep -n "SendOmModal\|deal_buyers\|buyers" app/(app)/deals/[id]/page.tsx` passed.
- `npm run lint -- lib/actions/send-om-action.ts components/deals/send-om-modal.tsx` passed.

## User Setup Required

- `RESEND_API_KEY` must be set before sending emails.
- `RESEND_FROM_EMAIL` should be set to a verified sender or domain. The implementation falls back to `onboarding@resend.dev` for development.
- Set `NEXT_PUBLIC_APP_URL` or `NEXT_PUBLIC_SITE_URL` in deployed environments so tracked OM URLs point at the production app.

## Next Phase Readiness

Plan 03-04 can now read `om_sent` and `om_opened` activity rows and display them in the Deal Hub timeline.

---
*Phase: 03-buyers-send-and-tracking*
*Completed: 2026-05-01*
