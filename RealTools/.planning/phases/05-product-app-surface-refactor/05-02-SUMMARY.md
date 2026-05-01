---
phase: 05-product-app-surface-refactor
plan: "02"
status: complete
---
# Plan 02 Summary — Deal Hub Surface Refactor

## Changes by file

### `app/(app)/deals/[id]/page.tsx`
- Back link: `text-zinc-400/zinc-50` → `text-muted-foreground/foreground`
- Page title: `text-xl font-semibold text-zinc-50` → `font-heading text-[28px] font-semibold text-foreground` (D-06)
- Header layout: added `items-start` + `gap-4` + `shrink-0` on controls group to handle long titles
- Edit button: `border-zinc-700 text-zinc-50 hover:bg-zinc-800` → `border-border text-foreground hover:bg-muted size="sm"` (D-06 secondary)
- Metadata card: `bg-zinc-900 border-zinc-800` → `bg-card border-border` (D-07)
- Metadata labels: `text-sm text-zinc-400` → `text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1` (D-07)
- Metadata values: `text-zinc-50` → `text-foreground` (D-07)

### `components/notes/notes-section.tsx`
- Section heading: `text-base font-semibold text-zinc-50` → `font-heading text-[20px] font-semibold text-foreground` (D-08)
- Add Note button: `text-zinc-400 hover:text-zinc-50` → `text-muted-foreground hover:text-foreground`
- Textarea: `bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500` → `bg-muted border-border text-foreground placeholder:text-muted-foreground`
- Error text: `text-red-500` → `text-destructive`
- Discard button: zinc → muted-foreground/foreground tokens
- Save button: `bg-white text-zinc-950 hover:bg-zinc-100` → `bg-accent text-accent-foreground hover:bg-accent/90`
- Empty state: `text-zinc-400` → `text-muted-foreground`

### `components/notes/note-item.tsx`
- Row background: `bg-zinc-800/50` → `bg-muted/50` with `hover:bg-muted/70 transition-colors` (D-10)
- Note content: `text-zinc-50` → `text-foreground`
- Timestamp: `text-sm text-zinc-400` → `text-xs text-muted-foreground`, changed `<span>` to `<time>` (D-15)
- Edit icon button: `text-zinc-400 hover:text-zinc-50` → `text-muted-foreground hover:text-foreground`
- Delete icon button: `hover:text-red-400` → `hover:text-destructive`
- Dialog: `bg-zinc-900 border-zinc-800 text-zinc-50` → `bg-card border-border text-foreground`
- Dialog description: `text-zinc-400` → `text-muted-foreground`
- Cancel button: zinc tokens → border-border/muted tokens
- Confirm button: `bg-red-500 hover:bg-red-600` → `bg-destructive hover:bg-destructive/90`
- Edit form: same zinc → token migrations as notes-section

### `components/files/files-section.tsx`
- Section heading: `text-base font-semibold text-zinc-50` → `font-heading text-[20px] font-semibold text-foreground` (D-08)
- Upload label: `text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800` → `text-muted-foreground hover:text-foreground hover:bg-muted`
- Empty state: `text-zinc-400` → `text-muted-foreground`
- File row: `bg-zinc-800/50` → `bg-muted/50` with `hover:bg-muted/70 transition-colors` (D-10)
- File icon: `text-zinc-400` → `text-muted-foreground`
- File name: `text-zinc-50` → `text-foreground`
- Download link: zinc → muted-foreground/foreground tokens; added `aria-label` (D-16)
- Delete button: `hover:text-red-400` → `hover:text-destructive`
- Dialog: zinc → card/border/muted token migration

### `components/deals/activity-log-section.tsx`
- Section heading: `text-base font-semibold text-zinc-50` → `font-heading text-[20px] font-semibold text-foreground` (D-08)
- Empty state: `text-zinc-400` → `text-muted-foreground`
- Activity row: `bg-zinc-800/50 items-start` → `bg-muted/50 items-center hover:bg-muted/70 transition-colors` (D-10, D-15)
- Event text: `text-base text-zinc-50` → `text-sm text-foreground`
- Timestamp: `text-sm text-zinc-400` → `text-xs text-muted-foreground` (D-15)
