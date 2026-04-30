# Phase 3: Buyers, Send, and Tracking — Research

**Researched:** 2026-04-30
**Domain:** Buyer CRM, Resend email API, Supabase tracking, Next.js 15 Server Actions
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** "Send OM" = single modal combining buyer selection + send. One Server Action.
- **D-02:** Success = toast ("OM sent to N buyers") + modal closes. `revalidatePath` refreshes activity log.
- **D-03:** Re-send allowed. Modal shows `om_sent_at` badge per buyer. Tracking token is stable.
- **D-04:** Buyers page = table layout. Columns: Name, Email, Tags, Actions.
- **D-05:** Create/edit buyer via modal form (BuyerFormModal). Edit opens modal prefilled. Delete = AlertDialog.
- **D-06:** Empty state: "No buyers yet. Add your first buyer." + New Buyer button.
- **D-07:** Activity log at bottom of Deal Hub, after Files section.
- **D-08:** Activity log = simple text list with timestamps, descending sort.
- **D-09:** Events: `om_sent`, `om_opened`, `note_added`, `file_uploaded`. Metadata JSONB stores buyer name/email or file_name.
- **D-10:** Phase 3 backfills `createNoteAction` and `insertDealFileAction` with `activities` INSERT.
- **D-11:** Tag input = pill/chip UI. Enter or comma creates chip. Stored as `TEXT[]`.
- **D-12:** URL-based tracking (PRIMARY): OM Server Component checks `searchParams.ref`, records first open via service role.
- **D-13:** Pixel tracking (SECONDARY): `/api/track/[token]` returns 1x1 GIF, idempotently sets `om_opened_at`.
- **D-14:** Resend email body includes unique OM URL. No Resend proprietary open tracking.

### Claude's Discretion
- Email template copy and layout (subject line, body text) — clean plain-text style, deal title in subject, brief intro, OM link as prominent button.
- Exact table row action placement — icon buttons (Pencil + Trash2) in actions column.
- Activity log empty state copy — "No activity yet."
- TagInput implementation — lightweight client component, no external library.

### Deferred Ideas (OUT OF SCOPE)
- Buyer tag-based filtering before Send OM (v2)
- Real-time activity log (WebSocket/SSE) — polling via revalidatePath is v1
- PDF OM export
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BUYER-01 | User can create a buyer with name, email, and tags | `buyers` table exists (001_initial_schema.sql); `buyer-actions.ts` pattern from `deal-actions.ts` |
| BUYER-02 | User can view and edit buyers | BuyerFormModal from DealFormModal blueprint; `useActionState` + `useRef` pattern confirmed |
| BUYER-03 | User can delete buyers | DeleteBuyerDialog from DeleteDealDialog blueprint; AlertDialog pattern confirmed |
| BUYER-04 | User can manually select buyers to associate with a deal | `deal_buyers` table exists with composite PK (deal_id, buyer_id); SendOmModal provides selection UI |
| SEND-01 | User can send OM link via email to selected buyers using Resend | Resend `batch.send()` up to 100 emails per request; `resend` npm package v6.12.2 |
| SEND-02 | Each buyer receives unique OM URL with tracking token | `deal_buyers.tracking_token` UUID column already in schema; `crypto.randomUUID()` available in Node 25.x |
| TRACK-01 | System records per-buyer OM open when buyer visits OM URL (URL-based, primary) | OM page uses `createSupabaseServiceClient()`; searchParams.ref pattern established |
| TRACK-02 | OM page embeds tracking pixel `/api/track/[token]` | New Route Handler; middleware already excludes `/api/track/*` |
| TRACK-03 | Each open event is idempotent (first-open only per buyer per deal) | `om_opened_at` null-check guards both URL tracking and pixel endpoint |
| ACT-01 | Deal Hub shows per-deal activity log: OM sent, note added, file uploaded | `activities` table exists; service-role INSERT confirmed; SELECT via deals join RLS |
| ACT-02 | Activity log shows per-buyer OM open events | Same `activities` table; `event_type = 'om_opened'` with buyer metadata in JSONB |
</phase_requirements>

---

## Summary

