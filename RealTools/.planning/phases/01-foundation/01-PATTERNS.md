# Phase 1: Foundation - Pattern Map

**Mapped:** 2026-04-27
**Files analyzed:** 18 new files (greenfield — no existing source code)
**Analogs found:** 0 / 18 (greenfield project; all patterns sourced from canonical references)

> **Greenfield note:** No source files exist in this repository. Every pattern below is derived
> from the official Next.js 15 App Router docs, the official `@supabase/ssr` docs, and the
> locked decisions captured in `ARCHITECTURE.md`, `SUMMARY.md`, and `CONTEXT.md`. The planner
> MUST use these patterns as the authoritative source for every file created in Phase 1.
> All subsequent phases will use Phase 1 files as their analogs.

---

## File Classification

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `middleware.ts` | middleware | request-response | none (greenfield) | no analog |
| `app/layout.tsx` | layout | request-response | none (greenfield) | no analog |
| `app/(auth)/login/page.tsx` | page (public) | request-response | none (greenfield) | no analog |
| `app/(auth)/signup/page.tsx` | page (public) | request-response | none (greenfield) | no analog |
| `app/(auth)/login/actions.ts` | server action | request-response | none (greenfield) | no analog |
| `app/(auth)/signup/actions.ts` | server action | request-response | none (greenfield) | no analog |
| `app/auth/callback/route.ts` | route handler | request-response | none (greenfield) | no analog |
| `app/(app)/layout.tsx` | layout | request-response | none (greenfield) | no analog |
| `app/(app)/dashboard/page.tsx` | page (protected) | request-response | none (greenfield) | no analog |
| `components/ui/sidebar.tsx` | component | request-response | none (greenfield) | no analog |
| `lib/supabase/server.ts` | utility | request-response | none (greenfield) | no analog |
| `lib/supabase/client.ts` | utility | request-response | none (greenfield) | no analog |
| `lib/supabase/service.ts` | utility | request-response | none (greenfield) | no analog |
| `supabase/migrations/001_initial_schema.sql` | migration | CRUD | none (greenfield) | no analog |
| `supabase/migrations/002_rls_policies.sql` | migration | CRUD | none (greenfield) | no analog |
| `supabase/migrations/003_indexes.sql` | migration | CRUD | none (greenfield) | no analog |
| `.env.local` | config | — | none (greenfield) | no analog |
| `next.config.ts` | config | — | none (greenfield) | no analog |

---

## Pattern Assignments

### `middleware.ts` (middleware, request-response)

**Source:** `@supabase/ssr` official docs + ARCHITECTURE.md + SUMMARY.md pitfall #4
**Critical rules:**
- Use `createServerClient` from `@supabase/ssr` — NEVER `createClient` or `@supabase/auth-helpers-nextjs`
- Matcher MUST explicitly exclude `/om` and `/api/track` — if missing, buyers are redirected to login
- Session refresh pattern: call `supabase.auth.getUser()` inside middleware to validate + refresh the cookie
- Redirect unauthenticated requests to `/auth/login`

**Full pattern:**
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // CRITICAL: getUser() — never getSession() (silent security hole)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !request.nextUrl.pathname.startsWith('/auth')) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - /om/* (public OM pages — no auth required)
     * - /api/track/* (tracking pixel — no auth required)
     * - _next/static, _next/image, favicon.ico, and other static files
     */
    '/((?!om|api/track|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

### `lib/supabase/server.ts` (utility, request-response)

**Source:** `@supabase/ssr` official docs + CLAUDE.md critical rules
**Purpose:** Server-side Supabase client used in Server Components, Server Actions, and Route Handlers. Reads/writes cookies from the Next.js request context.

