# RealTools

## What This Is

RealTools is an MVP SaaS for commercial real estate brokers that consolidates the full deal lifecycle into a single workspace per property — the Deal Hub. Brokers create a deal, generate an Offering Memorandum, match and send to buyers, and track engagement, all without leaving one page.

## Core Value

Every deal has one central workspace — broker never has to hunt across email, spreadsheets, and Drive to find deal status or contact buyers.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can sign up and log in with email/password
- [ ] User can create a deal (title, address, price, description, status)
- [ ] User can view a Deal Hub page as the central workspace for each deal
- [ ] User can add, edit, and delete notes on a deal
- [ ] User can upload files to a deal (Supabase Storage)
- [ ] User can set deal status: active, negotiating, closed
- [ ] User can generate an OM as a hosted HTML page from deal data + uploaded images
- [ ] OM is accessible via a unique public URL (/om/[deal-id])
- [ ] User can create buyers with name, email, and tags (e.g. retail, multifamily, budget range)
- [ ] User can select buyers for a deal manually or filter by tag
- [ ] User can send the OM link via email to selected buyers
- [ ] System tracks per-buyer whether they opened the OM (tracking pixel or flag)
- [ ] User sees an activity log per deal (OM sent, note added, file uploaded events)
- [ ] Dashboard shows list of all deals with New Deal button

### Out of Scope

- PDF export — HTML OM only for v1; PDF adds complexity without proportional value
- Team/multi-user features — single broker per account
- Billing system — no payments or subscriptions in v1
- Complex CRM features — no pipelines, tasks, forecasting
- OAuth / magic link auth — email/password only for v1

## Context

**Problem being solved:** Brokers today juggle email, Excel, Google Drive, and InDesign/Word for every deal. No single source of truth. OMs take hours to produce manually. CRMs like Salesforce and HubSpot are too generic and complex for CRE deal flow.

**OM flow:** Broker generates OM → gets a hosted public page URL → sends link to selected buyers via email → system records per-buyer open events via tracking pixel.

**Target user:** Individual commercial real estate broker (no team features needed in v1).

**Data models:** users, deals, notes, buyers, deal_buyers (relation), activities

## Constraints

- **Tech Stack**: Next.js App Router, Supabase (Auth + DB + Storage), TailwindCSS, Resend — no deviations
- **Scope**: No billing, no teams, no PDF — keep it minimal and working end-to-end
- **Auth**: Supabase email/password only
- **OM format**: Clean HTML page, no PDF generation

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Hosted OM page (/om/[deal-id]) | Buyers open in browser; enables tracking pixel; no email attachment issues | — Pending |
| Per-buyer open tracking | Broker needs to know which specific buyer engaged, not just aggregate | — Pending |
| Supabase Storage for files | Already in stack; no extra vendor for file handling | — Pending |
| Tags as array on buyers table | Flexible, lightweight — no separate tags table needed for v1 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-24 after initialization*
