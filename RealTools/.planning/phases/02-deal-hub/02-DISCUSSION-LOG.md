# Phase 2: Deal Hub - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-28
**Phase:** 02-deal-hub
**Areas discussed:** Dashboard deal list, Deal Hub page layout

---

## Dashboard Deal List

| Option | Description | Selected |
|--------|-------------|----------|
| Cards | Card per deal, reuses existing Card component | ✓ |
| Table rows | Compact data table with columns | |
| Simple list items | Minimal rows, lightest layout | |

**User's choice:** Cards

---

| Option | Description | Selected |
|--------|-------------|----------|
| Title + status badge | Clean and scannable | ✓ |
| Title + address + status badge | One more data point | |
| Title + address + price + status badge | Full context, denser | |

**User's choice:** Title + status badge only

---

| Option | Description | Selected |
|--------|-------------|----------|
| Centered message + CTA button | "No deals yet" + New Deal button | ✓ |
| Same as current placeholder | Keep Phase 1 text | |
| You decide | Claude picks | |

**User's choice:** Centered message + CTA button

---

## Deal Hub Page Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Single scrollable page | Details → notes → files, all visible by scrolling | ✓ |
| Tabbed sections | Tabs: Details \| Notes \| Files | |
| You decide | Claude picks | |

**User's choice:** Single scrollable page

---

| Option | Description | Selected |
|--------|-------------|----------|
| Modal dialog | Edit button opens modal, stay on page | ✓ |
| Inline edit | Fields editable in place | |
| Separate /deals/[id]/edit route | Navigate to dedicated edit page | |

**User's choice:** Modal dialog

---

| Option | Description | Selected |
|--------|-------------|----------|
| Modal dialog | New Deal opens modal, consistent with edit | ✓ |
| Dedicated /deals/new page | Full create page | |
| You decide | Match the edit flow | |

**User's choice:** Modal dialog

---

## Claude's Discretion

- Notes UX — not discussed; Claude decides inline textarea approach
- File upload UX — not discussed; Claude decides click-to-browse for v1
- OM page design — not discussed; Claude decides clean minimal layout
- Status badge colors — Claude decides
- Deal form field order — Claude decides

## Deferred Ideas

None mentioned during discussion.
