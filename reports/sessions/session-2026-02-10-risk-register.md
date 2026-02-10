# Session Report: H&S Risk Register with AI-Assisted Controls

**Date**: February 10, 2026
**Duration**: ~3 hours
**Module**: Health & Safety (`web-health-safety`, `api-health-safety`)
**Spec**: `HS_Risk_Register_Spec.docx` (ISO 45001:2018 compliant)

---

## Objective
Implement a fully functional Health & Safety Risk Register with AI-assisted control generation, 5x5 risk matrix scoring, and Hierarchy of Controls (ISO 45001) — replacing the non-functional "Add Risk" button on the `/risks` page.

## Architecture Decisions

### 1. Separate Prisma Schema (Not Core)
The H&S service uses its own Prisma schema at `packages/database/prisma/schemas/health-safety.prisma` with a generated client at `packages/database/generated/health-safety/`. This is separate from the core schema (`schema.prisma`) which only has User, Session, AuditLog, ApiKey models. All H&S route files import from a local `src/prisma.ts` wrapper rather than `@ims/database`.

### 2. L×S Scoring (Not L×S×D)
The spec requires a 5×5 matrix (Likelihood × Severity, max score 25) rather than the existing L×S×D model. The `detectability` field is retained for backward compatibility but not used in the risk register scoring. Risk levels:
- **LOW** (green): 1–4
- **MEDIUM** (yellow): 5–9
- **HIGH** (orange): 10–16
- **CRITICAL** (red): 17–25

### 3. AI Controls via Next.js API Route
The Anthropic API key stays server-side by using a Next.js API route (`/api/risks/generate-controls`). The browser calls this route (same-origin), which calls Claude. This avoids exposing the API key in client-side code or sending it through the gateway.

### 4. CSRF Double-Submit Cookie Pattern
The gateway enforces CSRF on all state-changing requests. The frontend's axios client was updated to:
1. Fetch a CSRF token from `/api/v1/csrf-token` before the first POST
2. Include it as `X-CSRF-Token` header with `withCredentials: true`
3. Auto-retry once on CSRF expiry (403)

### 5. Nullable New Fields
All 18 new fields on the Risk model are nullable (except `aiControlsGenerated` which defaults to `false`). This ensures backward compatibility — existing risks created before this feature continue to work.

## Technical Implementation

### Database Layer
```
health-safety.prisma → Risk model
  +referenceNumber    (String? @unique)     — HS-001, HS-002, etc.
  +whoAtRisk          (String?)             — People affected
  +aiControlElimination    (String?)        — Level 1 control
  +aiControlSubstitution   (String?)        — Level 2 control
  +aiControlEngineering    (String?)        — Level 3 control
  +aiControlAdministrative (String?)        — Level 4 control
  +aiControlPPE            (String?)        — Level 5 control
  +aiControlsGenerated     (Boolean)        — AI flag
  +residualLikelihood (Int?)                — Post-controls L
  +residualSeverity   (Int?)                — Post-controls S
  +residualRiskScore  (Int?)                — Post-controls L×S
  +residualRiskLevel  (RiskLevel?)          — Post-controls level
  +riskOwner          (String?)
  +legalReference     (String?)
  +createdBy          (String?)
```

Tables created via raw SQL in Docker Postgres (not `prisma db push`, which would drop core tables sharing the same database).

### API Layer (`api-health-safety/src/routes/risks.ts`)
- **Reference number generation**: Queries max existing ref, increments (HS-001 → HS-002)
- **Score calculation**: Inline `getRiskLevel(l, s)` for both initial and residual
- **Review date defaults**: CRITICAL=1mo, HIGH=3mo, MEDIUM=6mo, LOW=12mo from creation
- **createdBy**: Set from JWT `req.userId`
- **Matrix endpoint**: Groups risks by `likelihood-severity` key for heatmap rendering

### AI Layer (`web-health-safety/src/app/api/risks/generate-controls/route.ts`)
- Model: `claude-sonnet-4-5-20250929`, max_tokens: 800
- System prompt: ISO 45001 OHS expert, returns JSON with 5 hierarchy levels + suggested L/S
- Handles JSON wrapped in code fences (Claude sometimes wraps in ```json)
- Response time: ~3 seconds

### Frontend Layer (`web-health-safety/src/app/risks/client.tsx`)
- 901 lines, single client component
- 5-section modal form with AI integration
- Auto-triggers AI on hazard description blur (≥20 chars, one-shot)
- Tracks which AI fields user edited (shows "AI Suggested" vs "Edited" badges)
- Warns if residual risk ≥ initial risk
- Filters: status, risk rating, category, free-text search
- Summary cards with counts by risk level

## Issues Encountered & Resolved

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| `prisma.risk` undefined on API | API imported from `@ims/database` (core client, no Risk model) | Created `src/prisma.ts` importing from `@ims/database/health-safety` |
| Gateway ECONNREFUSED to localhost:4001 | Docker env sets `SERVICE_HEALTH_SAFETY_URL` but code read `HEALTH_SAFETY_URL` | Updated gateway to check `SERVICE_*` vars first |
| `prisma db push` would drop core tables | All schemas target the same `ims` database | Created tables via raw SQL instead |
| POST through gateway returns empty response | CSRF middleware blocks requests without token | Added CSRF token management to frontend axios client |
| .env double-path bug | `NEXT_PUBLIC_API_URL=http://localhost:4000/api` + api.ts appending `/api/health-safety` | Changed to `http://localhost:4000` |

## Files Changed Summary
- **New files**: 3 (client.tsx, route.ts, prisma.ts)
- **Modified files**: 11 (schema, 5 routes, entrypoint, gateway, api.ts, page.tsx, calculations)
- **Total new code**: ~1,041 lines
- **Modified code**: ~200 lines changed across existing files

## Testing Results
```
✓ GET  /api/risks           → 200, returns array with all new fields
✓ POST /api/risks           → 201, auto ref# HS-001, L×S scoring, review date
✓ PATCH /api/risks/:id      → 200, recalculates scores
✓ GET  /api/risks/matrix    → 200, grouped by L-S key
✓ POST /api/risks/generate-controls → 200, 5 control levels + suggested L/S
✓ Web page loads            → 200 at localhost:3001/risks
✓ Gateway proxy             → Routes to api-health-safety:4001 in Docker
```

## What's Next
- End-to-end browser testing of the full Add Risk workflow
- Edit Risk modal (reuse same form, pre-populate from existing risk)
- Bulk import/export of risks (CSV)
- Risk review workflow (notification when review date approaches)
- Dashboard integration (risk summary cards on H&S dashboard)
