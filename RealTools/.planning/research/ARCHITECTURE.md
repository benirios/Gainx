# Architecture Patterns

**Project:** RealTools — CRE Deal Management SaaS
**Researched:** 2026-04-24
**Confidence:** HIGH (Next.js App Router docs verified; Supabase patterns confirmed from official docs structure + established ecosystem knowledge)

---

## Recommended Architecture

RealTools is a single-tenant SaaS (one broker per account). The architecture is a monolith-in-one-repo: Next.js App Router serves both the authenticated broker dashboard (server + client components) and the fully public OM viewer. Supabase handles auth, database, and file storage. There is no separate backend service.

```
Browser (broker)
    │
    ▼
Next.js App Router (Vercel)
    ├── /dashboard          — authenticated, server component, lists deals
    ├── /deals/[id]         — authenticated, Deal Hub workspace
    ├── /om/[deal-id]       — PUBLIC, no auth, SSR from Supabase (service role)
    └── /api/
        ├── track/[token]   — PUBLIC, tracking pixel endpoint (1x1 GIF)
        ├── upload          — authenticated, returns Supabase signed upload URL
        └── send-om         — authenticated, sends email via Resend

Supabase
    ├── Auth (email/password, JWT)
    ├── Postgres DB (RLS enforced)
    │   ├── users (managed by Auth)
    │   ├── deals
    │   ├── buyers
    │   ├── deal_buyers (join table)
    │   ├── notes
    │   └── activities
    └── Storage
        └── deal-files bucket (private, per-deal prefix)
```

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| Dashboard page (`/dashboard`) | List all broker's deals, New Deal CTA | Supabase DB (server component direct query) |
| Deal Hub page (`/deals/[id]`) | Central workspace: deal info, notes, files, buyers, activity log | Supabase DB (server fetch) + client components for mutations |
| OM page (`/om/[deal-id]`) | Public-facing HTML OM, no auth, renders deal data + images | Supabase DB via service role key (never exposes anon key) |
| Buyer Manager (client component) | Add/edit buyers, tag filtering, select for send | API routes + Supabase client |
| File Uploader (client component) | Browser → Supabase Storage direct upload via signed URL | `/api/upload` for signed URL, then direct to Supabase |
| Activity Log (server component) | Chronological event list per deal | Supabase DB read |
| Tracking pixel endpoint (`/api/track/[token]`) | Returns 1x1 GIF, writes open event to activities table | Supabase DB via service role (no auth context) |
| Send OM endpoint (`/api/send-om`) | Generates per-buyer tracking tokens, sends email via Resend | Supabase DB + Resend API |

---

## Data Model

### Core Tables

```sql
-- Users managed by Supabase Auth (auth.users)
-- Brokers reference auth.users.id as user_id foreign key

CREATE TABLE deals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  address     TEXT,
  price       NUMERIC,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'active', -- active | negotiating | closed
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE buyers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  tags       TEXT[] DEFAULT '{}',  -- e.g. ['retail', 'multifamily']
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE deal_buyers (
  -- Many-to-many: a deal has many buyers; a buyer can be on many deals
  deal_id         UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  buyer_id        UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  tracking_token  UUID NOT NULL DEFAULT gen_random_uuid(), -- unique per deal+buyer pair
  om_sent_at      TIMESTAMPTZ,
  om_opened_at    TIMESTAMPTZ,  -- set on first pixel hit
  PRIMARY KEY (deal_id, buyer_id)
);

CREATE TABLE notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id    UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id),
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id     UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL, -- 'om_sent' | 'om_opened' | 'note_added' | 'file_uploaded' | 'status_changed'
  metadata    JSONB DEFAULT '{}', -- e.g. {"buyer_name": "...", "buyer_id": "..."}
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE deal_files (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id      UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,  -- path in Supabase Storage bucket
  file_name    TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);
```

### Many-to-Many Pattern: deal_buyers

