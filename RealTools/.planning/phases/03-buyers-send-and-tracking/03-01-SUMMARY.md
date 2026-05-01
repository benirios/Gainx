---
phase: "03-buyers-send-and-tracking"
plan: "01"
subsystem: "buyers-crm"
tags: ["crud", "server-actions", "zod", "supabase", "dark-ui", "chip-input"]
dependency_graph:
  requires: ["03-00"]
  provides: ["buyers-crm-ui", "buyer-actions", "tag-input-component"]
  affects: ["app/(app)/buyers/page.tsx", "components/buyers/", "components/ui/tag-input.tsx"]
tech_stack:
  added: []
  patterns:
    - "useActionState + prevPending success detection (mirroring DealFormModal)"
    - "Zod schema in separate non-use-server file (lib/schemas/buyer.ts)"
    - "supabase.from() as any cast for supabase-js 2.104.x inference"
    - "JSON-serialized hidden input for array form values (tags)"
    - "TagInput chip component with keyboard add (Enter/comma) and × remove"
key_files:
  created:
    - lib/schemas/buyer.ts
    - lib/actions/buyer-actions.ts
    - components/ui/tag-input.tsx
    - components/buyers/buyer-form-modal.tsx
    - components/buyers/delete-buyer-dialog.tsx
    - components/buyers/buyers-table.tsx
  modified:
    - app/(app)/buyers/page.tsx
decisions:
  - "BuyersTable renders New Buyer button in header only when buyers list is non-empty; empty state has its own CTA"
  - "Tags max 3 visible in table cells (v1 truncation, no '+N more')"
  - "TagInput adds tag on blur with non-empty value (prevents accidental loss when tabbing away)"
metrics:
  duration: "~20 minutes"
  completed_date: "2026-05-01"
  tasks_completed: 3
  tasks_total: 3
  files_created: 6
  files_modified: 1
---

# Phase 03 Plan 01: Buyers CRM CRUD Summary

**One-liner:** Buyers CRM with Zod-validated server actions, TagInput chip component, modal create/edit, and delete confirmation wired to a full-table /buyers route.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Buyer schema + server actions | 67b2da0 | lib/schemas/buyer.ts, lib/actions/buyer-actions.ts |
| 2 | TagInput, BuyerFormModal, DeleteBuyerDialog | 714ed59 | components/ui/tag-input.tsx, components/buyers/buyer-form-modal.tsx, components/buyers/delete-buyer-dialog.tsx |
| 3 | BuyersTable + /buyers page | d9e42e4 | components/buyers/buyers-table.tsx, app/(app)/buyers/page.tsx |

## What Was Built

**lib/schemas/buyer.ts** — BuyerSchema (name min-1, email valid, tags array default-[]) and BuyerState type mirroring DealState pattern.

**lib/actions/buyer-actions.ts** — createBuyerAction/updateBuyerAction/deleteBuyerAction all guarded by getUser() redirect, user_id-scoped DB queries (RLS-safe per T-03-02/T-03-03), Zod validation before DB writes (T-03-01), tags parsed from JSON hidden input per D-11. All mutations revalidate `/buyers`.

**components/ui/tag-input.tsx** — Client chip/pill component. Enter or comma commits tag, × removes, backspace removes last tag when input is empty, duplicates silently ignored, blur commits non-empty input. Serializes to hidden JSON input for server action.

**components/buyers/buyer-form-modal.tsx** — useActionState + prevPending success detection pattern (mirrors DealFormModal). Create/edit modes, TagInput integration, full dark theme styling per UI-SPEC.

**components/buyers/delete-buyer-dialog.tsx** — AlertDialog with "Delete Buyer?" / "This buyer will be permanently deleted." / Keep / Delete buttons, pending state, toast feedback per copywriting contract.

**components/buyers/buyers-table.tsx** — Client component. Table columns: Name/Email/Tags/Actions. Badge tags (max 3 visible). Row actions: Pencil edit trigger for BuyerFormModal + DeleteBuyerDialog. Empty state: "No buyers yet." + "Add your first buyer to get started." centered with CTA. min-h-[44px] rows.

**app/(app)/buyers/page.tsx** — Authenticated server component. getUser() redirect guard. User-scoped buyers query (ordered by name). Passes buyers to BuyersTable. New Buyer header button only shown when list is non-empty (empty state has its own CTA to avoid duplicate buttons).

## Deviations from Plan

**1. [Rule 2 - Missing critical functionality] TagInput adds on blur**
- **Found during:** Task 2 implementation
- **Issue:** User could type a tag and tab away without pressing Enter, silently losing the value
- **Fix:** Added `onBlur` handler that commits non-empty inputValue as a tag
- **Files modified:** components/ui/tag-input.tsx
- **Commit:** 714ed59

**2. [Rule 2 - Missing critical functionality] New Buyer button conditioned on buyer count**
- **Found during:** Task 3 implementation
- **Issue:** UI-SPEC shows page header always has New Buyer button, but empty state also has one — rendering both simultaneously creates redundant CTAs
- **Fix:** Header button only shown when buyers.length > 0; empty state always shows its own New Buyer button
- **Files modified:** app/(app)/buyers/page.tsx
- **Commit:** d9e42e4

## Known Stubs

None — all data is fetched from the database and rendered dynamically.

## Threat Flags

None — no new network endpoints or auth paths introduced beyond what the plan documented.

## Self-Check: PASSED

Files verified:
- lib/schemas/buyer.ts — FOUND
- lib/actions/buyer-actions.ts — FOUND
- components/ui/tag-input.tsx — FOUND
- components/buyers/buyer-form-modal.tsx — FOUND
- components/buyers/delete-buyer-dialog.tsx — FOUND
- components/buyers/buyers-table.tsx — FOUND
- app/(app)/buyers/page.tsx — FOUND (modified)

Commits verified:
- 67b2da0 — FOUND (feat(03-01): add buyer schema and CRUD server actions)
- 714ed59 — FOUND (feat(03-01): add TagInput chip component, BuyerFormModal, DeleteBuyerDialog)
- d9e42e4 — FOUND (feat(03-01): replace buyers placeholder with full table CRUD route)
