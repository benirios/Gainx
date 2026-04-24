# Technology Stack

**Project:** RealTools — CRE Deal Management SaaS
**Researched:** 2026-04-24
**Confidence note:** WebSearch, WebFetch, and Bash were unavailable in this environment. All findings are from training data (cutoff August 2025), which covers this stack comprehensively. Confidence levels are assigned conservatively.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 15.x (App Router) | Full-stack React framework | Already decided. App Router is the production-standard as of 2024–2025; Pages Router is maintenance-only. |
| React | 19.x | UI rendering | Comes with Next.js 15. React 19 introduces stable `useActionState` and form actions that pair directly with Next.js Server Actions. |
| TypeScript | 5.x | Type safety | Non-negotiable for a data-heavy domain (deal objects, buyer objects, RLS policies). Catches schema drift between DB and UI at compile time. |

### Backend / Database

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Supabase | latest JS SDK `@supabase/supabase-js` ^2.x | Auth, Postgres DB, Storage, Realtime | Already decided. Single vendor for auth + DB + file storage eliminates the Auth0 + PlanetScale + S3 complexity common in comparable stacks. |
| `@supabase/ssr` | ^0.x (replaces `@supabase/auth-helpers-nextjs`) | SSR-safe Supabase client for Next.js App Router | The old `@supabase/auth-helpers-nextjs` package is deprecated. `@supabase/ssr` is the official 2024+ package. It provides `createServerClient` (for Server Components, Route Handlers, Middleware) and `createBrowserClient` (for Client Components). Using the old package causes cookie-handling bugs with App Router. |
| PostgreSQL (via Supabase) | 15.x | Relational data | Hosted by Supabase. RLS policies enforce per-user data isolation. |

### Auth Pattern (HIGH confidence)

**Use `@supabase/ssr` with middleware-based session refresh.**

The canonical 2025 pattern:

1. `middleware.ts` at project root — calls `createServerClient`, reads/writes the session cookie on every request, and calls `supabase.auth.getUser()` to validate. This keeps the session alive without client-side polling.
2. Server Components call `createServerClient` using cookies from `next/headers` to get the current user.
3. Server Actions call `createServerClient` the same way — no API route needed for auth-gated mutations.
4. Client Components that need auth use `createBrowserClient` — only for UI-level concerns (e.g., real-time subscriptions).

**Do NOT use `getSession()` on the server.** It reads from the cookie without server-side validation. Always use `getUser()` server-side — it makes a network call to Supabase Auth to verify the JWT is still valid.

**Do NOT put secrets in Client Components.** The `SUPABASE_SERVICE_ROLE_KEY` must only ever appear in Server Actions, Route Handlers, or middleware — never in `"use client"` files.

### RLS (Row Level Security)

Enable RLS on every table. Canonical policies for this project:

```sql
-- deals: owner-only
CREATE POLICY "user sees own deals"
ON deals FOR ALL
USING (auth.uid() = user_id);

-- notes, activities: scoped through deal ownership
CREATE POLICY "user sees notes on own deals"
ON notes FOR ALL
USING (
  deal_id IN (SELECT id FROM deals WHERE user_id = auth.uid())
);

-- buyers: owner-only (buyers belong to the broker, not a deal)
CREATE POLICY "user sees own buyers"
ON buyers FOR ALL
USING (auth.uid() = user_id);

-- deal_buyers: join table, scoped through deal ownership
CREATE POLICY "user sees own deal_buyers"
ON deal_buyers FOR ALL
USING (
  deal_id IN (SELECT id FROM deals WHERE user_id = auth.uid())
);
```

The `activities` table follows the same notes pattern. Do NOT disable RLS as a workaround — use the service role key in Server Actions for operations that genuinely need elevated access (e.g., recording a tracking pixel hit from an unauthenticated request).

### Server Actions vs API Routes (HIGH confidence)

**Default to Server Actions for all mutations. Use Route Handlers only for specific cases.**

