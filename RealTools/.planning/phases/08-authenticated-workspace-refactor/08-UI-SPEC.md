---
phase: 8
slug: authenticated-workspace-refactor
status: approved
shadcn_initialized: true
preset: radix-nova
created: 2026-05-02
approved: 2026-05-02
---

# Phase 8 - UI Design Contract

> Visual and interaction contract for the authenticated RealTools workspace. Phase 8 applies the approved Phase 7 light dashboard foundation to app shell, dashboard, Deal Hub, buyers, profile, forms, dialogs, notes, files, send-OM, and activity surfaces while preserving all shipped broker workflows.

---

## Source Of Truth

Phase 8 inherits the Phase 7 UI contract as locked visual foundation:

- `app/globals.css` light tokens are the default visual system.
- `app/layout.tsx` uses Geist as the operational UI font and does not apply the `dark` class by default.
- Shared primitives in `components/ui/*` are the baseline for controls, cards, dialogs, badges, forms, and feedback.
- The attached Nexus dashboard screenshot remains a style reference only. Do not copy Nexus brand, content, metrics, avatars, chart labels, or product concepts.

Phase 8 scope is authenticated product UI:

- `app/(app)/layout.tsx`
- `components/sidebar.tsx`
- `components/sidebar-nav.tsx`
- `components/logout-button.tsx`
- `app/(app)/dashboard/page.tsx`
- `components/deals/deal-card.tsx`
- `app/(app)/deals/[id]/page.tsx`
- `components/deals/deal-form-modal.tsx`
- `components/deals/delete-deal-dialog.tsx`
- `components/deals/send-om-modal.tsx`
- `app/(app)/buyers/page.tsx`
- `components/buyers/buyers-table.tsx`
- `components/buyers/buyer-form-modal.tsx`
- `components/buyers/delete-buyer-dialog.tsx`
- `app/(app)/profile/page.tsx`
- `components/notes/notes-section.tsx`
- `components/notes/note-item.tsx`
- `components/files/files-section.tsx`
- `components/deals/activity-log-section.tsx`

Out of scope:

- Login, signup, root, and public OM pages. Phase 9 handles unauthenticated/public surfaces.
- New analytics, charts, revenue metrics, team features, billing, pipelines, or fake dashboard data.
- Supabase schema, auth, storage, Resend, tracking, or server action behavior changes.
- Renaming RealTools or changing product copy into Nexus-style content.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn |
| Preset | radix-nova |
| Component library | consolidated `radix-ui` package through existing local shadcn components |
| Icon library | lucide |
| Font | Geist for all authenticated workspace UI |
| Theme | Light by default |
| Layout model | Fixed desktop sidebar plus scrollable content canvas; mobile may stack or collapse only where needed to prevent overflow |

Implementation rules:

- Use existing local UI primitives before adding new components.
- Use lucide icons for nav, toolbar, empty state, row, and action affordances.
- Replace `font-heading` on authenticated product surfaces with Geist font utility classes.
- Use exact light foundation colors from Phase 7 unless a surface-specific token is listed below.
- Do not introduce a chart library or UI library in this phase.

---

## Workspace Layout

### Authenticated Shell

Target composition:

- Outer shell: `min-h-screen bg-background text-foreground`.
- Desktop sidebar: `w-60 shrink-0 border-r border-sidebar-border bg-sidebar`.
- Main area: `flex min-h-screen flex-1 flex-col`.
- Topbar: `h-16 border-b border-border bg-card/80 px-6 backdrop-blur`.
- Content canvas: `flex-1 overflow-y-auto px-6 py-6 lg:px-8 lg:py-8`.
- Maximum content width: do not globally cap app content at `max-w-3xl`; Deal Hub may use `max-w-7xl` with responsive columns.

Topbar contract:

- Contains current workspace context, search/filter affordance if already supported, and profile/logout affordance.
- Search-looking UI must not imply unsupported global search. If no search behavior exists, use a non-search breadcrumb/title area instead.
- Topbar actions use `Button` variants and lucide icons with accessible labels.

Sidebar contract:

- Logo area: RealTools wordmark text, `text-lg font-semibold`, no large hero branding.
- Section labels: optional uppercase `text-[11px] font-medium text-muted-foreground`.
- Nav items: `h-11 rounded-lg px-3 text-sm font-medium`.
- Nav icons: active state uses a `size-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground` icon chip; inactive icons use `text-muted-foreground`.
- Active row: `bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border shadow-[0_8px_18px_rgba(35,45,72,0.04)]`.
- Inactive hover: `hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`.
- Logout area: low-contrast row/button at bottom, not a destructive red default.