**Full pattern:**
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — cookie mutation silently ignored.
            // Only matters if middleware isn't refreshing sessions.
          }
        },
      },
    }
  )
}
```

**Usage in a Server Component or Server Action:**
```typescript
const supabase = await createSupabaseServerClient()
const { data: { user } } = await supabase.auth.getUser() // ALWAYS getUser()
```

---

### `lib/supabase/client.ts` (utility, request-response)

**Source:** `@supabase/ssr` official docs
**Purpose:** Browser-side Supabase client for use in Client Components (`'use client'`). Created once and reused.

**Full pattern:**
```typescript
// lib/supabase/client.ts
'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

### `lib/supabase/service.ts` (utility, request-response)

**Source:** ARCHITECTURE.md Q2, SUMMARY.md pitfall #1, CLAUDE.md critical rules
**Purpose:** Service-role Supabase client that bypasses RLS. Used ONLY in server-side code where no user session exists (OM page, tracking endpoint). NEVER exposed to client bundle.

**Critical rules:**
- `SUPABASE_SERVICE_ROLE_KEY` must NEVER appear in a `NEXT_PUBLIC_*` variable
- This file must NEVER be imported from a Client Component
- Use `import 'server-only'` to enforce this at build time

**Full pattern:**
```typescript
// lib/supabase/service.ts
import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export function createSupabaseServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // server-only env var, NEVER NEXT_PUBLIC_
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
```

---

### `app/auth/callback/route.ts` (route handler, request-response)

**Source:** `@supabase/ssr` official PKCE callback docs
**Purpose:** Exchanges the Supabase auth code for a session cookie after email confirmation / OAuth (future). Redirects to `/dashboard` on success.

**Full pattern:**
```typescript
// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Something went wrong — redirect to error page or login with error param
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
}
```

---

### `app/(auth)/login/actions.ts` (server action, request-response)

**Source:** Next.js 15 Server Actions + Supabase Auth docs + CONTEXT.md D-57 (inline errors via react-hook-form + zod)
**Purpose:** Handles sign-in form submission. Returns typed error object — no toast, inline field errors.

**Full pattern:**
```typescript
// app/(auth)/login/actions.ts
'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginState = {
  errors?: { email?: string[]; password?: string[]; general?: string[] }
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { errors: { general: [error.message] } }
  }

  redirect('/dashboard')
}
```

---

### `app/(auth)/signup/actions.ts` (server action, request-response)

**Source:** Same pattern as `login/actions.ts` — same zod + server action structure
**Purpose:** Handles sign-up form submission. Redirects to `/dashboard` on success (decision: no email confirm required for MVP).

**Full pattern:**
```typescript
// app/(auth)/signup/actions.ts
'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const SignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type SignUpState = {
  errors?: { email?: string[]; password?: string[]; general?: string[] }
}

export async function signUpAction(
  _prevState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const parsed = SignUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signUp({
    ...parsed.data,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { errors: { general: [error.message] } }
  }

  redirect('/dashboard')
}
```

---

### `app/(auth)/login/page.tsx` (page, request-response)

**Source:** CONTEXT.md decisions D-01 through D-04 + shadcn/ui Card component pattern
**Purpose:** Public sign-in page. Centered card, zinc theme, dark mode always on, "RealTools" text logo, inline errors.

**Full pattern:**
```typescript
// app/(auth)/login/page.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { LoginForm } from './login-form'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-zinc-50 text-center mb-8">
          RealTools
        </h1>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <p className="text-zinc-400 text-sm text-center">
              Sign in to your account
            </p>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
```

**Client form component pattern** (`login-form.tsx`):
```typescript
// app/(auth)/login/login-form.tsx
'use client'

import { useActionState } from 'react'
import { loginAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, {})

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="email" className="text-zinc-300">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          className="bg-zinc-800 border-zinc-700 text-zinc-50"
          disabled={isPending}
        />
        {state.errors?.email && (
          <p className="text-red-400 text-sm mt-1">{state.errors.email[0]}</p>
        )}
      </div>
      <div>
        <Label htmlFor="password" className="text-zinc-300">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          className="bg-zinc-800 border-zinc-700 text-zinc-50"
          disabled={isPending}
        />
        {state.errors?.password && (
          <p className="text-red-400 text-sm mt-1">{state.errors.password[0]}</p>
        )}
      </div>
      {state.errors?.general && (
        <p className="text-red-400 text-sm">{state.errors.general[0]}</p>
      )}
      <Button
        type="submit"
        className="w-full bg-white text-zinc-900 hover:bg-zinc-100"
        disabled={isPending}
      >
        {isPending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
```