Phase 3 delivers the core product differentiator for RealTools. The entire implementation builds directly on patterns already established in Phases 1 and 2 — there are no new architectural paradigms to introduce. The database schema (buyers, deal_buyers, activities tables) was fully defined in migration 001 and is ready to use. RLS policies in migration 002 already enforce the correct access rules: activities INSERT is service-role-only, SELECT is via deals join.

The primary new external dependency is Resend (not yet installed). The SDK is straightforward: `resend.batch.send([])` handles per-buyer unique emails in a single API call (up to 100 per batch), which is sufficient for v1 broker volumes. Rate limit is 5 req/s per team — safe for this use case where batch.send() is one request regardless of recipient count.

The tracking architecture is already wired at the infrastructure level: middleware excludes `/api/track/*`, `createSupabaseServiceClient()` is established for unauthenticated service-role operations, and `om_opened_at` + `tracking_token` columns exist in `deal_buyers`. The only work is implementing the logic.

**Primary recommendation:** Execute in dependency order — (1) install Resend + add `checkbox` shadcn component, (2) buyers CRUD, (3) Send OM action + email, (4) tracking endpoints, (5) activity log + backfill. Each wave is independently deployable.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Buyer CRUD | API / Backend (Server Actions) | Frontend (modal UI) | Data mutations own server; modal is presentation only |
| Send OM emails | API / Backend (Server Action) | — | Resend API call must be server-side (secret key) |
| URL-based open tracking | Frontend Server (SSR) | — | OM page is a Server Component; reads searchParams |
| Pixel tracking | API / Backend (Route Handler) | — | Returns binary GIF; needs service role for DB write |
| Activity log display | Frontend Server (SSR) | — | Server Component reads activities via authenticated client |
| activities INSERT | API / Backend (service role) | — | RLS blocks user-scoped INSERT; service role bypasses RLS |
| TagInput chip UI | Browser / Client | — | Pure client interaction; no server state |
| deal_buyers association | API / Backend (Server Action) | — | Upsert pattern with `ON CONFLICT DO UPDATE` |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| resend | 6.12.2 | Transactional email via Resend API | Only new dependency; official Node SDK; `batch.send()` handles per-recipient unique emails |
| @radix-ui/react-checkbox | 1.3.3 | shadcn Checkbox primitive | Not yet installed; needed for SendOmModal buyer checklist per UI-SPEC |

[VERIFIED: npm registry — `npm view resend version` → 6.12.2; `npm view @radix-ui/react-checkbox version` → 1.3.3]

### Already in Project (no install needed)
| Library | Version | Purpose |
|---------|---------|---------|
| @supabase/ssr | 0.5.2 | Supabase client factories (server, browser, service) |
| @supabase/supabase-js | 2.104.1 | DB + Storage operations |
| zod | 3.25.76 | Schema validation for buyer form |
| sonner | 2.0.7 | Toast notifications |
| lucide-react | 1.11.0 | Pencil, Trash2, Loader2, Check icons |
| shadcn/ui | Already installed | dialog, alert-dialog, badge, button, input, label, separator |

### Installation (new dependencies only)
```bash
npm install resend
npx shadcn@latest add checkbox
```

---

## Architecture Patterns

### System Architecture Diagram

```
Browser (broker authenticated)
  │
  ├─ /buyers page (Server Component)
  │    └─ BuyersTable ← buyers SELECT (user RLS)
  │         ├─ BuyerFormModal → createBuyerAction / updateBuyerAction
  │         └─ DeleteBuyerDialog → deleteBuyerAction
  │
  ├─ /deals/[id] page (Server Component)
  │    ├─ SendOmModal → sendOmAction
  │    │    ├─ deal_buyers UPSERT (user RLS via deals join)
  │    │    ├─ activities INSERT om_sent (service role)
  │    │    └─ resend.batch.send([{to, html, ...}]) — one email per buyer
  │    │
  │    └─ ActivityLogSection ← activities SELECT (user RLS via deals join)
  │
/om/[deal-id]?ref=[token]  (Server Component — NO auth)
  │  createSupabaseServiceClient()
  ├─ deal_buyers lookup by tracking_token
  ├─ IF om_opened_at IS NULL → SET om_opened_at + INSERT activities om_opened
  └─ <img src="/api/track/[token]" />  ← secondary pixel

/api/track/[token]  (Route Handler — public, service role)
  ├─ deal_buyers lookup by tracking_token
  ├─ IF om_opened_at IS NULL → SET om_opened_at + INSERT activities om_opened
  └─ Response: 1x1 transparent GIF (Buffer)
```

