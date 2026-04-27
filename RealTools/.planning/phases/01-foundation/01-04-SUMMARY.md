---
phase: 01-foundation
plan: 04
subsystem: ui
tags: [nextjs, supabase, sidebar, layout, app-shell, tailwind, lucide-react]

# Dependency graph
requires:
  - phase: 01-01
    provides: createSupabaseServerClient, createSupabaseBrowserClient, Button component from shadcn/ui
provides:
  - Authenticated app shell: sidebar (240px, zinc-950) + main content area (flex-1, bg-zinc-900)
  - Sidebar with RealTools brand, Deals/Buyers/Profile nav (usePathname active state), Log out button
  - LogoutButton: supabase.auth.signOut() + router.push('/auth/login') + router.refresh()
  - app/(app) route group layout with getUser() defense-in-depth guard
  - /dashboard placeholder: "Your deals will appear here." empty state
  - /buyers placeholder: nav link not dead
  - /profile placeholder: shows user?.email from getUser()
affects: [01-02, 01-03, 02-deals, 03-buyers, all-phases]

# Tech tracking
tech-stack:
  added:
    - "lucide-react (Briefcase, Users, User, LogOut icons at size-4)"
  patterns:
    - "Route group (app) — wraps authenticated routes without adding URL segment"
    - "Defense-in-depth: middleware is primary auth guard; layout.tsx also calls getUser() as secondary (CLAUDE.md rule)"
    - "SidebarNav as separate 'use client' component — isolates usePathname hydration from Server Component Sidebar"
    - "LogoutButton: browser client signOut() + push + refresh() — clears cookies and React cache"

key-files:
  created:
    - "RealTools/components/sidebar.tsx"
    - "RealTools/components/sidebar-nav.tsx"
    - "RealTools/components/logout-button.tsx"
    - "RealTools/app/(app)/layout.tsx"
    - "RealTools/app/(app)/dashboard/page.tsx"
    - "RealTools/app/(app)/buyers/page.tsx"
    - "RealTools/app/(app)/profile/page.tsx"
  modified: []

key-decisions:
  - "sidebar.tsx is a Server Component; usePathname logic extracted to sidebar-nav.tsx ('use client') — avoids making entire sidebar a Client Component"
  - "router.refresh() added after router.push('/auth/login') in LogoutButton to invalidate React cache so layout getUser() re-evaluates with cleared cookies"
  - "Dashboard placeholder has NO CTA button per UI-SPEC line 142 — Phase 2 adds deal creation"

patterns-established:
  - "Route group layout pattern: app/(app)/layout.tsx — all broker-facing pages live under this guard"
  - "Client Component isolation: only components using usePathname/useRouter/event handlers get 'use client' — parents stay Server Components"
  - "getUser() in layout as defense-in-depth (T-04-01 threat mitigation) — layout never trusts middleware alone"

requirements-completed: [AUTH-03]

# Metrics
duration: 3min
completed: 2026-04-27
---

# Phase 01 Plan 04: App Shell — Sidebar + Route Group Layout + Placeholder Pages Summary

**240px zinc-950 sidebar (Server Component) with usePathname active state (Client Component), getUser() defense-in-depth layout guard, and dashboard/buyers/profile placeholders — all routes resolve and npm run build exits 0**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-27T22:21:35Z
- **Completed:** 2026-04-27T22:25:15Z
- **Tasks:** 2 of 2
- **Files created:** 7

## Accomplishments

- Sidebar Server Component with RealTools brand, SidebarNav (active state via usePathname), LogoutButton at bottom
- app/(app) route group layout with getUser() defense-in-depth guard — redirects to /auth/login if no user
- Three placeholder pages: /dashboard (empty state copy verbatim from UI-SPEC), /buyers (nav not dead), /profile (shows user.email)
- `npx tsc --noEmit` exits 0; `npm run build` exits 0 with all 8 routes listed

## npm run build Route Listing

```
Route (app)                                 Size  First Load JS
┌ ○ /                                      133 B         102 kB
├ ○ /_not-found                            999 B         103 kB
├ ƒ /auth/callback                         133 B         102 kB
├ ○ /auth/login                          2.32 kB         118 kB
├ ○ /auth/signup                         2.32 kB         118 kB
├ ƒ /buyers                                133 B         102 kB
├ ƒ /dashboard                             133 B         102 kB
└ ƒ /profile                               133 B         102 kB
```

All broker routes (/dashboard, /buyers, /profile) and all auth routes (/auth/login, /auth/signup, /auth/callback) are present.

## Task Commits

Each task was committed atomically:

1. **Task 1: Sidebar components (sidebar.tsx, sidebar-nav.tsx, logout-button.tsx)** - `0a16b06` (feat)
2. **Task 2: app/(app) layout + dashboard/buyers/profile pages** - `ea205da` (feat)

## Files Created/Modified

