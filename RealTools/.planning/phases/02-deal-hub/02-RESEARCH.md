# Phase 02: Deal Hub — Research

**Researched:** 2026-04-28
**Domain:** Next.js 15 App Router — deal CRUD, notes CRUD, Supabase Storage file upload, public SSR OM page, shadcn/ui modal patterns
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Deal list layout = cards. Reuses existing `components/ui/card.tsx`. Consistent with zinc/neutral theme.
- **D-02:** Each deal card shows title + status badge only. Clean and scannable.
- **D-03:** Empty state = centered message + CTA button — "No deals yet. Create your first deal." with a prominent New Deal button. Replaces current placeholder text.
- **D-04:** Deal Hub = single scrollable page. Deal details at top → notes section → files section. No tabs.
- **D-05:** Deal editing = modal dialog. Edit button on the Deal Hub opens a modal with the deal form. Broker stays on the same page.
- **D-06:** Deal creation = modal dialog (same modal as edit, create vs edit mode). New Deal button on dashboard opens this modal.

### Claude's Discretion

- **Notes UX:** inline textarea on the Deal Hub page, with an "Add Note" button that reveals the textarea; existing notes show below with edit/delete inline.
- **File upload UX:** standard click-to-browse file input (no drag-drop for v1); file list shows name + download link (signed URL, opens in new tab).
- **OM page design:** clean minimal HTML page, deal title as heading, property details in a metadata block, description as prose, images in a grid. No auth required. Professional but simple.
- **Status badge colors:** active=green, negotiating=yellow, closed=zinc/muted.
- **Deal form fields:** per REQUIREMENTS.md: title, address, price, description, status (active/negotiating/closed).

### Deferred Ideas (OUT OF SCOPE)

