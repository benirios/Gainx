---
phase: 7
slug: light-visual-foundation
status: approved
shadcn_initialized: true
preset: radix-nova
created: 2026-05-02
approved: 2026-05-02
---

# Phase 7 - UI Design Contract

> Visual and interaction contract for the Phase 7 light dashboard foundation. This phase replaces the unfinished v1.1 dark premium direction with the user's Nexus-style light SaaS dashboard reference while preserving RealTools product identity and existing workflows.

---

## Source Of Truth

### Reference Interpretation

The attached Nexus dashboard screenshot is the visual source of truth for Phase 7. Treat it as a style reference, not a brand/content/product reference.

Required qualities:
- Light off-white application background with white panels.
- Left sidebar with compact icon-led navigation, muted labels, active row treatment, and subtle section dividers.
- Topbar/header controls with search/action/user affordances styled as low-contrast rounded controls.
- Dashboard cards with thin borders, soft shadows, compact metric hierarchy, and pale icon containers.
- Pastel teal, purple, and blue accents used for charts, badges, small trend chips, progress indicators, and icon backgrounds.
- Soft gray typography with clear hierarchy but no heavy black text.
- Spacious but dense operational SaaS layout: useful first screen, no marketing hero.

Explicit exclusions:
- Do not copy the Nexus brand name, logo, sidebar labels, avatar, sample revenue/page-view metrics, or exact business content.
- Do not add fake analytics features or unsupported chart data just because the reference contains charts.
- Do not preserve the v1.1 dark theme as the default appearance.
- Do not use the v1.1 serif-display premium CRE look for dashboard UI headings.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn |
| Preset | radix-nova |
| Component library | consolidated `radix-ui` package via existing shadcn components |
| Icon library | lucide |
| Font | Geist for all operational UI; Cormorant Garamond is not used for default app headings in this phase |
| Tailwind mode | CSS variables in `app/globals.css`; no separate Tailwind config file |
| Theme default | Light; remove `dark` class from the root default during implementation |

### Files In Scope For Foundation

These files are the foundation scope for Phase 7:
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

Out of scope for Phase 7:
- Rebuilding dashboard/deal pages directly. Phase 8 handles product surfaces.
- Rebuilding auth/public OM/root pages. Phase 9 handles public and unauthenticated surfaces.
- Database, auth, email, tracking, or Supabase behavior changes.

---

## Spacing Scale

Declared values must remain multiples of 4.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, checkbox indicator gaps, compact inline separators |
| sm | 8px | Nav item inner gaps, badge padding, card title/description gaps |
| md | 16px | Default form gaps, card inner spacing, toolbar gaps |
| lg | 24px | Card padding on desktop, page section gaps, dialog body spacing |
| xl | 32px | Page padding on desktop, major dashboard grid gaps |
| 2xl | 48px | Empty-state vertical padding, major page breaks |
| 3xl | 64px | Rare full-page vertical breathing room |

Exceptions:
- Icon-only controls may use `size-9` (36px) or `size-10` (40px) to match the reference toolbar density.
- Form controls use `h-10` (40px) by default and `h-9` (36px) for compact toolbar/filter controls.
- Cards use `rounded-lg` / 8px maximum unless an existing radix-nova primitive requires a larger popover/dialog radius for accessibility or animation.

Layout constraints:
- App shell background: `#F7F8FB`.
- Sidebar width target: 240px desktop, collapses or stacks only in later product phases.
- Page padding target: `32px` desktop, `20px` tablet, `16px` mobile.
- Card grid gaps target: `24px` desktop, `16px` mobile.
- Do not nest visual cards inside other visual cards.

---

## Typography

Use Geist as the default product font. The reference reads as a clean operational SaaS dashboard, so Phase 7 must remove the v1.1 serif heading default from shared UI primitives.

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px | 400 | 1.55 |
| Label | 12px | 500 | 1.35 |
| Small metadata | 12px | 400 | 1.4 |
| Nav item | 14px | 500 | 1.35 |
| Card title | 15px | 500 | 1.35 |
| Metric value | 28px | 500 | 1.1 |
| Page heading | 24px | 600 | 1.2 |
| Dialog heading | 20px | 600 | 1.25 |

Typography rules:
- Letter spacing is `0`.
- Avoid viewport-based font scaling.
- Avoid oversized hero-scale type in app surfaces.
- Use `text-[#525A6A]` or `--foreground` for primary text, not pure black.
- Use `text-[#9AA3B2]` or `--muted-foreground` for secondary text.
- No visible instructional copy describing the UI style, reference, shortcuts, or visual system.

---

## Color

