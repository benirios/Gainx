---
phase: 01-foundation
plan: 03
subsystem: auth
tags: [auth, middleware, supabase-ssr, server-actions, nextjs]

# Dependency graph
requires:
  - 01-01  # createSupabaseServerClient, shadcn/ui primitives
provides:
  - "middleware.ts: per-request session refresh with /om and /api/track exclusions"
  - "app/auth/login/: login page + form + Server Action"
  - "app/auth/signup/: signup page + form + Server Action"
  - "app/auth/callback/route.ts: PKCE code exchange handler"
affects:
  - 01-04  # layout's logout target is /auth/login; LogoutButton is client component
  - phase-2  # /om/* public route exclusion in middleware is load-bearing
  - phase-3  # /api/track/* exclusion in middleware is load-bearing

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "middleware.ts uses inline createServerClient from @supabase/ssr — cannot import from lib/supabase/server (edge runtime incompatibility)"
    - "useActionState (React 19) with typed LoginState/SignUpState — no react-hook-form on auth forms"
    - "Server Actions return typed error state; redirect() on success; no toast for auth errors (UI-SPEC line 156)"
    - "Middleware getUser() on every request — JWT server-side validation, never getSession()"

key-files:
  created:
    - "RealTools/middleware.ts"
    - "RealTools/app/auth/login/actions.ts"
    - "RealTools/app/auth/login/page.tsx"
    - "RealTools/app/auth/login/login-form.tsx"
    - "RealTools/app/auth/signup/actions.ts"
    - "RealTools/app/auth/signup/page.tsx"
    - "RealTools/app/auth/signup/signup-form.tsx"
    - "RealTools/app/auth/callback/route.ts"
  modified: []

key-decisions:
  - "Literal app/auth/login/ path (not route group (auth)/) — URLs are /auth/login and /auth/signup, matching middleware redirect target and callback failure redirect"
  - "useActionState over react-hook-form for two-field auth forms — simpler, server-roundtrip validation is correct for security"
  - "CookieOptions explicit type annotation in middleware.ts setAll callback — same fix as Plan 01's server.ts (implicit any in @supabase/ssr callback)"

# Metrics
duration: 3min
completed: 2026-04-27
---

# Phase 01 Plan 03: Middleware + Auth Pages Summary

**Middleware with getUser() + /om and /api/track exclusions, login/signup pages with useActionState Server Actions, and PKCE callback route — npm run build exits 0**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-27T22:21:30Z
- **Completed:** 2026-04-27T22:24:00Z
- **Tasks completed:** 3 of 3
- **Files created/modified:** 8 created

## Accomplishments

- `middleware.ts` created at project root with `createServerClient` from `@supabase/ssr`, `getUser()` on every request, redirect logic for protected routes and auth pages, and negative-lookahead matcher excluding `/om`, `/api/track`, `/auth/callback`, and static files
- Login page (`/auth/login`) — Server Component with zinc dark card, `LoginForm` client component using `useActionState`, inline errors, no toast
- Signup page (`/auth/signup`) — mirror structure, "Create account" CTA, "Already have an account?" toggle link
- Both Server Actions validate with zod server-side, return typed error states with UI-SPEC copy verbatim, call `redirect('/dashboard')` on success
- PKCE callback route (`/auth/callback`) exchanges code for session, redirects to `/dashboard` on success, `/auth/login?error=auth_callback_failed` on failure
- `npx tsc --noEmit` exits 0; `npm run build` exits 0

## Task Commits

Each task committed atomically:

1. **Task 1: middleware.ts** — `acbf7b6` (feat)
2. **Task 2: Login page + form + Server Action** — `87b7ac7` (feat)
3. **Task 3: Signup page + form + Server Action + callback route** — `449204a` (feat)

## Route Group Deviation (per plan spec)

`app/auth/login/` and `app/auth/signup/` use literal paths — NOT the route group `(auth)/` pattern from PATTERNS.md. This is the documented deviation in the plan's objective: URLs are `/auth/login` and `/auth/signup`, which match the middleware's redirect target (`/auth/login`) and the callback's failure redirect. If `(auth)/` were used, URLs would be `/login` and `/signup`, breaking the middleware logic.

## /om/* Exclusion Verification

The middleware matcher regex is:
```
/((?!om|api/track|auth/callback|_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)
```

A request to `/om/anything` matches the negative-lookahead and is excluded from middleware processing — no redirect occurs. A request to `/dashboard` without auth is redirected to `/auth/login`.

Manual curl test requires `npm run dev` with a real Supabase project (`.env.local` populated — Plan 01 Task 3 checkpoint). Expected results per plan:
- `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/om/anything` → `404` (NOT `307`)
- `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/dashboard` → `307` (redirect to /auth/login)

## Files Created

| File | Purpose |
|------|---------|
| `middleware.ts` | Per-request session refresh + route protection, /om and /api/track excluded |
| `app/auth/login/actions.ts` | loginAction Server Action: zod + signInWithPassword + typed error state |
| `app/auth/login/page.tsx` | Login page Server Component: zinc-950 bg, zinc-900 card, UI-SPEC copy |
| `app/auth/login/login-form.tsx` | Login form Client Component: useActionState, inline errors, Loader2 |
| `app/auth/signup/actions.ts` | signUpAction Server Action: zod + signUp + duplicate-email detection |
| `app/auth/signup/page.tsx` | Signup page Server Component: "Create your account", /auth/login link |
| `app/auth/signup/signup-form.tsx` | Signup form Client Component: useActionState, "Create account" CTA |
| `app/auth/callback/route.ts` | GET handler: exchangeCodeForSession → /dashboard or /auth/login?error |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed implicit `any` TypeScript errors in middleware.ts setAll callback**
- **Found during:** Task 1 — TypeScript check after creating middleware.ts
- **Issue:** `setAll` callback `cookiesToSet` parameter had implicit `any` type — same pattern as server.ts in Plan 01
- **Fix:** Added `CookieOptions` import from `@supabase/ssr` and explicit type annotation `cookiesToSet: { name: string; value: string; options: CookieOptions }[]`
- **Files modified:** `middleware.ts`
- **Verification:** `npx tsc --noEmit` exits 0
- **Committed in:** `acbf7b6` (Task 1 commit)

## Threat Surface Scan

All security mitigations from the plan's threat model are implemented:

| Threat ID | Disposition | Implementation |
|-----------|-------------|----------------|
| T-03-01 | mitigated | `getUser()` in middleware (grep confirmed, `getSession` absent) |
| T-03-02 | mitigated | Matcher regex negative-lookahead for `om\|api/track\|auth/callback` |
| T-03-03 | mitigated | Zod `safeParse` in both Server Actions; client form has no independent security role |
| T-03-05 | mitigated | Generic error copy returned; raw Supabase error never exposed |

No new threat surface introduced beyond what was planned.

## Note for Plan 04

- Layout's logout should call `supabase.auth.signOut()` then `router.push('/auth/login')` — the `LogoutButton` client component already exists at `components/logout-button.tsx` with this exact pattern
- Middleware's `isAuthRoute` check uses `.startsWith('/auth')` — so `/auth/callback` is treated as an auth route and won't trigger the unauthenticated redirect (the matcher also explicitly excludes `/auth/callback`)
- Dashboard redirect target is `/dashboard` — Plan 04's app shell must provide this route

## Self-Check: PASSED

All 8 files exist. All 3 commits verified in git log. `npx tsc --noEmit` and `npm run build` both exit 0.
