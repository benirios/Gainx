# Phase 11 UI-SPEC: Source Ingestion MVP

**Status:** approved
**Date:** 2026-05-03

## Scope

Phase 11 adds an authenticated listing ingestion surface. It must feel like an operational admin tool inside the existing light dashboard shell.

## Surfaces

### Navigation

- Add one sidebar nav item: `Listings`
- Route target: `/listings/import`
- Icon: use a lucide icon such as `MapPinned`, `Map`, `Database`, or `Search`.
- Active state must use the existing `SidebarNav` active styling.

### Import Page

Route: `app/(app)/listings/import/page.tsx`

The page should include:

- Header: `Listing Import`
- Subcopy: short operational description, no marketing copy.
- Summary strip with counts:
  - Total listings
  - Active targets
  - Last run status
  - Failed records or failed runs
- Target table:
  - Source
  - State
  - City
  - Search term
  - Active status
  - Action button for OLX targets
- Manual/CSV import panel:
  - Textarea or file/input area for CSV content
  - Clear expected column guidance in compact helper text
  - Submit button
- Recent runs table:
  - Source
  - Target
  - Status
  - Created
  - Updated
  - Skipped
  - Failed
  - Completed/started time
  - Error summary

## Visual Contract

- Use existing light dashboard tokens: `bg-background`, `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`.
- Cards/tables should match buyers/deal surfaces: rounded `lg`, bordered, white card background.
- Use dense operational layout; no hero sections.
- Buttons must use existing `Button` primitives.
- Empty state should include direct action, not explanation-heavy copy.
- Long URLs/errors must truncate or wrap without breaking layout.

## Interaction Contract

- Running OLX ingestion should show a pending/disabled state in the action component.
- CSV/manual import should show validation errors inline.
- Failures must remain visible after submission through recent run status.
- Do not block the entire page if OLX fails; show failed run status.

## Out of Scope

- Map view.
- Commercial classification badges.
- Geocoding status.
- Scheduled jobs.
- Facebook scraping automation.
