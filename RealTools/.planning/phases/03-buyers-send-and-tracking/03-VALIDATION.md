---
phase: 3
slug: buyers-send-and-tracking
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-30
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test framework in project |
| **Config file** | none |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx tsc --noEmit && npx next build` |
| **Estimated runtime** | ~30 seconds |

No automated test framework. All requirement verifications are manual smoke tests or TypeScript type-check + build confirmation. Manual verification steps are specified per-plan in `<verification>` and `<success_criteria>` blocks.

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsc --noEmit && npx next build`
- **Before `/gsd-verify-work`:** Full build must be green + manual smoke test checklist complete
- **Max feedback latency:** ~30 seconds (tsc only)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 03-01 | 1 | BUYER-01/02/03 | T-3-IDOR | buyers scoped to user_id via RLS | manual | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 3-01-02 | 03-01 | 1 | BUYER-04 | — | N/A | manual | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 3-02-01 | 03-02 | 1 | SEND-01/02 | T-3-RESEND | email escaping; service-only key | manual | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 3-02-02 | 03-02 | 1 | TRACK-01/03 | T-3-IDOR | idempotent first-open only | manual | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 3-02-03 | 03-02 | 1 | TRACK-02 | T-3-TOKEN | always return GIF (no 404 leak) | manual | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 3-03-01 | 03-03 | 2 | ACT-01/02 | — | N/A | manual | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No test framework to install. TypeScript compiler serves as primary automated gate.

- [ ] `npx tsc --noEmit` passes after every plan wave
- [ ] `npx next build` passes at phase end
- [ ] Manual smoke test checklist in each plan's `<verification>` block

*No new test files required — no test infrastructure in this project.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| createBuyerAction inserts buyer row | BUYER-01 | No test framework | Create buyer via UI; verify row in Supabase dashboard |
| deleteBuyerAction removes buyer row | BUYER-03 | No test framework | Delete buyer via UI; verify row removed |
| sendOmAction calls Resend batch | SEND-01 | Requires live Resend API | Send OM to test buyer; verify email received |
| Each buyer gets unique ?ref= URL | SEND-02 | Requires live email send | Inspect email HTML; verify distinct token per buyer |
| OM page records first open | TRACK-01 | Requires live DB | Visit OM URL with ?ref=token; verify om_opened_at set in deal_buyers |
| /api/track/[token] returns 1x1 GIF | TRACK-02 | Requires live route | curl /api/track/[valid-token]; verify 200 + GIF response |
| Second OM visit does not overwrite om_opened_at | TRACK-03 | Requires live DB | Visit OM URL twice; verify om_opened_at unchanged after second visit |
| ActivityLogSection shows correct events | ACT-01/02 | UI rendering | Verify all event types render correctly in Deal Hub |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
