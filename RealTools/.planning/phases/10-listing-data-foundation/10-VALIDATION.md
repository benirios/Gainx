---
phase: 10
slug: listing-data-foundation
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-03
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript compiler + ESLint + SQL inspection |
| **Config file** | `tsconfig.json`, `eslint.config.mjs`, `supabase/migrations/*.sql` |
| **Quick run command** | `npm run lint` |
| **Full suite command** | `npm run lint && npx tsc --noEmit` |
| **Estimated runtime** | ~30-60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint`
- **After every plan wave:** Run `npm run lint && npx tsc --noEmit`
- **Before `$gsd-verify-work`:** Full suite must be green and schema push/reset must be attempted
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 10-01-T1 | 10-01 | 1 | DATA-01 | T10-01-HIGH-01 | New listing tables are user-scoped | sql inspection | `rg "CREATE TABLE listings|user_id|ENABLE ROW LEVEL SECURITY|CREATE POLICY" supabase/migrations/008_listing_data_foundation.sql` | ✅ W0 | ⬜ pending |
| 10-01-T2 | 10-01 | 1 | DATA-02 | T10-01-HIGH-02 | Dedupe is user-scoped by source URL | sql inspection | `rg "UNIQUE.*user_id.*source.*source_url|unique_listing" supabase/migrations/008_listing_data_foundation.sql` | ✅ W0 | ⬜ pending |
| 10-01-T3 | 10-01 | 1 | DATA-03 | T10-01-MED-01 | Import target config is user-scoped | sql inspection | `rg "CREATE TABLE listing_import_targets|is_active|search_term|state|city" supabase/migrations/008_listing_data_foundation.sql` | ✅ W0 | ⬜ pending |
| 10-01-T4 | 10-01 | 1 | DATA-01 | T10-01-HIGH-03 | Schema is applied, not only typed | manual/blocking | `supabase db push` | ✅ W0 | ⬜ pending |
| 10-02-T1 | 10-02 | 2 | DATA-01 | — | Types match migration fields | typecheck | `npx tsc --noEmit` | ✅ W0 | ⬜ pending |
| 10-02-T2 | 10-02 | 2 | DATA-02 | T10-02-HIGH-01 | Upsert helper preserves user-scoped dedupe | typecheck | `npx tsc --noEmit` | ✅ W0 | ⬜ pending |
| 10-02-T3 | 10-02 | 2 | DATA-03 | — | Target constants/schema support Brazil-wide configs | lint/typecheck | `npm run lint && npx tsc --noEmit` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers Phase 10 verification:

- [x] `npm run lint`
- [x] `npx tsc --noEmit`
- [x] SQL migration inspection with `rg`
- [x] Supabase CLI command documented as blocking schema application gate

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Apply migration to the target Supabase database | DATA-01, DATA-02, DATA-03 | Requires linked/local Supabase environment and credentials | Run `supabase db push`; if unavailable, record the exact blocker before completing Phase 10. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-03
