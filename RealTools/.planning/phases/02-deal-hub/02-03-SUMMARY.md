---
phase: 02-deal-hub
plan: "03"
subsystem: files-and-om
tags: [storage, file-upload, signed-urls, server-actions, public-page, service-role, alert-dialog, OM]
dependency_graph:
  requires: ["02-02"]
  provides: ["insertDealFileAction", "deleteDealFileAction", "FilesSection", "deal-hub-with-files", "public-om-page"]
  affects:
    - lib/actions/file-actions.ts
    - components/files/files-section.tsx
    - app/(app)/deals/[id]/page.tsx
    - app/om/[id]/page.tsx
    - supabase/migrations/007_deal_files_user_id.sql
    - types/supabase.ts
tech_stack:
  added: []
  patterns:
    - "Browser-direct Supabase Storage upload via createSupabaseBrowserClient() in Client Component; DB record via Server Action after upload"
    - "Server-side signed URL generation (1h expiry) via Promise.all map before rendering"
    - "Service role client (createSupabaseServiceClient) for public OM page — sync factory, no cookies(), force-dynamic"
    - "as-any cast + explicit Promise<{data: T | null; error: unknown}> annotation on deal_files SELECT in Promise.all (same inference bug as Wave 2)"
key_files:
  created:
    - lib/actions/file-actions.ts
    - components/files/files-section.tsx
    - app/om/[id]/page.tsx
    - supabase/migrations/007_deal_files_user_id.sql
  modified:
    - app/(app)/deals/[id]/page.tsx
    - types/supabase.ts
decisions:
  - "Added user_id column to deal_files via migration 007 — table lacked it but plan required it for IDOR protection (T-03-02); RLS via deals join retained as additional layer"
  - "as-any cast applied to deal_files SELECT in Promise.all — same supabase-js 2.104.x inference bug as notes/deals queries in Wave 2"
  - "OM page uses createSupabaseServiceClient (sync, no cookies) exclusively — createSupabaseServerClient would throw in unauthenticated context"
metrics:
  duration_minutes: 3
  completed_date: "2026-04-28"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 6
---

# Phase 02 Plan 03: File Upload/Download/Delete + Public OM Page Summary

**One-liner:** Browser-direct Storage upload with server-side signed URLs for the Files section, plus a fully public OM page using the service role client with force-dynamic and light-mode buyer layout.

## Outcome

All deliverables for FILE-01, FILE-02, OM-01, OM-02, OM-03 are implemented:

- `lib/actions/file-actions.ts` — `insertDealFileAction` and `deleteDealFileAction` Server Actions; both call `getUser()`, use `as-any` cast, enforce `user_id` scoping on delete, and call `revalidatePath('/deals/[dealId]')`
- `components/files/files-section.tsx` — Client Component; browser-direct upload to `deal-files` bucket via `createSupabaseBrowserClient()`, 50 MB guard with toast, signed URL Download links (`target="_blank"`), AlertDialog delete confirmation with "Delete File?" / "This file will be permanently deleted from storage." / "Keep" / "Delete" copy
- `app/(app)/deals/[id]/page.tsx` — Extended with `deal_files` in the `Promise.all`, server-side signed URL generation (1-hour expiry), and `<FilesSection files={filesWithUrls} dealId={deal.id} userId={user.id} />` replacing the Wave 3 placeholder comment
- `app/om/[id]/page.tsx` — Public buyer-facing OM page; `createSupabaseServiceClient` (sync factory, no `cookies()`), `export const dynamic = 'force-dynamic'`, light mode (`min-h-screen bg-white text-zinc-900`), all UI-SPEC sections: top bar, hero, property details grid, Property Overview, Property Images (conditional), footer "Powered by RealTools"
- `supabase/migrations/007_deal_files_user_id.sql` — Adds `user_id` column to `deal_files` with back-fill and NOT NULL enforcement
- `types/supabase.ts` — `deal_files` Row/Insert/Update types updated to include `user_id`