### Recommended Project Structure (new files only)
```
lib/
├── actions/
│   ├── buyer-actions.ts      # CRUD for buyers table
│   └── send-om-action.ts     # Send OM + deal_buyers upsert + Resend batch
├── schemas/
│   └── buyer.ts              # BuyerSchema + BuyerState types
└── resend.ts                 # Resend client singleton (server-only)

components/
├── buyers/
│   ├── buyers-table.tsx      # BuyersTable server-rendered table
│   ├── buyer-form-modal.tsx  # BuyerFormModal (useActionState + useRef)
│   └── delete-buyer-dialog.tsx
├── deals/
│   ├── send-om-modal.tsx     # SendOmModal (useActionState + useRef)
│   └── activity-log-section.tsx
└── ui/
    └── tag-input.tsx         # TagInput chip component

app/
├── (app)/buyers/page.tsx     # Replace placeholder with real page
└── api/track/[token]/route.ts # Pixel tracking Route Handler
```

### Pattern 1: Resend Singleton (server-only module)
**What:** Initialize Resend client once, import in Server Actions
**When to use:** Anywhere email send is needed
```typescript
// Source: https://resend.com/docs/llms-full.txt
// lib/resend.ts
import 'server-only'
import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY!)
```

### Pattern 2: batch.send() for per-buyer unique emails
**What:** Single API call sends one email per buyer with unique OM URL
**When to use:** sendOmAction — each buyer gets a different `?ref=[token]`
```typescript
// Source: https://resend.com/docs/api-reference/emails/send-batch-emails
const { data, error } = await resend.batch.send(
  buyers.map((b) => ({
    from: 'RealTools <noreply@yourdomain.com>',
    to: [b.email],
    subject: `${deal.title} — Offering Memorandum`,
    html: buildOmEmailHtml({ buyerName: b.name, dealTitle: deal.title, omUrl: b.omUrl }),
  }))
)
if (error) return { errors: { general: ['Failed to send. Please try again.'] } }
```
**Critical:** Entire batch fails if any single email fails validation. Pre-validate all `to` addresses in Zod before calling batch.send().

### Pattern 3: Idempotent first-open tracking
**What:** Guard om_opened_at update with null check
**When to use:** Both OM page Server Component AND /api/track/[token] Route Handler
```typescript
// Source: [VERIFIED: from existing 002_rls_policies.sql and types/supabase.ts]
const supabase = createSupabaseServiceClient()

const { data: db } = await (supabase.from('deal_buyers') as any)
  .select('deal_id, buyer_id, om_opened_at')
  .eq('tracking_token', token)
  .single()

if (db && !db.om_opened_at) {
  await (supabase.from('deal_buyers') as any)
    .update({ om_opened_at: new Date().toISOString() })
    .eq('tracking_token', token)

  await (supabase.from('activities') as any).insert({
    deal_id: db.deal_id,
    event_type: 'om_opened',
    metadata: { buyer_id: db.buyer_id },
  })
}
```

### Pattern 4: deal_buyers UPSERT (re-send allowed)
**What:** Insert or update deal_buyers row — preserves stable tracking_token
**When to use:** sendOmAction when associating a buyer to a deal
```typescript
// tracking_token is stable — ON CONFLICT updates om_sent_at only, preserves token
// Source: [VERIFIED: 001_initial_schema.sql — deal_buyers PK is (deal_id, buyer_id)]
await (supabase.from('deal_buyers') as any)
  .upsert(
    { deal_id, buyer_id, om_sent_at: new Date().toISOString() },
    { onConflict: 'deal_id,buyer_id', ignoreDuplicates: false }
  )
```
**Critical:** Do NOT include `tracking_token` in the upsert update payload — let the DB default handle it on insert; omit it from update so existing token is preserved.

### Pattern 5: 1x1 transparent GIF Route Handler
**What:** Return minimal binary GIF as tracking pixel
**When to use:** /api/track/[token]/route.ts
```typescript
// Source: [ASSUMED — standard tracking pixel pattern]
const GIF_1x1 = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

return new Response(GIF_1x1, {
  status: 200,
  headers: {
    'Content-Type': 'image/gif',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    Pragma: 'no-cache',
  },
})
```

