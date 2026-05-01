# Phase 5: Product App Surface Refactor - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Restyle the authenticated broker workspace (dashboard, sidebar, Deal Hub, buyers, profile, dialogs/forms/tables, notes/files/send-OM/activity) to match the v1.1 premium dark reference system while preserving all shipped v1.0 behavior.

</domain>

<decisions>
## Implementation Decisions

### Dashboard and sidebar hierarchy
- **D-01:** Use a compact premium sidebar rail with muted nav labels and a clear active pill state.
- **D-02:** Use serif page titles with muted supporting copy and right-aligned primary actions on authenticated pages.
- **D-03:** Keep dashboard deal cards at balanced density: roomy title/primary metadata with compact secondary details.
- **D-04:** Empty states should be single-panel or unframed with one clear CTA and muted helper text.

### Deal Hub information layout
- **D-05:** Keep Deal Hub as a top summary panel followed by separated Notes, Files, and Activity sections.
- **D-06:** Keep Send OM, Edit, and Delete controls clustered in the header with Send OM as the primary emphasis and destructive action visually subdued.
- **D-07:** Render address/price as a two-column metadata grid with muted labels and readable values, with description below when present.
- **D-08:** Use large vertical rhythm between sections with subtle separators; avoid nested-card clutter.

### Dialog, form, and table states
- **D-09:** Use single-column dialog forms with consistent 16px field spacing and right-aligned actions.
- **D-10:** Use readable medium table/list density with 44px minimum row height and subtle hover surfaces.
- **D-11:** Keep state behavior explicit and unchanged: muted disabled controls, inline field errors, and spinner-in-button loading feedback.
- **D-12:** Use content-fit modal widths (md/xl style breakpoints) with consistent max-width tokens and mobile-safe stacked actions.

### Badges, tags, and activity readability
- **D-13:** Style status badges with subtle semantic tint + border and readable text; avoid saturated fills.
- **D-14:** Keep buyer tags neutral and muted, with max visible count and overflow handling.
- **D-15:** Keep activity items as readable compact rows/cards with concise event text and muted timestamp.
- **D-16:** Keep iconography minimal and supportive only when it improves scan speed; preserve text-first hierarchy.

### the agent's Discretion
- Exact utility classes and token composition per component, as long as decisions D-01 through D-16 and Phase 5 requirements remain satisfied.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and requirements
- `.planning/ROADMAP.md` — Phase 5 goal, requirements mapping, and success criteria.
- `.planning/REQUIREMENTS.md` — APP-01, APP-02, APP-03 acceptance scope for authenticated product surfaces.
- `.planning/PROJECT.md` — v1.1 constraints (behavior-preserving refactor, no new capabilities).

### Visual system contract
- `.planning/phases/04-reference-visual-foundation/04-UI-SPEC.md` — locked visual/spacing/typography/color/component contracts from Phase 4.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/sidebar.tsx` + `components/sidebar-nav.tsx` — app shell rail/nav structure with active-state logic and 44px nav targets.
- `app/(app)/dashboard/page.tsx` + `components/deals/deal-card.tsx` — dashboard header, empty state, and deal-card composition.
- `app/(app)/deals/[id]/page.tsx` — Deal Hub page skeleton with existing section ordering and action cluster.
- `components/deals/deal-form-modal.tsx`, `components/deals/send-om-modal.tsx`, `components/deals/delete-deal-dialog.tsx`, `components/buyers/buyer-form-modal.tsx`, `components/buyers/delete-buyer-dialog.tsx` — primary dialog/form patterns to restyle without behavior changes.
- `components/buyers/buyers-table.tsx`, `components/notes/notes-section.tsx`, `components/files/files-section.tsx`, `components/deals/activity-log-section.tsx` — table/list/timeline surfaces and row semantics to preserve.

### Established Patterns
- Authenticated surfaces use server components with `supabase.auth.getUser()` and keep business actions in server actions.
- Existing UI already uses dark tokenized primitives from Phase 4 (`components/ui/*`), so Phase 5 should apply/compose those patterns consistently instead of introducing new interaction paradigms.
- Empty states and feedback currently rely on direct copy + toast + inline errors; behavior contract should remain unchanged.

### Integration Points
- App shell and nav: `app/(app)/layout.tsx`, `components/sidebar.tsx`, `components/sidebar-nav.tsx`.
- Core surfaces: `app/(app)/dashboard/page.tsx`, `app/(app)/deals/[id]/page.tsx`, `app/(app)/buyers/page.tsx`, `app/(app)/profile/page.tsx`.
- CRUD flow components: deals/buyers/notes/files/send-OM/activity components under `components/`.

</code_context>

<specifics>
## Specific Ideas

- Preserve the current Deal Hub section order (summary, notes, files, activity) while improving visual hierarchy and spacing.
- Keep Send OM as the visually primary action in Deal Hub command clusters.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-product-app-surface-refactor*
*Context gathered: 2026-05-01*
