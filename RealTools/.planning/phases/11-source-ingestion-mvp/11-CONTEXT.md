# Phase 11: Source Ingestion MVP - Context

**Gathered:** 2026-05-03
**Status:** Ready for planning
**Source:** Phase 11 roadmap + Phase 10 implementation

<domain>
## Phase Boundary

Phase 11 makes listing ingestion usable. It should let an authenticated broker run controlled OLX ingestion for configured city/state/search targets, import Facebook Marketplace records manually or by CSV, and review run status plus failures.

It does not classify commercial listings, geocode listings, or render the opportunity map. Those are Phase 12 and Phase 13.
</domain>

<decisions>
## Implementation Decisions

### Source Strategy
- OLX is the only automated source in this phase.
- Facebook Marketplace remains manual/CSV import. Do not build browser automation or scraping for Facebook.
- Keep OLX ingestion controlled: configured target, low result limit, source failures recorded but non-fatal.
- Do not build anti-bot evasion, proxy rotation, CAPTCHA workarounds, or account-based scraping.

### UI Strategy
- Add a practical authenticated "Listings" or "Import" area using the existing light dashboard shell.
- The first screen should be operational, not marketing: ingestion targets, run buttons, CSV/manual import, recent run status, and failed record visibility.
- Reuse existing shadcn-style components and app shell patterns.

### Data Strategy
- Phase 10 created `listings` and `listing_import_targets`.
- Phase 11 may add a lightweight `listing_import_runs` table because SRC-04 requires status, created/updated/skipped/failed counts, and failure visibility.
- Store failed records or error samples in JSON metadata rather than over-modeling a separate failures table.

### Security
- Every ingestion action must require `supabase.auth.getUser()`.
- User-scoped RLS applies to import runs and targets.
- Server-side OLX ingestion must use existing `upsertListing` helper so dedupe remains user-scoped.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope
- `.planning/ROADMAP.md` - Phase 11 goal and success criteria.
- `.planning/REQUIREMENTS.md` - SRC-01 through SRC-04.
- `.planning/STATE.md` - Current milestone state and decisions.
- `.planning/phases/10-listing-data-foundation/10-VERIFICATION.md` - Phase 10 completion evidence.

### Listing Foundation
- `supabase/migrations/008_listing_data_foundation.sql` - Listing and target schema.
- `types/supabase.ts` - Current generated-style table types.
- `lib/schemas/listing.ts` - Listing draft and target validation.
- `lib/listings/constants.ts` - Source constants, Brazil states, default target examples.
- `lib/listings/ingestion.ts` - Existing listing/target upsert helpers.

### Existing App Patterns
- `app/(app)/buyers/page.tsx` - Authenticated page data loading pattern.
- `components/buyers/buyers-table.tsx` - Table/empty-state styling pattern.
- `components/buyers/buyer-form-modal.tsx` - Form/dialog/action state pattern.
- `lib/actions/buyer-actions.ts` - Authenticated server action pattern.
- `components/sidebar-nav.tsx` - Authenticated navigation pattern.
</canonical_refs>

<specifics>
## Specific Ideas

- Add `listing_import_runs` with `status`, counts, `error_message`, and `metadata`.
- Add `lib/listings/import-runs.ts` for start/complete/fail run helper functions.
- Add `lib/listings/olx.ts` for controlled OLX extraction. Use Playwright only for OLX and cap results aggressively.
- Add `lib/listings/csv.ts` for simple CSV/manual import parsing without a new CSV dependency.
- Add `lib/actions/listing-import-actions.ts` for authenticated run/import actions.
- Add `/listings/import` page and navigation item.
</specifics>

<deferred>
## Deferred Ideas

- Classification and confidence: Phase 12.
- Geocoding: Phase 12.
- Map pins and filters: Phase 13.
- Scheduled jobs: future.
- Full Facebook automation: out of scope.
- Large-scale scraping infrastructure: out of scope.
</deferred>

---

*Phase: 11-source-ingestion-mvp*
*Context gathered: 2026-05-03*