Responsive shell:

- At viewport widths below `768px`, no horizontal page overflow is allowed.
- Sidebar can become a top compact nav or remain a narrow stacked rail if implementation is simpler, but all nav labels/actions must remain reachable.
- Content padding target: `16px` mobile, `24px` tablet, `32px` desktop.

---

## Spacing Scale

All values must remain multiples of 4.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon-to-label gaps, badge inner gaps, compact metadata separators |
| sm | 8px | Nav item gaps, row inner gaps, badge padding, toolbar button gaps |
| md | 16px | Default form groups, row padding, compact card padding |
| lg | 24px | Dashboard card padding, page section gaps, Deal Hub column gaps |
| xl | 32px | Desktop page gutters, major grid gaps |
| 2xl | 48px | Empty-state vertical padding and major page breaks |

Surface-specific constraints:

- Dashboard grid gap: `16px` mobile, `24px` desktop.
- Card padding: `16px` compact cards, `24px` primary panels.
- Row height target: `48px` for tables/lists, `44px` minimum for compact action rows.
- Dialog inner spacing: `24px` body, `16px` footer gap.
- Avoid `p-8` inside pages that already sit inside the app layout padding.
- Do not nest visual cards inside visual cards. Use rows, sections, separators, or unframed grids inside a card instead.

---

## Typography

Use Geist throughout authenticated workspace pages.

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px | 400 | 1.55 |
| Metadata | 12px | 400 | 1.4 |
| Label | 12px | 500 | 1.35 |
| Nav item | 14px | 500 | 1.35 |
| Card title | 15px | 500 | 1.35 |
| Section heading | 18px | 600 | 1.25 |
| Page heading | 24px | 600 | 1.2 |
| Deal title | 28px max desktop, 22px mobile | 600 | 1.15 |

Rules:

- Remove `font-heading` from authenticated app shell, dashboard, Deal Hub, buyer, profile, modal, note, file, and activity surfaces.
- Do not use serif display headings in operational workspace UI.
- Letter spacing is `0` except uppercase labels may use `tracking-wide`.
- No viewport-scaled font sizes.
- Primary text uses `text-foreground`.
- Secondary text uses `text-muted-foreground`.
- Avoid pure black and avoid heavy all-caps labels outside compact metadata headings.

---

## Color

Phase 8 uses the Phase 7 root variables as canonical values.

| Role | Value | Usage |
|------|-------|-------|
| App background | `#F7F8FB` | Main authenticated canvas |
| Surface | `#FFFFFF` | Cards, dialogs, rows, tables, toolbars |
| Secondary surface | `#FBFCFE` | Sidebar, topbar, subtle section fills |
| Border | `#E7EAF0` | Card borders, row separators, inputs |
| Muted fill | `#F0F3F7` | Empty state icon chips, table header, hover rows |
| Foreground | `#4B5363` | Primary text |
| Muted foreground | `#9AA3B2` | Metadata, placeholders, helper text |
| Purple accent | `#8B7AE6` | Primary action, active nav icon chip, selected states |
| Teal accent | `#55D6CF` | Active/positive deal state, send/read signals, secondary accents |
| Blue accent | `#7DB4F5` | File/info indicators |
| Destructive | `#E45B6A` | Delete actions and validation errors only |

Status styling:

- Active deal: `bg-[#e7faf8] text-[#249c96] border-[#bfeeea]`.
- Negotiating deal: `bg-[#f0eeff] text-[#6759c7] border-[#ddd7ff]`.
- Closed deal: `bg-[#f3f5f9] text-[#6b7280] border-[#e7eaf0]`.
- Sent OM: `bg-[#eaf3ff] text-[#497db7] border-[#cfe4ff]`.
- Destructive badges/actions: `bg-[#fdecef] text-[#b93445] border-[#f6c7ce]`.

Forbidden authenticated workspace colors/patterns:

- Dark badge fills such as `green-950`, `yellow-950`, `#090d17`, `#111827`, `#0d1320`, or similar default dark UI remnants.
- `bg-accent text-background` for primary actions. Use `Button` default primary or explicit purple token pairing.
- Large purple/blue gradients, decorative orbs, bokeh, or full-page decorative backgrounds.
- A palette dominated by one accent hue.

---

## Component Contracts

### Dashboard

The dashboard remains a deal-management workspace, not an analytics product.

Required dashboard structure:

