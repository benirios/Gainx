# Roadmap: RealTools v1.3 Brazil Commercial Listing Map

## Overview

RealTools v1.3 adds a fast opportunity-sourcing MVP for Brazilian commercial real estate. The milestone does not try to scrape the entire country at once. It builds national data structures, runs controlled OLX ingestion by configured city/state/search terms, supports Facebook Marketplace through manual/CSV import, classifies likely `pontos comerciais`, geocodes listings, and shows them on a searchable Brazil map.

Phase numbering continues from the existing project history, so this milestone starts at Phase 10.

## Phases

**Phase Numbering:**
- Integer phases (10, 11, 12, 13): Planned v1.3 milestone work
- Decimal phases (12.1, 12.2): Urgent insertions if needed

- [ ] **Phase 10: Listing Data Foundation** - Add the national listing schema, ingestion configuration model, deduplication, and basic admin review surfaces.
- [ ] **Phase 11: Source Ingestion MVP** - Build controlled OLX ingestion and Facebook manual/CSV import, with source run status and failure visibility.
- [ ] **Phase 12: Classification And Geocoding** - Classify commercial listings with Portuguese rules plus optional AI fallback, geocode locations, and retain failed records for review.
- [ ] **Phase 13: Opportunity Map MVP** - Display geocoded listings on a map with popups, filters, and a demo-ready validation pass.

## Phase Details

### Phase 10: Listing Data Foundation
**Goal**: RealTools can store and manage national Brazilian listing records independently from the existing deal workspace.
**Depends on**: v1.3 milestone start
**Requirements**: DATA-01, DATA-02, DATA-03
**Success Criteria** (what must be TRUE):
  1. Supabase has a listings storage model that captures source, URL, title, description, price, location, address, images, country, state, city, neighborhood, coordinates, classification fields, and timestamps.
  2. Re-importing the same source URL updates the existing listing instead of creating duplicates.
  3. Ingestion targets can be configured by state, city, and search term for Brazil-wide expansion.
  4. Existing deal, buyer, OM, tracking, and activity workflows remain untouched.
**Plans**: TBD
**UI hint**: no

### Phase 11: Source Ingestion MVP
**Goal**: RealTools can collect real listings from OLX and accept Facebook Marketplace records without fighting Facebook automation.
**Depends on**: Phase 10
**Requirements**: SRC-01, SRC-02, SRC-03, SRC-04
**Success Criteria** (what must be TRUE):
  1. User can run a controlled OLX ingestion for selected city/state/search configurations.
  2. OLX ingestion extracts title, description when available, price, location, address when available, images, URL, and source.
  3. User can import Facebook Marketplace records manually or by CSV with the same normalized listing fields.
  4. User can review run status, created records, updated duplicates, skipped records, and failures.
  5. The implementation avoids anti-bot evasion and keeps source failures non-fatal.
**Plans**: TBD
**UI hint**: yes

### Phase 12: Classification And Geocoding
**Goal**: RealTools can identify likely commercial property listings and place usable records on the map.
**Depends on**: Phase 11
**Requirements**: CLS-01, CLS-02, CLS-03, CLS-04, GEO-01, GEO-02
**Success Criteria** (what must be TRUE):
  1. Each listing receives `is_commercial`, `commercial_type`, `confidence`, and `reasoning`.
  2. Portuguese keyword rules identify common commercial terms such as ponto comercial, loja, sala comercial, galpão, escritório, prédio comercial, terreno comercial, box, quiosque, and sobreloja.
  3. Residential false positives are reduced with negative terms such as apartamento, casa, quarto, temporada, flat, kitnet, and residencial.
  4. Optional AI classification is used only for ambiguous listings if configured.
  5. Listings with enough location data receive cached latitude/longitude coordinates.
  6. Listings that fail geocoding remain visible for review instead of being dropped.
**Plans**: TBD
**UI hint**: no

### Phase 13: Opportunity Map MVP
**Goal**: Brokers can visually inspect Brazilian commercial opportunities on a map and filter down to useful records.
**Depends on**: Phase 12
**Requirements**: MAP-01, MAP-02, MAP-03, QA-01, QA-02
**Success Criteria** (what must be TRUE):
  1. User can view geocoded listings as pins on a Brazil map.
  2. Clicking a pin shows title, price, location, source, commercial type, confidence, reasoning, and the listing URL.
  3. User can filter by state, city, price range, source, commercial-only status, and commercial type.
  4. User can review non-geocoded or low-confidence records from a table/list view.
  5. MVP can be demonstrated with roughly 50-200 listings across multiple Brazilian cities.
  6. Known limitations are documented clearly after the demo pass.
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 10 -> 11 -> 12 -> 13

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 10. Listing Data Foundation | 0/TBD | Not started | - |
| 11. Source Ingestion MVP | 0/TBD | Not started | - |
| 12. Classification And Geocoding | 0/TBD | Not started | - |
| 13. Opportunity Map MVP | 0/TBD | Not started | - |

## Requirement Coverage

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 10 | Pending |
| DATA-02 | Phase 10 | Pending |
| DATA-03 | Phase 10 | Pending |
| SRC-01 | Phase 11 | Pending |
| SRC-02 | Phase 11 | Pending |
| SRC-03 | Phase 11 | Pending |
| SRC-04 | Phase 11 | Pending |
| CLS-01 | Phase 12 | Pending |
| CLS-02 | Phase 12 | Pending |
| CLS-03 | Phase 12 | Pending |
| CLS-04 | Phase 12 | Pending |
| GEO-01 | Phase 12 | Pending |
| GEO-02 | Phase 12 | Pending |
| MAP-01 | Phase 13 | Pending |
| MAP-02 | Phase 13 | Pending |
| MAP-03 | Phase 13 | Pending |
| QA-01 | Phase 13 | Pending |
| QA-02 | Phase 13 | Pending |

**Coverage:**
- v1.3 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0
