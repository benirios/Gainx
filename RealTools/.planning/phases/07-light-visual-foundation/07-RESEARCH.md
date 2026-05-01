---
phase: 7
slug: light-visual-foundation
status: complete
created: 2026-05-02
---

# Phase 7 — Research: Light Visual Foundation

## Research Complete

Phase 7 should be implemented as a focused design-system replacement, not a product-surface refactor. The approved UI-SPEC is the visual contract; the codebase already has a shadcn/radix-nova primitive layer that can absorb most of the visual change before Phase 8 applies it to pages.

## Current Implementation Findings

### Root theme and globals

- `app/layout.tsx` applies `className={cn("dark", "font-sans", geist.variable, cormorant.variable)}` to `<html>`, making the dark theme the default.
- `app/globals.css` defines dark values in `:root` and duplicates them in `.dark`.
- `@theme inline` maps Tailwind color utilities to CSS variables, so replacing `:root` tokens is the correct global foundation path.
- `--font-heading` currently maps to `--font-display`, and base headings/card/dialog titles use `font-family: var(--font-display), Georgia, serif;`.

### Shared primitives

- `components/ui/button.tsx` uses rounded-full controls, dark borders, dark inset shadows, `h-11` defaults, and dark-hover colors.
- `components/ui/card.tsx` uses `rounded-2xl`, dark heavy shadow, `font-heading` card titles, and rounded footer/header treatments.
- `components/ui/input.tsx`, `textarea.tsx`, `select.tsx`, and `tag-input.tsx` use `rounded-[14px]`, `bg-secondary`, dark placeholder hex `#6f7485`, and dark invalid variants.
- `components/ui/dialog.tsx` and `alert-dialog.tsx` use dark overlays, 20px radii, heavy dark shadows, and `font-heading text-3xl` titles.
- `components/ui/sonner.tsx` hard-codes dark toast CSS variables (`#111827`, `#f7f5ef`, `#2b3040`) and a 16px radius.
- `components/ui/badge.tsx`, `checkbox.tsx`, `separator.tsx`, and `label.tsx` are structurally reusable but need token and radius tuning.

## Implementation Approach

### Plan 07-01: Global light theme foundation

Modify:
- `app/globals.css`
- `app/layout.tsx`

Implement:
- Set `:root` tokens to the UI-SPEC light palette.
- Keep `.dark` fallback only if useful, but remove the root default `dark` class.
- Set `--radius: 0.5rem`.
- Remap `--font-heading` to `var(--font-sans)` or stop applying `font-heading` to shared UI headings.
- Change base `body` font size to 14px and preserve line-height 1.55.
- Remove global serif heading override for app/card/dialog headings.

### Plan 07-02: Actions and form primitives

Modify:
- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/textarea.tsx`
- `components/ui/select.tsx`
- `components/ui/checkbox.tsx`
- `components/ui/label.tsx`

Implement:
- Buttons: 8px radius, 40px default height, purple primary, white outline/secondary, neutral ghost, restrained destructive.
- Inputs/selects/textareas: white background, `#E7EAF0` border via tokens, `h-10`, `rounded-lg`, muted placeholder through `placeholder:text-muted-foreground`.
- Select content: light surface, 12px max popover radius, lighter shadow.
- Checkbox: white background, checked purple, 4px-6px radius, visible focus ring.
- Labels: 12px, 500 weight, muted foreground.

### Plan 07-03: Surfaces, overlays, feedback, and foundation audit

Modify:
- `components/ui/card.tsx`
- `components/ui/badge.tsx`
- `components/ui/dialog.tsx`
- `components/ui/alert-dialog.tsx`
- `components/ui/sonner.tsx`
- `components/ui/tag-input.tsx`
- `components/ui/separator.tsx`

Implement:
- Cards: `rounded-lg`, white surface, subtle border, `0 12px 30px rgba(35, 45, 72, 0.05)` shadow, Geist card titles.
- Badges: neutral, secondary, destructive, and outline variants tuned to light palette.
- Dialogs/alert dialogs: light overlay `rgba(15, 23, 42, 0.22)`, `rounded-xl`, `0 24px 70px rgba(35, 45, 72, 0.18)` shadow, Geist 20px title.
- Sonner: light CSS variables and 8px radius.
- Tag input: light border/background and muted placeholders.
- Separator: continue token-driven border color.

## Validation Architecture

Automated validation is mostly static/code-level because Phase 7 is a visual foundation and does not introduce business logic.

Required automated checks:
- `npm run lint`
- `npm run build`
- `rg 'className=\\{cn\\(\"dark\"|<html[^>]*dark' app components` returns no default root dark class.
- `rg '#090d17|#111827|#0d1320|#171c2a' app/globals.css components/ui app/layout.tsx` returns no unapproved default dark foundation tokens.
- `rg 'font-heading' components/ui app/globals.css` returns no shared primitive/global heading dependency on the v1.1 serif direction.
- `rg 'rounded-2xl|rounded-3xl|rounded-4xl|rounded-\\[14px\\]|rounded-\\[20px\\]' components/ui app/globals.css app/layout.tsx` returns no shared primitive violations unless justified in executor summary.

Manual/visual validation:
- Run the app and inspect at 375px, 768px, and 1440px widths.
- Confirm the default UI is light without toggling theme state.
- Confirm controls retain focus-visible, disabled, invalid, aria-expanded, and keyboard behavior.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Product pages may still contain dark one-off classes after primitives change | Phase 7 only guarantees foundation files; Phase 8 handles product surface cleanup. Grep shared primitives and root files strictly, leave page-level surface work to Phase 8. |
| Removing `dark` default exposes page-level dark assumptions | Build and browser smoke-check after primitive changes; executor summaries must note remaining page-level dark remnants for Phase 8. |
| Overusing purple accents makes the page one-note | Reserve purple for primary/active states and use teal/blue only for specific statuses/charts. |
| Replacing serif headings could conflict with existing brand direction | UI-SPEC explicitly supersedes the v1.1 serif default for operational app UI. |
| Visual-only changes can accidentally alter behavior | Plans must avoid action/schema/auth/email/tracking files and run `npm run build`. |

## Files To Plan Against

- `app/globals.css`
- `app/layout.tsx`
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/input.tsx`
- `components/ui/textarea.tsx`
- `components/ui/select.tsx`
- `components/ui/checkbox.tsx`
- `components/ui/badge.tsx`
- `components/ui/dialog.tsx`
- `components/ui/alert-dialog.tsx`
- `components/ui/sonner.tsx`
- `components/ui/tag-input.tsx`
- `components/ui/separator.tsx`
- `components/ui/label.tsx`

## Planner Requirements

- Every plan must cite the relevant UI-SPEC sections in `read_first`.
- Every plan must include a threat model block, with no HIGH threats accepted.
- Every plan must include grep-verifiable acceptance criteria.
- The phase must cover UI-05, UI-06, UI-07, and UI-08 exactly once across the plan set.