- Page header: title `Deals`, muted one-line summary, primary `New Deal` action.
- Summary strip: compact cards derived only from existing deal data, such as total deals, active deals, negotiating deals, closed deals. Do not add revenue/page view/bounce metrics.
- Deal grid/list: cards with white surface, 8px radius, soft shadow, status badge, address, price, and clear `Open deal` affordance.
- Empty state: single white panel with pale icon chip, heading `No deals yet.`, existing helper copy, and existing create deal action.

Deal card contract:

- Card: `rounded-lg border-border bg-card shadow-[0_12px_30px_rgba(35,45,72,0.05)]`.
- Header: title `text-[15px] font-medium text-foreground`, status badge on the right.
- Metadata rows use lucide icons only when helpful and `text-sm text-muted-foreground`.
- Hover: `hover:border-[#d9ddf7] hover:shadow-[0_16px_36px_rgba(35,45,72,0.07)]`.
- Replace `View Deal ->` with an icon/text affordance using a lucide arrow or an accessible text link; do not use raw arrow glyphs as the only icon.

### Deal Hub

Required Deal Hub layout:

- Back navigation is a muted icon/text button or link above the page header.
- Header band uses a white surface with title, status, address/price metadata, and primary actions in a compact toolbar.
- Actions remain: Send OM, Edit, Delete.
- Desktop content uses a responsive 12-column grid:
  - Main column: deal details, notes, files.
  - Side column: buyers/send status and activity.
- Mobile stacks sections in the order: header, deal details, notes, files, buyers/send status, activity.

Deal detail panel:

- Use compact metadata cells instead of large text blocks.
- Labels: `text-xs font-medium uppercase tracking-wide text-muted-foreground`.
- Values: `text-sm text-foreground`.
- Description uses readable `text-sm leading-6`.

Section panels:

- Notes, files, buyers/send status, and activity each live in a white panel with `rounded-lg border border-border bg-card`.
- Section header: icon chip `size-9 rounded-lg bg-muted text-muted-foreground`, `text-[15px] font-medium`.
- Section action buttons use `variant="outline"` or `variant="ghost"` unless they perform the primary workflow.

### Buyers

Buyers page contract:

- No nested `p-8` page padding inside app layout.
- Header: `Buyers`, helper copy, `Add Buyer` action when appropriate.
- Buyers table is a white panel with rounded 8px border and low-contrast header row.
- Table header: `bg-[#fbfcfe]`, `text-[11px] uppercase tracking-wide text-muted-foreground`.
- Rows: `min-h-12`, `hover:bg-[#f8fafc]`, dividers `border-border/70`.
- Mobile: rows may become stacked cards with name/email first and tags/actions below; no horizontal overflow.

Tags:

- Tag pills use `bg-[#f3f5f9] text-[#6b7280] border-[#e7eaf0]`.
- Buyer tag overflow uses `+N more` text in `text-xs text-muted-foreground`.
- Do not use saturated tag colors.

### Notes

Notes section contract:

- Add-note control is an outline or ghost icon/text button in the section header.
- Inline note form uses existing `Textarea`, `Button`, and validation behavior.
- Note rows use white or `#FBFCFE` surface, border `#E7EAF0`, and `rounded-lg`.
- Note metadata uses `text-xs text-muted-foreground`.
- Empty note state uses a compact muted message inside the panel, not a standalone page-level empty state.

### Files

Files section contract:

- Upload affordance remains a label/input pattern if needed, but the visible control must match `Button` outline/ghost styling.
- File row uses lucide `FileText` in a pale blue icon chip: `bg-[#eaf3ff] text-[#497db7]`.
- Row: white or `#FBFCFE`, `min-h-12`, `rounded-lg`, `border border-border/70`.
- Download action uses icon/text with `text-muted-foreground hover:text-foreground`.
- Delete action remains icon-only with accessible label and destructive hover color.

### Activity

Activity log contract:

- Activity rows are timeline-like rows with an icon chip for event category.
- Event types:
  - `om_sent`: teal send/mail icon chip.
  - `om_opened`: blue eye icon chip.
  - `note_added`: purple note icon chip.
  - `file_uploaded`: blue file icon chip.
  - fallback: muted icon chip.
- Timestamp remains right-aligned on desktop and wraps below description on mobile.
- Empty state: compact muted message inside the section panel.

### Forms And Dialogs

Forms/dialogs in scope:

- Deal create/edit.
- Deal delete.
- Buyer create/edit.
- Buyer delete.
- Send OM.
- Note add.
- File delete.

Rules:

- Preserve form fields, validation messages, server actions, hidden inputs, action state, toast behavior, and submit disable logic.
- Dialog titles use Geist `text-xl font-semibold`.
- Dialog body text uses `text-sm text-muted-foreground`.
- Form labels use `text-sm font-medium text-foreground`.
- Error text uses `text-sm text-destructive`.
- Button order remains cancel/secondary before submit/destructive where existing behavior expects it.
- Destructive confirmation buttons use the destructive variant or `bg-destructive text-white`; avoid dark custom fills.
- Send OM buyer list uses white rows, checked purple checkbox state, sent badge blue/neutral, and selected count in submit copy exactly as existing behavior provides.

---

## Copywriting Contract

Preserve existing product meaning and avoid visible text that describes the visual refactor.

| Element | Copy |
|---------|------|
| Dashboard primary CTA | `New Deal` or existing `Create Deal` trigger text from `DealFormModal` |
| Dashboard empty heading | `No deals yet.` |
| Dashboard empty body | `Create a deal to start building the workspace, OM, buyers, and activity history in one place.` |
| Buyers empty heading | `No buyers yet.` |
| Buyers empty body | `Add your first buyer to get started.` |
| Notes empty state | `No notes yet.` |
| Files empty state | `No files uploaded yet.` |
| Activity empty state | `No activity yet.` |
| Send OM empty state | `No buyers available.` |
| File size error | `File too large. Maximum 50MB.` |
| File upload error | `Failed to upload file.` |
| File record error | `File uploaded but record failed. Please refresh.` |
| Delete file confirmation | `Delete File?` / `This file will be permanently deleted from storage.` |

Copy rules:

- Do not add in-app explanation of the Nexus reference, visual style, keyboard shortcuts, implementation details, or design system.
- Do not invent unsupported analytics labels.
- Keep broker workflow nouns: deal, buyer, OM, note, file, activity.

---

## Interaction And State Contract

Preserve behavior:

- Authenticated routes still require `supabase.auth.getUser()` and redirect unauthenticated users to `/auth/login`.
- Dashboard loads only the current user's deals.
- Deal Hub fetches deal, notes, files, buyers, deal buyers, and activities without changing data filters.
- Signed file URLs remain server-generated with existing expiry behavior.
- Note, file, buyer, deal, delete, and send-OM actions keep their current server action contracts.
- Toast success/error behavior remains intact.

Required states:

- Loading/pending actions show existing `Loader2` spinner patterns, and submit buttons retain their label or spinner without changing height.
- Disabled buttons retain readable text and do not collapse.
- Empty states use pale icon chips or compact messages, with no layout jump when data appears.
- Hover/focus states use Phase 7 focus rings and muted hover fills.
- Mobile layouts do not clip long deal titles, addresses, emails, file names, buyer tags, or submit button text.

Accessibility:

- Icon-only actions must keep `aria-label`.
- Labels remain connected to inputs where currently implemented.
- Dialogs continue using Radix/shadcn dialog primitives.
- Color is not the only status signal; status text remains visible in badges.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| local shadcn components | `Button`, `Card`, `Badge`, `Dialog`, `AlertDialog`, `Input`, `Textarea`, `Select`, `Checkbox`, `Label`, `TagInput`, `Sonner`, `Separator` | existing local primitives only |
| lucide-react | sidebar, toolbar, rows, activity icons | use package already installed |
| third-party UI registries | none | not allowed in Phase 8 |
| chart libraries | none | not allowed in Phase 8 |

---

## Verification Contract

Visual/code checks required during Phase 8 execution:

- `rg "font-heading" 'app/(app)' components/deals components/buyers components/notes components/files components/sidebar.tsx components/sidebar-nav.tsx` returns no matches.
- `rg "green-950|yellow-950|bg-accent text-background|rounded-xl" 'app/(app)' components/deals components/buyers components/notes components/files components/sidebar.tsx components/sidebar-nav.tsx` returns no matches unless a justified dialog/content exception is documented.
- `npm run lint` passes.
- `npm run build` passes or only emits the known multi-lockfile workspace-root warning.
- Desktop authenticated pages show no accidental dark-theme remnants.
- Mobile authenticated pages show no horizontal overflow or clipped primary controls.

Manual/browser checks required before Phase 8 completion:

- Dashboard with zero deals and with at least one deal.
- Deal Hub with notes, files, buyers, sent OM state, and activity events.
- Buyers page with zero buyers, many buyers, long email, and multiple tags.
- Create/edit/delete deal dialogs.
- Create/edit/delete buyer dialogs.
- Add note form.
- Upload/download/delete file controls.
- Send OM modal with no buyers, unselected buyers, selected buyers, and already-sent buyers.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-05-02