The palette must read as light neutral SaaS with restrained pastel accents. It must not become a purple-only or blue-only theme.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#F7F8FB` | App background and main canvas |
| Surface | `#FFFFFF` | Cards, dialogs, popovers, inputs, tables |
| Secondary (30%) | `#FBFCFE` | Sidebar, toolbar fills, secondary panels |
| Border | `#E7EAF0` | Card borders, separators, input borders |
| Input | `#EEF1F6` | Input/trigger border and subtle inset boundary |
| Foreground | `#4B5363` | Primary readable text |
| Muted foreground | `#9AA3B2` | Metadata, placeholders, helper text |
| Accent teal | `#55D6CF` | Positive trend chips, selected small indicators, secondary chart marks |
| Accent purple | `#8B7AE6` | Primary brand accent, active nav icon chip, key chart mark |
| Accent blue | `#7DB4F5` | Informational indicators and chart marks |
| Accent mint fill | `#E7FAF8` | Positive badge backgrounds |
| Accent purple fill | `#F0EEFF` | Active nav, icon chip, selected badge backgrounds |
| Accent blue fill | `#EAF3FF` | Informational badge backgrounds |
| Destructive | `#E45B6A` | Destructive actions and error state only |
| Destructive fill | `#FDECEF` | Destructive subtle background only |

Accent reserved for:
- Active navigation icon chip and active row edge.
- Trend pills and small status chips.
- Chart/progress marks introduced by existing product data only.
- Focus rings and selected states.
- File/type/tag/status accents when they improve scanning.

Accent not allowed for:
- Large page backgrounds.
- Every button.
- Body text.
- Decorative blobs, gradient orbs, bokeh, or full-page gradients.
- Fake analytics widgets unsupported by RealTools data.

CSS variable target values:

```css
:root {
  --radius: 0.5rem;
  --background: #f7f8fb;
  --foreground: #4b5363;
  --card: #ffffff;
  --card-foreground: #4b5363;
  --popover: #ffffff;
  --popover-foreground: #4b5363;
  --primary: #8b7ae6;
  --primary-foreground: #ffffff;
  --secondary: #fbfcfe;
  --secondary-foreground: #525a6a;
  --muted: #f0f3f7;
  --muted-foreground: #9aa3b2;
  --accent: #f0eeff;
  --accent-foreground: #6759c7;
  --destructive: #e45b6a;
  --border: #e7eaf0;
  --input: #eef1f6;
  --ring: #8b7ae6;
  --chart-1: #8b7ae6;
  --chart-2: #55d6cf;
  --chart-3: #7db4f5;
  --chart-4: #cfd6e3;
  --chart-5: #eef1f6;
  --sidebar: #fbfcfe;
  --sidebar-foreground: #6b7280;
  --sidebar-primary: #f0eeff;
  --sidebar-primary-foreground: #6759c7;
  --sidebar-accent: #f3f5f9;
  --sidebar-accent-foreground: #4b5363;
  --sidebar-border: #e7eaf0;
  --sidebar-ring: #8b7ae6;
}
```

The `.dark` block may remain for future support, but the root layout must not apply `className="dark"` by default.

---

## Component Contracts

### Buttons

Primary button:
- Background `#8B7AE6`, text `#FFFFFF`.
- Height `40px`, radius `8px`, horizontal padding `16px`.
- Shadow `0 8px 18px rgba(139, 122, 230, 0.18)`.
- Hover background `#7A6BDD`.
- Focus ring `0 0 0 3px rgba(139, 122, 230, 0.18)`.

Secondary/outline button:
- Background `#FFFFFF`.
- Border `#E7EAF0`.
- Text `#6B7280`.
- Hover background `#F3F5F9`.

Ghost button:
- Transparent background.
- Text `#8A93A3`.
- Hover background `#F3F5F9`, hover text `#4B5363`.

Icon button:
- `size-9` or `size-10`.
- Rounded `8px`.
- Uses lucide icons, not handmade SVGs when lucide has a matching icon.
- Unknown icon-only actions must have accessible labels or title text.

### Cards And Panels

Default card:
- Background `#FFFFFF`.
- Border `1px solid #E7EAF0`.
- Radius `8px`.
- Shadow `0 12px 30px rgba(35, 45, 72, 0.05)`.
- Padding `24px` desktop, `16px` mobile.
- Header gap `8px`, content gap `16px`.

Compact card:
- Padding `16px`.
- Min-height stable for metric cards.

Forbidden:
- Heavy dark shadows.
- Nested visual cards.
- Decorative gradient/orb backgrounds.
- Rounded card radius above 8px.

### Forms

Inputs, textareas, selects, and tag inputs:
- Background `#FFFFFF`.
- Border `#E7EAF0`.
- Text `#4B5363`.
- Placeholder `#A8B0BD`.
- Height `40px` for inputs/select triggers.
- Radius `8px`.
- Focus border `#8B7AE6`.
- Focus ring `rgba(139, 122, 230, 0.16)`.
- Invalid border `#E45B6A`, invalid ring `rgba(228, 91, 106, 0.14)`.

Labels:
- 12px, 500 weight, `#6B7280`.
- Error messages: 12px, `#E45B6A`.

### Badges, Tags, And Status

