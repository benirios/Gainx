---
phase: 8
slug: authenticated-workspace-refactor
created: 2026-05-02
status: complete
---

# Phase 8 Research - Authenticated Workspace Refactor

## Research Question

What does the planner need to know to refactor the authenticated RealTools workspace into the approved light dashboard direction without changing shipped broker workflows?

## Inputs

- `.planning/ROADMAP.md` Phase 8 scope and success criteria
- `.planning/REQUIREMENTS.md` requirements `APP-04`, `APP-05`, `APP-06`, `DEAL-01`, `DEAL-02`, `DEAL-03`
- `.planning/STATE.md` current project constraints
- `.planning/phases/07-light-visual-foundation/07-UI-SPEC.md`
- `.planning/phases/08-authenticated-workspace-refactor/08-UI-SPEC.md`
- Current authenticated app files under `app/(app)` and components under `components/`

## Current Architecture

The authenticated workspace is a Next.js App Router route group under `app/(app)`. `app/(app)/layout.tsx` is a server component that creates a Supabase server client, calls `supabase.auth.getUser()`, redirects unauthenticated users to `/auth/login`, and renders a persistent sidebar with a scrollable main content area.

Current authenticated routes:

- `app/(app)/dashboard/page.tsx` lists the current user's deals.
- `app/(app)/deals/[id]/page.tsx` renders Deal Hub data fetched in parallel: deal, notes, files, buyers, deal buyers, and activities.
- `app/(app)/buyers/page.tsx` lists the current user's buyers.
- `app/(app)/profile/page.tsx` displays account details.

Current interactive client components use server actions and `useActionState`:

- `components/deals/deal-form-modal.tsx`
- `components/deals/delete-deal-dialog.tsx`
- `components/deals/send-om-modal.tsx`
- `components/buyers/buyer-form-modal.tsx`
- `components/buyers/delete-buyer-dialog.tsx`
- `components/notes/notes-section.tsx`
- `components/notes/note-item.tsx`
- `components/files/files-section.tsx`

## Behavior Preservation Constraints

Phase 8 is a visual refactor only. The executor must preserve:

- `getUser()` authentication checks and redirect behavior.
- Supabase query filters, especially `.eq('user_id', user.id)` and `.eq('deal_id', id)`.
- Existing `as any` Supabase casts documented in project state.
- Parallel Deal Hub data fetches.
- Server-generated signed URLs for private deal files.
- Server action imports and form field names.
- Hidden inputs such as `dealId`, `buyerIds`, `deal_id`, `buyerId`, and `note_id`.
- `useActionState` success detection and toast behavior.
- File upload path format: `${userId}/${dealId}/${Date.now()}-${file.name}`.
- The 50MB file size limit and existing error copy.
- Send OM selected buyer state, disabled submit conditions, sent badge behavior, and success/error toasts.

## Visual Debt Found

Current authenticated surfaces still contain v1.1 dark/premium remnants:

- `font-heading` appears on dashboard, Deal Hub, buyers, profile, dialogs, notes, files, and activity headings.
- `components/deals/deal-card.tsx` uses dark badge fills: `green-950`, `yellow-950`.
- Several primary buttons use `bg-accent text-background` or `bg-accent text-accent-foreground` instead of the Phase 7 primary button.
- `components/logout-button.tsx` uses dark zinc hover/text colors.
- `app/(app)/buyers/page.tsx` and `app/(app)/profile/page.tsx` add nested `p-8` despite authenticated layout padding.
- `app/(app)/deals/[id]/page.tsx` globally caps Deal Hub at `max-w-3xl`, which conflicts with the Phase 8 responsive 12-column Deal Hub contract.
- Deal Hub notes, files, and activity sections are separated with large standalone separators rather than contained light panels.
- Some rows use `text-base` where the UI-SPEC calls for compact `text-sm` operational density.
- Raw arrow glyphs appear in back links and deal card affordances.

## Implementation Approach

Plan execution should proceed in file-ownership slices:

1. Refactor authenticated shell and navigation first because all pages inherit it.
2. Refactor dashboard and deal cards next, including status badge colors, because Deal Hub reuses `StatusBadge`.
3. Refactor Deal Hub layout and the notes/files/activity panels after shell and status badge changes exist.
4. Refactor buyers and profile surfaces independently from Deal Hub.
5. Refactor modal/form/dialog internals last, preserving all action contracts.

This keeps behavior-sensitive form work separate from layout work and reduces merge conflicts.

## Validation Architecture

Phase 8 validation is UI and behavior-preservation oriented.

Automated checks:

- `npm run lint`
- `npm run build`
- `rg "font-heading" 'app/(app)' components/deals components/buyers components/notes components/files components/sidebar.tsx components/sidebar-nav.tsx` returns no matches.
- `rg "green-950|yellow-950|bg-accent text-background|rounded-xl" 'app/(app)' components/deals components/buyers components/notes components/files components/sidebar.tsx components/sidebar-nav.tsx` returns no matches unless a documented exception exists.
- `rg "getUser\\(\\)|redirect\\('/auth/login'\\)" app/'(app)'/layout.tsx app/'(app)'/dashboard/page.tsx app/'(app)'/buyers/page.tsx` confirms auth checks remain.
- `rg "createSignedUrl|50 \\* 1024 \\* 1024|deal-files|buyerIds|useActionState" components app/'(app)'` confirms behavior-critical strings remain.

Manual/browser checks:

- Dashboard with no deals and with multiple deals.
- Deal Hub with notes, files, buyers, sent OM state, and activity events.
- Buyers page with no buyers, long emails, and multiple tags.
- Profile page.
- Deal create/edit/delete dialogs.
- Buyer create/edit/delete dialogs.
- Add/edit/delete note controls.
- Upload/download/delete file controls.
- Send OM modal with no buyers, no selection, selected buyers, and already-sent buyers.
- Mobile widths around 375px and 768px for no horizontal overflow.

## Planning Notes

- Do not introduce new analytics or charts. Dashboard summary cards may use counts derived from `dealList`.
- Do not add new database fields or queries unless a displayed value already exists in fetched data.
- Prefer changing class names and composition over extracting new abstractions.
- Shared UI primitives were handled in Phase 7; Phase 8 should not rework `components/ui/*` unless required for a page-specific bug.
- Use lucide icons already available through `lucide-react`.

## Research Complete

Phase 8 can be planned as five executable plans with explicit verification and behavior-preservation checks.
