# Phase 10: Listing Data Foundation - Research

## Research Complete

Phase 10 is a schema and data-access foundation. The key planning risk is not external domain uncertainty; it is preserving RealTools' existing Supabase security and keeping later ingestion/classification phases from requiring avoidable migrations.

## Existing Patterns

- Tables use UUID primary keys with `gen_random_uuid()`.
- User-owned records reference `auth.users(id) ON DELETE CASCADE`.
- Every table has RLS enabled and at least one owner policy.
- Existing server code imports `Database` from `types/supabase.ts`, defines table row/insert/update aliases, and currently casts `supabase.from()` to `any` at query sites because of a recorded Supabase inference issue.
- Migrations are numbered sequentially in `supabase/migrations/`.

## Recommended Shape

Create `008_listing_data_foundation.sql` with:

- `listings` for normalized listing records.
- `listing_import_targets` for user-configurable source/city/state/search combinations.
- Owner-scoped RLS policies for both tables.
- Unique constraint on `(user_id, source, source_url)` for listing dedupe.
- Unique constraint on `(user_id, source, country, state, city, search_term)` for target dedupe.
- Indexes for user/source, state/city, commercial status/type, source URL, and active import targets.

Update `types/supabase.ts` manually to include both tables because this project keeps generated-style types in-repo.

Add lightweight domain helpers:

- `lib/schemas/listing.ts` for validated listing draft and import target data.
- `lib/listings/constants.ts` for source/type/state constants.
- `lib/listings/ingestion.ts` for normalization and upsert helpers used by Phase 11.

## Validation Notes

Phase 10 should verify with:

- `npm run lint`
- `npx tsc --noEmit`
- SQL/schema inspection commands for the migration file.
- A mandatory schema push/reset step after migration creation because build/type checks do not prove the database schema was applied.

## Risks

- Over-modeling source-specific fields too early. Mitigation: keep source-specific extras in `raw_payload`.
- Making listings global instead of user-scoped. Mitigation: every listing has `user_id`, RLS, and user-scoped dedupe.
- Blocking Phase 11 with missing classification/geocode columns. Mitigation: create nullable placeholders now.
- Treating Facebook as automated source too early. Mitigation: source value is `facebook_manual` for MVP.

## Validation Architecture

The validation plan should combine static checks, migration inspection, and schema application:

1. Static TypeScript verification for new helper modules and Database types.
2. Migration inspection for RLS, policies, unique constraints, and indexes.
3. Schema push or local reset after SQL changes.
4. Non-regression check that existing deal/auth files are untouched.
