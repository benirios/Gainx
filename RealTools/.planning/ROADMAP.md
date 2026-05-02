# Roadmap: RealTools v1.2 Light Dashboard UI Refactor

## Overview

RealTools v1.2 is a behavior-preserving UI refactor that moves the product from the unfinished v1.1 dark premium direction to the provided Nexus-style light SaaS dashboard reference. The milestone keeps the v1.0 product surface intact while refreshing the visual system, authenticated workspace, public/auth surfaces, and verification pass.

Phase numbering continues from the previous roadmap, so this milestone starts at Phase 7.

## Phases

**Phase Numbering:**
- Integer phases (7, 8, 9): Planned v1.2 milestone work
- Decimal phases (8.1, 8.2): Urgent insertions if needed

- [x] **Phase 7: Light Visual Foundation** - Replace the dark reference foundation with light tokens, shared primitives, layout rules, and state styling based on the Nexus-style reference. (completed 2026-05-02)
- [x] **Phase 8: Authenticated Workspace Refactor** - Restyle the app shell, dashboard, Deal Hub, buyers, profile, forms, dialogs, tables, notes, files, send-OM flow, and activity surfaces. (completed 2026-05-02)
- [ ] **Phase 9: Public Surfaces and Verification** - Restyle auth/root/public OM surfaces, verify responsive quality, and complete critical workflow plus deferred live UAT checks.

## Phase Details

### Phase 7: Light Visual Foundation
**Goal**: The app has a coherent light SaaS visual system based on the reference image: off-white page backgrounds, white cards, subtle borders, soft shadows, muted grays, pale icons, rounded controls, and pastel teal/purple/blue accents.
**Depends on**: v1.2 milestone start
**Requirements**: UI-05, UI-06, UI-07, UI-08
**Success Criteria** (what must be TRUE):
  1. Global tokens, base styles, typography, radii, borders, focus rings, shadows, and color variables express the light reference direction.
  2. Shared UI primitives use rounded light controls, pale icon treatments, subtle separators, muted text, and pastel accents consistently.
  3. The previous dark theme direction no longer drives the default app appearance.
  4. Loading, empty, error, disabled, hover, and focus states are styled in the light system without layout shift.
  5. Visual rules explicitly avoid copying Nexus branding/content or inventing unsupported product analytics.
**Plans**: 07-01 Global Light Theme Foundation; 07-02 Action And Form Primitive Refactor; 07-03 Surfaces Feedback And Foundation Audit
**UI hint**: yes

### Phase 8: Authenticated Workspace Refactor
**Goal**: The authenticated broker workspace looks and feels like the reference dashboard while preserving all shipped RealTools workflows.
**Depends on**: Phase 7
**Requirements**: APP-04, APP-05, APP-06, DEAL-01, DEAL-02, DEAL-03
**Success Criteria** (what must be TRUE):
  1. Sidebar, topbar, navigation, user/profile affordances, and primary app layout match the light SaaS shell direction.
  2. Dashboard cards, deal summaries, activity previews, and workflow shortcuts align with the reference's card density and muted visual hierarchy without fake metrics.
  3. Deal Hub, buyers, profile, notes, files, send-OM, and activity log surfaces use consistent light cards, tables, badges, tags, rows, and metadata treatments.
  4. Deal, note, file, buyer, delete, and send-OM dialogs/forms are restyled without changing validation, actions, or data behavior.
  5. Existing authenticated navigation and broker workflows still work after the refactor.
**Plans**: 08-01 Authenticated Shell And Navigation; 08-02 Dashboard And Deal Cards; 08-03 Deal Hub Layout And Detail Sections; 08-04 Buyers And Profile Surfaces; 08-05 Dialogs And Workflow Forms
**UI hint**: yes

### Phase 9: Public Surfaces and Verification
**Goal**: Public and unauthenticated surfaces match the light reference direction, and the full UI refactor is verified across responsive layouts and critical workflows.
**Depends on**: Phase 8
**Requirements**: SURF-04, SURF-05, SURF-06, QA-04, QA-05, QA-06
**Success Criteria** (what must be TRUE):
  1. Login and signup pages match the light visual system and preserve Supabase email/password behavior.
  2. The root/landing page reflects the light dashboard direction without becoming a marketing-only detour.
  3. Public OM pages preserve unauthenticated access, tracking routes, and buyer-facing readability while adopting the light style.
  4. Desktop and mobile screenshots show no text overlap, clipped controls, unreadable contrast, broken layouts, or accidental dark-theme remnants.
  5. Critical v1.0 workflows pass after the refactor: auth, deal CRUD, notes, file upload/download, buyer CRUD, send OM, public OM open, tracking, and activity review.
  6. Deferred Phase 3 live UAT is completed or explicitly documented with remaining blockers.
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 7 -> 8 -> 9

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 7. Light Visual Foundation | 3/3 | Complete | 2026-05-02 |
| 8. Authenticated Workspace Refactor | 5/5 | Complete | 2026-05-02 |
| 9. Public Surfaces and Verification | 0/TBD | Not started | - |

## Requirement Coverage

| Requirement | Phase | Status |
|-------------|-------|--------|
| UI-05 | Phase 7 | Complete |
| UI-06 | Phase 7 | Complete |
| UI-07 | Phase 7 | Complete |
| UI-08 | Phase 7 | Complete |
| APP-04 | Phase 8 | Complete |
| APP-05 | Phase 8 | Complete |
| APP-06 | Phase 8 | Complete |
| DEAL-01 | Phase 8 | Complete |
| DEAL-02 | Phase 8 | Complete |
| DEAL-03 | Phase 8 | Complete |
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
