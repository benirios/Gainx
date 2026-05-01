---
phase: 05-product-app-surface-refactor
plan: "01"
status: complete
---
# Plan 01 Summary — Shell/Dashboard Refactor

## Files Changed

### `app/(app)/layout.tsx`
- Replaced `bg-zinc-950`/`bg-zinc-900`/`text-zinc-50` with CSS token equivalents `bg-background`/`text-foreground`

### `components/sidebar.tsx`
- Replaced `bg-zinc-950`, `border-zinc-800`, `text-zinc-50` with sidebar tokens: `bg-sidebar`, `border-sidebar-border`, `text-sidebar-foreground`

### `components/sidebar-nav.tsx`
- D-01: active pill updated to `bg-muted border border-border text-foreground`
- Base nav: `text-muted-foreground hover:text-foreground hover:bg-muted`
- Font size reduced to `text-sm` for compact rail feel
- Preserved pathname-based active matching logic unchanged

### `app/(app)/dashboard/page.tsx`
- D-02: page title uses `font-heading text-[28px] font-semibold` (Cormorant Garamond)
- D-04: empty state updated — `text-muted-foreground`, `text-sm`, `max-w-sm`, and new copy: "Create a deal to start building the workspace, OM, buyers, and activity history in one place."
- All data fetching, auth gate, and action handlers preserved

### `components/deals/deal-card.tsx`
- D-03: card title uses `font-heading text-lg font-semibold`; price elevated to `text-foreground font-medium`; spacing made roomy with adjusted padding
- D-13: status badges use subtle semantic tints — `bg-green-950/60 text-green-300 border-green-800/40`, `bg-yellow-950/60 text-yellow-300 border-yellow-800/40`, muted tokens for closed
- Card background/border uses CSS tokens (`bg-card border-border`)
- "View Deal" label styled `text-xs uppercase tracking-wide` for premium feel
- All deal links, status logic, and component props preserved
