# Feature Landscape: CRE Deal Management / Broker Productivity SaaS

**Domain:** Commercial real estate broker deal management
**Researched:** 2026-04-24
**Confidence note:** Web tools were unavailable during research. Findings draw on training-data knowledge of Dealpath, Buildout, Apto, CompStak, and broker workflow patterns (knowledge cutoff Aug 2025). Confidence levels are assigned honestly. Competitor feature lists should be spot-checked before shipping phase 2+.

---

## Competitor Landscape (Training Data, MEDIUM confidence)

| Tool | Positioning | Primary Users | Weakness |
|------|-------------|---------------|----------|
| Dealpath | Institutional deal pipeline tracker | Equity/debt investment teams | Overkill for individual brokers; expensive |
| Buildout | OM creation + listing distribution | CRE brokers (brokerage teams) | Heavy, team-oriented; not a deal tracker |
| Apto (Salesforce) | CRE CRM on Salesforce platform | Teams with Salesforce licenses | Complex setup, expensive, generic CRM feel |
| CompStak | Comp database + lease analytics | Research, appraisers, brokers | Data product, not workflow tool |
| HubSpot / generic CRM | Contact + pipeline management | Any salesperson | No CRE context: no OM, no asset data model |
| Excel + Google Drive | Manual deal tracking | Most solo brokers today | No automation, no tracking, constant manual updates |

**Key gap all comparables share:** None of the broker-oriented tools (Buildout, Apto) give a broker a single URL-based workspace that combines deal data, OM, buyer list, and open tracking in one place for a single deal. That is RealTools' core differentiation.

---

## Table Stakes

Features brokers expect. Absence means the product feels unfinished or unusable.

| Feature | Why Expected | Complexity | Confidence | Notes |
|---------|--------------|------------|------------|-------|
| Deal list / dashboard | Every deal management tool has this; broker needs to see all active deals at a glance | Low | HIGH | Already in scope |
| Deal status tracking (active / negotiating / closed) | Brokers need pipeline state; this is the most basic CRM behavior | Low | HIGH | Already in scope |
| Per-deal notes | Universal; brokers annotate deals constantly — call notes, showing notes, offer notes | Low | HIGH | Already in scope |
| File storage per deal | OMs, financials, photos, floor plans — all live on a deal | Low-Med | HIGH | Already in scope via Supabase Storage |
| Buyer/contact list | Brokers maintain a buyer list; without it they use a spreadsheet alongside the tool | Low | HIGH | Already in scope (Buyers CRM) |
| OM / marketing package creation | Buildout's entire business is this; brokers produce OMs for every listing | Med | HIGH | Already in scope (hosted HTML OM) |
| Send OM to buyers | Brokers blast the OM link to their buyer pool; this is the core workflow | Low | HIGH | Already in scope (Send OM via Resend) |
| Know which buyers received the OM | Without a send record, broker cannot follow up systematically | Low | HIGH | Implied by activity log |
| Deal address / property details | Asset data (address, price, type) is the identity of a CRE deal — must be structured, not just a note | Low | HIGH | Already in scope (deal create form) |
| Activity log per deal | Brokers need audit trail: when was OM sent, who opened it, when was the last note | Low | HIGH | Already in scope |

**Assessment:** Every table stakes feature is already in scope. The v1 spec is well-calibrated.

---

## Differentiators

Features that set RealTools apart from comparables. Not universally expected, but create meaningful advantage.

| Feature | Value Proposition | Complexity | Confidence | Notes |
|---------|-------------------|------------|------------|-------|
| Per-buyer OM open tracking | Dealpath and Buildout do not offer per-recipient email open tracking tied to a specific deal workspace. Knowing "John Smith opened the OM 3x" is actionable intelligence a broker uses to prioritize follow-up. | Low-Med | HIGH | Already in scope (tracking pixel) |
| Hosted public OM URL | A shareable URL (not an email attachment) means the OM is always current, easily forwarded by buyers, and trackable. Buildout generates PDFs; this is meaningfully different. | Low-Med | HIGH | Already in scope |
| Tag-based buyer matching | Filtering the buyer pool by asset class / geography / budget before blasting is a workflow that brokers do manually today with color-coded Excel tabs. Automating it is a real time save. | Low | MEDIUM | Already in scope |
| Single workspace per deal ("Deal Hub") | Competing tools separate the CRM from the marketing from the file storage. One URL that contains notes + files + OM + buyer activity is the core product differentiator. | Med | HIGH | Core product concept |
| OM open count badge on deal list | At-a-glance "3 buyers opened" on the deal dashboard gives brokers signal without clicking into each deal. | Low | MEDIUM | Not yet in scope — low effort, high value |
| Last-activity timestamp per deal | Shows broker which deals have gone stale. Deals with no activity in 14 days surface to top (or are flagged). | Low | MEDIUM | Not yet in scope |

---

## Features That Are NOT Table Stakes But Brokers Will Ask For

These will be requested by early users. Deliberately defer them. Understanding why helps prioritize.