- Buyers CRM (Phase 3)
- Send OM via email (Phase 3)
- Per-buyer tracking (Phase 3)
- Activity log (Phase 3)
- Deal tag filtering, pipeline/kanban views (v2 deferred)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DEAL-01 | User can create a deal with title, address, price, and description | Server Action + Zod schema → deals table INSERT with RLS; modal dialog pattern (D-06) |
| DEAL-02 | User can view, edit, and delete their own deals | Server Components for read; Server Actions for update/delete; revalidatePath after mutation |
| DEAL-03 | User can set deal status: active, negotiating, or closed | deals.status TEXT field, enum values; shadcn Select component; badge color per UI-SPEC |
| DEAL-04 | User sees a dashboard listing all their deals with status and a New Deal button | /dashboard page replaces placeholder; Server Component fetches deals; card grid from UI-SPEC |
| NOTE-01 | User can add a note to a deal | notes table INSERT via Server Action; inline textarea UX (Claude's Discretion) |
| NOTE-02 | User can edit their own notes on a deal | notes table UPDATE via Server Action; inline edit UX (Claude's Discretion) |
| NOTE-03 | User can delete their own notes on a deal | notes table DELETE via Server Action; AlertDialog confirmation |
| FILE-01 | User can upload files to a deal (stored in Supabase Storage) | Browser-side upload to deal-files bucket; deal_files table INSERT after upload; 50MB limit |
| FILE-02 | User can view and download uploaded files from the Deal Hub | deal_files read in Server Component; signed URL generation server-side; open in new tab |
| OM-01 | User can generate a hosted OM HTML page from deal data and uploaded images | /om/[id] page; service role client; force-dynamic; no cookies() call |
| OM-02 | OM page is publicly accessible at /om/[deal-id] without requiring auth | Middleware already excludes /om/*; confirmed in existing middleware.ts |
| OM-03 | OM page includes: deal title, property details, description, and images | Service role SELECT from deals + deal_files; om-images public bucket for images |
</phase_requirements>

---

## Summary

Phase 2 builds the complete deal workspace on top of the Phase 1 foundation. All infrastructure is in place: the database schema (001_initial_schema.sql), RLS policies (002_rls_policies.sql), indexes (003_indexes.sql), three Supabase client factories, and the middleware with `/om/*` already excluded from auth protection. Phase 2 is purely UI + business logic — no new schema or infrastructure is required, only Supabase Storage bucket creation.

The dominant pattern is Server Components fetching data at the page level, passing it as props to leaf Client Components that handle interactivity (modal open/close, inline note editor, file upload). Server Actions handle all mutations (deal create/edit/delete, note create/edit/delete, deal_files record insert/delete). The `revalidatePath` call after every mutation is the only cache invalidation needed — no client-side state library.

The OM page is the architecturally distinct piece: it lives outside the `(app)` route group, uses `createSupabaseServiceClient` (not the user-scoped server client), must not call `cookies()` anywhere in its render tree, and uses `export const dynamic = 'force-dynamic'` to prevent stale cached renders. The middleware already correctly excludes `/om/*`.

**Primary recommendation:** Build in wave order — (1) deals CRUD + dashboard, (2) notes CRUD on Deal Hub, (3) file upload + deal_files display, (4) OM page. Each wave depends on the previous; deals must exist before notes/files can be attached; OM page reads deal + files.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Deal list (dashboard) | Frontend Server (SSR) | — | Server Component fetches deals list; no client state needed |
| Deal create/edit form | Browser / Client | Frontend Server (SSR) | Modal is Client Component (needs useState for open/close); form submission goes to Server Action |
| Deal delete | Frontend Server (API) | — | Server Action; AlertDialog is Client Component trigger |
| Notes CRUD | Browser / Client | Frontend Server (API) | Inline add/edit UI is Client Component; mutations via Server Actions |
| File upload | Browser / Client | Database / Storage | Browser uploads directly to Supabase Storage (anon key + RLS); Server Action inserts deal_files record |
| File display + signed URLs | Frontend Server (SSR) | — | Signed URLs generated server-side in Server Component; passed as props to file list |
| Public OM page | Frontend Server (SSR) | Database / Storage | Service role server fetch; pure SSR render; no client JS needed |
| Supabase Storage buckets | Database / Storage | — | Two buckets: deal-files (private) and om-images (public); bucket creation is one-time setup |

---

## Standard Stack

### Core (all already installed in package.json)

| Library | Version (installed) | Purpose | Why Standard |
|---------|---------------------|---------|--------------|
| next | 15.5.15 | App Router, Server Components, Server Actions, Route Handlers | Project foundation |
| @supabase/ssr | ^0.5.2 | SSR-safe Supabase clients (createServerClient, createBrowserClient) | Project rule: never @supabase/auth-helpers-nextjs |
| @supabase/supabase-js | ^2.104.1 | Supabase JS client (Storage, DB queries) | Project foundation |
| react-hook-form | ^7.74.0 | Form state management | Established in auth forms (Phase 1) |
| zod | ^3.25.76 | Schema validation (client + Server Action) | Established in auth forms (Phase 1) |
| @hookform/resolvers | ^3.10.0 | Connects zod to react-hook-form | Already installed |
| lucide-react | ^1.11.0 | Icons (Plus, Pencil, Trash2, FileText, Download, Upload, Loader2) | shadcn/ui default icon library per components.json |
| sonner | ^2.0.7 | Toast notifications | Already installed (components/ui/sonner.tsx) |

### New shadcn/ui Components Required (not yet in components/ui/)

| Component | shadcn command | Radix package | Purpose |
|-----------|---------------|---------------|---------|
| Dialog | `npx shadcn@latest add dialog` | @radix-ui/react-dialog@1.1.15 | Deal create/edit modal (D-05, D-06) |
| Textarea | `npx shadcn@latest add textarea` | (none — HTML textarea) | Deal description, note body |
| Badge | `npx shadcn@latest add badge` | (none — styled span) | Status badges on deal cards and Deal Hub |
| Separator | `npx shadcn@latest add separator` | @radix-ui/react-separator@1.1.8 | Section dividers between Deal Hub sections |
| Alert Dialog | `npx shadcn@latest add alert-dialog` | @radix-ui/react-alert-dialog@1.1.15 | Destructive confirmations: delete deal/note/file |
| Select | `npx shadcn@latest add select` | @radix-ui/react-select@2.2.6 | Status field in deal form |

**Note on shadcn CLI:** Phase 1 encountered interactive peer-dep prompts with the shadcn CLI against React 19. [VERIFIED: codebase] Components were written manually. The same approach applies in Phase 2 — install Radix peer deps with `--legacy-peer-deps` first if needed, then use the CLI or write components manually. [VERIFIED: codebase — components.json `"style": "new-york"`, `"baseColor": "zinc"`, `"cssVariables": true`]

### No New npm Packages Required

All required libraries are already installed. Phase 2 adds no new npm dependencies beyond the Radix packages shadcn pulls in for the 5 new components. `date-fns` is not needed — relative timestamps can use `toLocaleDateString()` for v1 simplicity.

**Installation (shadcn components only):**
```bash
npx shadcn@latest add dialog textarea badge separator alert-dialog select
```
If CLI prompts for React 19 peer deps (same issue as Phase 1), install Radix packages manually:
```bash
npm install @radix-ui/react-dialog @radix-ui/react-alert-dialog @radix-ui/react-separator @radix-ui/react-select --legacy-peer-deps
```
Then write component files from canonical shadcn/ui source.

---

## Architecture Patterns

### System Architecture Diagram

```
[Broker Browser]
      │
      │  GET /dashboard
      ▼
[Next.js Server Component — /dashboard/page.tsx]
      │  createSupabaseServerClient() → SELECT * FROM deals WHERE user_id = auth.uid()
      ▼
[DealCard grid + empty state]
      │  "New Deal" click → opens DealFormModal (Client Component)
      │  "View Deal" click → navigate to /deals/[id]
      │
      │  Modal submit → Server Action createDealAction(formData)
      │    → INSERT INTO deals → revalidatePath('/dashboard')
      ▼
[Next.js Server Component — /deals/[id]/page.tsx]
      │  Single page-level fetch: deal + notes + files (three queries)
      │  Signed URLs generated server-side for each file in deal_files
      ├── [DealHeader — Server Component] deal title + status badge
      ├── [EditDealButton — Client Component] opens DealFormModal pre-filled
      ├── [NotesSection — Client Component] add/edit/delete inline, Server Actions
      ├── [FilesSection — Client Component] upload to Storage, delete, download
      │
[Supabase Storage — deal-files bucket (private)]
      │  Browser uploads directly: supabase.storage.from('deal-files').upload(path, file)
      │  Server generates signed URLs: createSignedUrl(path, 3600)
      │
[Buyer Browser — no auth]
      │  GET /om/[deal-id]
      ▼
[Next.js Server Component — /om/[id]/page.tsx]
      │  createSupabaseServiceClient() — bypasses RLS
      │  SELECT from deals (title, address, price, description, status)
      │  SELECT from deal_files WHERE storage_path LIKE 'om-images/%'
      │  force-dynamic — fresh render per request
      ▼
[OM HTML page — light mode, no sidebar, no auth]
      │  images from om-images public bucket (direct URLs, no signed)
      └── (Phase 3 will add: <img src="/api/track/[token]" /> pixel)
```

### Recommended Project Structure (Phase 2 additions)

```
app/
├── (app)/
│   ├── dashboard/
│   │   └── page.tsx              # REPLACE placeholder — Server Component, deal list
│   └── deals/
│       └── [id]/
│           └── page.tsx          # NEW — Deal Hub, Server Component
├── om/
│   └── [id]/
│       └── page.tsx              # NEW — Public OM page, service role, no auth
components/
├── deals/
│   ├── deal-card.tsx             # NEW — deal card display (Server Component)
│   ├── deal-form-modal.tsx       # NEW — create/edit modal (Client Component)
│   └── delete-deal-dialog.tsx   # NEW — AlertDialog wrapper (Client Component)
├── notes/
│   ├── notes-section.tsx         # NEW — full notes UI (Client Component)
│   └── note-item.tsx             # NEW — single note with inline edit (Client Component)
├── files/
│   └── files-section.tsx         # NEW — upload + file list (Client Component)
└── ui/
    ├── dialog.tsx                 # NEW — shadcn Dialog
    ├── textarea.tsx               # NEW — shadcn Textarea
    ├── badge.tsx                  # NEW — shadcn Badge
    ├── separator.tsx              # NEW — shadcn Separator
    ├── alert-dialog.tsx           # NEW — shadcn AlertDialog
    └── select.tsx                 # NEW — shadcn Select
lib/
└── actions/
    ├── deal-actions.ts            # NEW — Server Actions: createDeal, updateDeal, deleteDeal
    ├── note-actions.ts            # NEW — Server Actions: createNote, updateNote, deleteNote
    └── file-actions.ts            # NEW — Server Actions: insertDealFile, deleteDealFile
```

### Pattern 1: Server Action with revalidatePath (deal mutations)

Every mutation follows this pattern. `revalidatePath` is the only cache invalidation needed.

```typescript
// lib/actions/deal-actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const DealSchema = z.object({
  title: z.string().min(2, 'Deal title is required'),
  address: z.string().min(5, 'Address is required'),
  price: z.string().min(1, 'Asking price is required'),
  status: z.enum(['active', 'negotiating', 'closed']).default('active'),
  description: z.string().optional(),
})

export async function createDealAction(
  _prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const parsed = DealSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { error } = await supabase.from('deals').insert({
    ...parsed.data,
    user_id: user.id,
  })

  if (error) return { error: 'Failed to save deal. Please try again.' }

  revalidatePath('/dashboard')
  return {}
}
// Source: Next.js App Router Server Actions docs + established Phase 1 action pattern
```

### Pattern 2: Client Component modal with useActionState

```typescript
// components/deals/deal-form-modal.tsx
'use client'
import { useActionState, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createDealAction } from '@/lib/actions/deal-actions'

export function DealFormModal() {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(createDealAction, {})

  return (
    <>
      <button onClick={() => setOpen(true)}>New Deal</button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Deal</DialogTitle></DialogHeader>
          <form action={formAction}>
            {/* fields per UI-SPEC */}
            <button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : 'Save Deal'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
// Source: React 19 useActionState — replaces deprecated useFormState
```

### Pattern 3: File upload to Supabase Storage (browser direct)

```typescript
// Inside FilesSection Client Component
'use client'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { insertDealFileAction } from '@/lib/actions/file-actions'

async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, dealId: string) {
  const file = e.target.files?.[0]
  if (!file) return

  if (file.size > 50 * 1024 * 1024) {
    toast.error('File too large. Maximum 50MB.')
    return
  }

  setUploading(true)
  const supabase = createSupabaseBrowserClient()
  const path = `${userId}/${dealId}/${Date.now()}-${file.name}`

  const { error } = await supabase.storage
    .from('deal-files')
    .upload(path, file, { upsert: false })

  if (error) {
    toast.error('Failed to upload file.')
    setUploading(false)
    return
  }

  // Save record to deal_files table via Server Action
  await insertDealFileAction({ dealId, storagePath: path, fileName: file.name })
  toast.success('File uploaded.')
  setUploading(false)
}
// Source: Supabase Storage JS client docs + ARCHITECTURE.md Q4 pattern
```

### Pattern 4: OM page — service role, force-dynamic, no cookies()

```typescript
// app/om/[id]/page.tsx
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export default async function OmPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // createSupabaseServiceClient uses service role — bypasses RLS
  // MUST NOT call cookies() anywhere in this render tree
  const supabase = createSupabaseServiceClient()

  const { data: deal } = await supabase
    .from('deals')
    .select('*')
    .eq('id', id)
    .single()

  if (!deal) return <div>Deal not found.</div>

  // images: query deal_files where storage_path starts with 'om-images/'
  // For public bucket URLs: supabase.storage.from('om-images').getPublicUrl(path)

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      {/* UI-SPEC layout: top bar → hero → details grid → description → images → footer */}
    </main>
  )
}
// Source: ARCHITECTURE.md Q2 + SUMMARY.md Phase 2 must-avoid list
```

### Pattern 5: Server Component single-fetch for Deal Hub

```typescript
// app/(app)/deals/[id]/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'

