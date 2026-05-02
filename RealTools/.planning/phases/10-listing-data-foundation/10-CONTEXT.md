# Phase 10: Listing Data Foundation - Context

**Gathered:** 2026-05-03
**Status:** Ready for planning
**Source:** User milestone brief and confirmation

<domain>
## Phase Boundary

Phase 10 creates the durable data foundation for the Brazil commercial listing map. It does not scrape OLX, import Facebook data, classify listings, geocode, or render the map. Those belong to Phases 11-13.

</domain>

<decisions>
## Implementation Decisions

### Scope
- Build for all Brazil, not Pernambuco-only.
- Use controlled city/state/search configurations so the MVP can start with a few markets and expand without schema changes.
- Keep the existing deal workspace intact; listing sourcing is a new data area, not a rewrite of deals.

### Source Strategy
- OLX Brazil is the first automated source, but the Phase 10 data model must support multiple sources.
- Facebook Marketplace is manual/CSV import for the first MVP; do not build Facebook automation in this phase.
- Deduplicate listings by user, source, and source URL.

### Data Strategy
- Store raw listing fields even when downstream classification or geocoding is missing.
- Store normalized Brazil location fields: country, state, city, neighborhood, location text, address text, latitude, longitude.
- Store classification placeholders on listings now so Phase 12 can fill them without another migration.
- Store images as text URLs for MVP speed.
- Include raw payload JSON for source-specific fields that do not deserve first-class columns yet.

### Security
- Listings and ingestion targets are user-scoped.
- Every new table must enable RLS and include owner policies.
- Service-role usage remains restricted to `server-only` modules if future ingestion needs it.

### the agent's Discretion
- Exact table names and helper module boundaries.
- Whether ingestion target defaults are stored as constants, seed rows, or user-created records.
- Whether to create import run tables in Phase 10 or defer run-status persistence to Phase 11.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product Scope
- `.planning/ROADMAP.md` - Phase 10 goal, success criteria, and dependencies.
- `.planning/REQUIREMENTS.md` - DATA-01, DATA-02, DATA-03 requirements.
- `.planning/STATE.md` - Current milestone decisions and deferred constraints.
- `.planning/PROJECT.md` - Product context, source strategy, and security constraints.

### Existing Schema Patterns
- `supabase/migrations/001_initial_schema.sql` - Table style, UUID primary keys, user ownership.
- `supabase/migrations/002_rls_policies.sql` - RLS and owner policy style.
- `supabase/migrations/003_indexes.sql` - Index style.
- `types/supabase.ts` - Current generated-style Database type structure.

### Existing App Patterns
- `lib/actions/deal-actions.ts` - Server action auth, typed insert/update objects, and current Supabase query pattern.
- `lib/schemas/deal.ts` - Zod schema style for domain forms/data.
- `lib/supabase/server.ts` - Authenticated Supabase server client.
- `lib/supabase/service.ts` - Service-role client boundary.
</canonical_refs>

<specifics>
## Specific Ideas

- Prefer a `listings` table plus `listing_import_targets` table for Phase 10.
- `listings` should include `source`, `source_url`, `title`, `description`, `price_text`, `price_amount`, `location_text`, `address_text`, `country`, `state`, `city`, `neighborhood`, `lat`, `lng`, `images`, `is_commercial`, `commercial_type`, `confidence`, `reasoning`, `raw_payload`, `first_seen_at`, `last_seen_at`, `created_at`, and `updated_at`.
- `listing_import_targets` should include `source`, `country`, `state`, `city`, `search_term`, `is_active`, `created_at`, and `updated_at`.
- Use `source` values that cover `olx` and `facebook_manual` now without making later source expansion painful.
</specifics>

<deferred>
## Deferred Ideas

- OLX scraping implementation is Phase 11.
- Facebook CSV/manual import UI is Phase 11.
- Commercial classification is Phase 12.
- Geocoding is Phase 12.
- Map visualization is Phase 13.
- Converting sourced listings into deal workspaces is future scope after v1.3 validates usefulness.
</deferred>

---

*Phase: 10-listing-data-foundation*
*Context gathered: 2026-05-03 via inline milestone clarification*