| Feature | Why Brokers Want It | Why to Defer |
|---------|---------------------|--------------|
| PDF OM export | Buyers expect a PDF; some won't click a link | Adds InDesign/Puppeteer/pdf-lib complexity with no tracking benefit over HTML; revisit in v2 |
| Email template editor | Brokers customize their OM blast message per deal | v1 uses a standard template via Resend; custom templates add UI complexity |
| Buyer import (CSV) | Brokers have existing buyer lists in Excel | Data cleaning complexity; manual entry is acceptable for MVP validation |
| Deal pipeline view (Kanban) | Visual pipeline is expected from CRM tools | Table view is sufficient for a solo broker with <20 active deals; defer |
| Comp tracking / sold data | Brokers track comparable sales for pricing | Entirely different data model; CompStak owns this space |
| Commission tracking | Brokers track GCI per deal | Adds financial data model complexity; out of scope |
| Showing / tour scheduling | Calendar integration for property tours | Integration complexity; use Calendly link in notes for v1 |
| Document e-signing (LOI, PSA) | NDAs, Letters of Intent need signatures | DocuSign integration; major scope expansion |
| Team / multi-broker access | Listing agent + transaction manager on same deal | Multi-tenancy redesign; explicitly out of scope |

---

## Anti-Features

Things to deliberately NOT build in v1 — each one adds scope without proportional MVP value.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| PDF OM generation | Puppeteer/headless Chrome or pdf-lib adds infra complexity; OM as PDF can't have a tracking pixel | Hosted HTML page — modern, trackable, no attachment size issues |
| Team/multi-user deal access | Requires row-level security redesign, invite flows, permission model | Single user per account; team features are a v2 unlock that justifies pricing tier |
| Email open tracking via pixel (your own SMTP) | Running your own email tracking infrastructure is deliverability risk | Use Resend; rely on your own tracking pixel on the hosted OM page only — simpler and more reliable |
| Billing / subscription system | Auth + Stripe + webhook handling is 2-3 weeks of work | Launch free, validate, add billing when retention is proven |
| Mobile app | Brokers do deals at desks; mobile is nice-to-have | Responsive web is sufficient; native app is v3+ |
| AI-generated OM copy | Adds LLM API dependency and content review workflow | v1 OM pulls structured deal data directly; AI copy assist is a differentiator for v2 |
| Buyer scoring / lead scoring algorithm | Requires historical data to be meaningful | Manual tag filtering is better for v1 when buyer DB is small |
| MLS / CoStar data integration | Data licensing is expensive and legally complex | Broker enters deal data manually |
| Calendar/scheduling integration | Google/Outlook OAuth adds auth surface and sync complexity | Brokers paste Calendly links in notes |

---

## Feature Dependencies

```
Auth (sign up / log in)
  └─ Deal CRUD (create, edit, delete)
       ├─ Notes (per deal)
       ├─ File Upload (per deal, Supabase Storage)
       ├─ OM Generation (from deal data + images)
       │    └─ Hosted OM URL (/om/[deal-id])
       │         └─ Per-buyer open tracking (tracking pixel on OM page)
       └─ Activity Log (events from notes, files, OM sends, opens)

Buyers CRM (independent of deals)
  └─ Tag assignment on buyers
       └─ Buyer matching / filter by tag
            └─ Send OM (email via Resend to selected buyers)
                 └─ Open tracking (links buyer email to OM view event)
```

All features in scope have a clean dependency chain. No circular dependencies. OM tracking is the terminal node — everything else enables it.

---

## MVP Recommendation

**Build exactly what is scoped. Nothing more.**

The v1 spec already covers all table stakes and the two most important differentiators (hosted OM URL + per-buyer open tracking). The risk is scope creep from the "Features Brokers Will Ask For" list — resist adding any of those before validating that the core tracking + Deal Hub concept gets retention.

**Prioritized build order:**

1. Auth + Deal CRUD + Dashboard — foundation; everything else depends on it
2. Notes + File Upload — makes Deal Hub feel like a real workspace, not just a form
3. Buyers CRM + Tag system — needed before sending anything
4. OM Generator + Hosted URL — the first true differentiator; validates the core value prop
5. Send OM via email + Activity Log — completes the deal flow
6. Per-buyer open tracking — the final differentiator; requires OM URL to exist first

**Defer with conviction:**

- PDF export: revisit only if 3+ users explicitly churn citing it
- Buyer CSV import: revisit at 50+ buyers in the system
- Pipeline/Kanban view: revisit when broker has 20+ active deals
- Team features: revisit when pricing model justifies it

---

## What Generic CRMs (HubSpot) Miss That RealTools Solves

This is the "why not HubSpot" answer brokers need to hear:

| Gap in Generic CRMs | RealTools Answer |
|--------------------|-----------------|
| No asset-centric data model (address, price, property type, status) | Deal is the core object, not a contact or company |
| No OM generation — brokers use InDesign, Word, or Canva | OM Generator built into the deal workspace |
| No per-recipient OM tracking — email open tracking is aggregate at best | Tracking pixel tied to specific buyer + specific deal |
| CRM contact model is too generic — no buyer tags for asset class / geography | Buyers tagged by deal type (retail, multifamily, industrial, etc.) |
| Activity log mixes CRM noise (email sync, task updates) with deal signal | Activity log is deal-scoped: OM sends, opens, notes, files only |
| Contacts are global — not scoped to a deal | Buyer matching explicitly links buyers to a deal for a send event |

---

## Sources

- Training data: Dealpath feature documentation (pre-Aug 2025), Buildout product pages (pre-Aug 2025), Apto CRM documentation, HubSpot CRM feature set
- Project context: `/Users/beni/Dev/RealTools/.planning/PROJECT.md`
- Confidence: MEDIUM for competitor feature specifics (web verification unavailable); HIGH for workflow patterns (stable domain knowledge)
- Verification recommended: Spot-check Buildout and Dealpath feature pages before Phase 2+ roadmap decisions
