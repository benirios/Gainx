# Security Report — RealTools — 2026-05-21 (reviewed)

> This report reflects human-verified findings after scanner false-positive triage.
> Raw scanner output: 27 findings. Verified real: 2 unfixable, 0 actionable.

## Summary

| Severity | Count | Notes |
|----------|-------|-------|
| 🔴 CRITICAL | 0 | All scanner CRITICALs were false positives |
| 🟠 HIGH     | 2 | Unfixable upstream CVEs |
| 🟡 MEDIUM   | 0 | — |
| 🔵 LOW      | 1 | Test fixture password |

---

## ✅ Fixed this session

| ID | Fix | Files |
|----|-----|-------|
| S001 | `.gitignore` created | `.gitignore` |
| S038 | `.env.example` created | `.env.example` |
| S033 | File upload MIME + extension allowlist (client) | `components/files/files-section.tsx` |
| S033 | File upload extension validation (server) | `lib/actions/file-actions.ts` |
| S035 | `next@15.5.15 → 15.5.18` — middleware bypass CVEs cleared | `package.json` |

---

## 🟠 HIGH — Unfixable (upstream)

### [S035] npm audit: marked ReDoS
- **Location:** `node_modules/marked` (via `get-shit-done` → `node-notifier` → `cli-usage`)
- **Impact:** None — dev-only transitive dependency, not in production bundle
- **Status:** No upstream fix available. Accept.

### [S035] npm audit: postcss XSS in Next.js internal bundle
- **Location:** `node_modules/next/node_modules/postcss`
- **Impact:** Low — Next.js bundles its own postcss; "fix" would downgrade Next to 9.3.3
- **Status:** Must be patched by Next.js team. Track next minor release. Accept.

---

## 🔵 LOW — Test fixture password

### [S003f] Hardcoded E2E password
- **Location:** `tests/fixtures/score-card-e2e.ts:28`
- **Context:** `const E2E_PASSWORD = 'Score-card-e2e-Password-2026!'`
- **Impact:** Low — test-only credential, not a production secret
- **Remediation:** Move to `process.env.E2E_PASSWORD` and add to `.env.example`
- **Priority:** Nice-to-have

---

## ❌ False Positives (scanner noise)

| ID | Location | Why FP |
|----|----------|--------|
| S039 × 6 | `001_initial_schema.sql` | RLS enabled in `002_rls_policies.sql`; scanner only checks CREATE TABLE file |
| S033 × 8 | `files-section.tsx`, `file-actions.ts` | Validation added; scanner matches keywords, not logic |
| S033 × 2 | `activity-log-section.tsx:36,51` | Display-only component — no upload, just renders `case 'file_uploaded'` |
| S006a × 2 | `lib/location-intelligence/providers.js:405,693` | URL template using variable `options.googleMapsApiKey`, not hardcoded key |
| S006a | `next.config.ts:23` | Commented-out CSP example added by audit tool itself |
| S003g × 3 | `supabase/config.toml:95,287,319` | `env(VAR_NAME)` is Supabase's env interpolation syntax, not hardcoded secrets |
| S003g | `tests/location-intelligence.test.mjs:98` | `'demo-key'` is a test fixture placeholder |
| S019a × 2 | `middleware.ts:17,21` | Supabase SSR manages auth cookies internally; manual override breaks auth |

---

## Recommendation

Codebase has **0 actionable security issues**. Only open item worth tracking:

1. Watch Next.js releases for internal postcss patch
2. (Optional) Move `E2E_PASSWORD` to env var
