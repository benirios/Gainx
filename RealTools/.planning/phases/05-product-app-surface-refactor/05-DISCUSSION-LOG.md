# Phase 5: Product App Surface Refactor - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-01T20:37:07+01:00
**Phase:** 05-product-app-surface-refactor
**Areas discussed:** Dashboard and sidebar hierarchy, Deal Hub information layout, Dialog/form/table density and states, Badges/tags/activity readability

---

## Dashboard and sidebar hierarchy

| Option | Description | Selected |
|--------|-------------|----------|
| Compact premium rail with muted labels + clear active pill | Keeps nav visually calm while preserving active-page scanability | ✓ |
| Keep current simple rail and only tweak colors | Lowest change risk, minimal hierarchy improvement | |
| Expand to wider rail with section groups | Strong grouping, but increases shell width and visual weight | |

**User's choice:** Compact premium rail with muted labels + clear active pill.
**Notes:** Pair with serif page headers, balanced card density, and single-action empty states.

---

## Deal Hub information layout

| Option | Description | Selected |
|--------|-------------|----------|
| Top summary panel + separated sections (Notes, Files, Activity) with generous dividers | Preserves current workflow while improving hierarchy and scanability | ✓ |
| Single long card containing all sections | Fewer section boundaries, but denser and harder to scan | |
| Tab-based layout switching between sections | Reduces vertical length but hides context and increases clicks | |

**User's choice:** Keep top summary panel and separated sections with generous dividers.
**Notes:** Header actions stay clustered right with Send OM primary; metadata remains two-column with description below.

---

## Dialog/form/table density and states

| Option | Description | Selected |
|--------|-------------|----------|
| Single-column form stack with consistent 16px field spacing and right-aligned actions | Predictable modal rhythm and consistent action placement | ✓ |
| Two-column form layout in dialogs | More compact width usage but higher scanning complexity | |
| Sectioned accordion form with collapsible groups | Useful for large forms, unnecessary complexity for current scope | |

**User's choice:** Single-column forms with 16px vertical rhythm.
**Notes:** Keep medium table density (44px rows), inline validation, spinner loading, and content-fit modal width tokens.

---

## Badges/tags/activity readability

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle semantic tint + border, readable text, no saturated pill fills | Matches premium muted visual language while preserving status meaning | ✓ |
| Bright saturated chips for strong contrast | High visibility but too loud for target style | |
| Neutral-only badges with no semantic color | Calm visuals but weaker status scanning | |

**User's choice:** Subtle semantic tint + border, readable text.
**Notes:** Buyer tags remain neutral muted pills; activity rows remain concise text-first rows with minimal supporting icons.

---

## the agent's Discretion

- Exact class-level implementation details for each component, as long as selected behavior and visual hierarchy remain intact.

## Deferred Ideas

None.
