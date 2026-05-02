---
phase: 8
slug: authenticated-workspace-refactor
created: 2026-05-02
status: complete
---

# Phase 8 Pattern Map

## Purpose

Map Phase 8 target files to current code patterns, closest analogs, and behavior constraints. Executors must read the listed files before editing.

## Global Patterns To Preserve

- Server route pages use `createSupabaseServerClient()` and `supabase.auth.getUser()`.
- Authenticated pages redirect unauthenticated users with `redirect('/auth/login')`.
- Client forms use `useActionState`, server actions, pending flags, and toast notifications.
- The codebase currently tolerates Supabase `as any` casts because of the documented Supabase inference issue.
- Local shadcn primitives in `components/ui/*` are the styling base after Phase 7.
- Icons come from `lucide-react`.

## File Map

| Target | Role | Closest Analog / Pattern | Notes |
|--------|------|--------------------------|-------|
| `app/(app)/layout.tsx` | Authenticated layout shell | Existing auth guard + sidebar layout | Preserve `getUser()` and redirect. Change layout classes only. |
| `components/sidebar.tsx` | Persistent app sidebar | Existing sidebar composition | Add light SaaS brand/nav/footer treatment without changing routes. |
| `components/sidebar-nav.tsx` | Active route nav | Existing `usePathname()` matching | Preserve `matchPrefixes`; wrap icons in active/inactive chips. |
| `components/logout-button.tsx` | Client logout affordance | Existing Supabase browser sign-out | Preserve `signOut`, `router.push`, `router.refresh`; remove zinc dark classes. |
| `app/(app)/dashboard/page.tsx` | Deal list dashboard | Existing server fetch for current user's deals | Preserve query; derive count cards from `dealList` only. |
| `components/deals/deal-card.tsx` | Deal card and status badge | Existing link card + `StatusBadge` | Replace dark badges; keep link to `/deals/${deal.id}`. |
| `app/(app)/deals/[id]/page.tsx` | Deal Hub server page | Existing parallel fetch and signed URLs | Preserve all queries, `notFound`, signed URLs; restructure JSX/classes. |
| `components/notes/notes-section.tsx` | Note section and add form | Existing client action form | Preserve `createNoteAction`, hidden `deal_id`, toast success. |
| `components/notes/note-item.tsx` | Note row edit/delete | Existing edit form and alert dialog | Preserve `updateNoteAction`, `deleteNoteAction`, hidden inputs. |
| `components/files/files-section.tsx` | File upload/list/delete | Existing browser upload + server record insert/delete | Preserve 50MB check, path format, storage bucket, signed URL rendering. |
| `components/deals/activity-log-section.tsx` | Activity list | Existing event formatting helpers | Preserve `activityDescription` and `formatTimestamp`; add event icon chips. |
| `app/(app)/buyers/page.tsx` | Buyers page | Existing server fetch | Preserve query and action visibility; remove nested padding. |
| `components/buyers/buyers-table.tsx` | Buyer table/list | Existing table grid + actions | Preserve edit/delete controls; add mobile-safe layout if feasible. |
| `app/(app)/profile/page.tsx` | Account details page | Existing Supabase user display | Preserve displayed email/user id; restyle card. |
| `components/deals/deal-form-modal.tsx` | Deal create/edit dialog | Existing `useActionState` form | Preserve field names, default values, actions, success toasts. |
| `components/deals/delete-deal-dialog.tsx` | Deal delete dialog | Existing alert dialog | Preserve delete action and copy. |
| `components/deals/send-om-modal.tsx` | Send OM dialog | Existing selected buyer state + action | Preserve `buyerIds` hidden JSON, selected count copy, disabled state. |
| `components/buyers/buyer-form-modal.tsx` | Buyer create/edit dialog | Existing tag input form | Preserve `TagInput`, field names, action wiring. |
| `components/buyers/delete-buyer-dialog.tsx` | Buyer delete dialog | Existing alert dialog | Preserve delete action and copy. |

## Known Current Remnants To Remove

- `font-heading` in authenticated pages/components.
- `bg-green-950/60`, `text-green-300`, `border-green-800/40`.
- `bg-yellow-950/60`, `text-yellow-300`, `border-yellow-800/40`.
- `bg-accent text-background` on primary actions.
- Dark zinc logout/delete classes such as `text-zinc-400`, `hover:text-zinc-50`, `hover:bg-zinc-800`, `hover:text-red-400`.
- `rounded-xl` on deal cards.
- Raw arrow glyph affordances where lucide icons should be used.
- Nested page `p-8` inside pages already padded by `app/(app)/layout.tsx`.

## Suggested Execution Slices

### 08-01 Shell

Files:

- `app/(app)/layout.tsx`
- `components/sidebar.tsx`
- `components/sidebar-nav.tsx`
- `components/logout-button.tsx`

Primary requirement: `APP-04`.

### 08-02 Dashboard And Deal Cards

Files:

- `app/(app)/dashboard/page.tsx`
- `components/deals/deal-card.tsx`

Primary requirements: `APP-05`, `APP-06`.

### 08-03 Deal Hub And Detail Sections

Files:

- `app/(app)/deals/[id]/page.tsx`
- `components/notes/notes-section.tsx`
- `components/notes/note-item.tsx`
- `components/files/files-section.tsx`
- `components/deals/activity-log-section.tsx`

Primary requirements: `DEAL-01`, `DEAL-03`.

### 08-04 Buyers And Profile

Files:

- `app/(app)/buyers/page.tsx`
- `components/buyers/buyers-table.tsx`
- `app/(app)/profile/page.tsx`

Primary requirements: `APP-04`, `DEAL-02`, `DEAL-03`.

### 08-05 Dialogs And Workflow Forms

Files:

- `components/deals/deal-form-modal.tsx`
- `components/deals/delete-deal-dialog.tsx`
- `components/deals/send-om-modal.tsx`
- `components/buyers/buyer-form-modal.tsx`
- `components/buyers/delete-buyer-dialog.tsx`

Primary requirements: `APP-06`, `DEAL-02`.

## Verification Anchors

Executors should use the Phase 8 UI-SPEC verification commands and add plan-specific grep checks for:

- Removed dark/serif classes in owned files.
- Preserved action imports and hidden input names.
- Preserved auth/data query filters in server pages.
- Preserved file upload and send-OM behavior-critical strings.
