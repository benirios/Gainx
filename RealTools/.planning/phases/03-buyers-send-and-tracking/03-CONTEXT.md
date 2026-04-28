# Phase 3: Buyers, Send, and Tracking - Context

**Gathered:** 2026-04-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the core product differentiator: broker manages a buyer pool, selects buyers for a deal, sends the OM link via email with per-buyer tracking tokens, and sees who opened the OM in an activity log on the Deal Hub.

**In scope:**
- `/buyers` page — full buyer CRUD (create, view, edit, delete)
- Buyer-deal association + Send OM via a single modal on the Deal Hub
- Per-buyer unique OM URL (`/om/[deal-id]?ref=[token]`) sent via Resend
- URL-based open tracking (PRIMARY): OM page Server Component records first open when `?ref=` is present
- Pixel tracking (SECONDARY): OM page embeds `<img src="/api/track/[token]" />` as fallback signal
- `/api/track/[token]` Route Handler: idempotent open recording + returns 1x1 GIF
- Activity log on Deal Hub — events: om_sent, om_opened, note_added, file_uploaded
- Backfill activity logging to existing note and file server actions (Phase 2 shipped these without logging)

**Out of scope:**
- Buyer tag-based filtering before send (v2 deferred)
- Bulk import of buyers (v2 deferred)
- Real-time activity log (polling/revalidate is sufficient for v1)
- PDF OM export
- Team/multi-user features

</domain>

<decisions>
## Implementation Decisions

### Send OM Flow
- **D-01:** "Send OM" button on the Deal Hub opens a **single modal** combining buyer selection and send. Broker sees their full buyer pool with checkboxes. Checks recipients, clicks Send — association into `deal_buyers` and email send happen together in one Server Action.
- **D-02:** Success feedback: **toast ("OM sent to N buyers") + modal closes**. Deal Hub `revalidatePath` shows updated activity log. No summary screen in modal.
- **D-03:** **Re-send is allowed.** Modal shows which buyers already received the OM via `om_sent_at` timestamp (label: "Sent Apr 28"). Broker can select any buyer including previously sent. Tracking token is stable (idempotent first-open).

### Buyers Page (`/buyers`)
- **D-04:** Buyer list = **table layout** — columns: name, email, tags, actions. `New Buyer` button above the table.
- **D-05:** Create/edit buyer via **modal form** (same pattern as `DealFormModal`). Edit row action opens modal prefilled with buyer data. Delete row action shows `AlertDialog` ("Delete Buyer?" / "Keep" / "Delete").
- **D-06:** Empty state: "No buyers yet. Add your first buyer." centered with a New Buyer button.

### Activity Log
- **D-07:** Activity log positioned at the **bottom of the Deal Hub page**, after the Files section — consistent with the single-scroll layout established in Phase 2.
- **D-08:** Display: **simple text list with timestamps**. Each row: `[timestamp] [event description]`. Examples: "OM sent to John Smith — Apr 28, 2:30pm", "OM opened by Sarah Lee — Apr 29, 9:15am", "Note added — Apr 28, 1:00pm", "File uploaded: floorplan.pdf — Apr 28, 12:45pm".
- **D-09:** Events to log: `om_sent` (per buyer), `om_opened` (per buyer, first-open only), `note_added`, `file_uploaded`. Metadata JSONB stores buyer name/email for buyer events; file_name for file events.
- **D-10:** Phase 3 must **backfill activity logging** into `createNoteAction` and `insertDealFileAction` (Phase 2 actions) — insert `activities` rows for note_added and file_uploaded events. Service role client used for `activities` inserts (consistent with RLS policy: INSERT allowed via service role only).

### Tag Input UX
- **D-11:** Buyer tag input = **pill/chip UI**. Type a tag and press Enter or comma → creates a removable chip. Chips stored as `TEXT[]` in the `buyers` table. Tags display as badges in the table row.

### Tracking Implementation
- **D-12:** URL-based tracking (PRIMARY): When `/om/[deal-id]?ref=[token]` is loaded, the Server Component (using `createSupabaseServiceClient`) checks `searchParams.ref`, finds the `deal_buyers` row, and records first open (set `om_opened_at = now()` + insert `activities` event) if not already opened. Idempotent.
- **D-13:** Pixel tracking (SECONDARY): OM page embeds `<img src="/api/track/[token]" width="1" height="1" style="display:none" />` when `ref` is present. `/api/track/[token]` Route Handler: find `deal_buyers` by token, idempotently set `om_opened_at`, insert `activities` event, return 1x1 transparent GIF. Uses `createSupabaseServiceClient`.
- **D-14:** The email body sent via Resend includes the unique OM URL: `/om/[deal-id]?ref=[token]`. No proprietary Resend open tracking — URL token is the source of truth.

