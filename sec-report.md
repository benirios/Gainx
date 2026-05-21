# Security Report — RealTools — 2026-05-21 11:14

## Summary

| Severity | Count |
|----------|-------|
| 🔴 CRITICAL | 7 |
| 🟠 HIGH     | 19 |
| 🟡 MEDIUM   | 0 |
| 🔵 LOW      | 1 |
| **Total**   | **27** |

## 🔴 CRITICAL

### [S039] RLS not enabled on table deals
- **Location:** `supabase/migrations/001_initial_schema.sql`
- **Description:** Table 'deals' created without enabling Row Level Security
- **Remediation:** Add: ALTER TABLE deals ENABLE ROW LEVEL SECURITY; + policy
- **Context:**
  ```
  Table: deals
  ```

### [S039] RLS not enabled on table buyers
- **Location:** `supabase/migrations/001_initial_schema.sql`
- **Description:** Table 'buyers' created without enabling Row Level Security
- **Remediation:** Add: ALTER TABLE buyers ENABLE ROW LEVEL SECURITY; + policy
- **Context:**
  ```
  Table: buyers
  ```

### [S039] RLS not enabled on table deal_buyers
- **Location:** `supabase/migrations/001_initial_schema.sql`
- **Description:** Table 'deal_buyers' created without enabling Row Level Security
- **Remediation:** Add: ALTER TABLE deal_buyers ENABLE ROW LEVEL SECURITY; + policy
- **Context:**
  ```
  Table: deal_buyers
  ```

### [S039] RLS not enabled on table notes
- **Location:** `supabase/migrations/001_initial_schema.sql`
- **Description:** Table 'notes' created without enabling Row Level Security
- **Remediation:** Add: ALTER TABLE notes ENABLE ROW LEVEL SECURITY; + policy
- **Context:**
  ```
  Table: notes
  ```

### [S039] RLS not enabled on table activities
- **Location:** `supabase/migrations/001_initial_schema.sql`
- **Description:** Table 'activities' created without enabling Row Level Security
- **Remediation:** Add: ALTER TABLE activities ENABLE ROW LEVEL SECURITY; + policy
- **Context:**
  ```
  Table: activities
  ```

### [S039] RLS not enabled on table deal_files
- **Location:** `supabase/migrations/001_initial_schema.sql`
- **Description:** Table 'deal_files' created without enabling Row Level Security
- **Remediation:** Add: ALTER TABLE deal_files ENABLE ROW LEVEL SECURITY; + policy
- **Context:**
  ```
  Table: deal_files
  ```

### [S003f] Hardcoded password
- **Location:** `tests/fixtures/score-card-e2e.ts:28`
- **Description:** Password value hardcoded in source
- **Remediation:** Move to environment variable
- **Context:**
  ```
  const E2E_PASSWORD = 'Score-card-e2e-Password-2026!'
  ```
- **Auto-fix:** `secmaxxing destructive`

## 🟠 HIGH

### [S033] File upload without type validation
- **Location:** `components/deals/activity-log-section.tsx:36`
- **Description:** File upload handler lacks MIME type or extension filtering
- **Remediation:** Add fileFilter to validate MIME type and extension allowlist
- **Context:**
  ```
  case 'file_uploaded':
  ```

### [S033] File upload without type validation
- **Location:** `components/deals/activity-log-section.tsx:51`
- **Description:** File upload handler lacks MIME type or extension filtering
- **Remediation:** Add fileFilter to validate MIME type and extension allowlist
- **Context:**
  ```
  case 'file_uploaded':
  ```

### [S033] File upload without type validation
- **Location:** `components/files/files-section.tsx:38`
- **Description:** File upload handler lacks MIME type or extension filtering
- **Remediation:** Add fileFilter to validate MIME type and extension allowlist
- **Context:**
  ```
  const [uploading, setUploading] = useState(false)
  ```

### [S033] File upload without type validation
- **Location:** `components/files/files-section.tsx:56`
- **Description:** File upload handler lacks MIME type or extension filtering
- **Remediation:** Add fileFilter to validate MIME type and extension allowlist
- **Context:**
  ```
  const { error: uploadError } = await supabase.storage
  ```

### [S033] File upload without type validation
- **Location:** `components/files/files-section.tsx:58`
- **Description:** File upload handler lacks MIME type or extension filtering
- **Remediation:** Add fileFilter to validate MIME type and extension allowlist
- **Context:**
  ```
  .upload(path, file, { upsert: false })
  ```

### [S033] File upload without type validation
- **Location:** `components/files/files-section.tsx:60`
- **Description:** File upload handler lacks MIME type or extension filtering
- **Remediation:** Add fileFilter to validate MIME type and extension allowlist
- **Context:**
  ```
  if (uploadError) {
  ```

### [S033] File upload without type validation
- **Location:** `components/files/files-section.tsx:94`
- **Description:** File upload handler lacks MIME type or extension filtering
- **Remediation:** Add fileFilter to validate MIME type and extension allowlist
- **Context:**
  ```
  {uploading ? (
  ```

### [S033] File upload without type validation
- **Location:** `components/files/files-section.tsx:110`
- **Description:** File upload handler lacks MIME type or extension filtering
- **Remediation:** Add fileFilter to validate MIME type and extension allowlist
- **Context:**
  ```
  disabled={uploading}
  ```

