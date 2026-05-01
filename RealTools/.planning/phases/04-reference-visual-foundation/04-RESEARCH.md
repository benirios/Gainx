# Phase 04 Research: Reference Visual Foundation

## RESEARCH COMPLETE

## Phase Summary

Phase 4 establishes the shared visual foundation for the v1.1 UI refactor. It does not restyle every product page. It updates the global token layer, root fonts, and shared UI primitives so later phases can apply the reference style consistently without repeating low-level styling work.

## Inputs

- Roadmap phase: Phase 4 - Reference Visual Foundation
- Requirements: UI-01, UI-02, UI-03, UI-04
- UI contract: `.planning/phases/04-reference-visual-foundation/04-UI-SPEC.md`
- Reference image: `references/Captura de Tela 2026-05-01 às 19.22.35.png`
- Current stack: Next.js 15 App Router, Tailwind v4, shadcn radix-nova, radix-ui consolidated imports, lucide-react

## Implementation Approach

### Global Tokens And Fonts

Update `app/layout.tsx` and `app/globals.css` first. The current app already forces dark mode and exposes Geist as `--font-sans`; Phase 4 should add a serif display font variable and map `--font-heading` to it. The safest implementation path is:

1. Import `Cormorant_Garamond` from `next/font/google`.
2. Expose it as `--font-display`.
3. Keep Geist as `--font-sans`.
4. Remove the unused Inter body class so the CSS variables drive the typography system.
5. Replace the existing light/dark neutral OKLCH defaults with hex-based reference tokens required by UI-SPEC.

### Shared Primitives

The current UI primitives are already centralized in `components/ui`. Phase 4 should update those primitives instead of hard-coding page-level styles:

- `button.tsx`: pill radii, 44px default height, 48px large height, premium dark backgrounds/borders.
- `card.tsx`: 16px radius, dark panel surface, muted border, serif title.
- `input.tsx`, `textarea.tsx`, `select.tsx`, `checkbox.tsx`: 44px controls, 14px radius, dark input surface, accent focus.
- `badge.tsx`, `tag-input.tsx`: muted pill semantics.
- `dialog.tsx`, `alert-dialog.tsx`, `sonner.tsx`: dark overlay/popover surfaces and serif modal titles.
- `label.tsx`, `separator.tsx`: token-driven muted styling.

### Explicit Non-Goals

- Do not copy the reference screenshot background network/grid/dot pattern.
- Do not redesign dashboard, Deal Hub, buyers, auth, or OM page layouts in Phase 4.
- Do not add new UI dependencies.
- Do not change product behavior, form actions, data fetching, Supabase calls, or routes.

## Existing Patterns

The codebase favors small shadcn-style primitives with `data-slot` attributes and `cn(...)` class merging. Preserve that pattern. Existing components import primitives from `@/components/ui/*`; keeping the same exported component names avoids downstream page changes.

## Files In Scope

- `app/layout.tsx`
- `app/globals.css`
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/input.tsx`
- `components/ui/textarea.tsx`
- `components/ui/select.tsx`
- `components/ui/checkbox.tsx`
- `components/ui/badge.tsx`
- `components/ui/dialog.tsx`
- `components/ui/alert-dialog.tsx`
- `components/ui/label.tsx`
- `components/ui/separator.tsx`
- `components/ui/sonner.tsx`
- `components/ui/tag-input.tsx`

## Validation Architecture

Phase 4 is mostly visual infrastructure, so validation should combine grep-verifiable contract checks with the existing Next lint command.

Required automated checks:

1. `npm run lint`
2. `rg --fixed-strings -- '--background: #090d17' app/globals.css`
3. `rg --fixed-strings -- '--card: #111827' app/globals.css`
4. `rg --fixed-strings -- '--border: #2b3040' app/globals.css`
5. `rg --fixed-strings -- '--font-heading: var(--font-display)' app/globals.css`
6. `rg --fixed-strings -- 'Cormorant_Garamond' app/layout.tsx`
7. `rg --fixed-strings -- 'rounded-full' components/ui/button.tsx`
8. `rg --fixed-strings -- 'h-11' components/ui/button.tsx`
9. `rg --fixed-strings -- 'h-12' components/ui/button.tsx`
10. `rg --fixed-strings -- '#111827' app/globals.css`
11. `! rg -n 'network|constellation|particle|canvas' app components --glob '!favicon.ico'`

Manual review:

- Compare the changed primitive styles against the reference screenshot intent: premium dark, serif display, muted operational text, pill controls, subtle borders.
- Confirm no implementation recreates the excluded background network pattern.

## Risks

- Over-restyling product pages in Phase 4 would blur phase boundaries. Keep Phase 4 to tokens and primitives.
- Hard-coded `zinc-*` classes in product components will remain until Phase 5. Phase 4 should not chase all product component usage.
- Font import changes can create unused variable/class issues. Keep root layout simple and lintable.