### Pattern 6: TagInput client component (hidden input serialization)
**What:** Pill/chip UI with hidden input for Server Action form submission
**When to use:** BuyerFormModal tags field
```typescript
// Source: [VERIFIED: 03-UI-SPEC.md D-11 spec]
// Hidden input serializes tags as JSON for server action to parse
<input type="hidden" name="tags" value={JSON.stringify(tags)} />
// Server action: JSON.parse(formData.get('tags') as string) → string[]
```

### Pattern 7: sendOmAction — parallel upsert + email
**What:** Associate all selected buyers, then send batch email
**When to use:** sendOmAction Server Action
```typescript
// Server Action flow:
// 1. getUser() → redirect if no session
// 2. Validate dealId + buyerIds from FormData
// 3. Fetch deal title + buyers (name, email) via user-scoped client
// 4. Fetch/create deal_buyers rows to get stable tracking_tokens
// 5. Upsert deal_buyers (om_sent_at = now())
// 6. Insert activities (om_sent per buyer) via service role
// 7. resend.batch.send([...]) — one email per buyer
// 8. revalidatePath(`/deals/${dealId}`)
```

### Anti-Patterns to Avoid
- **Creating Resend client inside Server Action:** Creates a new instance per call. Use the singleton in `lib/resend.ts`.
- **Using `getSession()` anywhere:** Project rule — always `getUser()`.
- **Forgetting `as any` cast on supabase.from():** The 2.104.x inference bug affects both reads and writes. Every `supabase.from('table')` call needs `as any`.
- **Including tracking_token in UPSERT update payload:** Overwrites stable token with new UUID on re-send. Only include `om_sent_at` in the update fields.
- **Not guarding om_opened_at before update:** Both tracking paths (URL + pixel) must check `om_opened_at IS NULL` before writing — race condition possible but idempotent result is correct.
- **Importing `createSupabaseServerClient` in OM page:** Already established — this throws for unauthenticated requests. OM page and track route use `createSupabaseServiceClient()` only.
- **Using `NEXT_PUBLIC_*` for RESEND_API_KEY:** Per CLAUDE.md — service secrets server-only, never `NEXT_PUBLIC_*`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email delivery | Custom SMTP relay | `resend.batch.send()` | Deliverability, bounce handling, unsubscribe compliance |
| UUID token generation | Custom random string | `crypto.randomUUID()` (built-in Node.js) OR let Postgres `gen_random_uuid()` handle it via DB default | Cryptographically secure; DB default already in schema for `deal_buyers.tracking_token` |
| Email HTML | Custom CSS framework | Inline HTML string with inline styles | Email clients strip `<style>` tags; inline is safest for deliverability |
| Checkbox UI | Custom checkbox | `npx shadcn@latest add checkbox` | Radix-based, accessible, matches project style system |

**Key insight:** The tracking_token already exists in the DB schema with a `gen_random_uuid()` default. No code-side UUID generation is needed for tokens — just upsert and let the DB assign on first insert. `crypto.randomUUID()` is available if needed elsewhere (Node.js 25.x confirmed).

---

## Runtime State Inventory

> Not applicable — this is a greenfield feature phase, not a rename/refactor/migration phase.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | ✓ | v25.8.0 | — |
| `resend` npm package | SEND-01, SEND-02 | ✗ (not installed) | — | `npm install resend` — no fallback needed |
| `@radix-ui/react-checkbox` | SendOmModal UI | ✗ (not in components/ui/) | — | `npx shadcn@latest add checkbox` — no fallback needed |
| Supabase service role key | Tracking, activities INSERT | ✓ (used in existing OM page) | — | — |
| Middleware `/api/track/*` exclusion | TRACK-02 Route Handler | ✓ (confirmed in middleware.ts) | — | — |
| `crypto.randomUUID()` | Token generation (if needed) | ✓ (Node.js 25.x) | — | — |

**Missing dependencies with no fallback:**
- `resend` package — must install before Wave with email send
- `@radix-ui/react-checkbox` (via shadcn) — must install before Wave with SendOmModal

**Missing dependencies with fallback:**
- None

