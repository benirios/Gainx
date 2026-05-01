---
phase: 05-product-app-surface-refactor
plan: "03"
status: complete
---
# Plan 03 Summary — Deal Dialogs Refactor

## deal-form-modal.tsx
- Dialog content: `bg-card border-border text-foreground sm:max-w-md` (was zinc-900/zinc-800)
- Title: added `font-heading` class for Cormorant Garamond
- Description: `text-muted-foreground` (was text-zinc-400)
- All labels: `text-foreground/80` (was text-zinc-300)
- All inputs/textarea/select: `bg-muted border-border text-foreground placeholder:text-muted-foreground` + `disabled:opacity-50 disabled:cursor-not-allowed`
- SelectContent: `bg-card border-border text-foreground`
- Field errors: `text-destructive` (was text-red-500)
- Action footer: `flex flex-col-reverse sm:flex-row sm:justify-end gap-2` (D-12 mobile-safe stack)
- Cancel button: `text-muted-foreground hover:text-foreground`
- Submit button: `bg-accent text-background hover:bg-accent/90` (was hardcoded white/zinc-950)
- Trigger "New Deal" button: `bg-accent text-background hover:bg-accent/90`

## send-om-modal.tsx
- Dialog content: `bg-card border-border text-foreground sm:max-w-xl` (was zinc-900/zinc-800)
- Title: added `font-heading` class
- Description: `text-muted-foreground`
- Buyer list container: `divide-border border-border`
- Buyer row hover: `hover:bg-muted/60` (was hover:bg-zinc-800/60)
- Checkbox: `border-border data-[state=checked]:bg-accent data-[state=checked]:text-background disabled:opacity-50 disabled:cursor-not-allowed`
- Buyer name: `text-foreground`, buyer email: `text-muted-foreground`
- "Sent" badge: `bg-muted text-muted-foreground`
- "No buyers" empty state: `text-muted-foreground`
- All error paragraphs: `text-destructive`
- Action footer: `flex flex-col-reverse sm:flex-row sm:justify-end gap-2`
- Cancel: `text-muted-foreground hover:text-foreground`
- Submit: `bg-accent text-background hover:bg-accent/90`
- Trigger "Send OM" button: `bg-accent text-background hover:bg-accent/90`

## delete-deal-dialog.tsx
- AlertDialogContent: `bg-card border-border text-foreground` (was zinc-900/zinc-800)
- Title: added `font-heading text-xl font-semibold text-foreground`
- Description: `text-muted-foreground`; copy preserved including "This cannot be undone."
- Footer: `flex flex-col-reverse sm:flex-row sm:justify-end gap-2`
- Cancel: `border-border text-foreground hover:bg-muted`
- Delete action: subdued destructive style `bg-destructive/20 text-destructive border border-destructive/40 hover:bg-destructive/30 disabled:opacity-50 disabled:cursor-not-allowed` (was solid red-500)
- Trigger icon button: `hover:text-destructive` via CSS token (was hover:text-red-400)
- `aria-label="Delete deal"` preserved on trigger
