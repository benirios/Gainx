# RealTools — v1 Requirements

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can create an account with email and password
- [ ] **AUTH-02**: User can log in with email and password and stay logged in across sessions
- [ ] **AUTH-03**: User can log out from any page

### Deal Management

- [x] **DEAL-01
**: User can create a deal with title, address, price, and description
- [x] **DEAL-02
**: User can view, edit, and delete their own deals
- [x] **DEAL-03
**: User can set deal status: active, negotiating, or closed
- [x] **DEAL-04
**: User sees a dashboard listing all their deals with status and a New Deal button

### Notes

- [x] **NOTE-01
**: User can add a note to a deal
- [x] **NOTE-02
**: User can edit their own notes on a deal
- [x] **NOTE-03
**: User can delete their own notes on a deal

### File Uploads

- [ ] **FILE-01**: User can upload files to a deal (stored in Supabase Storage)
- [ ] **FILE-02**: User can view and download uploaded files from the Deal Hub

### Offering Memorandum

- [ ] **OM-01**: User can generate a hosted OM HTML page from deal data and uploaded images
- [ ] **OM-02**: OM page is publicly accessible at /om/[deal-id] without requiring auth (for buyers)
- [ ] **OM-03**: OM page includes: deal title, property details, description, and images

### Buyers CRM

- [ ] **BUYER-01**: User can create a buyer with name, email, and tags (e.g. retail, multifamily, budget range)
- [ ] **BUYER-02**: User can view and edit buyers
- [ ] **BUYER-03**: User can delete buyers
- [ ] **BUYER-04**: User can manually select buyers to associate with a deal

### Send OM

- [ ] **SEND-01**: User can send the OM link via email to selected buyers using Resend
- [ ] **SEND-02**: Each buyer receives a unique OM URL with a tracking token (/om/[deal-id]?ref=[token])

### Open Tracking

- [ ] **TRACK-01**: System records per-buyer OM open when buyer visits the OM URL (URL-based, primary signal)
- [ ] **TRACK-02**: OM page embeds a tracking pixel (/api/track/[token]) as a secondary open signal
- [ ] **TRACK-03**: Each open event is idempotent (only first open recorded per buyer per deal)

### Activity Log

- [ ] **ACT-01**: Deal Hub shows a per-deal activity log with events: OM sent, note added, file uploaded
- [ ] **ACT-02**: Activity log shows per-buyer OM open events

---

## v2 Requirements (Deferred)

- Buyer tag-based filtering before send (OR logic across tags)
- OM open count badge on deal list dashboard
- PDF OM export
- Buyer CSV import
- Pipeline / Kanban view for deals
- Team / multi-user access
- Real-time activity log (polling is sufficient for v1)
- Email template editor

---

## Out of Scope

- PDF export — HTML OM only; no PDF generation in v1
- Buyer tag filter — manual selection only in v1; tag filter deferred to v2
- Team features — single broker per account
- Billing / subscriptions — no payments in v1
- Complex CRM features — no pipelines, tasks, or forecasting
- OAuth / magic link auth — email/password only

---

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| AUTH-01 | Phase 1 — Foundation | Pending |
| AUTH-02 | Phase 1 — Foundation | Pending |
| AUTH-03 | Phase 1 — Foundation | Pending |
| DEAL-01 | Phase 2 — Deal Hub | Pending |
| DEAL-02 | Phase 2 — Deal Hub | Pending |
| DEAL-03 | Phase 2 — Deal Hub | Pending |
| DEAL-04 | Phase 2 — Deal Hub | Pending |
| NOTE-01 | Phase 2 — Deal Hub | Pending |
| NOTE-02 | Phase 2 — Deal Hub | Pending |
| NOTE-03 | Phase 2 — Deal Hub | Pending |
| FILE-01 | Phase 2 — Deal Hub | Pending |
| FILE-02 | Phase 2 — Deal Hub | Pending |
| OM-01 | Phase 2 — Deal Hub | Pending |
| OM-02 | Phase 2 — Deal Hub | Pending |
| OM-03 | Phase 2 — Deal Hub | Pending |
| BUYER-01 | Phase 3 — Buyers, Send, and Tracking | Pending |
| BUYER-02 | Phase 3 — Buyers, Send, and Tracking | Pending |
| BUYER-03 | Phase 3 — Buyers, Send, and Tracking | Pending |
| BUYER-04 | Phase 3 — Buyers, Send, and Tracking | Pending |
| SEND-01 | Phase 3 — Buyers, Send, and Tracking | Pending |
| SEND-02 | Phase 3 — Buyers, Send, and Tracking | Pending |
| TRACK-01 | Phase 3 — Buyers, Send, and Tracking | Pending |
| TRACK-02 | Phase 3 — Buyers, Send, and Tracking | Pending |
| TRACK-03 | Phase 3 — Buyers, Send, and Tracking | Pending |
| ACT-01 | Phase 3 — Buyers, Send, and Tracking | Pending |
| ACT-02 | Phase 3 — Buyers, Send, and Tracking | Pending |

**Coverage: 22/22 v1 requirements mapped. No orphans.**

---

*Requirements defined: 2026-04-24*
*Coverage: 22 v1 requirements across 9 categories*