### Claude's Discretion
- Email template copy and layout (subject line, body text) — Claude decides: clean plain-text style, deal title in subject, brief intro, OM link as a prominent button.
- Exact table row action placement (icon buttons vs dropdown) — Claude decides: icon buttons (edit pencil + trash delete) in an actions column, consistent with notes/files patterns from Phase 2.
- Activity log empty state copy — Claude decides: "No activity yet." centered in the section.
- Pill/chip component implementation — build a lightweight `TagInput` client component; no external library needed for v1.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Planning
- `.planning/ROADMAP.md` — Phase 3 goal, success criteria, requirements (BUYER-01–04, SEND-01–02, TRACK-01–03, ACT-01–02)
- `.planning/REQUIREMENTS.md` — Full requirement specs for all Phase 3 requirements
- `.planning/research/SUMMARY.md` — Critical pitfalls and locked decisions from project research

### Stack / Security Rules
- `CLAUDE.md` — Critical rules: getUser() not getSession(), @supabase/ssr only, service role key server-only, RLS mandatory, no Zustand/Redux, URL-based tracking is PRIMARY

### Phase Context (patterns to reuse)
- `.planning/phases/01-foundation/01-CONTEXT.md` — Auth decisions, zinc/dark theme locked
- `.planning/phases/02-deal-hub/02-CONTEXT.md` — DealFormModal pattern, Server Action pattern, supabase.from() as any cast

### No external specs — requirements fully captured in decisions above and canonical refs.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/actions/deal-actions.ts` — Server Action pattern: getUser() → Zod parse → `supabase.from() as any` cast → revalidatePath. Replicate for buyer-actions.ts.
- `lib/schemas/deal.ts` — Schema extraction pattern: Zod schema + types in separate non-"use server" file. Do the same for buyer schema.
- `components/deals/deal-form-modal.tsx` — `useActionState` + `useRef` pending-detection modal. Blueprint for BuyerFormModal.
- `components/deals/delete-deal-dialog.tsx` — AlertDialog delete pattern. Blueprint for buyer delete.
- `components/notes/notes-section.tsx` + `components/files/files-section.tsx` — Section component pattern for Deal Hub.
- `components/ui/` — badge.tsx, dialog.tsx, alert-dialog.tsx, select.tsx, textarea.tsx, input.tsx, button.tsx, card.tsx all available.

### Established Patterns
- Server components + server actions only (no client state libraries) — per CLAUDE.md
- `createSupabaseServerClient()` for authenticated server components; `createSupabaseBrowserClient()` for client components; `createSupabaseServiceClient()` for service role (tracking, OM page)
- Dark mode only: `bg-zinc-950` background, `bg-zinc-900` main area, `text-zinc-50` text, `border-zinc-800`
- `supabase.from('table') as any` + explicit Database type aliases — required for supabase-js 2.104.x inference bug
- Activities table: INSERT via service role only (no user-scoped INSERT policy); SELECT via user RLS policy

### Integration Points
- `/deals/[id]/page.tsx` — Deal Hub Server Component; Phase 3 adds: BuyersSendSection (Send OM button), ActivityLogSection (bottom of page); also adds URL-based tracking call when `searchParams.ref` is present (OM page only)
- `app/om/[id]/page.tsx` — Phase 3 updates: check `searchParams.ref`, record primary open, embed tracking pixel
- `app/(app)/buyers/page.tsx` — new route inside authenticated layout
- `app/api/track/[token]/route.ts` — new public Route Handler (already excluded by middleware)
- `lib/actions/note-actions.ts` + `lib/actions/file-actions.ts` — Phase 3 adds `activities` INSERT after successful note/file operations
- `middleware.ts` — `/api/track/*` already excluded. No changes needed.
- `supabase/migrations/` — may need migration for `activities.user_id` if logging requires it (check: current schema has no user_id on activities — use deal ownership via deals join for SELECT, service role for INSERT)

</code_context>

<specifics>
## Specific Ideas

- Send OM modal shows buyer pool with checkboxes. Already-sent buyers labeled (e.g., badge "Sent Apr 28") so broker has full context without hiding them.
- Activity log events sorted descending (most recent first).
- Pill/chip tag input: build as `TagInput` client component in `components/ui/tag-input.tsx`.

</specifics>

<deferred>
## Deferred Ideas

- Buyer tag-based filtering before Send OM — REQUIREMENTS.md v2 deferred
- Real-time activity log (WebSocket or SSE) — polling via revalidatePath sufficient for v1
- PDF OM export — out of scope per PROJECT.md

</deferred>

---

*Phase: 03-buyers-send-and-tracking*
*Context gathered: 2026-04-28*
