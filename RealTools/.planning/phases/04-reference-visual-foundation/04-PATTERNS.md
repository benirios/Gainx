# Phase 04 Pattern Map

## Purpose

Map Phase 4 files to existing codebase patterns so execution changes stay local and consistent.

## Existing UI Primitive Pattern

The local primitives in `components/ui` follow shadcn/radix-nova conventions:

- Export plain functions named after the component.
- Use `data-slot` attributes for styling hooks.
- Use `cn(...)` for class merging.
- Keep variants in `class-variance-authority` where component state requires named variants.
- Preserve existing export names so downstream imports do not change.

## File Map

| Phase File | Role | Closest Existing Analog | Pattern To Preserve |
|------------|------|-------------------------|---------------------|
| `app/layout.tsx` | Root font/theme wiring | Existing `Geist` setup | Use `next/font/google`, expose variables on `<html>`, keep `dark` class |
| `app/globals.css` | Tailwind v4 token layer | Current `@theme inline`, `:root`, `.dark`, `@layer base` structure | Keep Tailwind imports and token names; replace values, do not restructure framework setup |
| `components/ui/button.tsx` | Variant primitive | Current `buttonVariants` CVA | Preserve `variant`, `size`, `asChild`, `data-slot`, `data-variant`, `data-size` |
| `components/ui/card.tsx` | Surface primitive | Current Card family | Preserve Card/Header/Title/Description/Action/Content/Footer exports |
| `components/ui/input.tsx` | Form primitive | Current single-function Input | Preserve props passthrough and `data-slot="input"` |
| `components/ui/textarea.tsx` | Form primitive | Current Textarea | Preserve props passthrough and `data-slot="textarea"` |
| `components/ui/select.tsx` | Radix select primitive | Current Select family | Preserve Root/Group/Value/Trigger/Content/Label/Item/Separator exports |
| `components/ui/checkbox.tsx` | Radix checkbox primitive | Current Checkbox | Preserve indicator and checked state behavior |
| `components/ui/badge.tsx` | CVA display primitive | Current `badgeVariants` | Preserve `variant` API |
| `components/ui/dialog.tsx` | Radix dialog primitive | Current Dialog family | Preserve overlay/content/header/footer/title/description exports |
| `components/ui/alert-dialog.tsx` | Radix alert dialog primitive | Current AlertDialog family | Preserve action/cancel and `buttonVariants` integration |
| `components/ui/label.tsx` | Radix label primitive | Current Label | Preserve props passthrough and disabled styling hooks |
| `components/ui/separator.tsx` | Radix separator primitive | Current Separator | Preserve orientation behavior |
| `components/ui/sonner.tsx` | Toast bridge | Current Toaster | Preserve icons, theme passthrough, CSS custom property style API |
| `components/ui/tag-input.tsx` | Local composite primitive | Current TagInput | Preserve hidden JSON input, duplicate behavior, keyboard behavior |

## Constraints

- Do not change imports in product pages during Phase 4 unless a primitive API would break. Primitive APIs should not break.
- Avoid hard-coded light colors in primitives.
- Keep all changed classes token-driven where possible; hard-code only contract-required hex values in `app/globals.css`.
- Do not introduce a reference background implementation.