export default async function DealHubPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Single compound fetch — avoid N+1 (see Anti-Patterns)
  const [dealResult, notesResult, filesResult] = await Promise.all([
    supabase.from('deals').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('notes').select('*').eq('deal_id', id).order('created_at', { ascending: false }),
    supabase.from('deal_files').select('*').eq('deal_id', id).order('created_at', { ascending: false }),
  ])

  if (!dealResult.data) notFound()

  // Generate signed URLs server-side before passing to client
  const filesWithUrls = await Promise.all(
    (filesResult.data ?? []).map(async (f) => {
      const { data } = await supabase.storage
        .from('deal-files')
        .createSignedUrl(f.storage_path, 3600)
      return { ...f, signedUrl: data?.signedUrl ?? null }
    })
  )

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-900 p-8">
      {/* Section 1: Deal Details */}
      {/* Section 2: Notes (Client Component) */}
      {/* Section 3: Files (Client Component) */}
    </div>
  )
}
// Source: ARCHITECTURE.md Q6 + Anti-Pattern 3 (avoid N+1)
```

### Pattern 6: Signed URL generation and next.config.ts image domains

```typescript
// next.config.ts — update in Wave 0
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',  // Supabase Storage CDN hostname pattern
        pathname: '/storage/v1/**',
      },
    ],
  },
}

