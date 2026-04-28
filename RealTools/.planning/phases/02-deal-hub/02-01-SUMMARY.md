---
phase: 02-deal-hub
plan: "01"
subsystem: deal-crud
tags: [server-actions, crud, dashboard, modal, rls, zod]
dependency_graph:
  requires: ["02-00"]
  provides: ["deal-crud-actions", "deal-card", "deal-form-modal", "delete-deal-dialog", "live-dashboard"]
  affects: ["app/(app)/dashboard/page.tsx", "lib/actions/deal-actions.ts"]
tech_stack:
  added: []
  patterns:
    - "useActionState + useRef pending-detection for Server Action modal success"
    - "explicit Database type casts to bypass supabase-js 2.104.x __InternalSupabase inference issue"
    - "RLS double-protection: .eq('user_id', user.id) in every mutation + DB-level RLS policy"
key_files:
  created:
    - lib/actions/deal-actions.ts
    - components/deals/deal-card.tsx
    - components/deals/deal-form-modal.tsx
    - components/deals/delete-deal-dialog.tsx
  modified:
    - app/(app)/dashboard/page.tsx
decisions:
  - "Cast supabase.from('deals') as any at each call site rather than changing Database type — avoids touching generated types and keeps type safety at the insert/update data level via explicit DealInsert/DealUpdate types"
  - "Store price as text (already migrated via 005_deals_price_text.sql) — preserves formatted strings like $4,500,000"
  - "useRef-based pending→success detection in DealFormModal — avoids spurious close on initial mount when state=={}"
metrics:
  duration_minutes: 6
  completed_date: "2026-04-28"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 5
---

# Phase 02 Plan 01: Deal CRUD — Dashboard + Server Actions Summary

**One-liner:** Zod-validated Server Actions for deal create/edit/delete with RLS double-protection, status badge card grid, and live dashboard replacing the Phase 1 placeholder.

## Outcome

All deliverables for DEAL-01 through DEAL-04 are live:

- `lib/actions/deal-actions.ts` — three Server Actions (`createDealAction`, `updateDealAction`, `deleteDealAction`) all calling `getUser()`, validating with Zod, and enforcing `.eq('user_id', user.id)` on mutations
- `components/deals/deal-card.tsx` — `DealCard` + `StatusBadge` (active/negotiating/closed with color-coded badges)
- `components/deals/deal-form-modal.tsx` — create and edit modal with `useActionState`, inline field validation errors, and `useRef` pending-transition success detection
- `components/deals/delete-deal-dialog.tsx` — AlertDialog with exact copy: "Delete Deal?", "Keep", "Delete", storage cleanup before delete
- `app/(app)/dashboard/page.tsx` — live deal grid with `getUser()` auth, empty state with exact copy strings

Build and type-check both pass clean:
- `npm run build` exits 0
- `npx tsc --noEmit` exits 0

## Decisions Made

1. **`supabase.from() as any` cast pattern** — supabase-js 2.104.1 with `__InternalSupabase: { PostgrestVersion: "14.5" }` causes TypeScript to resolve the `Relation` type parameter in `PostgrestQueryBuilder` to `never`, breaking `.insert()` and `.update()` overloads. Fix: cast `supabase.from('table') as any` at call sites while preserving typed insert/update data via `Database['public']['Tables']['deals']['Insert']` / `['Update']`. The generated `types/supabase.ts` is not modified.

2. **`price` stored as text** — already handled by migration `005_deals_price_text.sql` from prior wave. Schema and TS types are consistent (`price: string | null`).

3. **`useRef` pending-detection** — `DealFormModal` uses `prevPending` ref to detect the exact transition from `isPending=true → false` with `!state.errors`, ensuring the modal only closes on genuine action success, not on initial mount where `state={}` is also falsy.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] supabase-js 2.104.x PostgrestVersion type inference causes Relation=never**

- **Found during:** Task 1 type-check
- **Issue:** `supabase.from('deals').insert(...)` TypeScript error: `No overload matches this call. Argument of type '...' is not assignable to parameter of type 'never'`. The `__InternalSupabase: { PostgrestVersion: "14.5" }` in the generated Database type causes the `SupabaseClient.from()` overload resolution to produce `Relation = never` for table query builders in supabase-js 2.104.1.
- **Fix:** Added explicit `Database['public']['Tables']['deals']['Insert']` and `['Update']` type aliases; cast `supabase.from('deals') as any` at each mutation call site. This preserves insert/update data typing while bypassing the library inference bug.
- **Files modified:** `lib/actions/deal-actions.ts`, `app/(app)/dashboard/page.tsx`
- **Commit:** 372b421

**2. [Rule 2 - Missing null handling] address and price are nullable in DB schema**

- **Found during:** Task 2 implementation
- **Issue:** Database schema has `address: string | null` and `price: string | null` (they are nullable TEXT columns). The plan's Deal type used `string` for both, which would cause type errors when rendering.
- **Fix:** Updated `Deal` type in `deal-card.tsx` and `deal-form-modal.tsx` to `address: string | null` and `price: string | null`; added null guards in rendering (`{deal.address && ...}`, `{deal.price && ...}`).
- **Files modified:** `components/deals/deal-card.tsx`, `components/deals/deal-form-modal.tsx`
- **Commit:** d3da4f0

## Threat Model Coverage

All mitigations from the plan's threat register are implemented:

| Threat ID | Status | Implementation |
|-----------|--------|----------------|
| T-01-01 (IDOR) | Mitigated | `.eq('user_id', user.id)` in all mutations |
| T-01-02 (Spoofing) | Mitigated | `getUser()` at top of every Server Action |
| T-01-03 (Tampering) | Mitigated | `DealSchema.safeParse()` before any DB call |
| T-01-04 (Storage orphans) | Accepted | Best-effort cleanup with comment |

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| lib/actions/deal-actions.ts exists | FOUND |
| components/deals/deal-card.tsx exists | FOUND |
| components/deals/deal-form-modal.tsx exists | FOUND |
| components/deals/delete-deal-dialog.tsx exists | FOUND |
| app/(app)/dashboard/page.tsx exists | FOUND |
| Commit 372b421 (Task 1) | FOUND |
| Commit d3da4f0 (Task 2) | FOUND |