---

### `app/(app)/layout.tsx` (layout, request-response)

**Source:** CONTEXT.md D-05, D-06 + Next.js App Router route groups pattern
**Purpose:** Authenticated app shell — wraps all broker-facing pages. Includes sidebar nav. Guards route by checking `getUser()`; redirects to login if no session (defense in depth — middleware is primary guard).

**Full pattern:**
```typescript
// app/(app)/layout.tsx
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/ui/sidebar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser() // ALWAYS getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  )
}
```

---

### `components/ui/sidebar.tsx` (component, request-response)

**Source:** CONTEXT.md D-05, D-06 — fixed sidebar, nav items: Deals, Buyers, Profile, Logout at bottom
**Purpose:** Fixed left sidebar. Server Component for structure; logout uses a Server Action or Client Component for the button.

**Full pattern:**
```typescript
// components/ui/sidebar.tsx
import Link from 'next/link'
import { LogoutButton } from './logout-button'

const navItems = [
  { href: '/dashboard', label: 'Deals' },
  { href: '/buyers', label: 'Buyers' },
  { href: '/profile', label: 'Profile' },
]

export function Sidebar() {
  return (
    <aside className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      <div className="p-4 border-b border-zinc-800">
        <span className="text-zinc-50 font-semibold">RealTools</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-3 py-2 rounded-md text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800 text-sm transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-zinc-800">
        <LogoutButton />
      </div>
    </aside>
  )
}
```

**Logout button** (`components/ui/logout-button.tsx`):
```typescript
// components/ui/logout-button.tsx
'use client'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 text-sm"
      onClick={handleLogout}
    >
      Log out
    </Button>
  )
}
```

---

### `app/(app)/dashboard/page.tsx` (page, request-response)

**Source:** ARCHITECTURE.md Q6 — Server Component, data fetching at page level, placeholder for Phase 2
**Purpose:** Phase 1 delivers a shell only — renders the layout with a placeholder message. Phase 2 adds deal list content.

**Full pattern:**
```typescript
// app/(app)/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-50 mb-6">Deals</h1>
      <p className="text-zinc-400 text-sm">
        Your deals will appear here. Create your first deal to get started.
      </p>
    </div>
  )
}
```

---

### `app/layout.tsx` (layout, config)

**Source:** CONTEXT.md D-04 — dark mode only, `class="dark"` always on `<html>`; no `next-themes`
**Purpose:** Root layout. Sets dark class permanently on `<html>`. No toggle, no theme provider.

**Full pattern:**
```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RealTools',
  description: 'CRE deal management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

---

### `supabase/migrations/001_initial_schema.sql` (migration, CRUD)

**Source:** ARCHITECTURE.md Data Model — exact SQL from canonical reference
**Purpose:** Creates all 6 tables with correct FK relationships and ON DELETE CASCADE.

**Full pattern (copy exactly from ARCHITECTURE.md):**
```sql
-- supabase/migrations/001_initial_schema.sql