`deal_buyers` is the correct pattern. Each broker's buyers are global to that broker (reusable across deals). The join table adds deal-specific state: `tracking_token`, `om_sent_at`, `om_opened_at`. The `tracking_token` is unique per deal+buyer combination — this is what appears in the tracking pixel URL, allowing attribution of an open to a specific buyer on a specific deal.

**Data flow:** Broker selects buyers for a deal → rows inserted into `deal_buyers` with a new `tracking_token` each → email sent with pixel URL containing that token → pixel hit updates `deal_buyers.om_opened_at` and inserts into `activities`.

---

## Question Answers

### Q1: Data Model — deals, buyers, activities relationships

**Verdict:** Many-to-many via `deal_buyers` join table is the correct pattern. Confidence: HIGH.

- `buyers` belongs to a broker (`user_id`), not to a deal. A buyer can receive OMs for multiple deals.
- `deal_buyers` is the join table that holds deal-specific state (sent timestamp, opened timestamp, tracking token).
- `activities` is an append-only event log per deal. It records all events (OM sent to buyer X, note added, file uploaded). It does NOT replace `deal_buyers.om_opened_at` — both exist: `deal_buyers` for quick status lookup, `activities` for the log view.
- `notes` is a child of `deals`, belongs to `user_id` for author attribution.
- `deal_files` tracks Supabase Storage paths associated with a deal.

### Q2: OM Hosting — Public /om/[deal-id] without auth

**Verdict:** Next.js App Router page with no middleware restriction + Supabase service role key for DB read. Confidence: HIGH.

The `/om/[deal-id]` page is a standard Next.js server component page that:
1. Is NOT wrapped by any auth middleware (middleware only protects `/dashboard` and `/deals` routes).
2. Uses the Supabase **service role key** (server-side env var only, never in client bundle) to query the deal without RLS getting in the way.
3. Renders the OM as a static-ish HTML page (no `<iframe>`, no client JS needed beyond the tracking pixel `<img>` tag).

```
middleware.ts — only match /dashboard/*, /deals/*, /api/send-om, /api/upload
               do NOT match /om/*, /api/track/*
```

The OM page uses `export const dynamic = 'force-dynamic'` or relies on the deal ID param to render fresh data per request. It includes the tracking pixel as an `<img>` tag embedded in the HTML:

```html
<img src="/api/track/[tracking_token]" width="1" height="1" style="display:none" />
```

The tracking token in the URL tells the server which buyer+deal combination opened the OM.

### Q3: Tracking Pixel — How email open tracking works

**Verdict:** Standard 1x1 transparent GIF served from a Next.js Route Handler. Confidence: HIGH.

Flow:
1. Broker clicks "Send OM" → server generates a unique `tracking_token` (UUID) per buyer in `deal_buyers`.
2. Resend email is sent containing the OM link AND an `<img>` tag pointing to `/api/track/[token]`.
3. Alternatively (better): the tracking pixel is embedded IN the OM page itself (`/om/[deal-id]?t=[token]`) — when buyer opens the OM page in browser, the `<img>` fires.
4. Route Handler at `/api/track/[token]`:
   - Looks up `deal_buyers` row by `tracking_token`.
   - If `om_opened_at` is null, sets it to `now()` and inserts an `activities` row.
   - Returns a 1x1 transparent GIF with `Content-Type: image/gif` and `Cache-Control: no-store`.

```typescript
// app/api/track/[token]/route.ts
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  // Use service role Supabase client (no user auth context here)
  // UPDATE deal_buyers SET om_opened_at = now() WHERE tracking_token = token AND om_opened_at IS NULL
  // INSERT INTO activities ...

  const gif = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  )
  return new Response(gif, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
```

**Important:** Email clients often block external images (the tracking pixel in raw email HTML). Embedding the pixel in the OM page instead of the email body is more reliable — the broker sends the OM link, buyer clicks it and opens the OM page, the pixel fires when the page loads in their browser.

