---
phase: 02
slug: deal-hub
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-28
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — build + type check as correctness proxy (consistent with Phase 1) |
| **Config file** | none — no test runner installed |
| **Quick run command** | `npm run build && npx tsc --noEmit` |
| **Full suite command** | `npm run build && npx tsc --noEmit` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build && npx tsc --noEmit`
- **After every plan wave:** Run `npm run build && npx tsc --noEmit` + browser smoke test of delivered features
- **Before `/gsd-verify-work`:** Full manual UAT checklist must be green
- **Max feedback latency:** 15 seconds (build check)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-W0-01 | setup | 0 | FILE-01, FILE-02 | T-storage-rls | Storage buckets exist with correct privacy settings | manual | `supabase storage ls` | ❌ W0 | ⬜ pending |
| 02-W0-02 | setup | 0 | FILE-01 | T-storage-rls | Storage RLS policies block cross-user access | manual | SQL policy verification | ❌ W0 | ⬜ pending |
| 02-W0-03 | setup | 0 | OM-03 | — | next.config.ts has remotePatterns for *.supabase.co | unit | `npm run build` | ❌ W0 | ⬜ pending |
| 02-W0-04 | setup | 0 | DEAL-04 | — | Sidebar /deals path match added | unit | `npm run build` | ❌ W0 | ⬜ pending |
| 02-01-01 | deals | 1 | DEAL-01, DEAL-04 | T-idor | deal creation inserts with correct user_id | build+manual | `npm run build && npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 02-01-02 | deals | 1 | DEAL-02, DEAL-03 | T-idor | edit/delete validates user_id ownership via RLS | build+manual | `npm run build && npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 02-02-01 | notes | 2 | NOTE-01, NOTE-02, NOTE-03 | T-idor | notes CRUD scoped to deal owner | build+manual | `npm run build && npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 02-03-01 | files | 3 | FILE-01 | T-storage-rls | upload restricted to user prefix in deal-files bucket | build+manual | `npm run build && npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 02-03-02 | files | 3 | FILE-02 | T-signed-url | signed URLs expire after 1hr, generated server-side | build+manual | `npm run build && npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 02-04-01 | om | 4 | OM-01, OM-02, OM-03 | T-service-role | /om/[id] accessible without auth, no cookies() call | build+manual | `npm run build && npx tsc --noEmit` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `next.config.ts` — add `images.remotePatterns` for `*.supabase.co` storage URLs
- [ ] Supabase Storage — create `deal-files` bucket (private, no public access) via Dashboard or CLI
- [ ] Supabase Storage — create `om-images` bucket (public) via Dashboard or CLI
- [ ] Supabase Storage — add RLS policies to `deal-files` bucket (user prefix isolation)
- [ ] `components/sidebar-nav.tsx` — add `/deals` path match for "Deals" active nav state
- [ ] shadcn components — install: `dialog textarea badge separator alert-dialog select`

*Existing infrastructure (build + tsc) covers automated verification for all subsequent waves.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Deal card shows on dashboard after creation | DEAL-04 | No test framework; UI state | Log in → New Deal → fill form → Save Deal → verify card appears |
| Deal edit persists correctly | DEAL-02 | UI interaction | Open Deal Hub → Edit Deal → change title → Save Deal → verify updated |
| Note inline add/edit/delete | NOTE-01–03 | UI interaction + inline state | Add note → verify appears; Edit → verify updated; Delete → verify removed |
| File upload appears in file list | FILE-01 | Browser file API | Upload <50MB file → verify name + Download link appear |
| Signed URL download opens file | FILE-02 | Network + browser | Click Download → verify file opens in new tab without auth prompt |
| OM page accessible without auth | OM-01, OM-02 | Incognito browser required | Open /om/[deal-id] in incognito → verify deal data visible, no redirect |
| OM page shows no images if none uploaded | OM-03 | Browser | Open OM page for deal with no om-images files → verify no broken img tags |
| Storage RLS cross-user isolation | FILE-01, FILE-02 | Two-account browser test | Upload file as User A → attempt to access storage path as User B → verify 403 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
