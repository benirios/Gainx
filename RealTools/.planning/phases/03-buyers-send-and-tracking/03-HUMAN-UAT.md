---
status: partial
phase: 03-buyers-send-and-tracking
source: [03-VERIFICATION.md]
started: 2026-05-01T18:00:00Z
updated: 2026-05-01T18:00:00Z
---

## Current Test

Awaiting human testing.

## Tests

### 1. Buyer CRUD
expected: Create a buyer with tags, edit it, and delete it from `/buyers`.
result: pending

### 2. Send OM Email
expected: From Deal Hub, select buyers in Send OM and receive Resend email with tracked OM URL.
result: pending

### 3. Open Tracking
expected: Opening `/om/[deal-id]?ref=[token]` records the first open once for that buyer/deal.
result: pending

### 4. Activity Timeline
expected: Deal Hub Activity section shows `om_sent`, `om_opened`, `note_added`, and `file_uploaded` newest-first.
result: pending

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