| Use Case | Mechanism | Reason |
|----------|-----------|--------|
| Create/update/delete deal | Server Action | Colocated with component, typed, no boilerplate |
| Create note | Server Action | Same |
| Send OM email to buyers | Server Action | Can call Resend SDK directly, no need to expose an endpoint |
| File upload (small files) | Server Action | Works for files under ~4MB via FormData |
| File upload (large files) | Route Handler + Supabase signed upload URL | Server Actions have a 4MB body limit in some hosting configs; see Storage section |
| Tracking pixel endpoint (`/api/track`) | Route Handler | Must be a GET request returning a 1x1 GIF — Server Actions are POST-only |
| Supabase Auth callbacks (OAuth, magic links) | Route Handler (`/auth/callback`) | Required by Supabase's PKCE flow even for email/password confirm flows |

### Storage (HIGH confidence)

**Pattern: Signed upload URLs for client-direct upload to Supabase Storage.**

Why not proxy through a Server Action: Supabase Storage files can be large (PDFs, images for OM). Proxying through the Next.js server means double bandwidth (client → server → Supabase). Signed URLs let the browser upload directly to Supabase, bypassing the server.

Flow:
1. Client requests a signed upload URL from a Server Action or Route Handler.
2. Server calls `supabase.storage.from('deals').createSignedUploadUrl(path)` using the service role key (so RLS doesn't block the URL generation).
3. Client receives the signed URL and uploads the file directly via `fetch()` or `XMLHttpRequest` with a `PUT` request.
4. Server Action records the file path/metadata in the `files` table (or as a JSON field on `deals`).

**Bucket configuration:**

- One bucket: `deals` (private by default).
- Storage RLS policies mirror DB policies — only the deal owner can read/write their files.
- Public OM images: either a separate `public` bucket for hero images used in OM HTML, or use signed read URLs when serving OM content to buyers.

**Do NOT use the anon key for storage writes.** Always generate signed upload URLs server-side.

### Email (HIGH confidence)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Resend | `resend` npm ^3.x | Transactional email | Already decided. Clean API, React Email integration, excellent deliverability. |
| React Email | `@react-email/components` ^0.x | Email template authoring | Build OM notification emails as React components. Handles cross-client CSS inline, Outlook compatibility, preview server. |

**Resend does not provide built-in open tracking** as of 2025 (it tracks clicks/opens on its dashboard but does not expose a per-recipient pixel you can customize with payload data). For per-buyer OM open tracking, implement a custom tracking pixel.

**Custom Tracking Pixel Pattern:**

1. When generating the OM email per buyer, embed an `<img>` tag pointing to your own endpoint:
   ```html
   <img src="https://app.realtools.com/api/track?deal=DEAL_ID&buyer=BUYER_ID" 
        width="1" height="1" alt="" style="display:none" />
   ```
2. Route Handler at `/api/track/route.ts`:
   - Receives GET request (Route Handler, not Server Action — pixels are image GETs).
   - Validates `deal` and `buyer` params.
   - Uses the Supabase service role key to `INSERT` into `activities` (unauthenticated request, so RLS would block anon key).
   - Returns a 1x1 transparent GIF (`image/gif` content type, 43-byte body).
3. The activity record: `{ deal_id, buyer_id, type: 'om_opened', created_at }`.

**Caveats to surface in UI:**
- Apple Mail Privacy Protection (iOS 15+, macOS Monterey+) pre-fetches all images, triggering the pixel even if the buyer never opened the email. Show open counts as "approximately" or "at least" in the activity log.
- Gmail image proxy caches images — first open records correctly; subsequent opens from cache may not re-ping.
- These are known limitations of pixel tracking industry-wide, not a Resend or implementation issue.

### Hosting (HIGH confidence)

| Option | Verdict | Reason |
|--------|---------|--------|
| Vercel | **Recommended** | Native Next.js platform (same team). Zero-config App Router support including streaming, middleware edge runtime, ISR, image optimization. Free tier sufficient for MVP. |
| Railway | Alternative | Good for colocation with a self-hosted Supabase, but Supabase is managed here — no reason to self-host. |
| Fly.io | Alternative | Better for long-running processes; unnecessary overhead for a Next.js SaaS. |
| AWS Amplify | Avoid | Historically lagged Next.js version support. App Router support arrived late; edge cases exist. |
| Netlify | Avoid | Next.js App Router support via adapter, not native. Middleware and Route Handlers have had compatibility issues. |

**Vercel configuration notes:**
- Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` as plain env vars (safe for browser).
- Set `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` as **encrypted** env vars (server-only, never expose to browser).
- Edge Middleware works with `@supabase/ssr` — the session refresh runs at the edge, not in a Lambda cold start.

---

## Supporting Libraries

### Form Handling

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-hook-form` | ^7.x | Client-side form state | Complex forms with real-time validation (e.g., multi-field deal creation form, buyer tag input). |
| `zod` | ^3.x | Schema validation | Validate Server Action inputs server-side. Also use for client-side validation via `@hookform/resolvers/zod`. Single schema = client + server validation from one definition. |
| `@hookform/resolvers` | ^3.x | Connects zod schema to RHF | Required to use `zodResolver` with react-hook-form. |

**Do NOT use uncontrolled HTML forms with Server Actions alone** for complex forms — you lose real-time validation feedback. Use RHF + zod for form state, then call the Server Action on submit via `action` prop or `startTransition`.

**Simple forms** (e.g., a single-field note input) can use plain `<form action={serverAction}>` with `useFormStatus` for the loading state.

### Table / Data Display

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| TanStack Table | `@tanstack/react-table` ^8.x | Headless table logic | Deal dashboard list, buyer list with tag filtering. Provides sorting, filtering, pagination logic without imposing UI. Style with Tailwind. |

**Do NOT use a pre-styled table component library** (e.g., MUI DataGrid, AG Grid Community). They fight Tailwind and are overkill for two small tables. TanStack Table is headless — you own the markup.

**Alternative for very simple lists:** Plain `<table>` with Tailwind classes. Only reach for TanStack Table when you need client-side sorting or filtering.

### UI Components

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui | n/a (copy-paste, not a package) | Accessible component primitives | Dropdowns, dialogs, toasts, command palettes. Built on Radix UI primitives + Tailwind. |
| Radix UI | (via shadcn) | Accessibility primitives | Use through shadcn — don't install Radix directly unless shadcn doesn't cover the component. |

**shadcn/ui is the right call for this stack.** It's not an npm dependency — components are copied into your codebase. No version conflicts, no breaking updates from upstream. Works perfectly with Tailwind and App Router. The CLI (`npx shadcn@latest add [component]`) adds only what you need.

**Do NOT install a full component library** (Chakra UI, Material UI, Mantine). They bundle their own styling systems that conflict with Tailwind and inflate bundle size.

### File Upload UI

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-dropzone` | ^14.x | Drag-and-drop file input UI | File upload component in Deal Hub. Handles drag events, file type/size validation in the browser before the upload request. |

Pair with the signed upload URL flow described in the Storage section.

### Date Handling

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `date-fns` | ^3.x | Date formatting and manipulation | Activity log timestamps, deal created/updated dates. Lightweight, tree-shakeable, no Moment.js baggage. |

**Do NOT use Moment.js** — it is in maintenance mode and adds ~67KB to the bundle. `date-fns` is the 2025 standard.

### Notifications / Toast

Included in shadcn/ui via the `sonner` integration (`npx shadcn@latest add sonner`). Do not add a separate toast library.

### State Management

No global state library needed for this project. The data model is simple and server-driven.

- Server Components + `fetch` (Supabase client) for read data.
- Server Actions + `revalidatePath` / `revalidateTag` for mutations that update the UI.
- `useState` / `useReducer` for local UI state (modal open/closed, selected buyers list).
- React Context only if prop drilling becomes genuinely painful (unlikely at this scope).

**Do NOT add Zustand, Jotai, or Redux.** They solve problems this app won't have at v1 scale.

---

## Installation Reference

```bash
# Core (already decided)
# Next.js 15, TailwindCSS, TypeScript come from create-next-app

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Email
npm install resend @react-email/components

# Forms + validation
npm install react-hook-form zod @hookform/resolvers

# Tables
npm install @tanstack/react-table

# File upload UI
npm install react-dropzone

# Date formatting
npm install date-fns

# shadcn/ui — add components as needed (not an npm install)
npx shadcn@latest init
npx shadcn@latest add button input label card dialog toast sonner
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Auth package | `@supabase/ssr` | `@supabase/auth-helpers-nextjs` | Deprecated; cookie handling broken with App Router |
| Email templates | `@react-email/components` | Plain HTML strings | No preview server, no component reuse, cross-client compatibility is manual |
| Form library | `react-hook-form` + `zod` | Server Action `FormData` only | No real-time validation; poor DX for complex forms |
| Table | `@tanstack/react-table` | MUI DataGrid / AG Grid | Fight Tailwind; bundle bloat; overkill |
| Component library | shadcn/ui | Chakra UI / MUI / Mantine | Style system conflicts with Tailwind; bundle size |
| Date library | `date-fns` | Moment.js | Maintenance mode; 67KB bundle |
| State | None (server-driven) | Zustand / Redux | Unnecessary complexity for v1 scope |
| Hosting | Vercel | Netlify / Fly.io | App Router native support; same team as Next.js |
| Upload method | Signed upload URL | Proxy through Server Action | 4MB body limit; double bandwidth |

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| `@supabase/ssr` as correct package | HIGH | Official Supabase deprecation of `auth-helpers-nextjs` was announced mid-2024 and well-documented through my cutoff |
| Middleware session refresh pattern | HIGH | Canonical pattern in official Supabase Next.js docs, extensively covered in community |
| `getUser()` vs `getSession()` server-side | HIGH | Explicitly documented as a security requirement by Supabase |
| RLS policy patterns | HIGH | Standard Postgres RLS; patterns are stable |
| Server Actions vs Route Handlers split | HIGH | Next.js 14–15 App Router semantics are stable |
| Signed upload URL for Storage | HIGH | Documented Supabase pattern; avoids bandwidth proxy issue |
| Tracking pixel via Route Handler | HIGH | Standard web pattern; 1x1 GIF response is well-understood |
| Apple Mail privacy caveats | HIGH | Announced 2021, well-established limitation |
| Vercel as hosting | HIGH | Native Next.js platform; well-established |
| shadcn/ui recommendation | HIGH | Dominant 2024–2025 Tailwind-compatible component solution |
| TanStack Table v8 | HIGH | Stable v8 released 2022, maintained through 2025 |
| Resend lacking per-recipient pixel | MEDIUM | Based on Resend feature set as of my cutoff; verify current Resend docs — they may have added native tracking since |
| react-hook-form v7 + zod v3 compatibility | HIGH | Stable combination, widely used |
| Specific npm versions (^2.x, ^3.x etc.) | MEDIUM | Correct at training cutoff; pin exact versions after `npm install` and commit lockfile |

---

## Critical Gaps to Verify Before Building

1. **Resend open tracking:** Confirm whether Resend now has per-recipient open tracking via their dashboard API. If yes, use that instead of a custom pixel — but still implement the `/api/track` Route Handler as a fallback for OM page views (not just email opens).

2. **Supabase Storage RLS on signed URLs:** Verify that `createSignedUploadUrl` with the service role key bypasses Storage RLS correctly, and that the resulting object is still readable only by the bucket policy. Test this explicitly — Storage RLS behavior with signed URLs has had edge cases.

3. **Next.js 15 body size limit for Server Actions:** Confirm the default body size limit in your Vercel deployment tier. The 4MB guidance is approximate — check Next.js 15 release notes for the exact `bodySizeLimit` configuration in `next.config.ts`.

---

## Sources

- Training knowledge covering: Supabase official docs (auth-helpers deprecation, `@supabase/ssr` introduction, Storage signed URL docs), Next.js 14–15 App Router documentation, React 19 release content, shadcn/ui documentation, TanStack Table v8 documentation, Resend API documentation, `react-hook-form` + `zod` integration guides. All sources accessed through training data with cutoff August 2025.
- Verify against: https://supabase.com/docs/guides/auth/server-side/nextjs, https://supabase.com/docs/guides/storage, https://resend.com/docs, https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