---

## Common Pitfalls

### Pitfall 1: Overwriting Stable Tracking Token on Re-send
**What goes wrong:** If `tracking_token` is included in the upsert update payload, each re-send generates a new UUID. Any previously sent email link becomes invalid — buyer opens old link, token not found.
**Why it happens:** Supabase `upsert()` with `ignoreDuplicates: false` updates ALL specified columns on conflict.
**How to avoid:** Only specify `{ om_sent_at }` in the update object. The DB default handles token assignment on first insert.
**Warning signs:** `deal_buyers` rows have different `tracking_token` values after multiple sends of the same deal-buyer pair.

### Pitfall 2: Resend batch.send() All-or-Nothing Validation
**What goes wrong:** If any email in the batch has an invalid `to` address, the entire batch fails (no emails sent).
**Why it happens:** Resend validates all emails before sending any.
**How to avoid:** Validate all buyer email addresses with Zod (`z.string().email()`) before calling `batch.send()`. Return a user-visible error if any buyer has invalid email.
**Warning signs:** `error` object returned from `batch.send()` despite most emails being valid.

### Pitfall 3: supabase.from() as any Missing on New Queries
**What goes wrong:** TypeScript error `Relation = never` — supabase-js 2.104.x inference bug. Build fails.
**Why it happens:** The `__InternalSupabase.PostgrestVersion: "14.5"` type causes `from()` to return `never`.
**How to avoid:** Every `supabase.from('table')` call in the codebase uses `as any` cast. New actions for `buyers`, `deal_buyers`, `activities` must follow the same pattern.
**Warning signs:** TypeScript errors mentioning `Relation` or `never` on supabase query chains.

### Pitfall 4: activities INSERT Blocked by RLS
**What goes wrong:** Activities INSERT fails silently when using user-scoped client instead of service client.
**Why it happens:** RLS policy on `activities` grants SELECT only to authenticated users (via deals join). INSERT has no user-scoped policy — intentional design for service-role-only writes.
**How to avoid:** All `activities` INSERT operations MUST use `createSupabaseServiceClient()`. The `sendOmAction` and tracking endpoints already use service role; the backfill to `createNoteAction` and `insertDealFileAction` must import and use service client for the activities INSERT step only (the primary note/file operation uses the user-scoped client as before).
**Warning signs:** Activities table appears empty despite actions completing successfully.

### Pitfall 5: OM Page searchParams Access in Next.js 15
**What goes wrong:** `searchParams` in App Router page props is now a Promise in Next.js 15 — must be awaited.
**Why it happens:** Next.js 15 made `searchParams` async (breaking change from 14).
**How to avoid:** In `app/om/[id]/page.tsx`, destructure searchParams from the resolved Promise: `const { id } = await params` pattern is already used for `params`. Apply same pattern for `searchParams`:
```typescript
// Next.js 15 App Router — both params AND searchParams are Promises
export default async function OmPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ ref?: string }>
}) {
  const { id } = await params
  const { ref } = await searchParams
  // ...
}
```
**Warning signs:** `searchParams.ref` always undefined; TypeScript error on direct property access.

### Pitfall 6: FormData Checkbox Values in Server Action
**What goes wrong:** shadcn `Checkbox` does not submit a native HTML checkbox value via `FormData`. Its `name`/`value` attributes are not native form inputs.
**Why it happens:** Radix `Checkbox` is a button-based component, not a native `<input type="checkbox">`. FormData only includes native inputs.
**How to avoid:** In `SendOmModal`, collect selected buyer IDs in client state (array), then serialize to a hidden `<input type="hidden" name="buyerIds" value={JSON.stringify(selectedIds)} />` for the server action to parse. This mirrors the TagInput hidden-input pattern.
**Warning signs:** Server action receives empty `buyerIds` despite checkboxes being checked.

### Pitfall 7: Resend API Key in Environment
**What goes wrong:** `RESEND_API_KEY` not set in `.env.local` or Vercel env → runtime error on first email send.
**Why it happens:** Key not automatically provisioned.
**How to avoid:** Wave 0 task must verify `RESEND_API_KEY` exists in `.env.local`. Document in plan that Vercel env var must be set before deployment.
**Warning signs:** `new Resend(undefined)` — Resend throws immediately on send attempt.

