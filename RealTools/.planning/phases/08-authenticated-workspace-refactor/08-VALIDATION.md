---
phase: 8
slug: authenticated-workspace-refactor
created: 2026-05-02
status: ready
---

# Phase 8 Validation Strategy

## Goal

Verify that the authenticated workspace adopts the approved light dashboard UI contract while preserving all shipped RealTools broker workflows.

## Automated Verification

Run after each plan when practical and after the full phase:

```bash
npm run lint
npm run build
rg "font-heading" 'app/(app)' components/deals components/buyers components/notes components/files components/sidebar.tsx components/sidebar-nav.tsx
rg "green-950|yellow-950|bg-accent text-background|rounded-xl" 'app/(app)' components/deals components/buyers components/notes components/files components/sidebar.tsx components/sidebar-nav.tsx
rg "getUser\\(\\)|redirect\\('/auth/login'\\)" app/'(app)'/layout.tsx app/'(app)'/dashboard/page.tsx app/'(app)'/buyers/page.tsx
rg "createSignedUrl|50 \\* 1024 \\* 1024|deal-files|buyerIds|useActionState" components app/'(app)'
```

Expected results:

- `npm run lint` passes.
- `npm run build` passes or only emits the known multi-lockfile workspace-root warning.
- The `font-heading` grep returns no matches in authenticated workspace scope.
- The dark-remnant grep returns no matches unless a justified non-visual exception is documented.
- Behavior-critical greps still find the expected auth, storage, action-state, and send-OM strings.

## Manual Verification

Required before Phase 8 completion:

- Dashboard empty state.
- Dashboard with at least one active, negotiating, and closed deal if data permits.
- Deal Hub header, metadata, notes, files, buyers/send-OM, and activity sections.
- Buyers empty state and buyers table with long email/tag values.
- Profile page account card.
- Deal create/edit/delete dialogs.
- Buyer create/edit/delete dialogs.
- Note add/edit/delete controls.
- File upload/download/delete controls.
- Send OM modal with no buyers, disabled submit, selected buyers, already-sent buyers, and success/error states where available.
- Mobile viewport around 375px shows no horizontal overflow or clipped primary controls.
- Desktop viewport around 1440px shows the app shell, cards, tables, and panels aligned to the light SaaS dashboard direction.

## Risk Controls

- Do not modify server actions, schemas, Supabase clients, middleware, or database migrations.
- Preserve hidden input names and form action bindings.
- Preserve server-side data filters and signed URL generation.
- Keep public/auth/root surfaces out of Phase 8; Phase 9 owns them.

## Pass Criteria

Phase 8 passes when all automated checks pass, all Phase 8 requirements are represented in executed summaries, and manual/browser verification records no blocking visual or behavior regressions.