### [S033] File upload without type validation
- **Location:** `lib/actions/file-actions.ts:42`
- **Description:** File upload handler lacks MIME type or extension filtering
- **Remediation:** Add fileFilter to validate MIME type and extension allowlist
- **Context:**
  ```
  event_type: 'file_uploaded',
  ```

### [S006a] Secret in comment
- **Location:** `lib/location-intelligence/providers.js:405`
- **Description:** Credential or key value left in code comment
- **Remediation:** Remove comment; use env var reference
- **Context:**
  ```
  `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${encodeURIComponent(options.googleMapsApiKey)}`,
  ```
- **Auto-fix:** `secmaxxing destructive`

### [S006a] Secret in comment
- **Location:** `lib/location-intelligence/providers.js:693`
- **Description:** Credential or key value left in code comment
- **Remediation:** Remove comment; use env var reference
- **Context:**
  ```
  `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1500&key=${encodeURIComponent(options.googleMapsApiKey)}`,
  ```
- **Auto-fix:** `secmaxxing destructive`

### [S019a] Cookie possibly missing httpOnly flag
- **Location:** `middleware.ts:17`
- **Description:** Cookie set without httpOnly:true enables XSS token theft
- **Remediation:** Add httpOnly: true to cookie options
- **Context:**
  ```
  request.cookies.set(name, value)
  ```
- **Auto-fix:** `secmaxxing audit`

### [S019a] Cookie possibly missing httpOnly flag
- **Location:** `middleware.ts:21`
- **Description:** Cookie set without httpOnly:true enables XSS token theft
- **Remediation:** Add httpOnly: true to cookie options
- **Context:**
  ```
  supabaseResponse.cookies.set(name, value, options)
  ```
- **Auto-fix:** `secmaxxing audit`

### [S006a] Secret in comment
- **Location:** `next.config.ts:23`
- **Description:** Credential or key value left in code comment
- **Remediation:** Remove comment; use env var reference
- **Context:**
  ```
  // headers: async () => [{ source: '/(.*)', headers: [{ key: 'Content-Security-Policy', value: "default-src 'self'" }] }]
  ```
- **Auto-fix:** `secmaxxing destructive`

### [S035] npm audit: 26 vulnerabilities (0 critical, 6 high)
- **Location:** `package.json`
- **Description:** Dependencies contain known CVEs: 0 critical, 6 high, 26 total
- **Remediation:** Run: npm audit fix — review breaking changes manually
- **Context:**
  ```
  {'info': 0, 'low': 0, 'moderate': 7, 'high': 6, 'critical': 0, 'total': 13}
  ```

### [S003g] Hardcoded secret/token
- **Location:** `supabase/config.toml:95`
- **Description:** Secret or token hardcoded in source
- **Remediation:** Move to environment variable
- **Context:**
  ```
  openai_api_key = "env(OPENAI_API_KEY)"
  ```
- **Auto-fix:** `secmaxxing destructive`

### [S003g] Hardcoded secret/token
- **Location:** `supabase/config.toml:287`
- **Description:** Secret or token hardcoded in source
- **Remediation:** Move to environment variable
- **Context:**
  ```
  auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"
  ```
- **Auto-fix:** `secmaxxing destructive`

### [S003g] Hardcoded secret/token
- **Location:** `supabase/config.toml:319`
- **Description:** Secret or token hardcoded in source
- **Remediation:** Move to environment variable
- **Context:**
  ```
  secret = "env(SUPABASE_AUTH_EXTERNAL_APPLE_SECRET)"
  ```
- **Auto-fix:** `secmaxxing destructive`

### [S003g] Hardcoded secret/token
- **Location:** `tests/location-intelligence.test.mjs:98`
- **Description:** Secret or token hardcoded in source
- **Remediation:** Move to environment variable
- **Context:**
  ```
  googleMapsApiKey: 'demo-key',
  ```
- **Auto-fix:** `secmaxxing destructive`

## 🔵 LOW

### [S001b] .gitignore missing some secret file patterns
- **Location:** `.gitignore`
- **Description:** Patterns not in .gitignore: *.p12, *.pfx
- **Remediation:** Add to .gitignore: *.p12 *.pfx
- **Context:**
  ```
  Missing: *.p12, *.pfx
  ```
- **Auto-fix:** `secmaxxing audit`

---

## Checklist — Safe fixes (`secmaxxing audit`)

- [ ] [S019a] Cookie possibly missing httpOnly flag — `middleware.ts:17`
- [ ] [S019a] Cookie possibly missing httpOnly flag — `middleware.ts:21`
- [ ] [S001b] .gitignore missing some secret file patterns — `.gitignore`

---

## Checklist — Destructive fixes (`secmaxxing destructive`)

> ⚠️  These changes modify logic or delete files. All uncommitted work will be committed to `secmaxxing-audit` branch first.

- [ ] [S003f] Hardcoded password — `tests/fixtures/score-card-e2e.ts:28`
- [ ] [S006a] Secret in comment — `lib/location-intelligence/providers.js:405`
- [ ] [S006a] Secret in comment — `lib/location-intelligence/providers.js:693`
- [ ] [S006a] Secret in comment — `next.config.ts:23`
- [ ] [S003g] Hardcoded secret/token — `supabase/config.toml:95`
- [ ] [S003g] Hardcoded secret/token — `supabase/config.toml:287`
- [ ] [S003g] Hardcoded secret/token — `supabase/config.toml:319`
- [ ] [S003g] Hardcoded secret/token — `tests/location-intelligence.test.mjs:98`