CREATE TABLE deals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  address     TEXT,
  price       NUMERIC,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'active',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE buyers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  tags       TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE deal_buyers (
  deal_id         UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  buyer_id        UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  tracking_token  UUID NOT NULL DEFAULT gen_random_uuid(),
  om_sent_at      TIMESTAMPTZ,
  om_opened_at    TIMESTAMPTZ,
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
  event_type  TEXT NOT NULL,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE deal_files (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id      UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name    TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);
```

---

### `supabase/migrations/002_rls_policies.sql` (migration, CRUD)

**Source:** ARCHITECTURE.md Q5 — exact RLS SQL from canonical reference
**Purpose:** Enables RLS on every table and creates user-scoped policies. MUST be in same migration run as schema, or a separate numbered migration committed immediately after. No table may exist without both `ENABLE ROW LEVEL SECURITY` and at least one policy.

**Full pattern (copy exactly from ARCHITECTURE.md):**
```sql
-- supabase/migrations/002_rls_policies.sql

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_buyers ENABLE ROW LEVEL SECURITY;

-- DEALS
CREATE POLICY "Users can see own deals"
  ON deals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deals"
  ON deals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own deals"
  ON deals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own deals"
  ON deals FOR DELETE USING (auth.uid() = user_id);

-- BUYERS
CREATE POLICY "Users can manage own buyers"
  ON buyers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- NOTES (join check back to deals)
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

-- DEAL_BUYERS (ownership via deals join)
CREATE POLICY "Users can manage deal_buyers for own deals"
  ON deal_buyers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM deals WHERE deals.id = deal_buyers.deal_id AND deals.user_id = auth.uid()
    )
  );

-- ACTIVITIES (read-only for user; writes are service-role only)
CREATE POLICY "Users can read activities for own deals"
  ON activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deals WHERE deals.id = activities.deal_id AND deals.user_id = auth.uid()
    )
  );

-- DEAL_FILES (ownership via deals join)
CREATE POLICY "Users can manage deal_files for own deals"
  ON deal_files FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM deals WHERE deals.id = deal_files.deal_id AND deals.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deals WHERE deals.id = deal_files.deal_id AND deals.user_id = auth.uid()
    )
  );
```

---

### `supabase/migrations/003_indexes.sql` (migration, CRUD)

**Source:** ARCHITECTURE.md Scalability Considerations — required indexes from day one
**Purpose:** Performance indexes. Required before any data is inserted.

**Full pattern:**
```sql
-- supabase/migrations/003_indexes.sql

CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_buyers_user_id ON buyers(user_id);
CREATE INDEX idx_notes_deal_id ON notes(deal_id);
CREATE INDEX idx_activities_deal_id ON activities(deal_id);
CREATE INDEX idx_deal_buyers_tracking_token ON deal_buyers(tracking_token);
CREATE INDEX idx_deal_files_deal_id ON deal_files(deal_id);
```

---

### `.env.local` (config)

**Source:** CLAUDE.md critical rules + CONTEXT.md D-07
**Purpose:** Environment variable template. The planner's steps must include manual steps to populate these from the Supabase dashboard.

**Full pattern:**
```bash
# .env.local — never commit to git
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # server-only, NEVER NEXT_PUBLIC_
NEXT_PUBLIC_SITE_URL=http://localhost:3000          # change to production URL on Vercel
```

---

### `next.config.ts` (config)

**Source:** Next.js 15 App Router defaults
**Purpose:** Minimal config for a Next.js 15 TypeScript project. No special overrides needed for Phase 1.

**Full pattern:**
```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Phase 2 will add: images.remotePatterns for Supabase Storage URLs
}

export default nextConfig
```

---

## Shared Patterns

### Authentication — getUser() rule
**Apply to:** Every Server Component, Server Action, and Route Handler that reads auth state
**Source:** CLAUDE.md, SUMMARY.md pitfall #2
```typescript
// CORRECT — validates JWT server-side
const { data: { user } } = await supabase.auth.getUser()

// FORBIDDEN — trusts cookie without server validation
// const { data: { session } } = await supabase.auth.getSession()
```

### Supabase Client Selection
**Apply to:** Every file that creates a Supabase client
**Source:** CLAUDE.md, SUMMARY.md pitfall #1

| Context | Client to use | File |
|---------|--------------|------|
| Server Component / Server Action / Route Handler (with user session) | `createSupabaseServerClient()` | `lib/supabase/server.ts` |
| Client Component (`'use client'`) | `createSupabaseBrowserClient()` | `lib/supabase/client.ts` |
| OM page / tracking endpoint (no user session, bypasses RLS) | `createSupabaseServiceClient()` | `lib/supabase/service.ts` |
| middleware.ts | inline `createServerClient` from `@supabase/ssr` | (cannot import from lib in middleware) |

### Error Handling in Server Actions
**Apply to:** All Server Actions that call Supabase
**Source:** CONTEXT.md D-57 (inline errors, not toast)
```typescript
// Pattern: return typed error state instead of throwing
export type ActionState = {
  errors?: { fieldName?: string[]; general?: string[] }
  success?: boolean
}