### Q4: File Uploads to Supabase Storage

**Verdict:** Direct browser upload using Supabase JS client after auth, storing path references in `deal_files` table. Confidence: HIGH.

Pattern:
1. Client-side component calls `supabase.storage.from('deal-files').upload(path, file)` directly from the browser — the anon key with RLS on the storage bucket controls access.
2. Storage bucket `deal-files` is **private** (not public). Storage RLS policy: only the authenticated user can upload to paths prefixed with their `user_id/`.
3. Storage path convention: `{user_id}/{deal_id}/{filename}` — this makes RLS straightforward.
4. After upload, client saves the `storage_path` to the `deal_files` table via an API call or direct Supabase insert.
5. To display files in the Deal Hub: generate a signed URL server-side: `supabase.storage.from('deal-files').createSignedUrl(path, 3600)`. Signed URLs expire (1 hour is reasonable for dashboard use).
6. For the public OM page: OM images need to be accessible without auth. Options:
   - Store OM images in a **separate public bucket** (`om-images`) — simplest approach.
   - Or use the service role to generate long-lived signed URLs at OM generation time and store them.
   - **Recommended:** Use a public bucket for images that appear in OMs. Store non-OM files (documents, private) in the private bucket with signed URL access.

```
Buckets:
  deal-files   (private)  — documents, PDFs, private attachments
  om-images    (public)   — images that appear on the public OM page
```

### Q5: Row Level Security — Supabase RLS Patterns

**Verdict:** Standard user_id = auth.uid() pattern. Confidence: HIGH.

```sql
-- Enable RLS on all tables
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_buyers ENABLE ROW LEVEL SECURITY;

-- DEALS: user owns rows directly
CREATE POLICY "Users can see own deals"
  ON deals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deals"
  ON deals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deals"
  ON deals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own deals"
  ON deals FOR DELETE
  USING (auth.uid() = user_id);

-- BUYERS: same pattern, user_id on buyers table
CREATE POLICY "Users can manage own buyers"
  ON buyers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- NOTES: user must own the parent deal (join check)
CREATE POLICY "Users can manage notes on own deals"
  ON notes FOR ALL
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM deals WHERE deals.id = notes.deal_id AND deals.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM deals WHERE deals.id = notes.deal_id AND deals.user_id = auth.uid()
    )
  );

-- DEAL_BUYERS: access if user owns the deal
CREATE POLICY "Users can manage deal_buyers for own deals"
  ON deal_buyers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM deals WHERE deals.id = deal_buyers.deal_id AND deals.user_id = auth.uid()
    )
  );

-- ACTIVITIES: access if user owns the deal
CREATE POLICY "Users can read activities for own deals"
  ON activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deals WHERE deals.id = activities.deal_id AND deals.user_id = auth.uid()
    )
  );

-- Activities are only inserted server-side (service role), so no INSERT policy needed for anon/user
```

**Key pattern:** Tables without a direct `user_id` column (like `deal_buyers`, `activities`, `deal_files`) use an `EXISTS` subquery back to `deals` to verify ownership. This keeps the security model anchored to `deals.user_id`.

**Service role usage:** The tracking pixel endpoint and OM page use the Supabase service role client (bypasses RLS). This is correct for server-side operations where no user session exists. Service role key MUST stay in server-only env vars — never in `NEXT_PUBLIC_*`.

### Q6: Server vs Client Components — Dashboard and Deal Hub

**Verdict:** Pages and layouts are Server Components by default. Push interactivity to leaf Client Components. Confidence: HIGH (verified from Next.js official docs).