export default nextConfig
// Note: Comment in existing next.config.ts explicitly flags this for Phase 2.
// Source: ASSUMED (Next.js image docs + Supabase Storage URL format) — verify hostname
// after project is linked. Actual hostname: <project-ref>.supabase.co
```

### Anti-Patterns to Avoid

- **cookies() in OM page render tree:** Any call to `cookies()` in the OM page or a Server Component it renders makes the page dynamic AND attempts to read session cookies. Since buyers have no session, this causes auth errors. Use `createSupabaseServiceClient()` (which uses `createClient` with service role, not `createServerClient`). [VERIFIED: codebase — lib/supabase/service.ts uses `createClient` not `createServerClient`]

- **Fetching data per-component on Deal Hub:** Calling Supabase in `<NotesSection>`, `<FilesSection>`, and `<DealHeader>` separately causes 3+ serial round-trips. Fetch all data in the page Server Component and pass as props. [VERIFIED: ARCHITECTURE.md Anti-Pattern 3]

- **getSession() in Server Action auth check:** Server Actions must call `getUser()` not `getSession()`. The existing action pattern in `app/auth/login/actions.ts` confirms `createSupabaseServerClient()` + `getUser()`. Never deviate. [VERIFIED: codebase]

- **useFormState instead of useActionState:** React 19 uses `useActionState` (from `react`). `useFormState` is from `react-dom` and deprecated. Phase 1 action patterns don't use either directly — the deal form modal will use `useActionState`. [ASSUMED — verify React 19 API]

- **Modal state in URL (searchParams):** Tempting but incorrect. Modals open/close state belongs in React `useState` inside the Client Component. No URL manipulation needed for v1 create/edit modal. [ASSUMED standard Next.js modal pattern]

- **Public bucket for deal-files:** Private broker documents in a public bucket means any guessed URL exposes sensitive files. deal-files bucket MUST be private with signed URL access. Only `om-images` is public. [VERIFIED: ARCHITECTURE.md Q4, STATE.md two-bucket decision]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom validation logic | zod + react-hook-form (already installed) | Handles nested errors, async validation, FormMessage display |
| Confirmation dialogs | Custom modal with confirm/cancel logic | shadcn AlertDialog (add via CLI) | Accessible, keyboard-dismissable, correct focus trap |
| Toast notifications | Custom toast state | sonner (already installed, components/ui/sonner.tsx) | Stacking, auto-dismiss, error/success variants |
| Status badge styling | Custom badge div with className logic | shadcn Badge (add via CLI) + variant | CVA-based, consistent with design system |
| File size validation | Custom bytes calculation | Standard `file.size > 50 * 1024 * 1024` check — 3 lines | Not complex enough for a library, but DO enforce it |
| Signed URL caching | LRU cache or Redis | None — regenerate per page load (1hr expiry) | At v1 scale, regenerating on each Server Component render is fine |
| Database migrations | Manual SQL execution | `supabase db push` or dashboard SQL editor | Schema already in place; only Storage bucket creation needed |

**Key insight:** All the infrastructure complexity is already resolved by Phase 1. Phase 2 is building UX on top of a complete, working schema with enforced RLS. Don't re-architect what already works.

---

## Common Pitfalls

### Pitfall 1: OM page accidentally calling cookies()

**What goes wrong:** If any import or Server Component in the `/om/[id]` render tree calls `cookies()` (e.g., by importing `createSupabaseServerClient` instead of `createSupabaseServiceClient`), Next.js throws an error because `cookies()` is not available in static/unauthenticated contexts.
**Why it happens:** Easy to grab the wrong import — `createSupabaseServerClient` is used everywhere else.
**How to avoid:** The OM page file imports ONLY `createSupabaseServiceClient` from `@/lib/supabase/service`. That module has `import 'server-only'` as its first line (preventing accidental client inclusion) and uses `createClient` (not `createServerClient`). Never add `createSupabaseServerClient` to the OM page's import list.
**Warning signs:** TypeScript error "cookies is not a function" at runtime; 500 error when accessing `/om/[id]` without a session.

### Pitfall 2: Modal open/close state causing Server Action re-render loops

**What goes wrong:** If the modal's open state is derived from `useActionState` result (e.g., closing on `state.success === true`), a race condition can keep re-opening the modal after form reset.
**How to avoid:** Use separate `useState` for `open`. Close the modal explicitly in the `onOpenChange` handler AND in the form submit success path. Reset form state after close.
**Warning signs:** Modal flickers or re-opens after successful submission.

### Pitfall 3: File upload succeeds in Storage but deal_files record fails to insert

**What goes wrong:** If the Server Action that inserts into `deal_files` fails (e.g., RLS violation, network error) after the browser already uploaded to Storage, the file exists in the bucket but is orphaned — no DB record to display or delete it.
**How to avoid:** Check RLS on `deal_files` — the policy requires `auth.uid()` to match the deal's `user_id` via EXISTS subquery. The browser upload uses the user's anon key (RLS enforced on Storage). The `deal_files` INSERT uses the same user session. Ensure the Server Action is called with the authenticated server client, not the browser client.
**Warning signs:** Files appear in Supabase Storage dashboard but don't show in the Deal Hub file list.

### Pitfall 4: Supabase Storage bucket not created before first upload attempt

**What goes wrong:** The schema defines `deal_files.storage_path` but Storage buckets (`deal-files`, `om-images`) are not created by migrations — they must be created via the Supabase Dashboard or CLI. If buckets don't exist, all upload calls return 404.
**How to avoid:** Wave 0 of the plan must include a task to create both buckets with correct settings: `deal-files` (private, no public access), `om-images` (public). This is a one-time manual step.
**Warning signs:** `supabase.storage.from('deal-files').upload(...)` returns `{ error: { message: "Bucket not found" } }`.

### Pitfall 5: next.config.ts missing remotePatterns for Supabase Storage images

**What goes wrong:** The OM page renders images from the `om-images` public bucket using `<Image>` (Next.js image optimization). Without adding `*.supabase.co` to `remotePatterns`, Next.js throws "hostname not configured" error in production.
**How to avoid:** Wave 0 includes updating `next.config.ts` with the correct `remotePatterns`. The existing file has a comment explicitly flagging this for Phase 2. [VERIFIED: codebase — next.config.ts comment "Phase 2 will add: images.remotePatterns for Supabase Storage URLs"]
**Alternative:** Use a plain `<img>` tag in the OM page instead of `<Image>` to avoid the remotePatterns requirement. Acceptable for v1 since the OM page is not the broker-facing app. UI-SPEC uses `<img>` implicitly (no mention of Next.js Image component for OM page).

### Pitfall 6: shadcn CLI interactive prompts with React 19

**What goes wrong:** `npx shadcn@latest add dialog` prompts interactively for React 19 peer dep resolution — blocks CI or automated execution.
**Why it happens:** Documented in Phase 1 SUMMARY.md — shadcn CLI peer dep resolution is interactive for React 19.
**How to avoid:** Pre-install Radix packages with `--legacy-peer-deps`, then run the shadcn CLI or write component files manually from canonical source. The `components.json` configuration is already correct (new-york, zinc, cssVariables). [VERIFIED: codebase — Phase 1 SUMMARY.md confirms this issue and resolution]

### Pitfall 7: Deal delete not cascading correctly

**What goes wrong:** Deleting a deal leaves orphaned notes and files in Storage (even if DB records are deleted by CASCADE).
**Why it happens:** `ON DELETE CASCADE` in the schema handles `notes`, `deal_files`, `activities`, `deal_buyers` DB records. BUT the actual files in Supabase Storage are NOT deleted by the DB cascade — only the `deal_files` table row is deleted.
**How to avoid:** The delete deal Server Action must: (1) fetch all `deal_files.storage_path` rows for the deal, (2) call `supabase.storage.from('deal-files').remove([...paths])`, (3) then delete the deal row (which cascades DB children). For v1, a note in the plan is sufficient — if Storage cleanup fails, the files are inaccessible (no DB record to resolve signed URL) but waste storage quota.
**Warning signs:** Storage bucket accumulates files with no corresponding DB rows.

---

## Code Examples

### Zod schema for deal form (shared between client validation and Server Action)

```typescript
// lib/actions/deal-actions.ts — zod schema (matches UI-SPEC Interaction Contracts)
import { z } from 'zod'

