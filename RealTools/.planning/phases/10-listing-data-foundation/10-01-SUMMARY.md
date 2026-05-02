---
phase: 10
plan: 10-01
subsystem: listing-schema
tags:
  - supabase
  - rls
  - schema
key-files:
  - supabase/migrations/008_listing_data_foundation.sql
  - types/supabase.ts
metrics:
  tasks_complete: 4
  verification: partial_human_needed
---

# Plan 10-01 Summary: Listing Schema And Generated Types

## What Changed

- Added `supabase/migrations/008_listing_data_foundation.sql`.
- Created user-owned `listings` table for raw and normalized listing records.
- Created user-owned `listing_import_targets` table for Brazil-wide source/city/state/search configuration.
- Added user-scoped dedupe constraints:
  - `listings_user_source_url_unique`
  - `listing_import_targets_unique`
- Enabled RLS on both new tables.
- Added owner-scoped RLS policies for both new tables.
- Added query indexes for user/source, source URL, state/city, commercial fields, and active import targets.
- Updated `types/supabase.ts` with generated-style `listings` and `listing_import_targets` table types.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 10-01-T1..T4 | Pending orchestration commit | Schema, RLS, indexes, and generated-style types |

## Verification

Passed:

```bash
npm run lint
npx tsc --noEmit
rg "CREATE TABLE listings|CREATE TABLE listing_import_targets|ENABLE ROW LEVEL SECURITY|Users can manage own listings|Users can manage own listing import targets" supabase/migrations/008_listing_data_foundation.sql
rg "listings: \\{|listing_import_targets: \\{" types/supabase.ts
```

Human-needed blocker:

```bash
supabase db push
```

Result:

```text
Initialising login role...
Access token not provided. Supply an access token by running supabase login or setting the SUPABASE_ACCESS_TOKEN environment variable.
```

The schema push requirement was attempted, but the local environment lacks Supabase auth. Static verification is green; live schema application remains human-needed until `supabase login` or `SUPABASE_ACCESS_TOKEN` is available.

## Deviations

- No existing deal, buyer, OM, tracking, file, or activity tables were modified.
- No Facebook automation, scraping, or map UI was added.
- The `supabase db push` task is documented as blocked by credentials rather than marked fully applied.

## Self-Check

PASSED with human-needed blocker for live Supabase schema push.