```
Dashboard page (/dashboard)
  └── Server Component (async, fetches deals list from Supabase)
       └── <DealCard> — Server Component (static display)
       └── <NewDealButton> — Client Component ('use client', opens modal)

Deal Hub page (/deals/[id])
  └── Server Component (async, fetches deal + notes + files + buyers + activities)
       ├── <DealHeader> — Server Component (title, status badge)
       ├── <StatusSelect> — Client Component (dropdown to change status)
       ├── <NotesList> — Server Component (renders notes)
       ├── <AddNoteForm> — Client Component (textarea + submit)
       ├── <FileList> — Server Component (renders file links with signed URLs)
       ├── <FileUploader> — Client Component (drag-drop, calls Supabase Storage)
       ├── <BuyerPanel> — Client Component (select buyers, filter by tag, send OM)
       └── <ActivityLog> — Server Component (chronological events)

OM page (/om/[deal-id])
  └── Server Component (service role fetch, renders full HTML)
       └── No interactive client components — pure HTML + CSS
       └── <img src="/api/track/[token]" /> embedded for tracking
```

**Rule of thumb:** Fetch data at the page (Server Component) level and pass as props. Only add `'use client'` when you need `useState`, `useEffect`, event handlers, or browser APIs. Forms that mutate data use either:
- Server Actions (Next.js 14+ pattern, available in App Router) — preferred for simple mutations like adding a note or changing status.
- Client Component + `fetch('/api/...')` — acceptable for complex cases like file uploads or multi-step flows.

---

## Data Flow Direction

```
[Broker Browser]
      │
      │  1. Auth: Supabase client SDK (anon key + JWT)
      │
      ▼
[Next.js Server Components]  ←→  [Supabase DB via supabase-js server client]
      │                               (user JWT from cookies, RLS enforced)
      │
      │  2. Page HTML + RSC payload streamed to browser
      │
      ▼
[Client Components hydrate]
      │
      ├── Mutations → Server Actions or API Routes
      │                      ↓
      │               [Supabase DB] (authenticated)
      │
      └── File Upload → Supabase Storage direct (browser → Storage, anon key)
                               ↓
                        [deal_files table] (path reference saved)

[Buyer Browser - no auth]
      │
      │  GET /om/[deal-id]
      │
      ▼
[Next.js Server Component - service role]
      └── Supabase DB read (no RLS, service role)
      └── Renders OM HTML with embedded <img /api/track/[token]>
                               │
                               ▼
                    [GET /api/track/[token]]  ←→  [Supabase DB - service role]
                    Returns 1x1 GIF                 Updates deal_buyers + activities
```

---

## Suggested Build Order

Dependencies drive this order. Each layer must exist before the next can be built.

### Layer 1: Foundation (no dependencies)
1. Supabase project setup — Auth enabled, DB schema created, RLS policies applied
2. Next.js project scaffold — App Router, TailwindCSS, Supabase client configured
3. Auth flow — Sign up / sign in / sign out pages using Supabase Auth

### Layer 2: Core Data (requires Layer 1)
4. Deals CRUD — create deal, list deals on dashboard, Deal Hub page shell
5. Notes CRUD — add/edit/delete notes on a deal

### Layer 3: Buyers + Files (requires Layer 2)
6. Buyers CRUD — create buyers, tag them, list/filter
7. File uploads — Supabase Storage integration, deal_files table, signed URL display

### Layer 4: OM + Tracking (requires Layers 2 and 3)
8. OM page — `/om/[deal-id]` public route, service role fetch, HTML template with deal data + images
9. Tracking pixel — `/api/track/[token]` route handler, deal_buyers tracking_token, activities write
10. Send OM — `/api/send-om`, select buyers for deal, insert deal_buyers rows, send email via Resend with OM link

### Layer 5: Activity Log (requires Layers 4)
11. Activity log — `activities` table reads per deal, display in Deal Hub

