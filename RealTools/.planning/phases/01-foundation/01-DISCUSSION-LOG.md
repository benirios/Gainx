# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-24
**Phase:** 01-foundation
**Areas discussed:** Auth page design, Post-auth shell scope, Supabase project status

---

## Auth Page Design

| Option | Description | Selected |
|--------|-------------|----------|
| Centered card | Form centered on neutral background. Clean, minimal, professional SaaS standard. | ✓ |
| Split panel | Left branding/value prop + right form. More polished, more work. | |

**User's choice:** Centered card layout

---

| Option | Description | Selected |
|--------|-------------|----------|
| Text logo only | "RealTools" in clean font above card. No icon. | ✓ |
| Text + tagline | Logo + one-line tagline below it. | |

**User's choice:** Text logo only

---

| Option | Description | Selected |
|--------|-------------|----------|
| Zinc / Neutral | Cool gray — professional, business-software feel. Default shadcn/ui look. | ✓ |
| Slate | Slightly bluer gray — similar professional feel, a touch cooler. | |
| Stone / Warm gray | Warmer neutral — less corporate, slightly friendlier. | |

**User's choice:** Zinc / Neutral

---

| Option | Description | Selected |
|--------|-------------|----------|
| Dark mode only | Consistent, no toggle needed. Right look for a broker productivity tool. | ✓ |
| Both light + dark | User can switch. Requires next-themes setup and styling every component twice. | |

**User's choice:** Dark mode only

---

## Post-auth Shell Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Full app layout shell | Sidebar nav + main content area + logout — Phase 2 fills deal content. | ✓ |
| Placeholder page only | Bare page: "Dashboard coming soon" + logout button. Minimal Phase 1 scope. | |

**User's choice:** Full app layout shell

---

| Option | Description | Selected |
|--------|-------------|----------|
| Deals + Buyers + Profile | Three items map directly to the 3 phases of the product. | ✓ |
| Deals only | Add Buyers link in Phase 3 when section is built. Avoid dead nav links. | |

**User's choice:** Deals + Buyers + Profile (Logout at bottom)

---

## Supabase Project Status

| Option | Description | Selected |
|--------|-------------|----------|
| Not yet created | Phase 1 plan includes creating the project, getting API keys, setting up .env.local. | ✓ |
| Already created | Project exists. Phase 1 can jump straight to migrations. | |

**User's choice:** Not yet created

---

| Option | Description | Selected |
|--------|-------------|----------|
| Supabase CLI | supabase db push / supabase migration new. Version-controlled SQL in supabase/migrations/. | ✓ |
| Dashboard only | Write SQL directly in Supabase dashboard. No migration files. | |

**User's choice:** Supabase CLI

---

## Claude's Discretion

- Auth error feedback style — not discussed. Claude decides approach.
- Sidebar component structure (fixed vs collapsible) — Claude decides.

## Deferred Ideas

None.