Build and type-check both pass clean:
- `npm run build` exits 0 — `/deals/[id]` (46.3 kB) and `/om/[id]` (135 B) routes compile
- `npx tsc --noEmit` exits 0

## Decisions Made

1. **Migration 007 — user_id on deal_files** — The actual `deal_files` table had no `user_id` column (only `id`, `deal_id`, `file_name`, `storage_path`, `created_at`). The plan required inserting `user_id` and scoping the delete with `.eq('user_id', user.id)` for IDOR protection (threat T-03-02). Created `007_deal_files_user_id.sql` to add the column with back-fill; updated `types/supabase.ts` accordingly. The existing RLS policy (via `deals` join) is retained as an additional layer.

2. **as-any cast on deal_files SELECT in Promise.all** — The supabase-js 2.104.x `PostgrestVersion=never` inference bug also affects the `deal_files` SELECT query when resolved inside the three-tuple `Promise.all`. Applied `(supabase.from('deal_files') as any)` with explicit `Promise<{ data: DealFileRow[] | null; error: unknown }>` annotation, matching the pattern established in Wave 2.

3. **OM page: service role client is sync, not awaited** — `createSupabaseServiceClient()` is a sync factory (no `await`), unlike `createSupabaseServerClient()` which is async. This is intentional — the service client does not touch cookies and therefore can be constructed synchronously.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical security field] deal_files table missing user_id column**

- **Found during:** Task 1 — reading `supabase/migrations/001_initial_schema.sql` and `types/supabase.ts`
- **Issue:** The `deal_files` table schema only had `id`, `deal_id`, `file_name`, `storage_path`, `created_at`. The plan's `insertDealFileAction` inserts `user_id` and `deleteDealFileAction` scopes deletion with `.eq('user_id', user.id)` for IDOR protection (threat T-03-02). Without the column, both would fail at runtime.
- **Fix:** Created `supabase/migrations/007_deal_files_user_id.sql` (ADD COLUMN with back-fill + NOT NULL). Updated `types/supabase.ts` deal_files Row/Insert/Update to include `user_id: string`.
- **Files modified:** `supabase/migrations/007_deal_files_user_id.sql`, `types/supabase.ts`
- **Commit:** ef6bec6

## Threat Model Coverage

All mitigations from the plan's threat register are implemented:

| Threat ID | Status | Implementation |
|-----------|--------|----------------|
| T-03-01 (Storage upload EoP) | Mitigated | Path `{user_id}/{deal_id}/...`; Storage RLS from 004 enforces first segment = `auth.uid()` |
| T-03-02 (IDOR on delete) | Mitigated | `.eq('user_id', user.id)` on `deal_files` DELETE; column added via migration 007 |
| T-03-03 (Signed URL disclosure) | Accepted | 1-hour expiry; no PII in filenames; deal_files SELECT scoped by RLS |
| T-03-04 (OM service role tampering) | Mitigated | OM page SELECT-only; `import 'server-only'` in service.ts; no mutations on OM page |
| T-03-05 (OM public access info disclosure) | Accepted | OM intentionally public; only deal fields exposed (no notes, no deal_files signed URLs) |
| T-03-06 (XSS via description) | Mitigated | React renders `{deal.description}` as text node — automatic HTML escaping; no `dangerouslySetInnerHTML` |
| T-03-07 (File size bypass) | Mitigated | Client-side 50 MB check in FilesSection; Supabase bucket 50 MB per-file limit as server enforcement |

## Known Stubs

None — FilesSection renders live data from server-side signed URLs. OM page renders live deal data via service role SELECT.

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| lib/actions/file-actions.ts exists | FOUND |
| components/files/files-section.tsx exists | FOUND |
| app/om/[id]/page.tsx exists | FOUND |
| supabase/migrations/007_deal_files_user_id.sql exists | FOUND |
| app/(app)/deals/[id]/page.tsx contains FilesSection | FOUND |
| Commit ef6bec6 (Task 1) | FOUND |
| Commit 82e4d75 (Task 2) | FOUND |
| npx tsc --noEmit exits 0 | PASSED |
| npm run build exits 0 | PASSED |
