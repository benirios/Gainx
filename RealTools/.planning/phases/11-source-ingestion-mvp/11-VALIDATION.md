---
phase: 11
slug: source-ingestion-mvp
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-03
---

# Phase 11 — Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript compiler + ESLint + targeted smoke scripts |
| **Config file** | `tsconfig.json`, `eslint.config.mjs`, `supabase/migrations/*.sql` |
| **Quick run command** | `npm run lint` |
| **Full suite command** | `npm run lint && npx tsc --noEmit` |
| **Estimated runtime** | ~30-90 seconds |

## Sampling Rate

- **After every task commit:** Run `npm run lint`
- **After every plan wave:** Run `npm run lint && npx tsc --noEmit`
- **Before `$gsd-verify-work`:** Full suite green, schema push attempted, parser smoke checked
- **Max feedback latency:** 90 seconds

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Secure Behavior | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------------|-----------|-------------------|--------|
| 11-01-T1 | 11-01 | 1 | SRC-04 | Import runs are user-scoped with RLS | sql inspection | `rg "CREATE TABLE listing_import_runs|ENABLE ROW LEVEL SECURITY|Users can manage own listing import runs" supabase/migrations/009_listing_import_runs.sql` | pending |
| 11-01-T2 | 11-01 | 1 | SRC-04 | Run helpers write only authenticated user's rows | typecheck | `npx tsc --noEmit` | pending |
| 11-02-T1 | 11-02 | 2 | SRC-01, SRC-02 | OLX extraction is bounded and best-effort | typecheck/smoke | `npx tsc --noEmit` | pending |
| 11-02-T2 | 11-02 | 2 | SRC-01, SRC-04 | OLX action requires auth and records failures | lint/typecheck | `npm run lint && npx tsc --noEmit` | pending |
| 11-03-T1 | 11-03 | 3 | SRC-03 | CSV parser validates required fields | typecheck/parser smoke | `npx tsc --noEmit` | pending |
| 11-03-T2 | 11-03 | 3 | SRC-04 | UI shows targets, import forms, and run status | lint/typecheck | `npm run lint && npx tsc --noEmit` | pending |

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live OLX scrape | SRC-01, SRC-02 | Source availability and markup can change | Run one configured OLX target with a low cap; confirm run row and listing rows are created or failure is recorded. |
| Supabase schema push | SRC-04 | Requires authenticated Supabase CLI | Run `supabase db push` after migration. |

## Validation Sign-Off

- [x] All tasks have automated verification or documented manual checks
- [x] No watch-mode commands
- [x] Feedback latency target under 90 seconds
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-03
