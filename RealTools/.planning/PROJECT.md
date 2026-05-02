# RealTools

## What This Is

RealTools is an MVP SaaS for individual commercial real estate brokers. It started as a deal workspace for managing OMs, buyers, files, notes, tracked links, and deal activity. The next product expansion adds opportunity sourcing: aggregating Brazilian property listings, identifying likely commercial listings, and showing them on a map so brokers can find potential deals faster.

## Core Value

Every broker has one practical workspace to find, qualify, and manage commercial real estate opportunities without hunting across listing sites, Facebook posts, spreadsheets, email, and Drive.

## Current State

**v1.0 milestone shipped:** 2026-05-01

RealTools now has:

- Supabase email/password authentication with protected app routes and public `/om/*` plus `/api/track/*` exclusions.
- Complete v1 database schema with RLS across deals, notes, buyers, deal_buyers, activities, and deal_files.
- Deal dashboard and Deal Hub with deal CRUD, status badges, notes, files, signed downloads, and hosted public OM pages.
- Buyers CRM with tag support.
- Send OM flow through Resend with per-buyer tracking tokens.
- URL-primary and pixel-secondary OM open tracking.
- Activity log for OM sent/opened, note added, and file uploaded events.

**Deferred verification debt:** Live Phase 3 UAT remains pending for Resend delivery and browser-driven tracking/activity confirmation.

**v1.1 Phase 4 complete:** Reference Visual Foundation established on 2026-05-01. Global dark reference tokens, serif display typography, pill button primitives, dark form/card/dialog/toast/badge primitives, and no-background-pattern guardrails are in place.

**v1.2 Phase 7 complete:** Light Visual Foundation established on 2026-05-02. The app now defaults to light mode, root tokens follow the Nexus-style palette, Geist drives operational UI typography, and shared shadcn/radix primitives use light dashboard controls and surfaces.

**v1.2 Phase 8 complete:** Authenticated Workspace Refactor completed on 2026-05-02. The app shell, dashboard, Deal Hub, buyers, profile, notes, files, activity, send-OM, and workflow dialogs now use the light dashboard direction while preserving shipped broker workflows.

**v1.2 Phase 9 deferred:** Public/auth/OM surface restyling and full post-refactor verification remain unfinished. The user explicitly chose to start the next product milestone before completing that cleanup phase.

## Current Milestone: v1.3 Brazil Commercial Listing Map

**Goal:** Build a fast national MVP that ingests Brazilian listing sources, detects likely `pontos comerciais`, geocodes them, and displays them on a searchable map.

**Target features:**
- Ingest OLX Brazil listings for configurable states/cities/search terms instead of hardcoding Pernambuco-only scope.
- Support Facebook Marketplace through manual or CSV import, not automated scraping, for the first MVP.
- Classify listings as commercial or non-commercial using Portuguese keyword rules, with optional AI fallback only for ambiguous cases.
- Geocode listings to coordinates and cache results.
- Display listings on a map with pins, summary popups, and basic filters for state, city, price, source, and commercial type.

## Requirements

### Validated

- ✓ User can sign up and log in with email/password — v1.0
- ✓ User can create a deal with title, address, price, description, and status — v1.0
- ✓ User can view a Deal Hub page as the central workspace for each deal — v1.0
- ✓ User can add, edit, and delete notes on a deal — v1.0
- ✓ User can upload files to a deal through Supabase Storage — v1.0
- ✓ User can generate a hosted HTML OM page from deal data and uploaded images — v1.0
- ✓ OM is publicly accessible at `/om/[deal-id]` without broker auth — v1.0
- ✓ User can create, view, edit, and delete buyers with name, email, and tags — v1.0
- ✓ User can manually select buyers for a deal — v1.0
- ✓ System can send tracked OM links through Resend — v1.0 implementation, live UAT pending
- ✓ System records first OM open per buyer/deal using URL tracking and pixel fallback — v1.0 implementation, live UAT pending
- ✓ Deal Hub shows a per-deal activity log — v1.0 implementation, live UAT pending
- ✓ Reference visual foundation tokens and shared UI primitives match the premium dark screenshot style, excluding the background pattern — v1.1 Phase 4
- ✓ Light dashboard foundation tokens and shared UI primitives match the Nexus-style reference direction — v1.2 Phase 7
- ✓ Authenticated app workspace surfaces match the light dashboard direction while preserving routes, auth, deal management, buyers, notes, files, send OM, and activity behavior — v1.2 Phase 8

### Active

- [ ] User can ingest Brazilian listing records from OLX for configured cities/states and preserve title, description, price, location, address, images, URL, and source.
- [ ] User can import Facebook Marketplace listings manually or by CSV when direct scraping is not viable.
- [ ] System can classify whether a listing is a likely commercial property and explain the decision with confidence.
- [ ] System can geocode listing locations and show successfully geocoded listings on a map.
- [ ] User can filter the opportunity map by state, city, price, source, and commercial property type.
- [ ] Deferred v1.2 public surface restyling and Phase 3 live UAT remain known cleanup work, not part of this milestone unless needed for demo readiness.

### Out of Scope

