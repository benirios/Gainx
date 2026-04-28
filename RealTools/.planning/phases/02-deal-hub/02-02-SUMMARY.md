---
phase: 02-deal-hub
plan: "02"
subsystem: deal-hub-notes
tags: [server-actions, crud, notes, deal-hub, rls, zod, alert-dialog, useActionState]
dependency_graph:
  requires: ["02-01"]
  provides: ["note-crud-actions", "note-item", "notes-section", "deal-hub-page"]
  affects:
    - app/(app)/deals/[id]/page.tsx
    - lib/actions/note-actions.ts
    - components/notes/note-item.tsx
    - components/notes/notes-section.tsx
tech_stack:
  added: []
  patterns:
    - "supabase.from() as any cast + explicit Database type aliases for both read and write operations (same pattern as deal-actions.ts)"
    - "Promise.all parallel fetch in Server Component with per-query as-any cast and explicit typed Promise return annotation"
    - "useActionState + useRef prevPending success detection for inline-form exit on Server Action success"
    - "AlertDialog delete confirmation with useState deletePending for direct Server Action call (no useActionState needed for delete)"
key_files:
  created:
    - lib/actions/note-actions.ts
    - components/notes/note-item.tsx
    - components/notes/notes-section.tsx
    - app/(app)/deals/[id]/page.tsx
    - supabase/migrations/006_notes_content_column.sql
  modified:
    - types/supabase.ts
decisions:
  - "Renamed notes.body → notes.content and added updated_at via migration 006 to align actual DB schema with plan spec; updated types/supabase.ts manually since Docker/local Supabase not running"
  - "Applied supabase.from() as any cast on both deals and notes queries in DealHubPage (not just mutations) — the inference bug affects SELECT queries inside Promise.all due to tuple type resolution"
  - "DealRow and NoteRow type aliases declared at page level to preserve type safety on the cast results"
metrics:
  duration_minutes: 6
  completed_date: "2026-04-28"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 6
---

# Phase 02 Plan 02: Deal Hub Page + Notes CRUD Summary

**One-liner:** Deal Hub page (/deals/[id]) with parallel-fetched deal details and full Notes CRUD — inline add, inline edit with useActionState, and AlertDialog delete confirmation.

## Outcome

All deliverables for NOTE-01, NOTE-02, NOTE-03 are live:

- `lib/actions/note-actions.ts` — three Server Actions (`createNoteAction`, `updateNoteAction`, `deleteNoteAction`) all calling `getUser()`, validating with Zod, enforcing `.eq('user_id', user.id)` on mutations, and calling `revalidatePath('/deals/[dealId]')`
- `components/notes/note-item.tsx` — read/edit mode toggle with inline Textarea, `useActionState` + `useRef` pending-detection for clean exit on success, AlertDialog delete confirmation with "Keep" / "Delete" buttons, toast feedback for both edit and delete
- `components/notes/notes-section.tsx` — Add Note toggle revealing inline form, `createNoteAction` wired via `useActionState`, notes list rendering `NoteItem` instances, "No notes yet." empty state
- `app/(app)/deals/[id]/page.tsx` — Server Component with `Promise.all` parallel fetch for deal + notes, deal details card (address, price, description), StatusBadge, Edit (DealFormModal) + Delete (DeleteDealDialog) in header, NotesSection wired with props; Wave 3 files section placeholder comment left in place
- `supabase/migrations/006_notes_content_column.sql` — renames `notes.body` → `notes.content`, adds `notes.updated_at` column to align actual DB schema with plan
- `types/supabase.ts` — notes Row/Insert/Update types updated to reflect migration 006

Build and type-check both pass clean:
- `npm run build` exits 0 — `/deals/[id]` route compiles (44.8 kB)
- `npx tsc --noEmit` exits 0

## Decisions Made

