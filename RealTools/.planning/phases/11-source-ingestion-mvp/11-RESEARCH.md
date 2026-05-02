# Phase 11: Source Ingestion MVP - Research

## Research Complete

Phase 11 is primarily local implementation planning. The practical product decision is to keep ingestion controlled and inspectable: OLX can be automated with low-volume Playwright extraction, while Facebook Marketplace should enter through manual/CSV import only.

## Implementation Notes

### OLX

- Use a dedicated server-side/local ingestion module instead of UI scraping code.
- Keep search target inputs explicit: state, city, search term, max listings.
- Extract only MVP fields required by SRC-02: title, description when available, price, location, address when available, images, URL, and source.
- Treat detail-page extraction as best effort. A listing without description/address is still useful if title, price, location, URL, and source are captured.
- Cap each run to avoid runaway scraping and source friction.
- Do not implement anti-bot evasion.

### Facebook Marketplace

- Do not automate scraping.
- Add manual/CSV import with the same normalized listing draft shape used by OLX.
- Required CSV/manual fields should be minimal: title, source URL, price text, location text, city, state. Description/address/images are optional.

### Run Status

SRC-04 needs durable run status. A `listing_import_runs` table is justified:

- `source`
- `status`
- `target_id`
- `started_at`
- `completed_at`
- `created_count`
- `updated_count`
- `skipped_count`
- `failed_count`
- `error_message`
- `metadata`

Use JSON metadata for sample failures and source-specific details.

## Existing Patterns To Reuse

- Server actions use `createSupabaseServerClient()`, `supabase.auth.getUser()`, and `redirect('/auth/login')`.
- Supabase writes currently use generated-style `Database` aliases plus narrowly scoped `as any` casts for `from()`.
- Authenticated pages are server components that load data and pass to client form/table components.
- The app shell navigation is defined in `components/sidebar-nav.tsx`.

## Validation Architecture

Phase 11 needs:

- Static lint/typecheck.
- Schema push after adding `listing_import_runs`.
- Unit-like parser verification for CSV/manual import via deterministic fixtures or a small script.
- OLX extractor smoke test should be best effort and allowed to be documented as source/network blocked if OLX blocks or markup changes.

## Risks

- Playwright dependency/browser availability may slow execution. Mitigation: isolate OLX code and make UI/action handle scraper failures cleanly.
- Source markup may change. Mitigation: keep extraction best-effort and failure-visible.
- Serverless deployment may not support browser automation. Mitigation: this MVP can run admin-triggered/local ingestion first; do not overbuild job infrastructure.
- CSV parsing can get complex. Mitigation: implement a simple documented CSV parser for the MVP shape; do not support every Excel edge case.
