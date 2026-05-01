---
phase: 7
slug: light-visual-foundation
status: complete
created: 2026-05-02
---

# Phase 7 — Pattern Map

## Existing Architecture Pattern

RealTools uses a compact Next.js App Router + shadcn/radix-nova setup:

- Global design tokens live in `app/globals.css`.
- Root theme classes and font variables live in `app/layout.tsx`.
- Shared primitives live in `components/ui/*`.
- Product components import primitives and Tailwind utility classes directly.
- Utility class merging uses `cn` from `@/lib/utils`.

Phase 7 should preserve this architecture. Do not introduce a theme provider, new CSS framework, new component library, or page-specific workaround layer.

## File Analog Map

| Target File | Role | Closest Existing Pattern | Notes |
|-------------|------|--------------------------|-------|
| `app/globals.css` | Token source and base layer | Existing `:root`, `.dark`, `@theme inline`, `@layer base` | Replace root values and base typography; keep Tailwind variable mapping. |
| `app/layout.tsx` | Font variables and default theme class | Existing root layout | Remove default `"dark"` class; keep Geist variable. |
| `components/ui/button.tsx` | CVA variant primitive | Existing `buttonVariants` | Preserve variant/size API and `Slot.Root`; change class strings only. |
| `components/ui/card.tsx` | Slot-based surface primitive | Existing `Card`, `CardHeader`, etc. | Preserve exported names and `size` prop. |
| `components/ui/input.tsx` | Native form primitive | Existing `Input` | Preserve prop spread, `data-slot`, and file input styling. |
| `components/ui/textarea.tsx` | Native textarea primitive | Existing `Textarea` | Preserve prop API and min-height. |
| `components/ui/select.tsx` | Radix select primitive | Existing Select wrapper | Preserve Radix parts and portal behavior. |
| `components/ui/checkbox.tsx` | Radix checkbox primitive | Existing Checkbox wrapper | Preserve checked indicator and disabled/invalid states. |
| `components/ui/badge.tsx` | CVA badge variants | Existing `badgeVariants` | Preserve variant names; tune colors. |
| `components/ui/dialog.tsx` | Radix dialog primitive | Existing Dialog wrapper | Preserve overlay/content/title exports. |
| `components/ui/alert-dialog.tsx` | Radix alert dialog primitive | Existing wrapper using `buttonVariants` | Preserve action/cancel integration. |
| `components/ui/sonner.tsx` | Sonner toast wrapper | Existing Toaster with icon map | Preserve icon map and props passthrough; change light CSS vars. |
| `components/ui/tag-input.tsx` | Local composite form control | Existing tag array control | Preserve hidden JSON input and keyboard behavior. |
| `components/ui/separator.tsx` | Radix separator | Existing token-driven separator | Minimal change likely needed. |
| `components/ui/label.tsx` | Radix label | Existing label wrapper | Tune weight/color only. |

## Reuse Rules

- Use existing `cva` variants rather than adding new helper abstractions.
- Use existing `radix-ui` consolidated imports.
- Use lucide icons through existing imports where icons appear.
- Prefer token utilities (`bg-card`, `border-border`, `text-muted-foreground`) after `app/globals.css` is updated.
- Use exact hex values only where the UI-SPEC requires a non-token accent or verification target.

## Data Flow

This phase is visual-only. No data leaves or enters these primitives except existing React props and form values. Do not modify:

- `lib/actions/*`
- `lib/supabase/*`
- `lib/tracking/*`
- `app/api/*`
- `supabase/migrations/*`

## Known Pitfalls

- Leaving `className={cn("dark", ...)}` in `app/layout.tsx` will override the new light `:root` defaults.
- Leaving `font-heading` on shared primitive titles will keep the old v1.1 serif direction.
- Updating `:root` but leaving hard-coded dark hex values in primitives will make the default UI visually inconsistent.
- Increasing border radii above 8px on cards/controls violates the UI-SPEC.
- Product pages may still contain dark utility classes after Phase 7; Phase 8 is responsible for page-level cleanup.