---

## Code Examples

### Buyer Schema (lib/schemas/buyer.ts)
```typescript
// Source: [VERIFIED: mirrors lib/schemas/deal.ts pattern]
import { z } from 'zod'

export const BuyerSchema = z.object({
  name:  z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  tags:  z.array(z.string()).default([]),
})

export type BuyerFormValues = z.infer<typeof BuyerSchema>

export type BuyerState = {
  errors?: {
    name?:    string[]
    email?:   string[]
    tags?:    string[]
    general?: string[]
  }
}
```

### Resend singleton (lib/resend.ts)
```typescript
// Source: https://resend.com/docs/llms-full.txt
import 'server-only'
import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY!)
```

### OM Email HTML builder
```typescript
// Source: [ASSUMED — inline style pattern for email deliverability]
export function buildOmEmailHtml({
  buyerName,
  dealTitle,
  omUrl,
  appBaseUrl,
}: {
  buyerName: string
  dealTitle: string
  omUrl: string
  appBaseUrl: string
}): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#18181b">
      <p style="font-size:16px;margin-bottom:16px">Hi ${buyerName},</p>
      <p style="font-size:16px;margin-bottom:24px">
        Please find the offering memorandum for <strong>${dealTitle}</strong> at the link below.
      </p>
      <a href="${omUrl}"
         style="display:inline-block;background:#18181b;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:600">
        View Offering Memorandum
      </a>
      <p style="font-size:12px;color:#71717a;margin-top:32px">
        This email was sent by your broker via RealTools.
      </p>
    </div>
  `
}
```

### sendOmAction skeleton
```typescript
// Source: [VERIFIED: mirrors deal-actions.ts + Resend batch.send() docs]
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { resend } from '@/lib/resend'
import { buildOmEmailHtml } from '@/lib/email/om-email'
import type { Database } from '@/types/supabase'

type ActivityInsert = Database['public']['Tables']['activities']['Insert']

export async function sendOmAction(
  _prevState: SendOmState,
  formData: FormData
): Promise<SendOmState> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const dealId = formData.get('dealId') as string
  const buyerIdsRaw = formData.get('buyerIds') as string
  const buyerIds: string[] = JSON.parse(buyerIdsRaw ?? '[]')

  if (!dealId || buyerIds.length === 0) {
    return { errors: { general: ['Select at least one buyer.'] } }
  }

  // Fetch deal (user-scoped) + buyers (user-scoped)
  // ...upsert deal_buyers, insert activities, call resend.batch.send()
  // All supabase.from() calls use `as any` cast

  revalidatePath(`/deals/${dealId}`)
  return {}
}
```

### Pixel tracking Route Handler
```typescript
// Source: [VERIFIED: middleware.ts confirms /api/track/* is excluded from auth]
// app/api/track/[token]/route.ts
import { NextRequest } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