1. **Schema migration 006** — The actual `notes` table had `body` (not `content`) and no `updated_at` column. Created `006_notes_content_column.sql` to rename and add the column; manually updated `types/supabase.ts` since local Supabase (Docker) is not running. The migration must be applied to the remote Supabase project.

2. **`as any` cast on SELECT queries too** — supabase-js 2.104.x inference bug affects not just mutations but also SELECT queries when they appear inside `Promise.all` tuple resolution. Both `supabase.from('deals')` and `supabase.from('notes')` needed `as any` + explicit `Promise<{ data: T | null; error: unknown }>` annotation to resolve correctly.

3. **`deleteNoteAction` as direct async call** — Delete uses `useState` + direct `await deleteNoteAction(...)` (same pattern as `deleteDealAction` in `delete-deal-dialog.tsx`) rather than `useActionState`. This is correct for an action that doesn't return form errors — keeps the component simpler.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Schema alignment] Notes table had `body` column and no `updated_at`**

- **Found during:** Task 1 — reading `001_initial_schema.sql` and `types/supabase.ts`
- **Issue:** The actual notes table schema used `body` (not `content`) and had no `updated_at` column. The plan's `note-actions.ts` code inserted `content` and set `updated_at`. Running as-is would cause runtime DB errors.
- **Fix:** Created `supabase/migrations/006_notes_content_column.sql` to rename `body → content` and add `updated_at TIMESTAMPTZ DEFAULT now()`. Updated `types/supabase.ts` notes types to match.
- **Files modified:** `supabase/migrations/006_notes_content_column.sql`, `types/supabase.ts`
- **Commit:** 3dc8569

**2. [Rule 1 - Bug] supabase-js 2.104.x inference bug affects SELECT queries in Promise.all**

- **Found during:** Task 2 type-check — `npx tsc --noEmit` returned `Property 'data' does not exist on type 'never'` for `dealResult.data`
- **Issue:** The inference bug (previously documented in 02-01 for mutations) also affects SELECT queries when resolved inside a `Promise.all` tuple. Both the deals and notes queries in the parallel fetch returned `never`.
- **Fix:** Applied `supabase.from('deals') as any` and `supabase.from('notes') as any` with explicit `Promise<{ data: T | null; error: unknown }>` type cast annotations on both queries. Added `DealRow` and `NoteRow` type aliases from `Database` types.
- **Files modified:** `app/(app)/deals/[id]/page.tsx`
- **Commit:** 626c4d6

## Threat Model Coverage

All mitigations from the plan's threat register are implemented:

| Threat ID | Status | Implementation |
|-----------|--------|----------------|
| T-02-01 (IDOR on notes) | Mitigated | `.eq('user_id', user.id)` in `updateNoteAction` and `deleteNoteAction` |
| T-02-02 (Deal access IDOR) | Mitigated | `.eq('user_id', user.id)` on deals query + `notFound()` on null result |
| T-02-03 (Spoofing) | Mitigated | `getUser()` at top of all three note Server Actions |
| T-02-04 (Tampering) | Mitigated | `NoteSchema.safeParse()` with `z.string().min(1)` before any DB write; `deal_id` validated as UUID |
| T-02-05 (Info disclosure) | Mitigated | Notes fetched with `.eq('deal_id', id)`; RLS EXISTS subquery ensures broker owns the deal |

## Known Stubs

None — all data is wired from real Supabase queries. Notes list renders live data from the parallel fetch.

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| lib/actions/note-actions.ts exists | FOUND |
| components/notes/note-item.tsx exists | FOUND |
| components/notes/notes-section.tsx exists | FOUND |
| app/(app)/deals/[id]/page.tsx exists | FOUND |
| supabase/migrations/006_notes_content_column.sql exists | FOUND |
| Commit 3dc8569 (Task 1) | FOUND |
| Commit 626c4d6 (Task 2) | FOUND |
| npx tsc --noEmit exits 0 | PASSED |
| npm run build exits 0 | PASSED |