// On Supabase error:
if (error) {
  return { errors: { general: [error.message] } }
}

// On success: redirect() — never return success from a redirect action
redirect('/dashboard')
```

### Zod Validation in Server Actions
**Apply to:** All Server Actions that accept form input
**Source:** SUMMARY.md (react-hook-form + zod, single schema for client + server)
```typescript
const Schema = z.object({
  field: z.string().min(1, 'Field is required'),
})

const parsed = Schema.safeParse(Object.fromEntries(formData))
if (!parsed.success) {
  return { errors: parsed.error.flatten().fieldErrors }
}
// Use parsed.data for the Supabase call
```

### Dark Mode — Always On
**Apply to:** Root layout (`app/layout.tsx`) and all className usage
**Source:** CONTEXT.md D-04
```typescript
// Root layout — always dark, never toggle
<html lang="en" className="dark">

// Tailwind classes always use zinc palette:
// Background: bg-zinc-950 (page), bg-zinc-900 (card/sidebar)
// Text: text-zinc-50 (primary), text-zinc-300 (secondary), text-zinc-400 (muted)
// Borders: border-zinc-800
// Primary button: bg-white text-zinc-900 hover:bg-zinc-100
```

### Route Group Conventions
**Apply to:** App Router directory structure
**Source:** Next.js App Router route groups
```
app/
  layout.tsx                  — root layout (dark html, no auth check)
  (auth)/                     — public auth pages (no sidebar)
    login/
      page.tsx
      login-form.tsx          — 'use client' form
      actions.ts              — 'use server' action
    signup/
      page.tsx
      signup-form.tsx
      actions.ts
  auth/
    callback/
      route.ts                — Supabase PKCE callback handler
  (app)/                      — authenticated app (sidebar layout)
    layout.tsx                — getUser() guard + Sidebar
    dashboard/
      page.tsx
    buyers/                   — placeholder in Phase 1
      page.tsx
    profile/                  — placeholder in Phase 1
      page.tsx
  om/                         — PUBLIC (not in (app) group — no auth layout)
    [deal-id]/
      page.tsx                — Phase 2+
  api/
    track/
      [token]/
        route.ts              — Phase 3
```

---

## No Analog Found

All files in this phase have no analog in the codebase (greenfield project). The planner MUST use the pattern excerpts above and the canonical references below as authoritative sources.

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| All 18 files listed above | various | various | Greenfield — no source files exist |

---

## Metadata

**Analog search scope:** Entire repository (`/Users/beni/Dev/RealTools`)
**Files scanned:** 0 source files found (only `CLAUDE.md` and `.planning/` artifacts exist)
**Pattern extraction date:** 2026-04-27
**Pattern source:** Official `@supabase/ssr` docs, Next.js 15 App Router docs, `ARCHITECTURE.md`, `SUMMARY.md`, `CONTEXT.md`

### Canonical References (planner must read before planning)
- `/Users/beni/Dev/RealTools/.planning/phases/01-foundation/01-CONTEXT.md` — locked decisions
- `/Users/beni/Dev/RealTools/.planning/research/ARCHITECTURE.md` — SQL schema, component boundaries, data flow
- `/Users/beni/Dev/RealTools/.planning/research/SUMMARY.md` — critical pitfalls, stack decisions
- `/Users/beni/Dev/RealTools/CLAUDE.md` — project-wide rules (getUser, RLS, service key scope)
