---
phase: 10
plan: 10-02
subsystem: listing-domain
tags:
  - zod
  - ingestion
  - listings
key-files:
  - lib/schemas/listing.ts
  - lib/listings/constants.ts
  - lib/listings/ingestion.ts
metrics:
  tasks_complete: 3
  verification: passed
---

# Plan 10-02 Summary: Listing Domain Helpers And Target Configuration

## What Changed

- Added `lib/schemas/listing.ts` with:
  - `ListingSourceSchema`
  - `ListingDraftSchema`
  - `ListingImportTargetSchema`
  - inferred source/draft/target types
- Added `lib/listings/constants.ts` with:
  - `LISTING_SOURCES`
  - `COMMERCIAL_TYPES`
  - all 27 `BRAZIL_STATES`
  - six national default OLX target examples across PE, SP, RJ, MG, BA, and DF
- Added `lib/listings/ingestion.ts` with:
  - `toListingInsert`
  - `toListingTargetInsert`
  - `upsertListing`
  - `upsertListingImportTarget`
- Encoded user-scoped upsert conflicts that match the Phase 10 database constraints.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 10-02-T1..T3 | Pending orchestration commit | Listing schemas, constants, and ingestion helpers |

## Verification

Passed:

```bash
npm run lint
npx tsc --noEmit
rg "ListingDraftSchema|ListingImportTargetSchema|ListingSourceSchema" lib/schemas/listing.ts
rg "BRAZIL_STATES|DEFAULT_LISTING_IMPORT_TARGETS|LISTING_SOURCES" lib/listings/constants.ts
rg "onConflict: 'user_id,source,source_url'|onConflict: 'user_id,source,country,state,city,search_term'" lib/listings/ingestion.ts
```

## Deviations

- Added explicit `isActive: true` to default targets so they satisfy the inferred Zod output type.
- Cast `rawPayload` into the project `Json` type when mapping to `raw_payload`; this keeps the helper compatible with the generated-style Supabase type.

## Self-Check

PASSED.