**Rationale for this order:**
- Auth must precede everything (RLS depends on auth.uid()).
- Deals must precede notes, buyers-on-deals, files, OM (all are children of deals).
- Buyers and files are siblings — either can be built in parallel after deals.
- OM page requires both deal data AND files (images). Must come after both.
- Tracking requires OM page to exist (pixel lives in the OM page).
- Send OM requires tracking_token generation (deal_buyers) and Resend integration.
- Activity log is a read-only view of events written by earlier layers — naturally last.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Exposing service role key to client
**What:** Using `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` so client components can bypass RLS.
**Why bad:** Service role key bypasses ALL RLS. Exposing it in client bundle means any user can read/write any row.
**Instead:** Service role key used only in server-only code (Route Handlers, Server Components). Client code uses anon key + user JWT.

### Anti-Pattern 2: Fetching data in Client Components for initial page load
**What:** `useEffect(() => fetch('/api/deals'), [])` in a Client Component that renders the dashboard.
**Why bad:** Creates loading waterfall — page renders empty, then fetches, then re-renders. Extra roundtrip.
**Instead:** Fetch in Server Component, pass data as props to interactive Client Components.

### Anti-Pattern 3: One activities query per component
**What:** Each widget on Deal Hub queries activities separately.
**Why bad:** N+1 queries on page load.
**Instead:** Fetch all activities for the deal once in the page Server Component, pass as props.

### Anti-Pattern 4: Storing tracking token only in the email URL (not in OM page)
**What:** Put `?t=[token]` only on the email link, don't embed pixel in OM page.
**Why bad:** Email clients strip tracking images; if buyer forwards the link without the token, tracking breaks.
**Instead:** Embed the tracking pixel in the OM page HTML itself, not in the email body. The email contains only the OM link. The OM page includes `<img src="/api/track/[token]">`.

### Anti-Pattern 5: Using public bucket for all files
**What:** Put all broker files (documents, contracts) in a public Supabase Storage bucket.
**Why bad:** Anyone with the file URL can access it — no auth control.
**Instead:** Private bucket for sensitive deal files (signed URLs for access), public bucket only for OM images that must be visible to anonymous buyers.

### Anti-Pattern 6: RLS on activities table allowing user INSERT
**What:** Giving the authenticated user INSERT permission on activities via client-side code.
**Why bad:** Activity log integrity is compromised — clients could inject fake events.
**Instead:** Activities are only written server-side (Server Actions or Route Handlers using service role). Client-side code can only READ activities.

---

## Scalability Considerations

This is an MVP for individual brokers. Scalability is not a primary concern, but these patterns hold up to growth:

| Concern | At 100 users | At 10K users |
|---------|--------------|--------------|
| DB queries | Direct Supabase queries fine | Add indexes on `deals.user_id`, `activities.deal_id`, `deal_buyers.tracking_token` |
| OM page load | Dynamic SSR per request | Add ISR with `revalidate` if OM data rarely changes |
| File storage | Single private bucket fine | No change needed; Supabase Storage scales |
| Tracking pixel | Single DB write per open fine | Idempotent (only writes if `om_opened_at IS NULL`) |

**Required indexes from day one:**
```sql
CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_buyers_user_id ON buyers(user_id);
CREATE INDEX idx_notes_deal_id ON notes(deal_id);
CREATE INDEX idx_activities_deal_id ON activities(deal_id);
CREATE INDEX idx_deal_buyers_tracking_token ON deal_buyers(tracking_token);
CREATE INDEX idx_deal_files_deal_id ON deal_files(deal_id);
```

---

## Sources

- Next.js App Router Route Handlers: https://nextjs.org/docs/app/api-reference/file-conventions/route (official, verified 2026-04-23)
- Next.js Server and Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components (official, verified 2026-04-23)
- Supabase RLS patterns: https://supabase.com/docs/guides/database/postgres/row-level-security (HIGH confidence, standard patterns)
- Supabase Storage: https://supabase.com/docs/guides/storage (HIGH confidence, standard patterns)
- Email tracking pixel mechanism: well-established email marketing pattern (MEDIUM confidence, no single authoritative spec)
