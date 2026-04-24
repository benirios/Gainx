# Domain Pitfalls

**Domain:** CRE Deal Management SaaS (Next.js App Router + Supabase + Resend)
**Researched:** 2026-04-24
**Confidence note:** External tools (WebSearch, WebFetch, Context7 CLI) were unavailable in this environment. All findings are drawn from well-established, high-recurrence patterns in the Supabase + Next.js App Router ecosystem as of the knowledge cutoff (August 2025). Confidence ratings reflect this constraint.

---

## Critical Pitfalls

Mistakes that cause rewrites, data leaks, or security incidents.

---

### Pitfall 1: Supabase Auth — Using the Wrong Client in Middleware

**Confidence:** HIGH (this is the #1 documented Supabase + Next.js mistake)

**What goes wrong:**
Developers create a plain `createClient` (browser client) inside `middleware.ts` instead of `createServerClient` from `@supabase/ssr`. The middleware runs on the Edge Runtime, has no access to browser cookies, and the session is never refreshed. The result: users appear logged out on every server-side render, or — worse — the middleware passes through without checking the session at all because the client silently returns `null` for the user.

**Why it happens:**
The old `@supabase/auth-helpers-nextjs` package had a different API from the newer `@supabase/ssr` package. Tutorials written before mid-2024 use the old pattern. Copy-pasting from outdated examples is extremely common.

**Consequences:**
- Protected routes accessible to unauthenticated users
- `getUser()` returns `null` on server components even when the user is logged in
- Auth state never synchronized between client and server

**Prevention:**
```typescript
// middleware.ts — CORRECT pattern
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // MUST call getUser(), not getSession() — see Pitfall 2
  const { data: { user } } = await supabase.auth.getUser()
  // ... redirect logic
  return response
}
```

**Warning signs:**
- `supabase.auth.getSession()` used in middleware instead of `getUser()`
- Import from `@supabase/auth-helpers-nextjs` in a Next.js 14+ project
- `createClient` called without cookie handlers in a Server Component

**Phase to address:** Phase 1 (Auth foundation). Lock this pattern in before writing any protected routes.

---

### Pitfall 2: Using `getSession()` Instead of `getUser()` for Auth Checks

**Confidence:** HIGH (official Supabase documentation explicitly calls this out)

**What goes wrong:**
`getSession()` returns the session from the cookie without re-validating it against Supabase's servers. A crafted or replayed cookie can pass `getSession()` as valid. `getUser()` makes a network call to validate the JWT with the Supabase Auth server — it is the only safe method for server-side auth decisions.

**Consequences:**
- Security bypass: a user with an expired or tampered token can access protected server routes
- Subtle: it works correctly in 99% of cases (normal sessions), so the vulnerability is invisible in testing

**Prevention:**
Always use `supabase.auth.getUser()` in:
- `middleware.ts`
- Server Components that gate access
- Server Actions that mutate data

`getSession()` is acceptable only for reading display data in client components where the worst outcome is a stale UI, not a data breach.

**Warning signs:**
- `getSession()` called in any server-side file or Server Action
- Auth guard logic that doesn't call the Supabase API

**Phase to address:** Phase 1. Establish as a coding rule before any protected routes are created.

---

### Pitfall 3: RLS Disabled on Tables or Policies That Allow Cross-User Data Access

**Confidence:** HIGH

**What goes wrong:**
A broker can query another broker's deals. This happens in two ways:

**Variant A — RLS never enabled:** When you create a table in Supabase, RLS is off by default. Developers enable it only when they remember. A table with RLS off and the anon key exposed means anyone can query it.

**Variant B — Policy written incorrectly:**
```sql
-- WRONG: allows any authenticated user to read any deal
CREATE POLICY "Users can view deals" ON deals
  FOR SELECT USING (auth.role() = 'authenticated');

-- CORRECT: user can only see their own deals
CREATE POLICY "Users can view own deals" ON deals
  FOR SELECT USING (auth.uid() = user_id);
```

**Variant C — Missing `user_id` column on a table:** If `notes`, `activities`, or `deal_buyers` don't have a direct `user_id` column, developers may write policies that check the parent `deal` row — which requires a subquery. A forgotten or malformed subquery policy fails open (returns false, blocking all access) or fails closed (returns true, allowing all access), depending on default behavior.

**Consequences:**
- CRE data is highly sensitive (unreleased deal pricing, buyer lists). Cross-user data exposure is a critical business failure, not just a technical one.
- If discovered, destroys broker trust immediately.

**Prevention:**
1. Enable RLS on every table immediately upon creation — make it a migration convention.
2. Test with the Supabase Table Editor as a logged-in user, not the dashboard (dashboard uses service role, bypasses RLS).
3. For join-table policies (e.g., `deal_buyers`), reference the parent via subquery and test it explicitly.
4. Add a Supabase "RLS enabled" check to a project health checklist.

**Warning signs:**
- Any table without `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` in migrations
- Policies using `auth.role() = 'authenticated'` as the sole condition
- Testing done only via Supabase dashboard (bypasses RLS)

**Phase to address:** Phase 1 (schema design). Every table migration must include RLS + policy as part of the same commit.

---

### Pitfall 4: Service Role Key Exposed on the Client or in Git

**Confidence:** HIGH

**What goes wrong:**
The Supabase service role key bypasses all RLS. If it appears in a Next.js file that gets bundled for the client (any file without `'use server'` or placed in a client component), it is shipped to the browser and visible in the network tab.

**Consequences:**
- Anyone who opens DevTools can make unrestricted database queries
- Complete data exposure for all users

**Prevention:**
- `SUPABASE_SERVICE_ROLE_KEY` must only appear in `server-only` modules or Server Actions
- Add a lint rule or pre-commit check: `git grep -r "SUPABASE_SERVICE_ROLE_KEY" --include="*.tsx" --include="*.ts"` and fail if found outside `/app/api/`, server actions, or server-only utilities
- Never store service role key in `.env.local` without a corresponding `.env.local.example` that uses a placeholder — prevents accidental commit

**Warning signs:**
- Service role key used in a file that imports from React or has JSX
- `.env.local` committed to git (check `.gitignore`)
- Any client component that makes unrestricted DB calls "for simplicity"

**Phase to address:** Phase 1. Enforce before any route is built.

---

### Pitfall 5: Supabase Storage — Public Bucket for Sensitive OM Images

**Confidence:** HIGH

**What goes wrong:**
Deal images (property photos, financial summaries) uploaded to a public Supabase Storage bucket get a permanent, guessable URL. The OM page uses these URLs. If the deal status changes to closed or the broker revokes a buyer's access, the image URLs remain accessible forever. Anyone with the URL can view the images indefinitely.

**Consequences:**
- No access control on property financials shared in OMs
- Brokers cannot "un-share" images after sending

**Prevention:**
Use a private bucket and generate signed URLs server-side for both the OM page and file downloads:
```typescript
// Server Component or Server Action
const { data } = await supabase.storage
  .from('deal-assets')
  .createSignedUrl(filePath, 3600) // 1-hour expiry
```

For the public OM page (`/om/[deal-id]`), generate signed URLs at render time in a Server Component. Since the OM page itself is unauthenticated, use the service role client server-side to generate the signed URLs — but do not expose the signed URLs in a way that allows enumeration.

**Warning signs:**
- `bucket.setPublic(true)` in any migration or storage setup script
- Image `src` attributes that contain `storage.supabase.co/object/public/`
- No signed URL generation logic in the OM page route

**Phase to address:** Phase 2 (file upload + OM generation). Bucket policy must be set private from creation.

---

### Pitfall 6: Next.js App Router — Server/Client Component Boundary Violations

**Confidence:** HIGH

**What goes wrong:**
Three recurring violations in App Router projects:

**Violation A — Async operations in Client Components:** Calling `supabase.from('deals').select()` directly in a Client Component at the top level. This triggers on every render, has no caching, and exposes the anon key pattern unnecessarily.

**Violation B — Passing non-serializable data across the boundary:** Passing a Supabase client instance, a Date object, or a class instance as a prop from a Server Component to a Client Component. Next.js will throw a serialization error at runtime, not build time.

**Violation C — `'use client'` creep:** Adding `'use client'` to a component that doesn't need it because a child needed it. This converts the entire subtree to client-rendered and defeats server-side data fetching. The correct fix is to extract only the interactive child into its own Client Component.

**Consequences:**
- Performance: large component trees shipped to the client unnecessarily
- Data fetching in client components lacks server-side caching
- Runtime errors on production that don't surface in dev (serialization)

**Prevention:**
- Rule: data fetching always in Server Components or Server Actions. Client Components receive data as props or use SWR/React Query for client-side refreshes.
- Rule: when a component needs both server data and interactivity, split it. Server Component fetches, passes props to a Client Component that handles UI state.
- Use the `server-only` package for any utility that uses the service role key.

**Warning signs:**
- `supabase.from(...)` inside a file with `'use client'` at the top
- `async` client components (not supported — will throw)
- `Date`, `Map`, or class instances passed as props to client components

**Phase to address:** Phase 1 (architecture setup). Establish the component boundary convention before building any feature.

---

### Pitfall 7: Next.js App Router Caching — Stale Data After Mutations

**Confidence:** HIGH

**What goes wrong:**
Next.js App Router aggressively caches `fetch()` calls and page segments. After a Server Action mutates a deal (e.g., status change, new note), the page re-renders but shows stale cached data because `revalidatePath()` or `revalidateTag()` was not called.

This is particularly painful for the Deal Hub page, which aggregates data from multiple tables (deal, notes, activities, deal_buyers). If revalidation is not targeted correctly, some sections update while others remain stale.

**Consequences:**
- Broker sees "negotiating" status after changing to "closed"
- Activity log doesn't show new note for 60 seconds (default cache TTL)
- Hard to diagnose because it works perfectly in dev mode (caching is disabled)

**Prevention:**
```typescript
// Every Server Action that mutates data must end with:
revalidatePath(`/deal/${dealId}`)
// Or tag-based for granular control:
revalidateTag(`deal-${dealId}`)
```

For the public OM page, use `export const revalidate = 0` to opt out of caching, or use `unstable_noStore()` — the OM is read-only but must be fresh if the broker updates deal info.

**Warning signs:**
- Server Actions without `revalidatePath` calls
- Deal Hub data appears correct in `localhost:3000` but stale in staging/production
- `fetch()` calls without explicit `cache: 'no-store'` on mutation-sensitive routes

**Phase to address:** Phase 2 (Deal Hub + mutations). Establish as part of the Server Action pattern.

---

## Moderate Pitfalls

---

### Pitfall 8: Email Tracking Pixel — Image Blocking and GDPR

**Confidence:** MEDIUM

**What goes wrong:**
The tracking pixel approach (`<img src="/api/track/[token]">` embedded in the OM email) fails silently in a large percentage of cases:

- **Gmail (web):** Proxies all images through Google's image caching proxy. The tracking server sees Google's IP, not the buyer's. More importantly, Gmail pre-fetches images at send time, not open time — every send is recorded as an open immediately. This makes open tracking unreliable as a "did they open it?" signal.
- **Outlook desktop and iOS Mail:** Default to blocking remote images. The tracking request never fires.
- **Apple Mail Privacy Protection (iOS 15+):** Pre-fetches all email images in the background regardless of whether the user opens the email. Opens are recorded for every email.

**Consequence for RealTools:** The "buyer opened OM" tracking feature — a core value prop — produces false positives (Gmail pre-fetch, Apple MPP) and false negatives (Outlook blocking). Brokers will see "opened" for buyers who never looked, and "not opened" for buyers who did.

**GDPR/CAN-SPAM:**
- Tracking pixels in commercial email require disclosure under GDPR Article 13 if recipients are EU-based
- CAN-SPAM requires a physical address in commercial email and an opt-out mechanism
- Resend handles CAN-SPAM headers but the OM email template must include: physical address, unsubscribe link (even if it's just a static page for MVP)

**Prevention:**
1. For MVP: implement the pixel as designed but set broker expectations correctly — frame it as "engagement signal" not "confirmed open." Supplement with a "clicked OM link" event (more reliable than pixel) by tracking the first load of `/om/[deal-id]?buyer=[token]`.
2. The OM URL itself can carry a buyer token: `/om/[deal-id]?ref=[buyer-token]`. When the OM page loads, it fires a Server Action to record the visit. This is far more reliable than a pixel.
3. Add unsubscribe link and physical address to Resend email template from day one.

**Warning signs:**
- Tracking implementation relies solely on `<img>` pixel with no fallback
- No `ref` or `buyer` query param strategy on the OM URL
- Email template without unsubscribe and address

**Phase to address:** Phase 3 (email send + tracking). Architect around URL-based tracking as primary, pixel as secondary.

---

### Pitfall 9: Public OM Page — No Rate Limiting on the Unauthenticated Route

**Confidence:** MEDIUM

**What goes wrong:**
`/om/[deal-id]` is a public, unauthenticated route. It renders deal data including price, description, and images. Without rate limiting:
- A competitor could scrape all deals by iterating UUIDs (if deal IDs are sequential integers — use UUIDs to mitigate)
- A malicious actor could trigger expensive Storage signed URL generation thousands of times per minute
- The route also fires a tracking event on each load; without deduplication, one buyer opening and refreshing 50 times logs 50 "opens"

**Prevention:**
1. Use UUIDs for deal IDs (not auto-increment integers) — Supabase default, so this is free.
2. Add rate limiting at the middleware level using Vercel's `@vercel/kv` + rate limit library, or use Vercel's built-in Edge middleware rate limiting. For MVP, even a simple in-memory rate limit per IP on the `/om/` path segment is acceptable.
3. Deduplicate tracking events: record first open per buyer token, ignore subsequent ones within a time window (e.g., 1 hour).

**Warning signs:**
- Deal IDs are sequential integers (visible in the URL)
- `/om/[deal-id]` route has no middleware rate limiting
- Activity log shows duplicate "OM opened" events for the same buyer

**Phase to address:** Phase 3 (OM public page + tracking). Rate limit and deduplication must be in place before sending first email.

---

### Pitfall 10: Missing RLS on the `activities` Table Causes Activity Log Leakage

**Confidence:** HIGH

**What goes wrong:**
The `activities` table records events like "OM sent to buyer@email.com" and "note added." It's easy to forget that activities reference a deal, and deals belong to a user — but if the activities table has a loose RLS policy (or none), a broker can query activities for deals they don't own.

This is a specific instance of Pitfall 3 but worth calling out separately because `activities` is often added later (Phase 2-3) when RLS hygiene attention has dropped.

**Prevention:**
```sql
CREATE POLICY "Users can view own deal activities" ON activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deals
      WHERE deals.id = activities.deal_id
      AND deals.user_id = auth.uid()
    )
  );
```

Test this policy specifically — it requires a subquery and is the most common place subquery policies are written incorrectly.

**Warning signs:**
- `activities` table added in a later migration without a corresponding RLS policy migration
- Activities query using `deal_id` filter only, with no user ownership check

**Phase to address:** Phase 2 (activity log feature). Add RLS as part of the same migration that creates the table.

---

### Pitfall 11: Scope Creep — "Small" Features That Kill MVP Timeline

**Confidence:** HIGH

**What goes wrong:**
Several features on the PROJECT.md active list appear simple but have hidden complexity that can consume entire sprints:

| Feature | Apparent Complexity | Hidden Complexity |
|---------|---------------------|-------------------|
| File upload to Storage | Low — drag and drop | Progress indication, error handling, file type validation, size limits, cleanup on deal deletion, signed URL management |
| OM generation from deal data | Low — render HTML | Image layout, font handling, responsive design for buyer screens, what happens if images aren't uploaded yet |
| Per-buyer email tracking | Low — send link | Gmail pre-fetch, Apple MPP, deduplication, token management, unsubscribe compliance |
| Activity log | Low — insert rows | Real-time updates? Polling? Pagination for high-volume deals? Timestamp timezone handling |
| Buyer tag filtering | Low — array filter | UX for selecting tags, what happens with no matching buyers, tag normalization (case sensitivity) |

The highest-risk scope creep candidates for this specific MVP:
1. **Real-time activity log:** If the broker expects the activity log to update live without refresh, that requires Supabase Realtime subscriptions (WebSockets, client-side subscription management, reconnect logic). This is 2-3x the implementation work of a polling approach.
2. **OM visual quality:** Brokers are used to InDesign-quality OMs. An HTML OM that looks "developer-designed" may get rejected as the primary deliverable. Under-specifying the OM design in Phase 2 leads to design rework in Phase 3.
3. **Buyer deduplication:** What if the same buyer email is added twice? Tags on buyers seem simple until a broker asks for multi-select filter ("retail AND budget > 5M").

**Prevention:**
- Real-time: explicitly decide "polling only for MVP" and document it in PROJECT.md as Out of Scope. Implement a manual refresh button rather than live updates.
- OM design: create a simple but professional HTML template in Phase 2 — use a clean Tailwind print-style layout. Get broker feedback before building email send.
- Buyer tags: implement as a simple array, support multi-select filter UI only if broker feedback demands it. Default to OR logic for tag matching.

**Warning signs:**
- "Should we make the activity log real-time?" discussion during Phase 2
- Broker stakeholder sees the OM and immediately asks for "better design"
- Buyer filter feature scope expanding beyond tag match to include AND/OR logic, saved filters, etc.

**Phase to address:** Phase 0 (scope lock). These must be explicitly ruled out or capped in PROJECT.md before implementation begins.

---

### Pitfall 12: Next.js App Router — Incorrect Dynamic Route Handling for `/om/[deal-id]`

**Confidence:** HIGH

**What goes wrong:**
The public OM route at `/om/[deal-id]` is unauthenticated and should be statically generated or ISR-cached for performance. Two mistakes commonly occur:

**Mistake A — Accidentally blocking with middleware:** If the auth middleware uses a catch-all matcher (e.g., `matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']`), the `/om/` path gets intercepted and the middleware tries to redirect unauthenticated users to login — breaking all buyer access.

**Mistake B — Dynamic rendering on every request:** If the route uses `cookies()` or `headers()` anywhere in the render tree (even in a layout), Next.js opts the entire route into dynamic rendering. This means every buyer load hits the database. For a public marketing page, this defeats caching entirely.

**Prevention:**
1. Explicitly exclude `/om` from the auth middleware matcher:
```typescript
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|om).*)',
  ],
}
```
2. The OM Server Component must not call `cookies()` or `headers()`. Use the service role Supabase client (initialized with env vars only, no cookie access) to fetch deal data.
3. Consider `export const revalidate = 60` on the OM route for ISR — deal data changes infrequently.

**Warning signs:**
- Buyers cannot access the OM URL and get redirected to `/login`
- OM page response times above 500ms for every request (sign of no caching)
- `cookies()` import present in the OM page component

**Phase to address:** Phase 2 (OM page) and Phase 1 (middleware setup). Middleware matcher must be correct from day one.

---

## Minor Pitfalls

---

### Pitfall 13: Resend — Email Deliverability Without Domain Verification

**What goes wrong:**
Resend requires domain verification (DKIM, SPF, DMARC records) for production sending. Emails sent from unverified domains go to spam. Brokers sending OM links from `@gmail.com` addresses will have them land in buyer spam folders.

**Prevention:** Set up a custom domain for Resend in Phase 3 before the first real broker test. `mail.realtools.io` or similar. Plan 24-48 hours for DNS propagation.

**Phase to address:** Phase 3 (email send). Must be done before any broker user testing.

---

### Pitfall 14: Supabase Free Tier Limits Hit During Demo

**What goes wrong:**
Supabase free tier has: 500MB database, 1GB storage, 50,000 MAU. None of these are likely to cause problems in MVP, but the free tier pauses projects after 1 week of inactivity. During a demo, the database might be paused, causing a 30-60 second cold start.

**Prevention:** Upgrade to Supabase Pro ($25/month) before any stakeholder demo or broker onboarding. The pause behavior alone justifies the cost.

**Phase to address:** Pre-launch / first demo preparation.

---

### Pitfall 15: Missing `ON DELETE CASCADE` on Foreign Keys

**What goes wrong:**
When a deal is deleted, associated notes, activities, deal_buyers, and uploaded files are not deleted. The Storage bucket retains orphaned files. The DB accumulates orphaned rows that are invisible in the UI but inflate storage costs and complicate queries.

**Prevention:**
```sql
-- All child tables should cascade on deal deletion
ALTER TABLE notes ADD CONSTRAINT notes_deal_id_fkey
  FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE;

-- Storage: implement a Supabase Edge Function or DB trigger that
-- deletes Storage objects when a deal row is deleted
```

**Phase to address:** Phase 1 (schema). Cascades must be in initial migrations, not retrofitted later.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 1: Auth + Schema | Wrong Supabase client in middleware (`getSession` vs `getUser`) | Use `@supabase/ssr` + `createServerClient` exclusively; ban `@supabase/auth-helpers-nextjs` |
| Phase 1: Schema | RLS disabled or poorly written policies | Every migration includes RLS + policy; test as anon/authenticated user, not dashboard |
| Phase 1: Schema | No cascade deletes | Every FK references parent with `ON DELETE CASCADE` from creation |
| Phase 2: File Upload | Public storage bucket | Create bucket as private; always generate signed URLs server-side |
| Phase 2: Deal Hub | Stale data after mutations | Every Server Action calls `revalidatePath`; test in production mode |
| Phase 2: OM Page | Middleware blocks unauthenticated buyers | Exclude `/om` from middleware matcher explicitly |
| Phase 2: OM Page | Auth cookies accessed in OM route, defeating ISR | OM route uses service-role client only, no `cookies()` |
| Phase 3: Email + Tracking | Gmail pre-fetch makes pixel tracking unreliable | Implement URL-based tracking (`/om/[id]?ref=[token]`) as primary signal |
| Phase 3: Email + Tracking | No CAN-SPAM compliance | Add physical address + unsubscribe to email template before first send |
| Phase 3: Email + Tracking | No rate limiting on `/om/` route | Add IP-based rate limit and event deduplication before broker testing |
| Phase 3: Resend | Emails land in spam | Verify sending domain (DKIM/SPF/DMARC) before any real sends |
| All phases | Scope creep: real-time, PDF, complex tag filters | Document explicit "polling only, no PDF, OR-only tag logic" in PROJECT.md Out of Scope |

---

## Sources and Confidence

| Finding | Confidence | Basis |
|---------|------------|-------|
| `getUser()` vs `getSession()` auth bypass | HIGH | Official Supabase documentation explicitly warns this; widely documented in Supabase GitHub issues |
| `createServerClient` middleware pattern | HIGH | Official Supabase SSR package documentation; `@supabase/ssr` README |
| RLS disabled by default | HIGH | Supabase table defaults; confirmed in official docs |
| Service role key client exposure | HIGH | Standard Next.js security concern; Next.js documentation on server-only |
| Storage public vs private bucket | HIGH | Supabase Storage documentation; standard file access control |
| Gmail pixel tracking pre-fetch | MEDIUM | Well-documented behavior from email marketing literature; Gmail behavior confirmed by multiple ESP vendors |
| Apple Mail Privacy Protection | MEDIUM | Announced and documented by Apple at WWDC 2021; widely confirmed in email industry |
| App Router caching + revalidation | HIGH | Next.js App Router documentation; Next.js GitHub discussions |
| Server/client component boundaries | HIGH | Next.js App Router documentation |
| Supabase free tier pause behavior | HIGH | Supabase pricing page and documentation |
| CAN-SPAM requirements | MEDIUM | FTC CAN-SPAM Act guidance; standard email compliance |