const GIF_1x1 = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = createSupabaseServiceClient()

  const { data: db } = await (supabase.from('deal_buyers') as any)
    .select('deal_id, buyer_id, om_opened_at')
    .eq('tracking_token', token)
    .single()

  if (db && !db.om_opened_at) {
    await (supabase.from('deal_buyers') as any)
      .update({ om_opened_at: new Date().toISOString() })
      .eq('tracking_token', token)
    await (supabase.from('activities') as any).insert({
      deal_id: db.deal_id,
      event_type: 'om_opened',
      metadata: { buyer_id: db.buyer_id },
    } satisfies { deal_id: string; event_type: string; metadata: object })
  }

  return new Response(GIF_1x1, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
    },
  })
}
```

---

## Database Schema Status

**All tables exist.** No new migrations needed for core schema. Existing state:

| Table | Status | Notes |
|-------|--------|-------|
| `buyers` | READY | `id, user_id, name, email, tags TEXT[], created_at` — [VERIFIED: 001_initial_schema.sql] |
| `deal_buyers` | READY | `deal_id, buyer_id, tracking_token UUID DEFAULT gen_random_uuid(), om_sent_at, om_opened_at` — PK(deal_id, buyer_id) — [VERIFIED: 001_initial_schema.sql + types/supabase.ts] |
| `activities` | READY | `id, deal_id, event_type TEXT, metadata JSONB, created_at` — [VERIFIED: 001_initial_schema.sql + types/supabase.ts] |
| RLS on activities | READY | SELECT via deals join (user-scoped); INSERT = service role bypasses RLS — [VERIFIED: 002_rls_policies.sql] |
| RLS on buyers | READY | ALL via `auth.uid() = user_id` — [VERIFIED: 002_rls_policies.sql] |
| RLS on deal_buyers | READY | ALL via deals join — [VERIFIED: 002_rls_policies.sql] |

**Potential migration needed:** `activities` table has no `buyer_id` column directly — buyer identity is stored in `metadata JSONB`. When ActivityLogSection displays "OM opened by [Buyer Name]", it must join `metadata->>'buyer_id'` back to buyers table, OR the activity INSERT must include `buyer_name` in metadata directly to avoid the join. Recommendation: store `{ buyer_id, buyer_name, buyer_email }` in metadata at INSERT time — avoids join cost at query time. [VERIFIED: types/supabase.ts confirms metadata is JSONB — flexible schema]

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` only | Phase 1 decision | BANNED in this project |
| `getSession()` | `getUser()` | Phase 1 decision | Security requirement |
| `searchParams` sync access | `await searchParams` (Promise) | Next.js 15 | Must await in page component |
| `params` sync access | `await params` (Promise) | Next.js 15 | Already implemented in existing pages |
| Resend `resend.emails.send()` per loop | `resend.batch.send([])` single call | Current Resend SDK | Efficient, single API call for N emails |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Banned by CLAUDE.md; not in package.json
- Resend `resend.emails.send()` in a loop: Anti-pattern — use `batch.send()` instead

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | 1x1 GIF base64 string `R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7` is correct minimal transparent GIF | Code Examples (pixel handler) | Pixel would render broken image; use known-good base64 string instead |
| A2 | `resend.batch.send()` entire batch fails on single invalid address | Pitfall 2 | If partial success is supported, error handling strategy changes |
| A3 | Storing `{ buyer_name, buyer_email }` in activities metadata eliminates need for join in ActivityLogSection | Database Schema Status | If names change after event recorded, display shows stale name — acceptable for activity log |

**If this table is empty:** All other claims were verified via codebase inspection, npm registry, or official Resend documentation.

---

## Open Questions

1. **Resend sender domain**
   - What we know: Resend requires a verified domain for `from` address in production
   - What's unclear: Has `rbenirios09@gmail.com` verified a domain in Resend? Or will Resend's sandbox `onboarding@resend.dev` sender be used during development?
   - Recommendation: Plan includes a Wave 0 task to verify `RESEND_API_KEY` and `RESEND_FROM_EMAIL` env vars exist. Use `onboarding@resend.dev` as `from` during development; parameterize via env var.

2. **Activity log buyer name display**
   - What we know: `activities.metadata` is JSONB; no direct buyer_name column
   - What's unclear: Should the activity INSERT store `buyer_name` in metadata, or should ActivityLogSection join to `buyers` table?
   - Recommendation: Store `{ buyer_id, buyer_name }` in metadata at INSERT time. Avoids runtime join. Acceptable stale-name trade-off for an activity log.

3. **SendOmModal — fetch buyer list**
   - What we know: Modal is a client component; it needs the full broker buyer pool + per-deal om_sent_at status
   - What's unclear: Should buyer data be passed as props from the server (preferred) or fetched client-side?
   - Recommendation: Pass buyers + deal_buyers data as props from the Deal Hub Server Component. Avoids client-side fetch; consistent with existing Notes/Files pattern.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — no test files exist in project |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BUYER-01 | createBuyerAction inserts buyer row | unit | N/A | ❌ Wave 0 (if test infra added) |
| BUYER-02 | updateBuyerAction updates buyer row | unit | N/A | ❌ |
| BUYER-03 | deleteBuyerAction removes buyer row | unit | N/A | ❌ |
| BUYER-04 | SendOmModal associates buyers to deal | integration | N/A | ❌ |
| SEND-01 | sendOmAction calls resend.batch.send() | unit | N/A | ❌ |
| SEND-02 | Each buyer email contains unique ?ref= token | unit | N/A | ❌ |
| TRACK-01 | OM page records first open via searchParams.ref | integration | N/A | ❌ |
| TRACK-02 | /api/track/[token] returns 1x1 GIF | smoke | N/A | ❌ |
| TRACK-03 | Second visit does not overwrite om_opened_at | unit | N/A | ❌ |
| ACT-01/02 | ActivityLogSection displays correct events | smoke | N/A | ❌ |

