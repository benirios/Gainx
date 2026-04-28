# Phase 3: Buyers, Send, and Tracking - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-28
**Phase:** 03-buyers-send-and-tracking
**Areas discussed:** Send OM flow, Buyers page, Activity log, Tag input UX

---

## Send OM Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Single 'Send OM' modal | One modal combining buyer selection + send. Association + email happen together. | ✓ |
| Associate first, send separately | Broker adds buyers to deal first, then separate send button for all associated. | |
| Send from /buyers page | Broker goes to Buyers page, picks buyers + deal, sends. Breaks Deal Hub mental model. | |

**User's choice:** Single 'Send OM' modal (Recommended)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Toast + modal closes | Success toast: 'OM sent to N buyers'. Modal closes, Deal Hub refreshes. | ✓ |
| Summary screen in modal | Modal stays open showing confirmation per buyer. Broker manually closes. | |

**User's choice:** Toast + modal closes (Recommended)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, re-send allowed | Broker can send again to any buyer. Modal shows who already received via om_sent_at. | ✓ |
| No, only unsent buyers | Modal only shows buyers who haven't been sent to yet. | |

**User's choice:** Yes, re-send allowed (Recommended)

---

## Buyers Page

| Option | Description | Selected |
|--------|-------------|----------|
| Table | Rows with name, email, tags columns. Standard CRM list. | ✓ |
| Cards | Card layout consistent with deal cards on dashboard. | |

**User's choice:** Table (Recommended)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Modal (same pattern as deals) | 'New Buyer' opens modal. Edit row action opens modal prefilled. | ✓ |
| Inline row editing | Click row to edit fields in-place. New pattern not in codebase. | |

**User's choice:** Modal (same pattern as deals) (Recommended)

---

## Activity Log

| Option | Description | Selected |
|--------|-------------|----------|
| Bottom of page after Files | Single scrollable page: deal → notes → files → activity. | ✓ |
| Collapsible section | Collapsed by default, expanded with toggle. | |

**User's choice:** Bottom of page after Files (Recommended)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Simple text list with timestamps | Each row: timestamp + event description. Clean and fast. | ✓ |
| Timeline with icons | Vertical timeline with colored icons per event type. More visual. | |

**User's choice:** Simple text list with timestamps (Recommended)

---

## Tag Input UX

| Option | Description | Selected |
|--------|-------------|----------|
| Pill/chip UI | Type tag + Enter/comma → removable chip. Clear visual feedback. | ✓ |
| Plain text input | Comma-separated text field. Simplest to build. | |

**User's choice:** Pill/chip UI (Recommended)

---

## Claude's Discretion

- Email template copy and layout
- Table row action placement (icon buttons vs dropdown)
- Activity log empty state copy
- TagInput component implementation approach

## Deferred Ideas

- Buyer tag-based filtering before send — v2 deferred (REQUIREMENTS.md)
- Real-time activity log — polling sufficient for v1
- PDF OM export — out of scope