- PDF export — HTML OM only for v1; PDF adds complexity without proportional value.
- Team/multi-user features — single broker per account.
- Billing system — no payments or subscriptions in v1.
- Complex CRM features — no pipelines, tasks, forecasting.
- OAuth / magic link auth — email/password only for v1.
- Buyer tag-based filtering before send — deferred to v2; manual selection is v1.
- Real-time activity log — polling/refresh is sufficient for v1.
- Full Facebook Marketplace automation — avoid platform/anti-scraping risk in the first opportunity-sourcing MVP.
- Nationwide bulk scraping at scale — build national data structures, but ingest controlled city/state batches first.
- Perfect address normalization — approximate map pins are acceptable for MVP validation.
- ML model training — keyword rules and optional AI fallback are enough for Milestone 1.

## Context

**Problem being solved:** Brokers today juggle listing sites, Facebook Marketplace, WhatsApp, spreadsheets, email, Google Drive, and manual OM workflows. They need a faster way to find potential commercial opportunities, qualify them, and manage the resulting deal flow.

**OM flow:** Broker generates OM → gets hosted public page URL → sends tracked link to selected buyers via email → system records per-buyer first open events → broker reviews activity in Deal Hub.

**Opportunity sourcing flow:** Broker runs/imports listing searches → system stores raw listings → system classifies likely commercial properties → system geocodes listings → broker reviews opportunities on a national Brazil map.

**Target user:** Individual commercial real estate broker.

**Data models:** users, deals, notes, buyers, deal_buyers, activities, deal_files, listings, listing_imports.

## Constraints

- **Tech Stack:** Next.js App Router, Supabase Auth/DB/Storage, TailwindCSS, Resend.
- **Opportunity stack:** Playwright for OLX ingestion, CSV/manual import for Facebook Marketplace, Supabase Postgres for listing storage, Leaflet/OpenStreetMap for maps, Nominatim/OpenStreetMap-style geocoding for MVP.
- **Scope:** No billing, teams, PDF, or complex CRM workflows in v1.
- **Auth:** Supabase email/password only.
- **OM format:** Clean hosted HTML page.
- **Security:** Service-role key only in `server-only` modules; use `getUser()` server-side; RLS policy coverage for every table.
- **Scraping:** Keep volume controlled, source-specific, and resilient to failure. Do not build anti-bot evasion or unauthorized Facebook automation.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Hosted OM page at `/om/[deal-id]` | Buyers open in browser; enables tracking pixel and public sharing | ✓ Shipped v1.0 |
| Per-buyer tracking tokens in `deal_buyers` | Broker needs engagement per buyer, not aggregate views | ✓ Shipped v1.0 |
| URL-based tracking is primary, pixel is secondary | More reliable than email-client pixel loading alone | ✓ Shipped v1.0 |
| Supabase Storage uses private deal files and public OM images buckets | Preserves broker file privacy while allowing public OM media | ✓ Shipped v1.0 |
| Tags stay as `text[]` on buyers | Lightweight and flexible for v1 | ✓ Shipped v1.0 |
| Cast `supabase.from()` as `any` at query/mutation sites | Work around supabase-js 2.104.x PostgrestVersion inference bug while keeping explicit Database types | ⚠ Revisit after Supabase upgrade |
| Service role writes activities for tracking and telemetry | Public/open tracking and activity backfill cannot rely on browser user session | ✓ Shipped v1.0 |
| Use Cormorant Garamond for display typography and Geist for operational text | Matches the reference screenshot's premium serif display voice while keeping app text readable | ✓ Established v1.1 Phase 4 |
| Do not recreate the reference screenshot's background network pattern | User explicitly excluded the background from the requested style match | ✓ Enforced v1.1 Phase 4 |
| Start v1.2 before formally completing v1.1 | User explicitly chose to proceed with a new UI refactor despite v1.1 Phase 6 and verification state remaining incomplete | — Pending |
| Use the provided Nexus-style light dashboard screenshot as the v1.2 visual source of truth | The user requested another UI refactor following that reference image | — Pending |
| Default RealTools to the light dashboard foundation | Phase 7 replaced the default dark root class and dark shared primitive styling with light tokens and controls | ✓ Established v1.2 Phase 7 |
| Apply the light dashboard foundation to authenticated workspace surfaces without behavior changes | Phase 8 refactored app shell, dashboard, Deal Hub, buyers, profile, notes, files, activity, send-OM, and dialogs while preserving existing workflows | ✓ Established v1.2 Phase 8 |
| Start v1.3 before completing v1.2 Phase 9 | User prioritized the Brazil commercial listing map MVP over remaining public-surface UI cleanup | — Pending |
| Build listing sourcing as national Brazil infrastructure with controlled initial city batches | Product scope should not be Pernambuco-only, but full-country scraping is not an MVP requirement | — Pending |
| Use manual/CSV import for Facebook Marketplace in Milestone 1 | Automated Facebook scraping is high-friction and high-risk compared with proving the product workflow | — Pending |
| Use keyword classification first, optional AI only for ambiguous listings | Faster, cheaper, easier to inspect, and good enough to identify likely `pontos comerciais` in early MVP data | — Pending |

## Next Milestone Goals

After v1.3, validate whether brokers find the map useful with real Brazilian listings, then decide whether to expand source coverage, automate more ingestion, or connect opportunities back into the existing deal workspace.

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check -> still the right priority?
3. Audit Out of Scope -> reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-03 at v1.3 Brazil Commercial Listing Map milestone start*
