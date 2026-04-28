# Phase 2: Deal Hub - Pattern Map

**Mapped:** 2026-04-28
**Files analyzed:** 18 new/modified files
**Analogs found:** 14 / 18 (4 are new shadcn components — install from CLI/source)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `app/(app)/dashboard/page.tsx` | page (Server Component) | request-response | `app/(app)/profile/page.tsx` | role-match |
| `app/(app)/deals/[id]/page.tsx` | page (Server Component) | request-response + CRUD | `app/(app)/profile/page.tsx` | role-match |
| `app/om/[id]/page.tsx` | page (Server Component, public) | request-response | `app/(app)/profile/page.tsx` + `lib/supabase/service.ts` | partial-match |
| `components/deals/deal-card.tsx` | component (Server) | request-response | `app/auth/login/page.tsx` (Card usage) | partial-match |
| `components/deals/deal-form-modal.tsx` | component (Client) | CRUD | `app/auth/login/login-form.tsx` | role-match |
| `components/deals/delete-deal-dialog.tsx` | component (Client) | CRUD | `components/logout-button.tsx` | partial-match |
| `components/notes/notes-section.tsx` | component (Client) | CRUD | `app/auth/login/login-form.tsx` | role-match |
| `components/notes/note-item.tsx` | component (Client) | CRUD | `app/auth/login/login-form.tsx` | role-match |
| `components/files/files-section.tsx` | component (Client) | file-I/O | `components/logout-button.tsx` (browser client usage) | partial-match |
| `lib/actions/deal-actions.ts` | server action | CRUD | `app/auth/login/actions.ts` | exact |
| `lib/actions/note-actions.ts` | server action | CRUD | `app/auth/login/actions.ts` | exact |
| `lib/actions/file-actions.ts` | server action | file-I/O | `app/auth/signup/actions.ts` | role-match |
| `components/ui/dialog.tsx` | ui component | — | `components/ui/button.tsx` (shadcn pattern) | role-match |
| `components/ui/textarea.tsx` | ui component | — | `components/ui/input.tsx` | exact |
| `components/ui/badge.tsx` | ui component | — | `components/ui/button.tsx` (cva pattern) | role-match |
| `components/ui/separator.tsx` | ui component | — | `components/ui/card.tsx` (Radix pattern) | role-match |
| `components/ui/alert-dialog.tsx` | ui component | — | `components/ui/button.tsx` (shadcn pattern) | role-match |
| `components/ui/select.tsx` | ui component | — | `components/ui/button.tsx` (shadcn pattern) | role-match |

---

## Pattern Assignments

### `app/(app)/dashboard/page.tsx` (page, request-response)

**Analog:** `app/(app)/profile/page.tsx`

This file REPLACES the current placeholder. The profile page is the best real analog for an authenticated Server Component that calls `createSupabaseServerClient()` and renders data. The dashboard adds a data fetch and card grid on top of that pattern.

**Auth + fetch pattern** — copy from `app/(app)/profile/page.tsx` lines 1-8:
```typescript
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  // Note: layout.tsx already redirects unauthenticated users,
  // but CLAUDE.md rule requires getUser() for defense-in-depth.
```

**Card import pattern** — from `app/auth/login/page.tsx` line 1:
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
```

**Dark-mode card styling** — from `app/auth/login/page.tsx` line 12:
```tsx
<Card className="bg-zinc-900 border-zinc-800">
```

**Page wrapper (zinc-900 main area)** — from `app/(app)/layout.tsx` line 23:
```tsx
<main className="flex-1 overflow-y-auto bg-zinc-900 p-8">
  {children}