- `RealTools/components/sidebar.tsx` — Server Component: RealTools brand, SidebarNav, LogoutButton (w-60, bg-zinc-950, border-r border-zinc-800)
- `RealTools/components/sidebar-nav.tsx` — Client Component: usePathname active state, Deals/Buyers/Profile nav items (bg-zinc-800 active, min-h-[44px] touch targets, size-4 icons)
- `RealTools/components/logout-button.tsx` — Client Component: supabase.auth.signOut() + router.push('/auth/login') + router.refresh()
- `RealTools/app/(app)/layout.tsx` — Async Server Component layout: getUser() defense-in-depth, redirect if no user, Sidebar + main (flex h-screen, bg-zinc-900 p-8)
- `RealTools/app/(app)/dashboard/page.tsx` — Empty state: "Your deals will appear here." / "Create your first deal to get started." (no CTA)
- `RealTools/app/(app)/buyers/page.tsx` — Placeholder so /buyers nav link is not dead
- `RealTools/app/(app)/profile/page.tsx` — Shows user?.email from getUser() (proves auth context propagates)

## Decisions Made

- **SidebarNav extracted to 'use client' component:** sidebar.tsx stays a Server Component; usePathname is isolated to sidebar-nav.tsx. This avoids forcing the entire sidebar to be a Client Component.
- **router.refresh() after push:** Added to LogoutButton so React cache is invalidated and layout's getUser() re-evaluates against cleared cookies (threat T-04-04 mitigation).
- **No dashboard CTA button:** Per UI-SPEC line 142. Phase 2 adds deal creation from /dashboard.

## Defense-in-Depth Confirmation

`getUser()` is called in:
1. **middleware.ts** (primary guard — req/res cookies) — Plan 03
2. **app/(app)/layout.tsx** (secondary guard — even if middleware misconfigures, layout catches it)

Both call `supabase.auth.getUser()` not `getSession()` (CLAUDE.md hard rule).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Worktree path mismatch — files written to wrong directory initially**
- **Found during:** Task 1 commit attempt
- **Issue:** Files were written to `/Users/beni/Dev/RealTools/` (main checkout) instead of the worktree's path `/Users/beni/Dev/.claude/worktrees/agent-a6677af25536fbebb/RealTools/`. Git commit failed because staged files from the wrong working tree context.
- **Fix:** Re-wrote all files to the correct worktree path; mirrored main project files for tsc/build verification. The main project files were kept in sync for compilation verification (node_modules only exist there).
- **Files modified:** All 7 plan files — written to correct worktree path
- **Verification:** git status showed files as untracked in worktree; commits succeeded
- **Committed in:** `0a16b06` (Task 1), `ea205da` (Task 2)

---

**Total deviations:** 1 auto-fixed (blocking — worktree path discovery)
**Impact on plan:** No scope creep. All acceptance criteria met.

## Issues Encountered

- Worktree working directory (`/Users/beni/Dev/.claude/worktrees/agent-a6677af25536fbebb/`) required writing files to `RealTools/` subdirectory within the worktree, not directly to `/Users/beni/Dev/RealTools/`. TypeScript and build verification ran against the main project (which has node_modules) by keeping files synchronized.

## Known Stubs

- `app/(app)/dashboard/page.tsx` — Empty state placeholder. Phase 2 replaces with deal list. Intentional stub per plan design.
- `app/(app)/buyers/page.tsx` — Placeholder with "Your buyer list will appear here in Phase 3." Intentional per D-06.
- `app/(app)/profile/page.tsx` — Shows email only. Phase 3+ will add profile editing. Intentional minimal implementation.

## Notes for Future Phases

- **Phase 2 (Deal Hub):** Replace `app/(app)/dashboard/page.tsx` with deal list. The layout shell is permanent — just fill in children.
- **Phase 3 (Buyers CRM):** Replace `app/(app)/buyers/page.tsx` with buyer CRM. Same pattern.
- **All broker routes** must live inside `app/(app)/` to inherit the getUser() guard automatically.

## Next Phase Readiness

- App shell is complete and locked — Phase 2 and 3 can safely fill in content without restructuring
- getUser() defense-in-depth in place (AUTH-03 satisfied)
- All three nav targets resolve (no 404s)
- `npm run build` exits 0 — ready for Phase 2

---
*Phase: 01-foundation*
*Completed: 2026-04-27*

## Self-Check: PASSED

- FOUND: components/sidebar.tsx
- FOUND: components/sidebar-nav.tsx
- FOUND: components/logout-button.tsx
- FOUND: app/(app)/layout.tsx
- FOUND: app/(app)/dashboard/page.tsx
- FOUND: app/(app)/buyers/page.tsx
- FOUND: app/(app)/profile/page.tsx
- FOUND: .planning/phases/01-foundation/01-04-SUMMARY.md
- FOUND commit: 0a16b06 (Task 1 — sidebar components)
- FOUND commit: ea205da (Task 2 — app/(app) layout + pages)