Default badge:
- Background `#F3F5F9`.
- Text `#6B7280`.
- Border `#E7EAF0`.
- Radius `999px`.

Positive/tracked/opened:
- Background `#E7FAF8`.
- Text `#249C96`.

Brand/active:
- Background `#F0EEFF`.
- Text `#6759C7`.

Info:
- Background `#EAF3FF`.
- Text `#3E7FC3`.

Destructive:
- Background `#FDECEF`.
- Text `#C93F50`.

### Dialogs And Popovers

- Background `#FFFFFF`.
- Border `#E7EAF0`.
- Radius `12px` maximum for dialogs/popovers.
- Overlay `rgba(15, 23, 42, 0.22)`.
- Shadow `0 24px 70px rgba(35, 45, 72, 0.18)`.
- Title font Geist 20px/600, not Cormorant.

### Toasts

- Light surface.
- Success icon/color uses teal.
- Error icon/color uses destructive.
- Toast border and shadow match cards.

---

## Layout Contracts

### App Shell Preview Contract

Phase 7 sets the foundation that Phase 8 will apply to the full app shell.

The intended shell is:
- Sidebar: 240px, `#FBFCFE`, right border `#E7EAF0`.
- Main canvas: `#F7F8FB`.
- Topbar/search controls: white rounded controls with muted icon/text.
- Active nav row: `#F3F5F9` row background plus a purple-tinted icon chip.
- Sidebar section headings: 12px uppercase-ish label, `#C0C6D0`, 500 weight, letter spacing 0.

Do not implement new product navigation items in Phase 7. Visual primitives must support this shell for Phase 8.

### Responsive Contract

- No text overlap at 375px, 768px, 1280px, or 1440px widths.
- Fixed-format controls use stable dimensions.
- Long labels wrap or truncate intentionally; they must not expand icon buttons or badges unexpectedly.
- Mobile app surfaces may stack, but Phase 7 only establishes primitives and tokens.

---

## Copywriting Contract

Phase 7 is foundation work, so copy changes should be minimal and component-level only.

| Element | Copy |
|---------|------|
| Primary CTA | `Create deal` |
| Empty state heading | `No deals yet` |
| Empty state body | `Create a deal to keep the workspace, OM, buyers, and activity in one place.` |
| Error state | `Something went wrong. Try again, or refresh the page.` |
| Destructive confirmation | `Delete {item}: This cannot be undone.` |
| Loading state | `Loading` |

Copy rules:
- Use sentence case.
- Use concise broker/product language.
- Do not mention the reference image, visual refactor, keyboard shortcuts, or implementation details in the product UI.
- Do not introduce marketing hero copy in app surfaces.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | Existing local primitives only: button, card, input, textarea, select, checkbox, badge, dialog, alert-dialog, separator, sonner, label, form | No registry fetch required |
| radix-nova preset | Existing project preset in `components.json` | No new registry install required |
| third-party registries | None | Any future registry block requires `shadcn view` plus diff review before use |

Dependency rules:
- Do not add a new component library.
- Do not add charting libraries in Phase 7.
- Do not add a CSS framework beyond existing Tailwind/shadcn setup.
- Continue using lucide for icons.

---

## Implementation Guardrails For Planners

Every Phase 7 plan must include these truths:
- The default UI becomes light by removing the root `dark` class default from `app/layout.tsx`.
- `app/globals.css` is the token source of truth.
- Shared primitives must be updated before product pages are restyled.
- Phase 7 must not change Supabase, Resend, tracking, schema, or data behavior.
- Phase 7 must not add fake analytics capabilities.
- Phase 7 must preserve accessibility states: focus-visible, disabled, invalid, aria-expanded, and keyboard use.

Recommended plan split:
- Plan 07-01: global tokens, root theme default, base typography.
- Plan 07-02: shared action/form primitives.
- Plan 07-03: cards, badges, dialogs, toasts, tag-input, separators, and visual state audit.

Recommended verification commands:
- `npm run lint`
- `npm run build`
- `rg "className=\\{cn\\(\\\"dark\\\"|<html[^>]*dark" app components`
- `rg "#090d17|#111827|#0d1320|#171c2a|font-heading" app components`
- `rg "rounded-2xl|rounded-3xl|rounded-4xl" components/ui app`

The dark-token grep may find comments or non-default `.dark` fallback support. Any remaining match must be explicitly justified by the executor summary.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-05-02

## Inline Checker Notes

- Copywriting passes because the contract names exact reusable state copy and forbids visible implementation/reference explanations.
- Visuals pass because the contract translates the reference into concrete surfaces, shadows, borders, icon treatments, and layout rules.
- Color passes because the palette is light-neutral dominant with teal/purple/blue accents reserved for specific UI roles.
- Typography passes because it removes the dark serif dashboard direction and defines fixed Geist roles with no viewport scaling.
- Spacing passes because all scale tokens are multiples of 4 and fixed-format controls have stable dimensions.
- Registry safety passes because no new registry or third-party UI dependency is introduced.
