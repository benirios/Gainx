# RealTools

## What This Is

RealTools is an MVP SaaS for individual commercial real estate brokers that consolidates the deal lifecycle into one workspace per property. Brokers can create deals, manage notes and files, publish a hosted Offering Memorandum, manage buyers, send tracked OM links through email, and review engagement in the Deal Hub activity log.

## Core Value

Every deal has one central workspace — broker never has to hunt across email, spreadsheets, and Drive to find deal status or contact buyers.

## Current State

**v1.0 milestone shipped:** 2026-05-01

RealTools now has:

- Supabase email/password authentication with protected app routes and public `/om/*` plus `/api/track/*` exclusions.
- Complete v1 database schema with RLS across deals, notes, buyers, deal_buyers, activities, and deal_files.
- Deal dashboard and Deal Hub with deal CRUD, status badges, notes, files, signed downloads, and hosted public OM pages.
- Buyers CRM with tag support.
- Send OM flow through Resend with per-buyer tracking tokens.
- URL-primary and pixel-secondary OM open tracking.
- Activity log for OM sent/opened, note added, and file uploaded events.

**Deferred verification debt:** Live Phase 3 UAT remains pending for Resend delivery and browser-driven tracking/activity confirmation.

**v1.1 Phase 4 complete:** Reference Visual Foundation established on 2026-05-01. Global dark reference tokens, serif display typography, pill button primitives, dark form/card/dialog/toast/badge primitives, and no-background-pattern guardrails are in place.

## Current Milestone: v1.1 Reference UI Refactor

**Goal:** Refactor all RealTools user-facing UI to match the provided reference screenshot's premium dark CRE visual style, excluding the screenshot's background pattern.

**Target features:**
- Apply the reference visual system across authentication, dashboard, deal hub, buyers, profile, modals, tables, forms, activity, files, notes, and hosted OM pages.
- Preserve existing functionality while restyling typography, spacing, navigation, surfaces, buttons, inputs, badges, dialogs, and empty/loading/error states.
- Validate responsive behavior and visual consistency across desktop and mobile without adopting the reference background network.

## Requirements

### Validated

- ✓ User can sign up and log in with email/password — v1.0
- ✓ User can create a deal with title, address, price, description, and status — v1.0
- ✓ User can view a Deal Hub page as the central workspace for each deal — v1.0
- ✓ User can add, edit, and delete notes on a deal — v1.0
- ✓ User can upload files to a deal through Supabase Storage — v1.0
- ✓ User can generate a hosted HTML OM page from deal data and uploaded images — v1.0
- ✓ OM is publicly accessible at `/om/[deal-id]` without broker auth — v1.0
- ✓ User can create, view, edit, and delete buyers with name, email, and tags — v1.0
- ✓ User can manually select buyers for a deal — v1.0
- ✓ System can send tracked OM links through Resend — v1.0 implementation, live UAT pending
- ✓ System records first OM open per buyer/deal using URL tracking and pixel fallback — v1.0 implementation, live UAT pending
- ✓ Deal Hub shows a per-deal activity log — v1.0 implementation, live UAT pending
- ✓ Reference visual foundation tokens and shared UI primitives match the premium dark screenshot style, excluding the background pattern — v1.1 Phase 4

### Active

- [ ] Apply the Phase 4 reference visual foundation across all user-facing RealTools surfaces, excluding the background pattern.
- [ ] Preserve all shipped v1.0 behavior during the visual refactor.
- [ ] Complete live UAT for Phase 3: Resend delivery, open tracking, and activity timeline.

### Out of Scope

- PDF export — HTML OM only for v1; PDF adds complexity without proportional value.
- Team/multi-user features — single broker per account.
- Billing system — no payments or subscriptions in v1.
- Complex CRM features — no pipelines, tasks, forecasting.
- OAuth / magic link auth — email/password only for v1.
- Buyer tag-based filtering before send — deferred to v2; manual selection is v1.
- Real-time activity log — polling/refresh is sufficient for v1.

## Context

**Problem being solved:** Brokers today juggle email, Excel, Google Drive, and InDesign/Word for every deal. No single source of truth. OMs take hours to produce manually. Generic CRMs are too broad for CRE deal flow.

**OM flow:** Broker generates OM → gets hosted public page URL → sends tracked link to selected buyers via email → system records per-buyer first open events → broker reviews activity in Deal Hub.

**Target user:** Individual commercial real estate broker.

**Data models:** users, deals, notes, buyers, deal_buyers, activities, deal_files.

## Constraints

- **Tech Stack:** Next.js App Router, Supabase Auth/DB/Storage, TailwindCSS, Resend.
- **Scope:** No billing, teams, PDF, or complex CRM workflows in v1.
- **Auth:** Supabase email/password only.
- **OM format:** Clean hosted HTML page.
- **Security:** Service-role key only in `server-only` modules; use `getUser()` server-side; RLS policy coverage for every table.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Hosted OM page at `/om/[deal-id]` | Buyers open in browser; enables tracking pixel and public sharing | ✓ Shipped v1.0 |
| Per-buyer tracking tokens in `deal_buyers` | Broker needs engagement per buyer, not aggregate views | ✓ Shipped v1.0 |
| URL-based tracking is primary, pixel is secondary | More reliable than email-client pixel loading alone | ✓ Shipped v1.0 |
| Supabase Storage uses private deal files and public OM images buckets | Preserves broker file privacy while allowing public OM media | ✓ Shipped v1.0 |
| Tags stay as `text[]` on buyers | Lightweight and flexible for v1 | ✓ Shipped v1.0 |
| Cast `supabase.from()` as `any` at query/mutation sites | Work around supabase-js 2.104.x PostgrestVersion inference bug while keeping explicit Database types | ⚠ Revisit after Supabase upgrade |
| Service role writes activities for tracking and telemetry | Public/open tracking and activity backfill cannot rely on browser user session | ✓ Shipped v1.0 |
| Use Cormorant Garamond for display typography and Geist for operational text | Matches the reference screenshot's premium serif display voice while keeping app text readable | ✓ Established v1.1 Phase 4 |
| Do not recreate the reference screenshot's background network pattern | User explicitly excluded the background from the requested style match | ✓ Enforced v1.1 Phase 4 |

## Next Milestone Goals

After v1.1, gather broker feedback on the refreshed product UI and resolve any remaining Phase 3 UAT findings or deployment packaging concerns.

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check -> still the right priority?
3. Audit Out of Scope -> reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-01 after Phase 4 Reference Visual Foundation*
