---
phase: 04
slug: reference-visual-foundation
status: approved
shadcn_initialized: true
preset: radix-nova
created: 2026-05-01
---

# Phase 04 - UI Design Contract

> Visual and interaction contract for Phase 4: Reference Visual Foundation.
> Source reference: `references/Captura de Tela 2026-05-01 às 19.22.35.png`.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn |
| Preset | radix-nova |
| Component library | radix-ui consolidated package plus existing `@radix-ui/*` packages |
| Icon library | lucide-react |
| Display font | Cormorant Garamond, fallback Georgia, serif |
| Body font | Geist, fallback Inter, Arial, sans-serif |
| Reference style | Premium dark CRE product UI, muted contrast, large serif display type, subtle borders, pill controls |

Phase 4 owns the global visual foundation only. It must not redesign product flows or add product capabilities. Later phases apply this foundation to specific app surfaces.

---

## Reference Interpretation

| Reference Choice | Contract |
|------------------|----------|
| Background | Do not recreate the reference network/grid/dot background. Use clean dark surfaces only. |
| Brand voice | RealTools should read as premium, quiet, and CRE-specific, not playful, neon, or generic SaaS. |
| Typography | Serif display/brand typography for logo, hero/display headings, and major page titles; muted sans-serif for navigation, labels, forms, and operational text. |
| Navigation | Muted gray navigation labels with restrained hover/active states. Active states use border/surface contrast, not bright fills. |
| Buttons | Pill-shaped primary CTAs with dark translucent fill, light text, subtle border, and faint inset/highlight shadow. Secondary actions stay subdued. |
| Surfaces | Dark navy/charcoal panels with low-contrast borders. Avoid bright white cards and avoid nested card-on-card layouts. |
| Spacing | Generous page-level spacing, compact controls, predictable 4px scale. Dense operational screens stay scan-friendly. |

---

## Spacing Scale

