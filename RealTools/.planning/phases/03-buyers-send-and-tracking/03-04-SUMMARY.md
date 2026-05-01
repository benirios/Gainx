---
phase: 03-buyers-send-and-tracking
plan: "04"
subsystem: activity-log
tags: [deal-hub, activities, audit-trail, notes, files]
requires:
  - phase: 03-buyers-send-and-tracking
    provides: send/open activity events and Deal Hub core sections
provides:
  - Deal Hub activity timeline after Files
  - Required event text mapping for om_sent, om_opened, note_added, and file_uploaded
  - Best-effort note_added and file_uploaded activity inserts
affects: [deal-hub, notes, files, activity-log]
tech-stack:
  added: []
  patterns: [read-only activity renderer, service-role telemetry insert, non-blocking activity backfill]
key-files:
  created:
    - components/deals/activity-log-section.tsx
  modified:
    - app/(app)/deals/[id]/page.tsx
    - lib/actions/note-actions.ts
    - lib/actions/file-actions.ts
key-decisions:
  - "Activity section is rendered after Files to preserve the locked Deal Hub section order."
  - "Note/file activity inserts are best-effort and never block the primary note/file write."
patterns-established:
  - "Activity rows use defensive metadata extraction and fallback descriptions."
  - "Service-role usage in user actions is limited to activity telemetry insert paths."
requirements-completed: [ACT-01, ACT-02]
duration: 20min
completed: 2026-05-01
---

# Phase 03: Activity Log Summary

**Deal Hub now shows a read-only activity timeline and records note/file activity events automatically.**

## Performance

- **Duration:** 20 min
- **Started:** 2026-05-01T17:40:00Z
- **Completed:** 2026-05-01T18:00:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Added `ActivityLogSection` with required event descriptions for OM sent, OM opened, note added, and file uploaded.
- Extended Deal Hub fetching to load `activities` ordered by newest first and render the section after Files.
- Added best-effort `note_added` and `file_uploaded` activity inserts after successful note/file creation.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add ActivityLog section and Deal Hub query wiring** - `960565b` (feat)
2. **Task 2: Backfill note/file actions to insert activities via service role** - `28c5958` (feat)

## Files Created/Modified

- `components/deals/activity-log-section.tsx` - Read-only activity renderer with timestamp and event text mapping.
- `app/(app)/deals/[id]/page.tsx` - Activity query and section placement after Files.
- `lib/actions/note-actions.ts` - Best-effort `note_added` activity insert.
- `lib/actions/file-actions.ts` - Best-effort `file_uploaded` activity insert with `metadata.file_name`.

## Decisions Made

- Activity telemetry failures are swallowed after primary write success to preserve existing note/file UX.
- Metadata is read defensively so malformed or missing metadata never breaks timeline rendering.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Verification

- `npx tsc --noEmit` passed.
- `grep -n "ActivityLogSection\|om_sent\|om_opened\|file_uploaded\|note_added" components/deals/activity-log-section.tsx app/(app)/deals/[id]/page.tsx` passed.
- `grep -n "createSupabaseServiceClient\|note_added\|file_uploaded" lib/actions/note-actions.ts lib/actions/file-actions.ts` passed.
- `npm run lint -- components/deals/activity-log-section.tsx lib/actions/note-actions.ts lib/actions/file-actions.ts` passed.

## User Setup Required

None.

## Next Phase Readiness

Phase 3 now has send, open, note, and file activity events flowing into one Deal Hub timeline. Phase-level verification can check the full buyer send and engagement workflow.

---
*Phase: 03-buyers-send-and-tracking*
*Completed: 2026-05-01*