</main>
```
Dashboard page content renders inside this wrapper — use `p-8` spacing and `bg-zinc-900` surface.

---

### `app/(app)/deals/[id]/page.tsx` (page, request-response)

**Analog:** `app/(app)/profile/page.tsx` + RESEARCH.md Pattern 5

This is the most complex page: three parallel Supabase queries + signed URL generation, then props passed down to Client Components. The profile page provides the auth+fetch skeleton; RESEARCH.md Pattern 5 provides the deal-specific fetch structure.

**Auth + parallel fetch skeleton**:
```typescript
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

  const [dealResult, notesResult, filesResult] = await Promise.all([
    supabase.from('deals').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('notes').select('*').eq('deal_id', id).order('created_at', { ascending: false }),
    supabase.from('deal_files').select('*').eq('deal_id', id).order('created_at', { ascending: false }),
  ])

  if (!dealResult.data) notFound()
  // ... signed URL generation, then return JSX
}
```

**Note on params:** Next.js 15 `params` is a Promise — always `await params` before accessing `id`. The profile page doesn't use params, but the login page also doesn't — this is confirmed pattern from RESEARCH.md Pattern 4 and 5.

---

### `app/om/[id]/page.tsx` (page, request-response, PUBLIC)

**Analogs:** `lib/supabase/service.ts` (service client) + RESEARCH.md Pattern 4

This page is architecturally distinct. It MUST use `createSupabaseServiceClient` (not server client), MUST NOT call `cookies()`, and MUST export `dynamic = 'force-dynamic'`.

**Service client pattern** — from `lib/supabase/service.ts` lines 1-16 (full file):
```typescript
import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export function createSupabaseServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
```

**OM page top-level structure**:
```typescript
import { createSupabaseServiceClient } from '@/lib/supabase/service'
// DO NOT import createSupabaseServerClient here — cookies() would be called

export const dynamic = 'force-dynamic'

export default async function OmPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createSupabaseServiceClient()  // note: NOT awaited (sync factory)
  // ...
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      {/* Light mode — no sidebar, no auth chrome */}
    </main>
  )
}
```

**Critical:** The OM page uses light mode (`bg-white text-zinc-900`) — the opposite of the zinc dark theme used everywhere else in the app.

---

### `components/deals/deal-card.tsx` (component, Server)

**Analog:** `app/auth/login/page.tsx` (Card usage pattern)

A Server Component that receives a deal object as props and renders a Card. Card sub-components and dark-mode styling come directly from the existing login page usage.

**Card imports**:
```typescript
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
```

**Card dark-mode styling** — from `app/auth/login/page.tsx` line 12:
```tsx
<Card className="bg-zinc-900 border-zinc-800">
  <CardHeader>
    <CardTitle className="text-zinc-50">{deal.title}</CardTitle>
  </CardHeader>
  <CardContent>
    <StatusBadge status={deal.status} />
  </CardContent>
</Card>
```

**Status badge config** (per CONTEXT.md Claude's Discretion + RESEARCH.md Code Examples):
```typescript
const statusConfig = {
  active:      { label: 'Active',      className: 'bg-green-500/10 text-green-500 border-green-500/20' },
  negotiating: { label: 'Negotiating', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  closed:      { label: 'Closed',      className: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
} as const
```

---

### `components/deals/deal-form-modal.tsx` (component, Client, CRUD)

**Analog:** `app/auth/login/login-form.tsx`

This is the primary Client Component pattern in the project. The login form establishes: `'use client'`, `useActionState` from `react`, `Loader2` spinner on submit, field-level error display, dark-mode Input/Label styling. The deal form modal wraps this same form pattern inside a Dialog.

**Client directive + useActionState** — from `app/auth/login/login-form.tsx` lines 1-13:
```typescript
'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { loginAction, type LoginState } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: LoginState = {}

export function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, initialState)
```

**Form field with dark-mode styling** — from `app/auth/login/login-form.tsx` lines 17-30:
```tsx
<div className="space-y-2">
  <Label htmlFor="email" className="text-zinc-300">Email</Label>
  <Input
    id="email"
    name="email"
    type="email"
    className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
    disabled={isPending}
  />
  {state.errors?.email && (
    <p className="text-sm text-red-500">{state.errors.email[0]}</p>
  )}
</div>
```

**Submit button with spinner** — from `app/auth/login/login-form.tsx` lines 50-63:
```tsx
<Button
  type="submit"
  className="w-full bg-white text-zinc-950 hover:bg-zinc-100"
  disabled={isPending}
>
  {isPending ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Signing in...
    </>
  ) : (
    'Sign in'
  )}
