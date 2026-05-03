# Requirements: RealTools v1.3 Brazil Commercial Listing Map

**Defined:** 2026-05-03
**Core Value:** Every broker has one practical workspace to find, qualify, and manage commercial real estate opportunities without hunting across listing sites, Facebook posts, spreadsheets, email, and Drive.

## v1.3 Requirements

### Listing Data Foundation

- [x] **DATA-01**: User can store Brazilian listing records with source, source URL, title, description, price, location, address, images, country, state, city, neighborhood, and timestamps.
- [x] **DATA-02**: User can deduplicate listings by source and URL so repeated imports update existing records instead of creating duplicates.
- [x] **DATA-03**: User can configure listing ingestion by Brazilian state, city, and search term without hardcoding Pernambuco-only scope.

### Source Ingestion

- [x] **SRC-01**: User can run controlled OLX Brazil ingestion for configured city/state/search combinations and save extracted listing records.
- [x] **SRC-02**: User can extract OLX title, description when available, price, location, address when available, images, URL, and source.
- [x] **SRC-03**: User can import Facebook Marketplace listings manually or by CSV when automated scraping is not viable.
- [x] **SRC-04**: User can review ingestion status, including successful records, skipped duplicates, and failed records.

### Commercial Classification

- [ ] **CLS-01**: User can see whether each listing is classified as likely commercial or non-commercial.
- [ ] **CLS-02**: User can see a commercial type such as loja, galpão, escritório, sala comercial, prédio comercial, terreno comercial, box, quiosque, or unknown.
- [ ] **CLS-03**: User can see a confidence score from 0 to 100 and a short reasoning string for the classification.
- [ ] **CLS-04**: System can use Portuguese keyword rules first and optional AI fallback only for ambiguous listings.

### Geocoding And Map

- [ ] **GEO-01**: System can convert listing location/address text into latitude and longitude where enough location data exists.
- [ ] **GEO-02**: System can cache geocoding results and keep listings without coordinates available in a review table instead of dropping them.
- [ ] **MAP-01**: User can view geocoded listings as pins on a Brazil map.
- [ ] **MAP-02**: User can click a map pin to view title, price, location, classification, confidence, source, and listing URL.
- [ ] **MAP-03**: User can filter listings by state, city, price range, source, commercial-only status, and commercial type.

### MVP Review

- [ ] **QA-01**: User can validate the MVP with a controlled dataset of roughly 50-200 listings across multiple Brazilian cities.
- [ ] **QA-02**: User can identify failed classifications, failed geocodes, and source ingestion problems quickly enough to fix or ignore them for demo purposes.

## Future Requirements

### Source Expansion

- **SRC-05**: User can ingest additional portals beyond OLX and Facebook Marketplace.
- **SRC-06**: User can run scheduled recurring ingestion jobs.
- **SRC-07**: User can receive alerts for new matching commercial listings.

### Product Expansion

- **OPP-01**: User can save a listing as an opportunity and convert it into a deal workspace.
- **OPP-02**: User can add broker notes, status, and follow-up tasks to sourced opportunities.
- **OPP-03**: User can compare listing history or price changes over time.
- **MAP-04**: User can draw or select map areas instead of filtering only by city/state.

## Out of Scope

Explicitly excluded for this milestone to protect speed.

| Feature | Reason |
|---------|--------|
| Full Facebook Marketplace automation | High platform friction and risk; manual/CSV import proves the workflow faster. |
| Scraping the entire country at once | Build national support, then ingest controlled city batches for MVP validation. |
| Anti-bot evasion infrastructure | Too much risk and maintenance for a first MVP. |
| Perfect address normalization | Approximate geocoding is acceptable for market discovery. |
| Custom ML model training | Keyword rules plus optional AI fallback are enough to validate demand. |
| Saved searches and alerts | Useful later, but not needed to prove the map workflow. |
| Opportunity-to-deal conversion | Defer until sourced listings prove useful. |
| Mobile app | Responsive web is enough for the MVP. |
| Large-scale analytics | Focus on finding and viewing commercial opportunities first. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 10 | Complete |
| DATA-02 | Phase 10 | Complete |
| DATA-03 | Phase 10 | Complete |
| SRC-01 | Phase 11 | Complete |
| SRC-02 | Phase 11 | Complete |
| SRC-03 | Phase 11 | Complete |
| SRC-04 | Phase 11 | Complete |
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

---
*Requirements defined: 2026-05-03*
*Last updated: 2026-05-03 after Phase 11 completion*
