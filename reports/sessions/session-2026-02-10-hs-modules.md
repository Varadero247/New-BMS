# Session Report: H&S Modules — Incidents, Legal, Objectives, CAPA

**Date**: February 10, 2026
**Duration**: ~2 hours
**Module**: Health & Safety (`web-health-safety`, `api-health-safety`)
**Spec**: `HS_Modules_ClaudeCode_Prompt.md`

---

## Objective

Implement 4 fully functional H&S modules — Incident Register, Legal Register, OHS Objectives, and CAPA Management — each with full CRUD APIs, AI-assisted analysis, and comprehensive frontend modals with multi-section forms.

## Architecture Decisions

### 1. Raw SQL for Schema Changes

`prisma db push` drops core tables (users, sessions) when run against shared database. All new tables created via `docker exec ims-postgres psql` with `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.

### 2. Incident API Bug Fixes

Original `incidents.ts` had 3 bugs from the initial scaffold:

- Used `standard: STANDARD` in where clauses (field doesn't exist in H&S schema)
- Included `reporter`/`investigator` relations (User model is in core schema, not H&S)
- Missing all new fields from schema extension

### 3. Auto-Business Logic

Embedded in API routes rather than frontend:

- **RIDDOR**: CRITICAL/CATASTROPHIC/MAJOR severity → `riddorReportable: true`
- **Investigation**: Same severities → `investigationRequired: true`, auto due dates
- **CAPA targets**: Priority-based (CRITICAL=7d, HIGH=14d, MEDIUM=30d, LOW=60d)
- **Objective progress**: Recalculated from milestones on every milestone update
- **Compliance audit**: `lastReviewedAt` auto-set when compliance status changes

### 4. AI Route Pattern

All 4 AI routes follow the same pattern established by `risks/generate-controls/route.ts`:

- Next.js API routes (server-side, API key secure)
- Direct `fetch` to Anthropic API (no SDK dependency)
- JSON extraction with code fence handling
- Field validation with safe defaults

### 5. Frontend Pattern

All 4 client components follow the `risks/client.tsx` pattern:

- Single `client.tsx` file with `'use client'` directive
- Thin `page.tsx` server wrapper
- Multi-section modal with tab navigation
- AI generation button with loading state
- "AI Suggested" badges on generated fields
- Search + filter bar with dropdowns
- Summary cards with color-coded counts

## Technical Implementation

### Database Layer

```
health-safety.prisma changes:
  Incident model  → +18 new fields (RIDDOR, investigation, AI analysis)
  Risk model      → +capas relation
  +LegalRequirement (22 fields, 3 enums)
  +OhsObjective (22 fields, 2 enums)
  +ObjectiveMilestone (7 fields, cascade delete)
  +Capa (24 fields, 6 enums)
  +CapaAction (11 fields, cascade delete)
```

### API Layer

```
api-health-safety/src/routes/
  incidents.ts    → Rewritten (CRUD, auto RIDDOR, auto investigation dates)
  legal.ts        → NEW (CRUD, auto ref# LR-XXX, compliance tracking)
  objectives.ts   → NEW (CRUD + milestones, auto ref# OBJ-XXX, progress calc)
  capa.ts         → NEW (CRUD + actions, auto ref# CAPA-XXX, auto target dates)
  index.ts        → +3 route registrations
```

### AI Layer

```
web-health-safety/src/app/api/
  incidents/analyse/route.ts   → 5-Why root cause (ICAM methodology)
  legal/analyse/route.ts       → UK/EU compliance assessment
  objectives/assist/route.ts   → SMART objective + KPIs + milestones
  capa/analyse/route.ts        → Root cause + corrective/preventive actions
```

### Frontend Layer

```
web-health-safety/src/app/
  incidents/client.tsx  → 4-section modal, severity colors, RIDDOR badges
  legal/client.tsx      → 2-section modal, compliance colors, jurisdiction
  objectives/client.tsx → 2-section modal, card grid, progress bars, milestones
  actions/client.tsx    → 2-section modal, overdue indicators, nested actions
```

## Test Results

```
Automated test suite: 70/70 passing

1. INCIDENTS (16 tests)
   ✓ POST - create with auto ref#
   ✓ POST CRITICAL - auto RIDDOR + investigation + due date (24hrs)
   ✓ POST MODERATE - no auto RIDDOR
   ✓ GET list, single, search, status filter, severity filter
   ✓ PATCH - status update
   ✓ Validation error on empty title
   ✓ 404 on nonexistent ID
   ✓ DELETE

2. LEGAL (11 tests)
   ✓ POST - create with auto ref# (LR-001), default NOT_ASSESSED
   ✓ GET list, single, compliance filter, category filter
   ✓ PATCH - compliance status update, auto lastReviewedAt
   ✓ Validation error on missing required fields
   ✓ DELETE

3. OBJECTIVES (11 tests)
   ✓ POST - create with 4 milestones, auto ref# (OBJ-001)
   ✓ GET list with milestones, single
   ✓ POST milestone, PATCH milestone (completed + completedDate)
   ✓ Progress recalculation (1/5 = 20%)
   ✓ PATCH status update
   ✓ Category filter
   ✓ DELETE (cascade milestones)

4. CAPA (16 tests)
   ✓ POST - create with 3 actions, auto ref# (CAPA-XXX)
   ✓ POST HIGH priority - auto 14-day target
   ✓ POST CRITICAL - auto 7-day target
   ✓ GET list with actions, single
   ✓ POST action, PATCH action (completed + completedAt)
   ✓ PATCH close - closedDate, closedBy, effectivenessRating
   ✓ Priority filter, type filter
   ✓ DELETE (cascade actions)

5. GATEWAY (4 tests)
   ✓ /api/health-safety/incidents → proxied
   ✓ /api/health-safety/legal → proxied
   ✓ /api/health-safety/objectives → proxied
   ✓ /api/health-safety/capa → proxied

6. FRONTEND (5 tests)
   ✓ /incidents → 200
   ✓ /legal → 200
   ✓ /objectives → 200
   ✓ /actions → 200
   ✓ /risks → 200

7. DELETE (7 tests)
   ✓ All 4 modules delete correctly
   ✓ Cascade deletes verified (milestones, actions)
   ✓ 404 after delete confirmed
```

## Files Summary

- **New files**: 16 (3 API routes, 4 AI routes, 4 client.tsx, 4 page.tsx, 1 test script)
- **Modified files**: 3 (schema, incidents.ts, index.ts)
- **Total new code**: ~3,500 lines
- **Modified code**: ~600 lines changed

## What's Next

- End-to-end browser testing of all modal workflows
- Edit modals (reuse same forms, pre-populate from existing records)
- Dashboard integration (summary cards on H&S main page)
- Notification system (overdue CAPAs, approaching review dates)
- Bulk import/export (CSV for incidents, legal requirements)
