# RealTools

CRE deal management SaaS. One Deal Hub per property. Broker creates deal → generates OM → sends to buyers → tracks opens.

## Stack

- Next.js 15 (App Router) + TypeScript
- Supabase (Auth + Postgres + Storage) — use `@supabase/ssr`, NEVER `@supabase/auth-helpers-nextjs`
- TailwindCSS + shadcn/ui
- Resend (email)
- Vercel (hosting)

## Critical Rules

- Server-side auth: always `getUser()`, NEVER `getSession()` — silent security hole
- Middleware matcher: explicitly exclude `/om/*` and `/api/track/*` from auth
- Service role key: server-only modules only, NEVER `NEXT_PUBLIC_*`
- RLS: every table gets RLS + policy in the same migration, no exceptions
- OM tracking: URL-based (`?ref=[token]`) is PRIMARY signal; pixel is secondary
- No Zustand/Redux — server components + server actions + `revalidatePath` only

## GSD Workflow

This project uses the GSD planning system. Planning artifacts live in `.planning/`.

- `/gsd-progress` — check current phase status
- `/gsd-discuss-phase N` — discuss phase N before planning
- `/gsd-plan-phase N` — create execution plan for phase N
- `/gsd-execute-phase N` — execute phase N plans
- `/gsd-verify-work` — verify phase deliverables

Always read `.planning/STATE.md` at session start for current context.
