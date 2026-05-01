# Roadmap: RealTools v1.1 Reference UI Refactor

## Overview

RealTools v1.1 is a behavior-preserving UI refactor. The milestone refreshes every user-facing surface to match the provided reference screenshot's premium dark CRE style while explicitly excluding the screenshot's background network pattern. Phase numbering continues from the shipped v1.0 milestone, so this roadmap starts at Phase 4.

## Phases

**Phase Numbering:**
- Integer phases (4, 5, 6): Planned v1.1 milestone work
- Decimal phases (5.1, 5.2): Urgent insertions if needed

- [ ] **Phase 4: Reference Visual Foundation** - Establish global tokens, typography, surfaces, and shared UI primitives matching the reference style.
- [ ] **Phase 5: Product App Surface Refactor** - Restyle the authenticated broker workspace: dashboard, deal hub, buyers, profile, forms, dialogs, tables, notes, files, send OM, and activity.
- [ ] **Phase 6: Public/Auth Surfaces and Responsive QA** - Restyle auth, landing, and public OM pages, then verify responsive quality and critical v1.0 workflows.

## Phase Details

### Phase 4: Reference Visual Foundation
**Goal**: The app has a coherent visual system based on the reference screenshot: premium dark palette, serif display typography, muted supporting text, pill controls, subtle borders, and consistent surface styling without copying the excluded background pattern.
**Depends on**: v1.0 complete
**Requirements**: UI-01, UI-02, UI-03, UI-04
**Success Criteria** (what must be TRUE):
  1. Global CSS variables and base styles define the refreshed dark palette, typography scale, borders, focus rings, and selection/scrollbar behavior.
  2. Shared UI primitives (`button`, `card`, `input`, `textarea`, `select`, `checkbox`, `badge`, `dialog`, `alert-dialog`, `separator`, `sonner`, `tag-input`) visually align with the reference style.
  3. Brand/display typography uses a serif voice where appropriate, while supporting text remains muted and readable.
  4. Common surfaces avoid nested-card clutter and use consistent spacing, subtle borders, and dark premium contrast.
  5. No implementation depends on recreating the reference background network pattern.
**Plans**: TBD
**UI hint**: yes

### Phase 5: Product App Surface Refactor
**Goal**: The authenticated broker workspace looks and feels like the reference style while preserving all shipped v1.0 workflows.
**Depends on**: Phase 4
**Requirements**: APP-01, APP-02, APP-03
**Success Criteria** (what must be TRUE):
  1. Dashboard, sidebar, deal cards, Deal Hub, buyers table, and profile page use the refreshed visual system consistently.
  2. Deal, note, file, buyer, delete, and send-OM dialogs/forms are restyled without changing validation, actions, or data behavior.
  3. Status badges, buyer tags, metadata rows, file rows, notes, and activity timeline items remain readable and visually consistent.
  4. Existing authenticated navigation and broker workflows still work after the refactor.
  5. Empty, loading, error, disabled, hover, and focus states are present and styled across core app surfaces.
**Plans**: TBD
**UI hint**: yes

### Phase 6: Public/Auth Surfaces and Responsive QA
**Goal**: Public and unauthenticated surfaces match the refreshed reference style, and the milestone is verified across responsive layouts and critical v1.0 behavior.
**Depends on**: Phase 5
**Requirements**: SURF-01, SURF-02, SURF-03, QA-01, QA-02, QA-03
**Success Criteria** (what must be TRUE):
  1. Login and signup pages match the refreshed visual system and preserve existing auth behavior.
  2. The root/landing page reflects the reference style without copying the excluded background pattern.
  3. Public OM pages preserve unauthenticated access, tracking routes, and buyer-facing readability while adopting the refreshed style.
  4. Desktop and mobile screenshots show no text overlap, clipped controls, broken layouts, or unreadable contrast.
  5. Critical v1.0 workflows pass after the refactor: auth, deal CRUD, notes, file upload/download, buyer CRUD, send OM, public OM open, tracking, and activity review.
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 4. Reference Visual Foundation | 0/TBD | Ready to plan | - |
| 5. Product App Surface Refactor | 0/TBD | Not started | - |
| 6. Public/Auth Surfaces and Responsive QA | 0/TBD | Not started | - |
