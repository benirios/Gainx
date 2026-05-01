---
phase: 04
slug: reference-visual-foundation
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-01
---

# Phase 04 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Next.js ESLint plus grep-verifiable UI contract checks |
| **Config file** | `eslint.config.mjs` |
| **Quick run command** | `npm run lint` |
| **Full suite command** | `npm run lint` plus contract `rg` checks listed below |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint`
- **After every plan wave:** Run `npm run lint` plus relevant contract `rg` checks
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 04-01 | 1 | UI-01, UI-02 | T-04-01 | N/A | lint + grep | `npm run lint`; `rg --fixed-strings -- '--background: #090d17' app/globals.css`; `rg --fixed-strings -- 'Cormorant_Garamond' app/layout.tsx` | yes | pending |
| 04-02-01 | 04-02 | 2 | UI-03, UI-04 | T-04-02 | N/A | lint + grep | `npm run lint`; `rg --fixed-strings -- 'rounded-full' components/ui/button.tsx`; `rg --fixed-strings -- 'h-11' components/ui/button.tsx`; `rg --fixed-strings -- 'h-12' components/ui/button.tsx` | yes | pending |
| 04-03-01 | 04-03 | 2 | UI-01, UI-04 | T-04-03 | N/A | lint + grep | `npm run lint`; `rg --fixed-strings -- '#111827' app/globals.css`; `! rg -n 'network|constellation|particle|canvas' app components --glob '!favicon.ico'` | yes | pending |

*Status: pending, green, red, flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual match to reference style excluding background pattern | UI-01, UI-02, UI-03, UI-04 | Screenshot-level style judgment cannot be fully automated | Review changed primitives against `04-UI-SPEC.md` and the reference image; verify premium dark style, serif display typography, pill controls, muted borders, and no copied network background. |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all missing references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-01

