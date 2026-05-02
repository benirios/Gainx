---
phase: 11
plan: 11-01
subsystem: import-runs
tags:
  - supabase
  - ingestion
  - rls
key-files:
  - supabase/migrations/009_listing_import_runs.sql
  - types/supabase.ts
  - lib/listings/import-runs.ts
metrics:
  tasks_complete: 3
  verification: passed
---

# Plan 11-01 Summary: Import Run Schema And Status Helpers

## What Changed

- Added `listing_import_runs` migration with user ownership, target reference, source/status checks, count columns, error message, metadata, and timestamps.
- Added RLS and owner-scoped policy for import runs.
- Added import run indexes for user, target, status, and created-at queries.
- Updated `types/supabase.ts` with generated-style `listing_import_runs` types.
- Added `lib/listings/import-runs.ts` with:
  - `startImportRun`
  - `completeImportRun`
  - `failImportRun`

## Verification

Passed:

```bash
npm run lint
npx tsc --noEmit
rg "CREATE TABLE listing_import_runs|ENABLE ROW LEVEL SECURITY|Users can manage own listing import runs" supabase/migrations/009_listing_import_runs.sql
rg "listing_import_runs: \\{" types/supabase.ts
rg "startImportRun|completeImportRun|failImportRun|eq\\('user_id', userId\\)" lib/listings/import-runs.ts
supabase db push
```

`supabase db push` applied `009_listing_import_runs.sql` successfully.

## Deviations

None.

## Self-Check

PASSED.