</Button>
```

**Additional for modal:** Add `useState` for `open` state, wrap the form in `<Dialog open={open} onOpenChange={setOpen}>`. Use separate `useState` for open — do NOT derive from action state (Pitfall 2 in RESEARCH.md).

---

### `components/deals/delete-deal-dialog.tsx` (component, Client, CRUD)

**Analog:** `components/logout-button.tsx`

The logout button shows the pattern for a Client Component that: imports `'use client'`, uses a browser event to trigger a destructive action, and calls a function on click. Delete dialog wraps this in an `AlertDialog` for confirmation.

**Client component with destructive action** — from `components/logout-button.tsx` lines 1-8:
```typescript
'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
```

**Delete dialog wraps button in AlertDialog** (new shadcn component):
```tsx
import { AlertDialog, AlertDialogTrigger, AlertDialogContent,
         AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
         AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { deleteDealAction } from '@/lib/actions/deal-actions'
```

---

### `components/notes/notes-section.tsx` (component, Client, CRUD)

**Analog:** `app/auth/login/login-form.tsx`

Full notes UI is a Client Component with inline add/edit UX. It uses the same `useActionState` + form pattern as the login form. Multiple action bindings (add, edit, delete) are handled with `bind` on the server action or separate forms.

**Client form base pattern** — identical to `deal-form-modal.tsx` imports and `useActionState` structure. Key differences:
- No Dialog wrapper — inline on the page
- `useState` controls whether the "Add Note" textarea is visible
- Notes list rendered below the add form

**Inline textarea pattern** (uses new `components/ui/textarea.tsx`):
```tsx
import { Textarea } from '@/components/ui/textarea'
// Textarea styling mirrors Input:
<Textarea
  name="content"
  className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
  placeholder="Add a note..."
  disabled={isPending}
/>
```

---

### `components/notes/note-item.tsx` (component, Client, CRUD)

**Analog:** `app/auth/login/login-form.tsx` (subset pattern)

A single note with inline edit/delete. Follows the same Client Component form conventions — `useActionState` for edit, `useState` to toggle edit mode, Button with Loader2 for submit. Delete triggers a Server Action via `AlertDialog` (same as `delete-deal-dialog.tsx`).

---

### `components/files/files-section.tsx` (component, Client, file-I/O)

**Analog:** `components/logout-button.tsx` (browser client usage pattern)

The logout button is the only existing example of importing and calling `createSupabaseBrowserClient()` inside a Client Component for a non-form side-effect action. The files section extends this pattern to Storage.

**Browser Supabase client** — from `components/logout-button.tsx` lines 1-6:
```typescript
'use client'

import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
```

**Browser client import** — from `lib/supabase/client.ts` lines 1-11 (full file):
```typescript
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

**File upload handler pattern** (from RESEARCH.md Pattern 3):
```typescript
const supabase = createSupabaseBrowserClient()
const path = `${userId}/${dealId}/${Date.now()}-${file.name}`
const { error } = await supabase.storage
  .from('deal-files')
  .upload(path, file, { upsert: false })
```

---

### `lib/actions/deal-actions.ts` (server action, CRUD)

**Analog:** `app/auth/login/actions.ts` — EXACT match

This is the primary server action analog. Every deal action copies this file's structure exactly: `'use server'` directive, zod schema, action function signature with `_prevState` + `formData`, `safeParse`, `createSupabaseServerClient()`, `getUser()` auth check, database call, error return shape. Add `revalidatePath` after successful mutations.

**Full action pattern** — from `app/auth/login/actions.ts` lines 1-42 (full file):
```typescript
'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const LoginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type LoginState = {
  errors?: {
    email?: string[]
    password?: string[]
    general?: string[]
  }
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
    return { errors: { general: ['Incorrect email or password'] } }
  }

  redirect('/dashboard')
}
```

**Deal action additions over the login action template:**
1. Add `import { revalidatePath } from 'next/cache'` after the redirect import
2. Add `getUser()` auth check: `const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect('/auth/login')`
3. Replace `supabase.auth.signInWithPassword` with `supabase.from('deals').insert({...})`
4. Replace `redirect('/dashboard')` with `revalidatePath('/dashboard'); return {}`

---

### `lib/actions/note-actions.ts` (server action, CRUD)

**Analog:** `app/auth/login/actions.ts` — exact (same pattern as deal-actions)

Same template as deal-actions. Differences:
- Schema validates `content` (note body) + `deal_id` (hidden field)
- After mutation: `revalidatePath(`/deals/${dealId}`)` not `/dashboard`
- Table: `notes` not `deals`

---

### `lib/actions/file-actions.ts` (server action, file-I/O)

**Analog:** `app/auth/signup/actions.ts` — role-match

The signup action is the better analog here because it also returns a state type without field-level errors (just a `general` error). File actions only need to INSERT/DELETE a `deal_files` DB record (the browser handles the actual Storage upload directly). The action signature is the same pattern.

**Signup action structure** — from `app/auth/signup/actions.ts` lines 1-6:
```typescript
'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
```

---

### `components/ui/textarea.tsx` (ui component)

**Analog:** `components/ui/input.tsx` — EXACT structural match

Textarea is the closest shadcn component to Input — same `cn()` pattern, same `data-slot` attribute convention, same `React.ComponentProps` typing. Copy Input and swap `<input>` for `<textarea>`, remove `type` prop, adjust height class.

**Input structure to copy** — from `components/ui/input.tsx` lines 1-21 (full file):
```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground ...",
        className
      )}
      {...props}
    />
  )
}

export { Input }
```

**Textarea adaptation:** Replace `React.ComponentProps<"input">` with `React.ComponentProps<"textarea">`, remove `type` prop, change `data-slot="input"` to `data-slot="textarea"`, add `min-h-[80px]` to className.

---

### `components/ui/badge.tsx` (ui component)

**Analog:** `components/ui/button.tsx` — cva variant pattern

Badge uses `cva` (class-variance-authority) exactly like Button. Copy the cva setup from button.tsx, simplify to badge variants (default, secondary, destructive, outline).

**CVA import pattern** — from `components/ui/button.tsx` lines 1-6:
```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
```

**CVA usage** — from `components/ui/button.tsx` lines 7-36:
```typescript
const buttonVariants = cva(
  "inline-flex items-center ...",
  {
    variants: {
      variant: { default: "...", destructive: "...", ... },
      size: { default: "...", sm: "...", ... },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)
```

Badge does not need `Slot`/`asChild` — simpler than Button. Use `data-slot="badge"`.

---

### `components/ui/dialog.tsx` (ui component)

**Analog:** `components/ui/button.tsx` (shadcn structural pattern)

No direct analog exists — Dialog is a new Radix-based component. The button.tsx shows how shadcn wraps Radix primitives: `import * as DialogPrimitive from "@radix-ui/react-dialog"`, re-export as named functions with `cn()` className merging and `data-slot` attributes.

**Radix wrapper pattern** — from `components/ui/button.tsx` lines 1-4:
```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
```

Adapt: `import * as DialogPrimitive from "@radix-ui/react-dialog"`. Exports needed: `Dialog`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`. All use `cn()` for className and `data-slot="dialog-*"` attributes.

---

### `components/ui/alert-dialog.tsx` (ui component)

**Analog:** `components/ui/dialog.tsx` (once written) — identical Radix-wrapper pattern

AlertDialog mirrors Dialog structurally. Uses `@radix-ui/react-alert-dialog`. Additional exports: `AlertDialogAction`, `AlertDialogCancel` (styled with Button variants — destructive for Action, outline for Cancel).

---

### `components/ui/separator.tsx` (ui component)

**Analog:** `components/ui/input.tsx` — thin Radix wrapper pattern

Separator is a thin wrapper around `@radix-ui/react-separator`. Single component, no variants. Uses `cn()` and `data-slot="separator"`.

---

### `components/ui/select.tsx` (ui component)

**Analog:** `components/ui/dialog.tsx` (once written) — Radix wrapper pattern

Select wraps `@radix-ui/react-select`. Exports: `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue`, `SelectGroup`, `SelectLabel`. Uses `cn()` + `data-slot` convention.

---

## Shared Patterns

### Pattern A: Supabase Server Client (auth check)

**Source:** `lib/supabase/server.ts` + `app/(app)/layout.tsx` lines 10-14

**Apply to:** All Server Component pages inside `(app)` group, all Server Actions

```typescript
// In Server Component:
const supabase = await createSupabaseServerClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/auth/login')

// In Server Action:
const supabase = await createSupabaseServerClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/auth/login')
```

NEVER use `getSession()`. NEVER use `@supabase/auth-helpers-nextjs`.

---

### Pattern B: Server Action structure

**Source:** `app/auth/login/actions.ts` lines 1-42 (full file)

**Apply to:** `lib/actions/deal-actions.ts`, `lib/actions/note-actions.ts`, `lib/actions/file-actions.ts`

Every Server Action:
1. `'use server'` directive at top
2. Named `export type FooState = { errors?: { ... } }` for the state shape
3. Function signature: `async function fooAction(_prevState: FooState, formData: FormData): Promise<FooState>`
4. `zod.safeParse` before any DB call
5. `createSupabaseServerClient()` + `getUser()` auth check
6. DB operation, error check, `revalidatePath`, return `{}`

---

### Pattern C: Client Component form with useActionState

**Source:** `app/auth/login/login-form.tsx` lines 1-66 (full file)

**Apply to:** `components/deals/deal-form-modal.tsx`, `components/notes/notes-section.tsx`, `components/notes/note-item.tsx`

Every interactive Client Component:
1. `'use client'` directive at top
2. `import { useActionState } from 'react'` — NOT from `react-dom`
3. `const [state, action, isPending] = useActionState(serverAction, initialState)`
4. `<form action={action}>` — native form action binding
5. `disabled={isPending}` on all inputs and submit button
6. `<Loader2 className="mr-2 h-4 w-4 animate-spin" />` inside submit button when pending
7. Field error display: `{state.errors?.field && <p className="text-sm text-red-500">{state.errors.field[0]}</p>}`

---

### Pattern D: Dark-mode Input/Label styling

**Source:** `app/auth/login/login-form.tsx` lines 17-30

**Apply to:** All form fields inside `(app)` group (deal form, note form)

```tsx
<Label htmlFor="field" className="text-zinc-300">Field Label</Label>
<Input
  id="field"
  name="field"
  className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
  disabled={isPending}
/>
```

---

### Pattern E: Dark-mode Card styling

**Source:** `app/auth/login/page.tsx` lines 12-13

**Apply to:** `components/deals/deal-card.tsx`, any Card used inside the `(app)` group

```tsx
<Card className="bg-zinc-900 border-zinc-800">
```

Card sub-components: `CardHeader`, `CardTitle` (`text-zinc-50`), `CardDescription` (`text-zinc-400`), `CardContent`, `CardFooter`.

---

### Pattern F: Browser Supabase client in Client Components

**Source:** `components/logout-button.tsx` lines 4-5 + `lib/supabase/client.ts` lines 1-11

**Apply to:** `components/files/files-section.tsx`, `components/deals/delete-deal-dialog.tsx`

```typescript
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
// Inside event handler (NOT at module level):
const supabase = createSupabaseBrowserClient()
```

---

### Pattern G: cn() utility for className merging

**Source:** `lib/utils.ts` lines 1-6 (full file) + used throughout all `components/ui/*.tsx`

**Apply to:** All new `components/ui/*.tsx` files

```typescript
import { cn } from "@/lib/utils"
// Usage: className={cn("base-classes", conditionalClass && "extra", className)}
```

---

### Pattern H: Service role client for public pages

**Source:** `lib/supabase/service.ts` lines 1-16 (full file)

**Apply to:** `app/om/[id]/page.tsx` ONLY

```typescript
import { createSupabaseServiceClient } from '@/lib/supabase/service'
// Sync factory — no await:
const supabase = createSupabaseServiceClient()
```

NEVER import `createSupabaseServerClient` on the OM page — it calls `cookies()` which fails for unauthenticated requests.

---

### Pattern I: Sidebar nav active state

**Source:** `components/sidebar-nav.tsx` lines 8-11

**Apply to:** `components/sidebar-nav.tsx` (MODIFY existing file)

Current navItem for Deals:
```typescript
{ href: '/dashboard', label: 'Deals', icon: Briefcase, matchPrefix: '/dashboard' },
```

Must be updated so `/deals/[id]` also highlights the "Deals" nav item. Change `matchPrefix` to match both `/dashboard` and `/deals`:
```typescript
{ href: '/dashboard', label: 'Deals', icon: Briefcase, matchPrefix: '/dashboard' },
// Active check:
const isActive = pathname === href || pathname.startsWith('/dashboard') || pathname.startsWith('/deals')
```

Or add `matchPrefixes: ['/dashboard', '/deals']` array — either approach is valid.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `app/om/[id]/page.tsx` | page (public SSR) | request-response | No existing public (unauthenticated) page in codebase; closest is the login page but it doesn't use service role — patterns from RESEARCH.md Pattern 4 apply directly |

All shadcn UI components (`dialog`, `alert-dialog`, `separator`, `select`) have no analog in the codebase — install via CLI (`npx shadcn@latest add dialog alert-dialog separator select`) or write manually from shadcn/ui canonical source. The `textarea` and `badge` analogs (`input.tsx` and `button.tsx`) are close enough to derive directly.

---

## Metadata

**Analog search scope:** `app/`, `components/`, `lib/`
**Files scanned:** 26 TypeScript/TSX files
**Pattern extraction date:** 2026-04-28
