# Graph Report - RealTools  (2026-04-30)

## Corpus Check
- 50 files · ~13,733 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 137 nodes · 113 edges · 8 communities detected
- Extraction: 71% EXTRACTED · 29% INFERRED · 0% AMBIGUOUS · INFERRED: 33 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 44|Community 44]]

## God Nodes (most connected - your core abstractions)
1. `createSupabaseServerClient()` - 14 edges
2. `GET()` - 8 edges
3. `RealTools` - 8 edges
4. `State Management Approach` - 5 edges
5. `Next.js 15 (App Router)` - 4 edges
6. `Supabase` - 4 edges
7. `signUpAction()` - 3 edges
8. `loginAction()` - 3 edges
9. `handleFileChange()` - 3 edges
10. `createDealAction()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `AppLayout()` --calls--> `createSupabaseServerClient()`  [INFERRED]
  app/(app)/layout.tsx → lib/supabase/server.ts
- `ProfilePage()` --calls--> `createSupabaseServerClient()`  [INFERRED]
  app/(app)/profile/page.tsx → lib/supabase/server.ts
- `signUpAction()` --calls--> `createSupabaseServerClient()`  [INFERRED]
  app/auth/signup/actions.ts → lib/supabase/server.ts
- `GET()` --calls--> `createSupabaseServerClient()`  [INFERRED]
  app/auth/callback/route.ts → lib/supabase/server.ts
- `createDealAction()` --calls--> `GET()`  [INFERRED]
  lib/actions/deal-actions.ts → app/auth/callback/route.ts

## Hyperedges (group relationships)
- **RealTools Technology Stack** — claude_nextjs, claude_typescript, claude_supabase, claude_tailwindcss, claude_shadcn_ui, claude_resend, claude_vercel [EXTRACTED 1.00]
- **RealTools State Management Pattern** — claude_server_components, claude_server_actions, claude_revalidatepath [EXTRACTED 1.00]
- **OM Tracking Signals** — claude_url_tracking, claude_pixel_tracking, claude_om_tracking [EXTRACTED 1.00]
- **RealTools Auth Critical Rules** — claude_getuser, claude_getsession, claude_supabase_ssr, claude_supabase_auth_helpers, claude_middleware_matcher [EXTRACTED 1.00]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (14): loginAction(), signUpAction(), createDealAction(), deleteDealAction(), updateDealAction(), handleDelete(), AppLayout(), createNoteAction() (+6 more)

### Community 1 - "Community 1"
Cohesion: 0.14
Nodes (14): CRE Deal Management SaaS, Deal Hub, Rationale: Service role key server-only, RealTools, Resend (email), Row Level Security (RLS), Service Role Key, shadcn/ui (+6 more)

### Community 2 - "Community 2"
Cohesion: 0.29
Nodes (5): createSupabaseBrowserClient(), deleteDealFileAction(), insertDealFileAction(), handleDelete(), handleFileChange()

### Community 3 - "Community 3"
Cohesion: 0.29
Nodes (8): /api/track/* route, Middleware Matcher, Offering Memorandum (OM), /om/* route, OM Tracking, Pixel Tracking, Rationale: URL tracking as primary OM signal, URL-based Tracking (?ref=[token])

### Community 4 - "Community 4"
Cohesion: 0.38
Nodes (7): Next.js 15 (App Router), Rationale: No Zustand/Redux, revalidatePath, Server Actions, Server Components, State Management Approach, Zustand/Redux (BANNED)

### Community 10 - "Community 10"
Cohesion: 1.0
Nodes (3): GSD Planning Workflow, .planning/ directory, .planning/STATE.md

### Community 11 - "Community 11"
Cohesion: 1.0
Nodes (3): getSession() (BANNED), getUser(), Rationale: getUser over getSession

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (1): RealTools CLAUDE.md

## Knowledge Gaps
- **12 isolated node(s):** `RealTools CLAUDE.md`, `Deal Hub`, `TypeScript`, `@supabase/auth-helpers-nextjs (BANNED)`, `TailwindCSS` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 44`** (1 nodes): `RealTools CLAUDE.md`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createSupabaseServerClient()` connect `Community 0` to `Community 2`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `RealTools` connect `Community 1` to `Community 4`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `Next.js 15 (App Router)` connect `Community 4` to `Community 1`, `Community 3`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `createSupabaseServerClient()` (e.g. with `AppLayout()` and `ProfilePage()`) actually correct?**
  _`createSupabaseServerClient()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `GET()` (e.g. with `signUpAction()` and `createSupabaseServerClient()`) actually correct?**
  _`GET()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Next.js 15 (App Router)` (e.g. with `Server Components` and `Server Actions`) actually correct?**
  _`Next.js 15 (App Router)` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `RealTools CLAUDE.md`, `Deal Hub`, `TypeScript` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._