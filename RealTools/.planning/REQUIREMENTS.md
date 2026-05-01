# Requirements: RealTools v1.2 Light Dashboard UI Refactor

**Defined:** 2026-05-02
**Core Value:** Every deal has one central workspace — broker never has to hunt across email, spreadsheets, and Drive to find deal status or contact buyers.

## v1.2 Requirements

### Visual System

- [x] **UI-05**: User sees a light Nexus-style RealTools interface with off-white page backgrounds, white surfaces, subtle borders, soft shadows, muted gray text, and pastel teal/purple/blue accents.
- [ ] **UI-06**: User sees consistent rounded controls, compact icon-led actions, pale icon containers, restrained hover/focus states, and low-contrast dividers across shared UI primitives.
- [x] **UI-07**: User sees typography, spacing, card density, and visual hierarchy tuned for a calm SaaS dashboard rather than the previous dark premium style.
- [ ] **UI-08**: User sees loading, empty, error, disabled, hover, and focus states that follow the light reference style without causing layout shift or text overlap.

### App Shell And Dashboard

- [ ] **APP-04**: User can navigate the authenticated app through a light sidebar/topbar shell that matches the reference's compact SaaS layout while preserving existing routes and actions.
- [ ] **APP-05**: User can scan the dashboard through light metric cards, deal summaries, activity previews, and broker workflow shortcuts that feel visually aligned with the reference without inventing unsupported analytics.
- [ ] **APP-06**: User can use dashboard filters, buttons, menus, badges, and cards in the light visual system without losing existing deal-management behavior.

### Deal Workspace

- [ ] **DEAL-01**: User can use the Deal Hub in the light reference style, including deal header, metadata, status, notes, files, buyers, send-OM entry points, and activity log.
- [ ] **DEAL-02**: User can create, edit, delete, and review deals, notes, files, buyers, and send-OM flows through restyled forms, dialogs, tables, and timeline components.
- [ ] **DEAL-03**: User sees buyer tags, deal statuses, file rows, notes, and activity events styled with readable muted contrast and pastel accents.

### Public And Auth Surfaces

- [ ] **SURF-04**: User sees login and signup pages restyled to match the light dashboard visual system while preserving Supabase email/password auth behavior.
- [ ] **SURF-05**: Buyer sees public OM pages restyled to match the light reference system while preserving unauthenticated access, OM readability, and tracking behavior.
- [ ] **SURF-06**: User sees the unauthenticated root/landing page restyled to match the light reference system without adding marketing-only content that delays access to the product.

### Verification

- [ ] **QA-04**: User can complete critical v1.0 workflows after the refactor: auth, deal CRUD, notes, file upload/download, buyer CRUD, send OM, public OM open, tracking, and activity review.
- [ ] **QA-05**: User sees the refreshed UI without text overlap, clipped controls, unreadable contrast, broken layout, or accidental dark-theme remnants on mobile and desktop viewports.
- [ ] **QA-06**: User can complete the deferred Phase 3 live UAT scenarios for Resend delivery, browser open tracking, and activity-log confirmation.

## Future Requirements

### Product Expansion

- **DASH-01**: User can see OM engagement summary cards on the dashboard.
- **BUYER-05**: User can filter buyers by tags before sending an OM.
- **OM-04**: User can export a PDF version of an OM.
- **IMPORT-01**: User can import buyers from CSV.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| New analytics product capabilities | The reference contains analytics widgets, but this milestone is a visual refactor and should not invent unsupported metrics. |
| Billing, teams, pipelines, and PDF export | Previously deferred product scope; not required for the UI refactor. |
| Brand rename to Nexus or copied reference content | The image is a style reference, not a product or content migration. |
| Rebuilding v1.1 dark direction | v1.2 replaces that direction with a light dashboard system. |
| Large CRM expansion | Complex CRM workflows remain out of scope for the MVP. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| UI-05 | Phase 7 | Complete |
| UI-06 | Phase 7 | Pending |
| UI-07 | Phase 7 | Complete |
| UI-08 | Phase 7 | Pending |
| APP-04 | Phase 8 | Pending |
| APP-05 | Phase 8 | Pending |
| APP-06 | Phase 8 | Pending |
| DEAL-01 | Phase 8 | Pending |
| DEAL-02 | Phase 8 | Pending |
| DEAL-03 | Phase 8 | Pending |
| SURF-04 | Phase 9 | Pending |
| SURF-05 | Phase 9 | Pending |
| SURF-06 | Phase 9 | Pending |
| QA-04 | Phase 9 | Pending |
| QA-05 | Phase 9 | Pending |
| QA-06 | Phase 9 | Pending |

**Coverage:**
- v1.2 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0

---
*Requirements defined: 2026-05-02*
*Last updated: 2026-05-02 after v1.2 roadmap creation*