### Wave 0 Gaps
No test framework exists in this project. Given `nyquist_validation: true` in config.json, the planner must decide:
- Option A: Add Jest + testing-library as Wave 0 task and implement unit tests for critical paths (sendOmAction, tracking idempotency)
- Option B: Manual smoke testing protocol for each requirement (pragmatic for v1 MVP)

Given project velocity and MVP scope, **Option B (manual smoke testing)** is recommended unless the planner explicitly includes a testing wave. Document manual verification steps in each plan's success criteria.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `getUser()` enforced on all Server Actions; service role for tracking bypasses auth intentionally |
| V3 Session Management | no | Session management established in Phase 1; no changes |
| V4 Access Control | yes | Buyers: `user_id` RLS; deal_buyers: deals join RLS; activities: service role INSERT only |
| V5 Input Validation | yes | Zod on all buyer form fields; buyerIds array validated before batch.send() |
| V6 Cryptography | no | `tracking_token` uses Postgres `gen_random_uuid()` (secure); no custom crypto |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| IDOR on /api/track/[token] | Spoofing | Token is UUID v4 (128-bit entropy from `gen_random_uuid()`); not guessable |
| Token enumeration via pixel endpoint | Information Disclosure | Always return 200 + GIF regardless of token validity (don't reveal 404 for invalid tokens) |
| Send OM to other broker's buyer | Elevation of Privilege | `createBuyerAction` scopes by `user_id`; `sendOmAction` fetches buyers via user-scoped client — only own buyers returned |
| XSS in email HTML | Tampering | Email content uses static template with escaping; buyer/deal data inserted via string interpolation — escape `<>&"` in `buildOmEmailHtml()` |
| RESEND_API_KEY exposure | Information Disclosure | `lib/resend.ts` uses `import 'server-only'`; never `NEXT_PUBLIC_*` per CLAUDE.md |

---

## Sources

### Primary (HIGH confidence)
- `/Users/beni/Dev/RealTools/supabase/migrations/001_initial_schema.sql` — confirmed buyers, deal_buyers, activities schema
- `/Users/beni/Dev/RealTools/supabase/migrations/002_rls_policies.sql` — confirmed activities INSERT = service role only
- `/Users/beni/Dev/RealTools/types/supabase.ts` — confirmed DB type shapes
- `/Users/beni/Dev/RealTools/middleware.ts` — confirmed `/api/track/*` excluded from auth
- `/Users/beni/Dev/RealTools/lib/supabase/service.ts` — confirmed createSupabaseServiceClient pattern
- `/Users/beni/Dev/RealTools/app/om/[id]/page.tsx` — confirmed OM page uses service client, `force-dynamic`, async params
- Context7 `/llmstxt/resend_llms-full_txt` — Resend SDK API, batch.send(), rate limits, error handling
- Context7 `/resend/resend-examples` — Next.js Server Action + batch.send() pattern
- npm registry — `resend@6.12.2`, `@radix-ui/react-checkbox@1.3.3`

### Secondary (MEDIUM confidence)
- Context7 `/websites/resend` — Resend rate limit: 5 req/s per team
- Codebase patterns in `deal-actions.ts`, `note-actions.ts`, `file-actions.ts`, `deal-form-modal.tsx`

### Tertiary (LOW confidence — needs validation)
- A1: 1x1 GIF base64 string (standard known value, but not verified against spec)
- A2: Resend batch.send() all-or-nothing on invalid address (documented in Context7 but phrased as "note")

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified against npm registry and codebase
- Architecture: HIGH — all patterns derived from verified existing code and official Resend docs
- Database schema: HIGH — verified from actual migration files and generated types
- Pitfalls: HIGH — derived from existing codebase decisions and verified Resend docs
- Email template: MEDIUM — inline style approach is standard but specific copy is Claude's discretion

**Research date:** 2026-04-30
**Valid until:** 2026-05-30 (stable stack; Resend SDK changes are rare)
