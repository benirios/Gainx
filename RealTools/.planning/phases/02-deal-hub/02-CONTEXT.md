# Phase 2: Deal Hub - Context

**Gathered:** 2026-04-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a complete deal workspace: broker can create and manage deals, attach notes and files to a deal, and share a public hosted OM page — all organized around a single Deal Hub view per property.

**In scope:**
- /dashboard: deal list (cards) + New Deal button
- /deals/[id]: Deal Hub page (deal details + notes + files, single scrollable)
- Deal CRUD via modal dialogs (create + edit share same modal)
- Notes CRUD on the Deal Hub page
- File upload to Supabase Storage, file list with signed URL download on the Deal Hub
- Public /om/[deal-id] page — accessible without auth, shows deal title, details, description, images

**Out of scope:**
- Buyers CRM (Phase 3)
- Send OM via email (Phase 3)
- Per-buyer tracking (Phase 3)
- Activity log (Phase 3)
- Deal tag filtering, pipeline/kanban views (v2 deferred)

</domain>

<decisions>
## Implementation Decisions

### Dashboard Deal List
- **D-01:** Deal list layout = **cards**. Reuses existing `Card` component from `components/ui/card.tsx`. Consistent with zinc/neutral theme.
- **D-02:** Each deal card shows **title + status badge only**. Clean and scannable — status is the key signal at a glance.
- **D-03:** Empty state = **centered message + CTA button** — "No deals yet. Create your first deal." with a prominent New Deal button. Replaces the current placeholder text from Phase 1.

### Deal Hub Page Layout
- **D-04:** Deal Hub = **single scrollable page**. Deal details at top → notes section → files section. No tabs. All visible by scrolling.
- **D-05:** Deal editing = **modal dialog**. Edit button on the Deal Hub opens a modal with the deal form. Broker stays on the same page.
- **D-06:** Deal creation = **modal dialog** (same modal as edit, create vs edit mode). New Deal button on dashboard opens this modal.

### Claude's Discretion
- **Notes UX** — not discussed. Claude decides: inline textarea on the Deal Hub page, with an "Add Note" button that reveals the textarea; existing notes show below with edit/delete inline.
- **File upload UX** — not discussed. Claude decides: standard click-to-browse file input (no drag-drop for v1); file list shows name + download link (signed URL, opens in new tab).
- **OM page design** — not discussed. Claude decides: clean minimal HTML page, deal title as heading, property details in a metadata block, description as prose, images in a grid. No auth required. Professional but simple.
- **Status badge colors** — Claude decides: active=green, negotiating=yellow, closed=zinc/muted.
- **Deal form fields** — per REQUIREMENTS.md: title, address, price, description, status (active/negotiating/closed).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Planning
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, requirements (DEAL-01 to OM-03)
- `.planning/REQUIREMENTS.md` — Full requirement specs for DEAL-01–04, NOTE-01–03, FILE-01–02, OM-01–03
- `.planning/research/SUMMARY.md` — Critical pitfalls and locked decisions from project research
- `.planning/research/ARCHITECTURE.md` — Data model SQL schema, component boundaries

### Stack / Security Rules
- `CLAUDE.md` — Critical rules: getUser() not getSession(), @supabase/ssr only, service role key server-only, RLS mandatory, no Zustand/Redux

### Phase 1 Context (patterns to reuse)
- `.planning/phases/01-foundation/01-CONTEXT.md` — Auth decisions, zinc/dark theme locked, shadcn/ui component patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/ui/card.tsx` — Full Card component (Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter) — use for deal cards on dashboard and sections within Deal Hub
- `components/ui/form.tsx` + `input.tsx` + `label.tsx` + `button.tsx` — established form pattern from auth pages; reuse same pattern for deal create/edit form
- `components/ui/sonner.tsx` — toast notifications available for success/error feedback
- `components/sidebar.tsx` — fixed sidebar, w-60, zinc-950; Deals link should navigate to /dashboard

### Established Patterns
- Server components + server actions only (no client state libraries) — per CLAUDE.md
- Auth check in layout: `await supabase.auth.getUser()` → redirect if null
- Supabase clients: `createSupabaseServerClient()` for server, `createSupabaseBrowserClient()` for client components
- Dark mode only: `bg-zinc-950` background, `bg-zinc-900` main area, `text-zinc-50` text, `border-zinc-800` borders
- Shadcn/ui form validation: react-hook-form + zod (established in auth forms)

### Integration Points
- `/dashboard` route (`app/(app)/dashboard/page.tsx`) — currently a placeholder; Phase 2 replaces it with the deal list
- `app/(app)/layout.tsx` — authenticated layout shell; Phase 2 adds `/deals/[id]` route inside this group
- `/om/[deal-id]` — must live OUTSIDE `(app)` group (no auth middleware) — new `app/om/[id]/page.tsx`
- Supabase Storage: two buckets needed — `deal-files` (private, signed URLs) and `om-images` (public) — per STATE.md Phase 2 decision

</code_context>

<specifics>
## Specific Ideas

- No "I want it like X" references from discussion — open to standard shadcn/ui patterns throughout.
- Deal cards on dashboard: clicking the card (or a "View Deal" button) navigates to `/deals/[id]`.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-deal-hub*
*Context gathered: 2026-04-28*