export const DealSchema = z.object({
  title:       z.string().min(2, 'Deal title is required'),
  address:     z.string().min(5, 'Address is required'),
  price:       z.string().min(1, 'Asking price is required'),  // stored as text
  status:      z.enum(['active', 'negotiating', 'closed']).default('active'),
  description: z.string().optional(),
})
export type DealFormValues = z.infer<typeof DealSchema>
// Source: CONTEXT.md "Deal form fields" + UI-SPEC "Deal Create/Edit Form Validation"
```

### Status badge colors (per UI-SPEC)

```typescript
// components/deals/deal-card.tsx
import { Badge } from '@/components/ui/badge'

const statusConfig = {
  active:      { label: 'Active',      className: 'bg-green-500/10 text-green-500 border-green-500/20' },
  negotiating: { label: 'Negotiating', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  closed:      { label: 'Closed',      className: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
} as const

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.active
  return <Badge className={config.className}>{config.label}</Badge>
}
// Source: UI-SPEC Color section — status badge colors per CONTEXT.md Claude's Discretion
```

### Server-side signed URL generation

```typescript
// Inside Deal Hub page.tsx — server-side signed URL generation
const filesWithUrls = await Promise.all(
  (filesResult.data ?? []).map(async (f) => {
    const { data } = await supabase.storage
      .from('deal-files')
      .createSignedUrl(f.storage_path, 3600) // 1 hour expiry
    return { ...f, signedUrl: data?.signedUrl ?? null }
  })
)
// Source: ARCHITECTURE.md Q4 — "generate a signed URL server-side"
// Note: Supabase signedUrl returns null on error — handle gracefully in UI
```

### Storage bucket Storage RLS policy (for Wave 0 setup task)

```sql
-- Storage RLS for deal-files bucket
-- Policy: users can only upload/read from their own user_id prefix
-- Create via Supabase Dashboard: Storage → deal-files bucket → Policies

-- Allow authenticated users to upload to their own prefix
CREATE POLICY "Users can upload to own prefix"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'deal-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to read their own files
CREATE POLICY "Users can read own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'deal-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'deal-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
-- Source: ARCHITECTURE.md Q4 — path convention "{user_id}/{deal_id}/{filename}"
-- [ASSUMED: storage.foldername() function — verify against Supabase Storage docs]
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useFormState` (react-dom) | `useActionState` (react) | React 19 | Must use `useActionState` from `'react'` — `useFormState` deprecated |
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | Supabase SSR v0.1+ | CLAUDE.md bans the deprecated package; never import it |
| getSession() server-side | getUser() only | Ongoing Supabase security guidance | getSession() trusts cookie without validation — silent security hole |
| tailwind.config.ts darkMode: ['class'] | @custom-variant dark in globals.css | Tailwind v4 | Already implemented in Phase 1 — do not add tailwind.config.ts |
| next/image with unverified domains | remotePatterns (hostname + pathname) | Next.js 13+ | next.config.ts needs update for Supabase Storage image URLs |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: banned by CLAUDE.md, do not use anywhere
- `useFormState` from `react-dom`: replaced by `useActionState` from `react` in React 19
- `tailwind.config.ts`: not used in this project (Tailwind v4); all config in `globals.css`

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `storage.foldername()` is the correct Supabase Storage RLS helper for path prefix checks | Code Examples — Storage RLS policy | Storage RLS policy won't enforce per-user isolation; wrong function name causes policy creation to fail |
| A2 | `*.supabase.co` wildcard works in Next.js `remotePatterns` hostname field | Pattern 6 (next.config.ts) | Next.js Image component errors on OM page images; fallback: use plain `<img>` tag |
| A3 | `useActionState` from `react` is available and correct API in React 19.1.0 | Pattern 2 (modal) | Form submissions don't work; fallback: use `useState` + manual fetch call |
| A4 | shadcn Dialog component accepts `open` + `onOpenChange` as controlled props | Pattern 2 (modal) | Modal state control doesn't work as expected |

---

## Open Questions (RESOLVED)

1. **Storage bucket creation method**
   - What we know: Buckets must exist before uploads; `deal-files` (private), `om-images` (public); schema migrations don't create buckets
   - What's unclear: Whether `supabase db push` or the Supabase CLI can create buckets programmatically, or if it requires the Dashboard
   - Recommendation: Wave 0 task includes a documented manual step with exact Dashboard instructions, plus a verification step confirming buckets exist before proceeding

2. **OM images — where they come from in Phase 2**
   - What we know: OM-03 requires images on the OM page; `om-images` bucket is public; Phase 2 has no UI for uploading specifically to om-images
   - What's unclear: The UI-SPEC says "if images exist in `om-images` bucket" — but Phase 2 has no upload flow targeted at om-images
   - Recommendation: For Phase 2, the OM page gracefully shows no images section if `om-images` bucket has no files for the deal. Actual image upload to om-images can be the same FileUploader component with a toggle/checkbox "include in OM" — or simply treat all uploaded files in `deal-files` with image MIME types as OM-eligible. Planner should decide: either add a second upload target or make the images section blank for Phase 2.

3. **Deal Hub active nav state in sidebar**
   - What we know: `sidebar-nav.tsx` highlights nav items based on `pathname.startsWith(matchPrefix)`. Currently has `matchPrefix: '/dashboard'` for Deals.
   - What's unclear: `/deals/[id]` won't match `/dashboard` — the sidebar "Deals" item won't highlight when on the Deal Hub page.
   - Recommendation: Update sidebar-nav to add `/deals` as an additional match prefix for the Deals nav item, OR add a separate navItem for `/deals` with the same label (hidden, just for path matching).

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build, CLI | Yes | v25.8.0 | — |
| npm | Package install | Yes | 11.11.0 | — |
| supabase CLI | Bucket creation verification | Yes | 2.95.4 | Manual Dashboard |
| Supabase project (linked) | DB migrations, Storage | Yes (linked per .temp/) | — | — |
| Next.js dev server | Development | Yes (next@15.5.15 installed) | 15.5.15 | — |

**Missing dependencies with no fallback:** None.

**Notes:**
- Supabase Storage buckets must be created manually via Dashboard or `supabase storage create` CLI before first upload [ASSUMED: CLI supports storage bucket creation in v2.95.4]
- `SUPABASE_SERVICE_ROLE_KEY` must be populated in `.env.local` (confirmed from Phase 1 setup) for the OM page to function

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected (no jest.config, no vitest.config, no playwright.config in project root) |
| Config file | None — Wave 0 gap |
| Quick run command | `npm run build && npx tsc --noEmit` (build/type check as proxy for correctness) |
| Full suite command | `npm run build && npx tsc --noEmit` |

**Note:** The project has no automated test infrastructure. Phase 1 verification used `npm run build` (0 errors) + `npx tsc --noEmit` (0 type errors) as the green-light signal. Phase 2 should follow the same pattern. UAT (manual browser testing) is the primary verification method per the Phase 1 SUMMARY.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | Infrastructure Exists? |
|--------|----------|-----------|-------------------|------------------------|
| DEAL-01 | Create deal → appears in dashboard list | Manual (browser) | `npm run build` (type-checks action signatures) | Build only |
| DEAL-02 | Edit/delete deal → reflects in UI | Manual (browser) | `npm run build` | Build only |
| DEAL-03 | Status badge displays correct color per status | Manual (browser) | `npm run build` | Build only |
| DEAL-04 | Dashboard shows cards + empty state + New Deal button | Manual (browser) | `npm run build` | Build only |
| NOTE-01–03 | Add/edit/delete notes inline on Deal Hub | Manual (browser) | `npm run build` | Build only |
| FILE-01 | Upload file → appears in file list | Manual (browser) | `npm run build` | Build only |
| FILE-02 | Download link opens signed URL in new tab | Manual (browser) | `npm run build` | Build only |
| OM-01–03 | /om/[id] accessible without auth, shows deal data + images | Manual (browser + incognito) | `npm run build` | Build only |

### Sampling Rate

- **Per task commit:** `npm run build && npx tsc --noEmit`
- **Per wave merge:** `npm run build && npx tsc --noEmit` + browser smoke test of each delivered feature
- **Phase gate:** Full manual UAT checklist before `/gsd-verify-work`

### Wave 0 Gaps

No automated test framework to install. Verification is build + manual UAT, consistent with Phase 1 approach.

- [ ] Update `next.config.ts` with `images.remotePatterns` for Supabase Storage
- [ ] Create Storage buckets: `deal-files` (private) and `om-images` (public) — manual step
- [ ] Add Storage RLS policies to `deal-files` bucket (or migration `004_storage_rls.sql`)
- [ ] Install shadcn components: `npx shadcn@latest add dialog textarea badge separator alert-dialog select`
- [ ] Sidebar nav: add `/deals` path match for "Deals" active state

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Yes | `getUser()` in every Server Action (CLAUDE.md rule); layout already checks auth |
| V3 Session Management | No | Handled by Phase 1 middleware + Supabase Auth |
| V4 Access Control | Yes | RLS on all tables (already in place); Storage bucket RLS policies (Wave 0 task) |
| V5 Input Validation | Yes | zod schema validation in every Server Action; client-side validation via react-hook-form |
| V6 Cryptography | No | Not applicable — signed URLs handled by Supabase SDK |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| IDOR — accessing another broker's deal by guessing UUID | Elevation of Privilege | RLS `user_id = auth.uid()` on deals table; Server Action validates user owns deal |
| Unauthenticated access to private files via Storage path guessing | Elevation of Privilege | deal-files bucket is private; signed URLs with 1hr expiry; Storage RLS policies |
| Server Action called without valid session (CSRF-like) | Spoofing | `getUser()` in every mutation Server Action — returns null user on invalid session → redirect |
| XSS via deal description rendered in OM page | Tampering | React Server Component renders — React escapes HTML by default; no `dangerouslySetInnerHTML` |
| Service role key exposure | Information Disclosure | `lib/supabase/service.ts` has `import 'server-only'` — prevents client bundle inclusion; key not in NEXT_PUBLIC_* |

---

## Project Constraints (from CLAUDE.md)

These directives are mandatory. Research recommendations do not contradict any of them.

| Directive | Applied In Phase 2 |
|-----------|-------------------|
| Use `@supabase/ssr`, NEVER `@supabase/auth-helpers-nextjs` | All client factories use `@supabase/ssr` |
| Server-side auth: always `getUser()`, NEVER `getSession()` | Every Server Action and Server Component calls `getUser()` |
| Middleware matcher: explicitly exclude `/om/*` and `/api/track/*` | Already done in Phase 1 middleware.ts (VERIFIED) |
| Service role key: server-only modules only, NEVER `NEXT_PUBLIC_*` | `lib/supabase/service.ts` uses `import 'server-only'` and `SUPABASE_SERVICE_ROLE_KEY` |
| RLS: every table gets RLS + policy in the same migration, no exceptions | All 6 tables have RLS (migrations 001+002); Storage bucket RLS is Wave 0 task |
| OM tracking: URL-based (`?ref=[token]`) is PRIMARY signal; pixel is secondary | Out of scope for Phase 2; Phase 3 concern |
| No Zustand/Redux — server components + server actions + `revalidatePath` only | All mutations use Server Actions + `revalidatePath`; no client state library |

---

## Sources

### Primary (HIGH confidence)
- `supabase/migrations/001_initial_schema.sql` — schema verified; all 6 tables exist [VERIFIED: codebase]
- `supabase/migrations/002_rls_policies.sql` — all RLS policies verified [VERIFIED: codebase]
- `middleware.ts` — `/om/*` exclusion confirmed in matcher [VERIFIED: codebase]
- `lib/supabase/service.ts` — service client pattern confirmed [VERIFIED: codebase]
- `lib/supabase/server.ts` — server client pattern confirmed [VERIFIED: codebase]
- `lib/supabase/client.ts` — browser client pattern confirmed [VERIFIED: codebase]
- `package.json` — all installed dependencies and versions [VERIFIED: codebase]
- `components.json` — shadcn config: new-york, zinc, cssVariables [VERIFIED: codebase]
- `.planning/phases/02-deal-hub/02-CONTEXT.md` — user decisions [VERIFIED: codebase]
- `.planning/phases/02-deal-hub/02-UI-SPEC.md` — visual/interaction contract [VERIFIED: codebase]
- `.planning/research/ARCHITECTURE.md` — data model, component boundaries, patterns [VERIFIED: codebase]
- `.planning/research/SUMMARY.md` — critical pitfalls and decisions [VERIFIED: codebase]
- `.planning/phases/01-foundation/01-01-SUMMARY.md` — Phase 1 patterns and deviations [VERIFIED: codebase]

### Secondary (MEDIUM confidence)
- Next.js 15 App Router Server Actions docs — `useActionState` from React 19, `revalidatePath` usage [CITED: nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations]
- Supabase Storage JS client docs — `.upload()`, `.createSignedUrl()`, `.remove()` [CITED: supabase.com/docs/reference/javascript/storage-from-upload]
- shadcn/ui component registry — Dialog, AlertDialog, Select, Badge, Separator, Textarea [CITED: ui.shadcn.com]

### Tertiary (LOW confidence — see Assumptions Log)
- `storage.foldername()` in Storage RLS policies [ASSUMED — not verified against current Supabase docs]
- `*.supabase.co` wildcard in Next.js remotePatterns [ASSUMED — pattern based on training knowledge]

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — all packages verified against installed package.json; versions confirmed
- Architecture: HIGH — patterns lifted directly from ARCHITECTURE.md and verified against live codebase
- Pitfalls: HIGH — most pitfalls verified against existing code or Phase 1 SUMMARY.md; A1/A2 tagged ASSUMED
- UI/Interaction: HIGH — UI-SPEC is locked and complete; all component names and copy verified

**Research date:** 2026-04-28
**Valid until:** 2026-05-28 (stable stack — no fast-moving dependencies)
