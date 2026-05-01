# Requirements: RealTools v1.1 Reference UI Refactor

**Defined:** 2026-05-01
**Core Value:** Every deal has one central workspace — broker never has to hunt across email, spreadsheets, and Drive to find deal status or contact buyers.

## v1.1 Requirements

### Visual System

- [ ] **UI-01**: User sees a premium dark RealTools interface that matches the provided reference screenshot's typography, contrast, border, spacing, and control styling, excluding the background pattern.
- [ ] **UI-02**: User sees consistent serif brand/display typography and muted sans-serif supporting text across headings, navigation, labels, descriptions, and calls to action.
- [ ] **UI-03**: User sees consistent pill-shaped primary actions, subdued secondary actions, subtle borders, and restrained hover/focus states across buttons and links.
- [ ] **UI-04**: User sees consistent dark surface styling across cards, panels, tables, forms, dialogs, and empty states without nested-card clutter.

### Product App

- [ ] **APP-01**: User can use the dashboard, deal cards, deal hub, buyers table, profile page, and sidebar in the refreshed reference style without losing existing workflows.
- [ ] **APP-02**: User can create, edit, delete, and review deals, notes, files, buyers, send-OM flows, and activity events through restyled forms, dialogs, tables, and timeline components.
- [ ] **APP-03**: User sees status badges, tags, metadata, and activity items restyled to match the reference's muted premium visual language while remaining readable.

### Public And Auth Surfaces

- [ ] **SURF-01**: User sees login and signup pages restyled to match the reference visual system.
- [ ] **SURF-02**: Buyer sees public OM pages restyled to match the reference visual system while preserving unauthenticated access and tracking behavior.
- [ ] **SURF-03**: User sees the unauthenticated landing/root page restyled to match the reference visual system without copying the excluded background pattern.

### Responsive QA

- [ ] **QA-01**: User can complete critical v1.0 workflows after the refactor: auth, deal CRUD, notes, file upload/download, buyer CRUD, send OM, public OM open, tracking, and activity review.
- [ ] **QA-02**: User sees the refreshed UI without text overlap, clipped controls, unreadable contrast, or broken layout on mobile and desktop viewports.
- [ ] **QA-03**: User-facing loading, empty, error, disabled, focus, and hover states follow the refreshed visual system.

## Future Requirements

### Product Expansion

- **DASH-01**: User can see OM engagement summary cards on the dashboard.
- **BUYER-05**: User can filter buyers by tags before sending an OM.
- **OM-04**: User can export a PDF version of an OM.
- **IMPORT-01**: User can import buyers from CSV.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Reference background network pattern | User explicitly excluded the background from the style match. |
| New product capabilities | This milestone is a visual refactor; workflow behavior should stay stable. |
| Billing, teams, pipelines, and PDF export | Previously deferred product scope; not required for the UI refactor. |
| Brand rename or logo redesign beyond styling fit | The goal is to match style choices, not redefine the product identity. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| UI-01 | Phase 4 | Pending |
| UI-02 | Phase 4 | Pending |
| UI-03 | Phase 4 | Pending |
| UI-04 | Phase 4 | Pending |
| APP-01 | Phase 5 | Pending |
| APP-02 | Phase 5 | Pending |
| APP-03 | Phase 5 | Pending |
| SURF-01 | Phase 6 | Pending |
| SURF-02 | Phase 6 | Pending |
| SURF-03 | Phase 6 | Pending |
| QA-01 | Phase 6 | Pending |
| QA-02 | Phase 6 | Pending |
| QA-03 | Phase 6 | Pending |

**Coverage:**
- v1.1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0

---
*Requirements defined: 2026-05-01*
*Last updated: 2026-05-01 after v1.1 requirements definition*