Declared values (all multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, inline metadata gaps, badge inner gaps |
| sm | 8px | Compact control gaps, small list gaps |
| md | 16px | Default component gap, form field stack gap |
| lg | 24px | Card/panel padding, modal inner spacing |
| xl | 32px | Page section gap, dashboard grid gap |
| 2xl | 48px | Major vertical spacing, auth/landing content spacing |
| 3xl | 64px | Desktop page header separation and top-level layout spacing |

Exceptions:
- Icon-only buttons may use 32px, 36px, or 40px square sizes.
- Touch targets must be at least 44px high on mobile navigation and primary row actions.
- Dialog max-widths may use fixed values (`32rem`, `40rem`, `48rem`) where content requires stable wrapping.

---

## Typography

| Role | Size | Weight | Line Height | Font |
|------|------|--------|-------------|------|
| Body | 15px | 400 | 1.55 | Geist |
| Small body | 13px | 400 | 1.45 | Geist |
| Label | 12px | 600 | 1.2 | Geist |
| Navigation | 15px | 600 | 1.2 | Geist |
| Card title | 18px | 500 | 1.2 | Cormorant Garamond |
| Page heading | 40px desktop, 32px mobile | 500 | 1.05 | Cormorant Garamond |
| Display | 88px desktop, 56px tablet, 42px mobile | 500 | 0.95 | Cormorant Garamond |
| Numeric/stat | 28px | 500 | 1.05 | Cormorant Garamond |

Rules:
- Do not scale font size with viewport width. Use breakpoint-specific sizes.
- Letter spacing must be `0` for body, headings, and display text.
- Uppercase eyebrow text may use `letter-spacing: 0.18em` only for short labels such as section headings.
- Body text color must default to muted gray, not pure white.
- Pure white is reserved for top-level display headings and primary CTA text.

---

## Color

Use hex values in CSS variables so Tailwind and shadcn tokens remain inspectable.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#090d17` | App background and page canvas |
| Dominant raised | `#0d1320` | Sidebar, auth shell, public surfaces |
| Secondary (30%) | `#111827` | Cards, dialogs, table containers, form surfaces |
| Secondary raised | `#171c2a` | Hover surfaces, selected nav, elevated controls |
| Border | `#2b3040` | Cards, inputs, buttons, dialogs, separators |
| Border strong | `#5f6575` | Primary CTA/button borders and active rings |
| Foreground | `#f7f5ef` | Major headings and primary CTA text |
| Muted foreground | `#9ba0b2` | Body copy, nav, metadata |
| Subtle foreground | `#6f7485` | Placeholders, disabled copy, quiet helper text |
| Accent (10%) | `#d7d1c4` | Focus rings, selected nav text, premium highlight lines |
| Destructive | `#ef6f6c` | Destructive actions and validation errors only |
| Success | `#7fbf9f` | Positive status badges only |
| Warning | `#d8b86a` | Warning status badges only |

Accent reserved for:
- Focus-visible rings.
- Active navigation label/border.
- Primary CTA border highlight.
- Small premium divider/highlight details.

Accent must not be used as a broad background fill across cards or pages.

---

## Component Contracts

### Global CSS And Fonts

- `app/layout.tsx` must load a serif display font and expose it as `--font-display`.
- `app/globals.css` must map `--font-heading` to `--font-display`.
- Root app remains dark by default via the existing `dark` class.
- `body` background must use `--background: #090d17`.
- No global pseudo-element may recreate the screenshot's network/dot background.

### Buttons

Primary/default button:
- Height: `44px` for default, `48px` for large CTA.
- Border radius: `999px`.
- Background: `#171c2a`.
- Text: `#f7f5ef`.
- Border: `1px solid #5f6575`.
- Shadow: subtle inset/highlight only, no bright glow.
- Hover: background `#1d2332`, border `#858a99`.

Secondary/outline button:
- Transparent or `#111827`.
- Text `#d7d1c4`.
- Border `#2b3040`.
- Hover background `#171c2a`.

Destructive button:
- Muted destructive text/border by default.
- Avoid solid red fills unless confirming irreversible deletion.

### Cards And Panels

- Radius: `16px` for primary panels and cards.
- Border: `1px solid #2b3040`.
- Background: `#111827`.
- Padding: `24px` desktop, `16px` mobile.
- Nested cards are disallowed except for repeated item rows inside a list/table where the parent is not visually carded.
- Footer bands should be subtle and must not create a second card inside the card.

### Inputs, Textareas, Selects, Checkbox

- Height: `44px` default for inputs/select triggers.
- Radius: `14px`.
- Background: `#0d1320`.
- Border: `#2b3040`; focus border `#d7d1c4`.
- Placeholder: `#6f7485`.
- Label: 12px, uppercase optional only for section labels; normal form labels stay sentence case.
- Checkbox checked state uses accent border/fill with dark check contrast.

### Badges And Tags

- Radius: `999px`.
- Font: 12px, 600.
- Backgrounds are tinted dark surfaces, not saturated pills.
- Status color must come from success/warning/destructive semantic tokens.
- Buyer tags use neutral muted styling unless explicitly selected.

### Dialogs And Alert Dialogs

- Overlay: `rgba(2, 4, 10, 0.72)`.
- Content background: `#111827`.
- Border: `#2b3040`.
- Radius: `20px`.
- Title font: Cormorant Garamond, 28px desktop, 24px mobile.
- Footer buttons align right on desktop and stack full-width on mobile.

### Toasts

- Background: `#111827`.
- Border: `#2b3040`.
- Text: `#f7f5ef`.
- Description: `#9ba0b2`.
- Success/error states use semantic borders instead of saturated fills.

---

## Layout Contracts

| Surface | Contract |
|---------|----------|
| App shell | Sidebar remains operational and compact; style it as a premium dark rail with serif brand mark and muted nav labels. |
| Page canvas | Use full-width dark page canvas; do not place the whole page inside a floating card. |
| Page headers | Use serif page headings with concise muted supporting copy and right-aligned command buttons on desktop. |
| Tables | Dark table container with subtle dividers; rows use hover surface, not heavy borders. |
| Forms | Labels above controls, 16px vertical field gaps, clear inline error text. |
| Empty states | Unframed or single-panel empty states with one clear action. |
| Mobile | Navigation and primary actions must preserve 44px touch targets; no horizontal overflow. |

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | `New Deal` for dashboard creation, `Save Changes` for edits, `Send OM` for email sending |
| Empty dashboard heading | `No deals yet` |
| Empty dashboard body | `Create a deal to start building the workspace, OM, buyers, and activity history in one place.` |
| Empty buyers heading | `No buyers yet` |
| Empty buyers body | `Add buyers once, then select them when sending an OM for a deal.` |
| Error state | `Something went wrong. Check the details and try again.` |
| Destructive confirmation | `Delete {item}: This cannot be undone.` |

Copy rules:
- Do not add in-app explanations of the visual refactor, style choices, keyboard shortcuts, or how the UI was designed.
- Keep operational copy direct and broker-specific.
- Avoid marketing-heavy language inside authenticated app pages.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | Existing local primitives only: button, card, input, textarea, select, checkbox, badge, dialog, alert-dialog, separator, label, form, sonner, tag-input | No new registry block required |
| Third-party registries | none | Any future third-party registry block requires preview, diff review, and explicit approval before use |

No new UI dependency is required for Phase 4. Use existing Tailwind v4, shadcn/radix-nova, radix-ui, and lucide-react.

---

## Verification Contract

Phase 4 implementation must verify:

1. `app/globals.css` contains `--background: #090d17`, `--card: #111827`, `--border: #2b3040`, `--font-heading: var(--font-display)`.
2. `app/layout.tsx` exposes `--font-display` from a serif Google font.
3. `components/ui/button.tsx` default and large buttons use pill radius (`rounded-full` or equivalent) and 44px/48px heights.
4. `components/ui/card.tsx`, `components/ui/input.tsx`, `components/ui/dialog.tsx`, `components/ui/badge.tsx`, and related primitives use the dark token system rather than hard-coded light surfaces.
5. No file added or modified in Phase 4 contains decorative network-background classes or canvas logic intended to copy the reference background.
6. `npm run lint` exits successfully.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-05-01
