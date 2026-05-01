---
phase: 7
slug: light-visual-foundation
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-02
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Next.js build + ESLint + grep-based contract checks |
| **Config file** | `package.json` scripts |
| **Quick run command** | `npm run lint` |
| **Full suite command** | `npm run lint && npm run build` |
| **Estimated runtime** | ~60-120 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint`
- **After every plan wave:** Run `npm run lint && npm run build`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | UI-05 | T-07-01 / T-07-02 | No auth/data behavior touched | static | `npm run lint` | yes | pending |
| 07-01-02 | 01 | 1 | UI-07 | T-07-02 | Root theme remains deterministic | static | `rg 'className=\\{cn\\(\"dark\"|<html[^>]*dark' app components` | yes | pending |
| 07-02-01 | 02 | 2 | UI-06 | T-07-03 | Form/action states remain accessible | static | `npm run lint` | yes | pending |
| 07-02-02 | 02 | 2 | UI-08 | T-07-03 | Disabled/invalid/focus states preserved | static | `rg 'focus-visible|disabled:|aria-invalid|aria-expanded' components/ui/{button,input,textarea,select,checkbox,label}.tsx` | yes | pending |
| 07-03-01 | 03 | 2 | UI-05 | T-07-04 | Surface styling is token-driven | static | `rg '#090d17|#111827|#0d1320|#171c2a' app/globals.css components/ui app/layout.tsx` | yes | pending |
| 07-03-02 | 03 | 2 | UI-08 | T-07-04 | Radius/typography violations removed from shared primitives | static | `rg 'font-heading|rounded-2xl|rounded-3xl|rounded-4xl|rounded-\\[14px\\]|rounded-\\[20px\\]' components/ui app/globals.css app/layout.tsx` | yes | pending |

*Status: pending until execution.*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements:
- `npm run lint`
- `npm run build`
- `rg` contract checks

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Default UI reads as light Nexus-style SaaS foundation | UI-05, UI-07 | Visual direction cannot be fully proven by unit tests | Run `npm run dev`, inspect app at 375px, 768px, and 1440px after execution. Confirm default background is light, cards are white, and shared controls use muted light styling. |
| Focus, invalid, disabled, and open states remain visually visible | UI-06, UI-08 | Requires browser interaction | Tab through buttons/forms/selects/dialogs and confirm focus rings, disabled opacity, invalid rings, and select/dialog open states are visible. |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 120s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-02
