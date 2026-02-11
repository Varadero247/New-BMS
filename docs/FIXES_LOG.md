# IMS — Fixes Log

## Date: February 10, 2026

All 5 H&S modules (Risks, Incidents, Legal, Objectives, CAPA) were implemented and tested. During end-to-end testing, 6 critical bugs were discovered and fixed.

---

## FIX 1 — Modal prop name mismatch (CRITICAL)

**Problem:** All 5 H&S module pages used `<Modal open={...}>` but the `@ims/ui` Modal component expects `isOpen` as the prop name. The modal never rendered because `isOpen` was always `undefined`.

**Root Cause:** The Claude Code prompt specified `open` as the prop, but `packages/ui/src/modal.tsx` defines the prop as `isOpen`. The generated code followed the prompt rather than the actual component API.

**Solution:**
```bash
sed -i 's/<Modal open=/<Modal isOpen=/g' [each file]
```

**Files Changed:**
- `apps/web-health-safety/src/app/incidents/client.tsx`
- `apps/web-health-safety/src/app/legal/client.tsx`
- `apps/web-health-safety/src/app/objectives/client.tsx`
- `apps/web-health-safety/src/app/risks/client.tsx`
- `apps/web-health-safety/src/app/actions/client.tsx`

**Correct Modal Usage:**
```tsx
<Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Report Incident" size="lg">
```

**Modal Component Props (`packages/ui/src/modal.tsx`):**
| Prop | Type | Required | Notes |
|------|------|----------|-------|
| `isOpen` | `boolean` | Yes | NOT `open` |
| `onClose` | `() => void` | Yes | |
| `title` | `string` | No | |
| `description` | `string` | No | |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | No | |

---

## FIX 2 — Health-Safety API CORS wildcard (CRITICAL)

**Problem:** `apps/api-health-safety/src/index.ts` used `app.use(cors())` with no configuration, which defaults to `Access-Control-Allow-Origin: *` (wildcard). Browsers block credentialed requests (`withCredentials: true`) to wildcard origins.

**Root Cause:** Default CORS middleware configuration does not support credentialed cross-origin requests. The browser requires an explicit origin (not `*`) when credentials are included.

**Solution:**
```typescript
// Before
app.use(cors());

// After
app.use(cors({ origin: true, credentials: true }));
```

`origin: true` reflects the request's `Origin` header back in the response, which satisfies the browser's CORS check for credentialed requests.

**Files Changed:**
- `apps/api-health-safety/src/index.ts`

---

## FIX 3 — API Gateway CORS ordering (CRITICAL)

**Problem:** The `createSecurityMiddleware()` (Helmet) ran BEFORE the CORS middleware, and the downstream proxy response headers overwrote the gateway's CORS headers. This caused all cross-origin requests through the gateway to fail.

**Root Cause:** Middleware ordering issue — Helmet's security headers were applied first, then CORS headers were set, but the proxy response from downstream services (which had their own CORS headers) overwrote the gateway's headers on the way back.

**Solution (3 changes to `apps/api-gateway/src/index.ts`):**

### 3a. Raw CORS middleware as ABSOLUTE FIRST middleware (before Helmet):
```typescript
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = [
    'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002',
    'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005',
    'http://localhost:3006', 'http://localhost:3007', 'http://localhost:3008'
  ];
  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-CSRF-Token,X-Correlation-ID');
  if (req.method === 'OPTIONS') { res.sendStatus(204); return; }
  next();
});
```

### 3b. `onProxyRes` handler to strip downstream CORS headers:
```typescript
const createServiceProxy = (...) => createProxyMiddleware({
  ...
  onProxyRes: (proxyRes) => {
    delete proxyRes.headers['access-control-allow-origin'];
    delete proxyRes.headers['access-control-allow-credentials'];
    delete proxyRes.headers['access-control-allow-methods'];
    delete proxyRes.headers['access-control-allow-headers'];
  },
  ...
});
```

### 3c. Function-based CORS origin:
```typescript
const allowedOrigins = [
  'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002',
  'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005',
  'http://localhost:3006', 'http://localhost:3007', 'http://localhost:3008'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin || '*');
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Correlation-ID'],
}));
```

**Files Changed:**
- `apps/api-gateway/src/index.ts`

---

## FIX 4 — Security headers crossOriginResourcePolicy

**Problem:** `apps/api-gateway/src/middleware/security-headers.ts` had `crossOriginResourcePolicy: { policy: 'same-origin' }` which blocked all cross-origin resource loading.

**Root Cause:** Helmet's default `same-origin` policy is correct for most apps, but in a multi-port microservice architecture where frontends on ports 3000-3008 need to access APIs on ports 4000-4008, cross-origin resource loading is required.

**Solution:**
```typescript
// Before
crossOriginResourcePolicy: { policy: 'same-origin' },

// After
crossOriginResourcePolicy: { policy: 'cross-origin' },
```

**Files Changed:**
- `apps/api-gateway/src/middleware/security-headers.ts`

---

## FIX 5 — api.ts CSRF/withCredentials rewrite (CRITICAL)

**Problem:** `apps/web-health-safety/src/lib/api.ts` had multiple issues:
1. `withCredentials: true` on the axios instance (requires non-wildcard CORS — see Fix 2)
2. A tagged template literal bug: `axios.get\`${url}\`` instead of `axios.get(url)`
3. CSRF token fetch logic that called `/api/v1/csrf-token` causing 403 errors on every request

**Root Cause:** The original api.ts was over-engineered with CSRF double-submit cookie logic that was incompatible with the JWT Bearer token auth pattern used by the H&S module. The tagged template literal was a code generation error.

**Solution — Rewrote to clean simple version:**
```typescript
'use client';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_URL}/api/health-safety`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Files Changed:**
- `apps/web-health-safety/src/lib/api.ts`

---

## FIX 6 — CORS_ORIGIN environment variable

**Problem:** The root `.env` file had `CORS_ORIGIN=` (empty string) which was being loaded by the gateway container and overriding the hardcoded origins array in code, resulting in an empty allowed-origins list.

**Root Cause:** Environment variables take precedence over code defaults. An empty `CORS_ORIGIN=` evaluates to truthy in Node.js (`process.env.CORS_ORIGIN` is `""`, which is a string), so the code path `process.env.CORS_ORIGIN || fallback` used the empty string instead of the fallback.

**Solution:**
```bash
# Remove CORS_ORIGIN from .env entirely
sed -i '/CORS_ORIGIN/d' ~/New-BMS/.env
```

Let the code use the hardcoded allowed origins array.

**Files Changed:**
- `.env`

---

## Summary

| Fix | Severity | Category | Root Cause |
|-----|----------|----------|------------|
| 1 — Modal prop | CRITICAL | Frontend | Prop name `open` vs `isOpen` |
| 2 — H&S CORS | CRITICAL | Backend | Wildcard CORS with credentials |
| 3 — Gateway CORS | CRITICAL | Infra | Middleware ordering + proxy header override |
| 4 — Security headers | MODERATE | Infra | `same-origin` resource policy |
| 5 — api.ts rewrite | CRITICAL | Frontend | Over-engineered CSRF + template literal bug |
| 6 — CORS_ORIGIN env | MODERATE | Config | Empty env var overriding code defaults |

**Lesson Learned:** In a multi-service architecture, CORS must be handled at the gateway level only. Downstream services should either not set CORS headers or the gateway must strip them. Always test cross-origin requests end-to-end through the gateway, not just direct to the service.

---

## Session 2 — Startup & Database Fixes (2026-02-11)

After shutting down and restarting the system, 5 critical startup issues were discovered and fixed.

---

### FIX 7 — Port Conflicts on Restart

**Problem:** When restarting Docker after a system shutdown, host services (PostgreSQL, Redis) were still running and occupying the ports needed by containers.

**Symptoms:**
```
Error response from daemon: Ports are not available: exposing port TCP 0.0.0.0:5432
Error response from daemon: Ports are not available: exposing port TCP 0.0.0.0:6379
```

**Solution:** Kill all conflicting ports before starting Docker:
```bash
sudo systemctl stop postgresql
sudo fuser -k 5432/tcp 6379/tcp 2>/dev/null
for port in 4000 4001 4002 4003 4004 3000 3001 3002 3003 3004 3005 3006 3007; do
  sudo fuser -k ${port}/tcp 2>/dev/null
done
sleep 3
docker compose up -d
```

---

### FIX 8 — Fresh PostgreSQL Container Loses All Data

**Problem:** When Docker recreates the postgres container, all data is lost including the `ims_user` role, admin user record, all hs_* table schemas, and columns added after initial migration.

**Root Cause:** The postgres container uses a volume but when killed with `fuser`, the volume may be recreated fresh or the container was recreated with `--force-recreate`.

**Solution:** After postgres restarts, re-initialize:
1. Reset postgres password
2. Add missing columns to users/sessions tables (`deletedAt`, `lastLoginAt`, `lastActivityAt`)
3. Re-seed admin user with bcrypt hash

See `scripts/startup.sh` for the automated procedure.

---

### FIX 9 — Health-Safety Tables Missing After Restart

**Problem:** The 15 hs_* tables do not exist in a fresh postgres container because `prisma db push` fails inside containers due to OpenSSL 1.1 incompatibility, and no migration files exist for the health-safety schema.

**Root Cause:** Prisma 5.22.0 needs `libssl.so.1.1` but Alpine containers only have OpenSSL 3.

**Solution:** Push schema from HOST machine using `prisma migrate diff`:
```bash
cd ~/New-BMS/packages/database
HEALTH_SAFETY_DATABASE_URL="postgresql://postgres:ims_secure_password_2026@localhost:5432/ims" \
  node_modules/.bin/prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schemas/health-safety.prisma \
  --script 2>/dev/null | \
  DOCKER_API_VERSION=1.41 docker exec -i ims-postgres psql -U postgres -d ims
```

Then manually add missing columns for `hs_legal_requirements` and `hs_ohs_objectives` tables. See `docs/DATABASE_SCHEMA_NOTES.md` for the full list.

---

### FIX 10 — Prisma OpenSSL Incompatibility in Containers

**Problem:** All API containers (Alpine Linux) fail with:
```
Error loading shared library libssl.so.1.1: No such file or directory
```

**Root Cause:** Prisma 5.22.0 uses `linux-musl` binary which needs OpenSSL 1.1, but Alpine only has OpenSSL 3.

**Solution:** Added `binaryTargets` to ALL Prisma schema generator blocks:
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
  output        = "../../generated/core"
}
```

Applied to `packages/database/prisma/schema.prisma`, `packages/database/prisma/schemas/health-safety.prisma`, and all other schemas.

After adding binaryTargets, affected containers must be rebuilt:
```bash
docker compose build --no-cache api-gateway api-health-safety
docker compose up -d --force-recreate api-gateway api-health-safety
```

---

### FIX 11 — Docker API Version Mismatch

**Problem:** Standard `docker exec` commands fail with:
```
Error response from daemon: client version 1.53 is too new. Maximum supported API version is 1.41
```

**Solution:** Prefix all docker exec commands with:
```bash
DOCKER_API_VERSION=1.41 docker exec ...
```

Or set permanently: `export DOCKER_API_VERSION=1.41`

---

### Session 2 Summary

| Fix | Severity | Category | Root Cause |
|-----|----------|----------|------------|
| 7 — Port conflicts | HIGH | Infra | Host services occupying container ports |
| 8 — Data loss | CRITICAL | Database | Volume loss on container recreation |
| 9 — Missing HS tables | CRITICAL | Database | No migration files + OpenSSL incompatibility |
| 10 — OpenSSL | HIGH | Infra | Prisma needs OpenSSL 1.1, Alpine has OpenSSL 3 |
| 11 — Docker API | LOW | Config | Client/daemon version mismatch |

**Lesson Learned:** Always use `scripts/startup.sh` for restarts. It handles port conflicts, data re-seeding, and table recreation automatically. Never assume Docker volumes survive container recreation.

---

## Session 3 — Environmental Modules Implementation (2026-02-11)

Complete rewrite of the Environment module from basic scaffolding to 6 fully functional ISO 14001:2015 modules.

---

### CHANGE 12 — Environment Schema Rewrite

**What:** Replaced the entire `packages/database/prisma/schemas/environment.prisma` with 8 new comprehensive models and 30+ enums.

**New Models:**
| Model | Table | Description |
|-------|-------|-------------|
| EnvAspect | `env_aspects` | Environmental aspects with 7-factor significance scoring |
| EnvEvent | `env_events` | Environmental events/incidents with RCA fields |
| EnvLegal | `env_legal` | Legal register with compliance assessment |
| EnvObjective | `env_objectives` | Objectives & targets with SMART framework |
| EnvMilestone | `env_milestones` | Objective milestones (child of EnvObjective) |
| EnvAction | `env_actions` | Environmental actions with verification |
| EnvCapa | `env_capas` | CAPA with 5-Why, Fishbone, Bowtie RCA |
| EnvCapaAction | `env_capa_actions` | CAPA actions (child of EnvCapa) |

**Kept Models:** MonitoringData, WasteRecord, EnvironmentalMetric (unchanged from original).

**Key Enums Added:** EnvActivityCategory (13), EnvEventType (10), EnvCapaStatus (7), EnvCapaTrigger (11), EnvRootCauseCategory (11), and 25+ more.

**Files Changed:**
- `packages/database/prisma/schemas/environment.prisma`

---

### CHANGE 13 — API Route Mounting Fix

**Problem:** The existing API routes were mounted at `/api/risks` and `/api/incidents` which didn't match the gateway's path rewrite pattern. The gateway strips `/api/environment` prefix via `pathRewrite: { '^/api/environment': '/api' }`, so routes must mount at `/api/aspects`, `/api/events`, etc.

**Also:** The API was importing from the shared `@ims/database` instead of the domain-specific `@ims/database/environment`.

**Solution:**
1. Created `apps/api-environment/src/prisma.ts` — domain-specific Prisma client singleton
2. Rewrote `apps/api-environment/src/index.ts`:
   - Changed import from `@ims/database` to `./prisma`
   - Fixed CORS: `cors({ origin: true, credentials: true })`
   - Fixed route mounting to `/api/aspects`, `/api/events`, `/api/legal`, `/api/objectives`, `/api/actions`, `/api/capa`
3. Updated `apps/api-environment/entrypoint.sh` to generate environment schema (was only generating core)

**Files Changed:**
- `apps/api-environment/src/prisma.ts` (new)
- `apps/api-environment/src/index.ts`
- `apps/api-environment/entrypoint.sh`

---

### CHANGE 14 — Six API Route Files

**What:** Wrote 6 complete API route files with full CRUD, Zod validation, reference number generation, and pagination.

| Route | Model | Reference Pattern | Special Features |
|-------|-------|-------------------|------------------|
| `aspects.ts` | `prisma.envAspect` | `ENV-ASP-YYYY-NNN` | Weighted significance scoring formula |
| `events.ts` | `prisma.envEvent` | `ENV-EVT-YYYY-NNN` | Auto-sets closureDate on CLOSED |
| `legal.ts` | `prisma.envLegal` | `ENV-LEG-YYYY-NNN` | Compliance status defaults |
| `objectives.ts` | `prisma.envObjective` | `ENV-OBJ-YYYY-NNN` | Nested milestone CRUD, PATCH milestones endpoint |
| `actions.ts` | `prisma.envAction` | `ENV-ACT-YYYY-NNN` | Auto-sets completionDate on COMPLETED |
| `capa.ts` | `prisma.envCapa` | `ENV-CAPA-YYYY-NNN` | Nested capaActions, POST/PUT sub-actions |

**Significance Scoring Formula (aspects):**
```
score = severity*1.5 + probability*1.5 + duration + extent + reversibility + regulatory + stakeholder
isSignificant = score >= 15
```

**Files Changed:**
- `apps/api-environment/src/routes/aspects.ts`
- `apps/api-environment/src/routes/events.ts`
- `apps/api-environment/src/routes/legal.ts`
- `apps/api-environment/src/routes/objectives.ts`
- `apps/api-environment/src/routes/actions.ts` (new)
- `apps/api-environment/src/routes/capa.ts` (new)

---

### CHANGE 15 — Six Frontend Modules

**What:** Created 12 frontend files (page.tsx + client.tsx for each module) with comprehensive forms, AI analysis panels, significance scoring, filters, and card-based list views.

Each module includes:
- Summary metrics row
- Filter bar (status/type/search)
- Card/table list with badges and color coding
- Empty state with CTA
- Full modal form (`<Modal isOpen={...}>`) with sectioned layout
- AI analysis panel with collapsible results
- Loading/submitting states
- Green color theme consistent with Environmental module

**Module sizes:** Aspects (1216 lines), Events (1044 lines), Legal (990 lines), Objectives (1284 lines), Actions (1165 lines), CAPA (1400 lines) — total ~7,100 lines.

**CAPA module highlights:** 5-tab form with Initiation, Root Cause Analysis (5-Why/Fishbone/Bowtie conditional rendering), Corrective Actions (dynamic table), Effectiveness Tracking, AI Analysis.

**Files Changed:**
- `apps/web-environment/src/app/aspects/page.tsx` + `client.tsx`
- `apps/web-environment/src/app/events/page.tsx` + `client.tsx`
- `apps/web-environment/src/app/legal/page.tsx` + `client.tsx`
- `apps/web-environment/src/app/objectives/page.tsx` + `client.tsx`
- `apps/web-environment/src/app/actions/page.tsx` + `client.tsx`
- `apps/web-environment/src/app/capa/page.tsx` + `client.tsx` (new directory)
- `apps/web-environment/src/components/sidebar.tsx` (updated navigation)
- `apps/web-environment/src/app/page.tsx` (dashboard field name fixes)

---

### Session 3 Summary

| Change | Category | Scope |
|--------|----------|-------|
| 12 — Schema rewrite | Database | 8 new models, 30+ enums, 11 tables |
| 13 — API routing fix | Backend | Prisma client, route mounting, CORS, entrypoint |
| 14 — API routes | Backend | 6 route files with full CRUD + validation |
| 15 — Frontend modules | Frontend | 12 files, ~7,100 lines, 6 modules with AI |

**Lesson Learned:** In multi-schema Prisma setups sharing one database, `prisma db push` tries to drop tables from other schemas. Use `prisma migrate diff --from-empty --script` piped through `psql` instead — this safely creates only the new tables without touching existing ones.

---

## Session 4 — Quality Module Full Implementation (2026-02-11)

Complete rewrite of the Quality module from basic scaffolding to 12 fully functional ISO 9001:2015 modules with 15 API endpoints and 18 database models.

---

### CHANGE 16 — Quality Schema Rewrite

**What:** Replaced the entire `packages/database/prisma/schemas/quality.prisma` with 18 new `Qual`-prefixed models and 50+ enums (1,489 lines).

**New Models:**
| Model | Table | Description |
|-------|-------|-------------|
| QualInterestedParty | `qual_interested_parties` | Interested parties register |
| QualIssue | `qual_issues` | Internal/external issues |
| QualRisk | `qual_risks` | Risk register with probability × consequence scoring |
| QualOpportunity | `qual_opportunities` | Opportunity register |
| QualProcess | `qual_processes` | Process register with turtle diagram fields |
| QualNonConformance | `qual_nonconformances` | NCR with containment, RCA, 5-Why |
| QualAction | `qual_actions` | Action register with verification lifecycle |
| QualDocument | `qual_documents` | Document control with versioning |
| QualCapa | `qual_capas` | CAPA with 5-Why/Fishbone/8D RCA methods |
| QualCapaAction | `qual_capa_actions` | CAPA actions (child of QualCapa) |
| QualLegal | `qual_legal` | Legal/compliance register |
| QualFmea | `qual_fmeas` | FMEA header |
| QualFmeaRow | `qual_fmea_rows` | FMEA analysis rows with S×O×D RPN |
| QualImprovement | `qual_improvements` | Continual improvement with PDCA |
| QualSupplier | `qual_suppliers` | Supplier quality with IMS 3-ring scoring |
| QualChange | `qual_changes` | Change management with impact assessment |
| QualObjective | `qual_objectives` | Quality objectives with KPI tracking |
| QualMilestone | `qual_milestones` | Objective milestones (child of QualObjective) |

**Files Changed:**
- `packages/database/prisma/schemas/quality.prisma`

---

### CHANGE 17 — Quality API Infrastructure

**What:** Created domain-specific Prisma client, rewrote API entry point, and updated entrypoint script.

**Changes:**
1. Created `apps/api-quality/src/prisma.ts` — singleton PrismaClient from `@ims/database/quality`
2. Rewrote `apps/api-quality/src/index.ts`:
   - Changed import from `@ims/database` to `./prisma`
   - Fixed CORS: `cors({ origin: true, credentials: true })`
   - Mounted 15 routes at `/api/<resource>` (gateway rewrites `/api/quality/*` → `/api/*`)
3. Updated `apps/api-quality/entrypoint.sh` to generate quality schema before core
4. Removed 9 obsolete route files (audits.ts, capas.ts, change-management.ts, continuous-improvement.ts, investigations.ts, metrics.ts, supplier-quality.ts, templates.ts, training.ts)

**Files Changed:**
- `apps/api-quality/src/prisma.ts` (new)
- `apps/api-quality/src/index.ts`
- `apps/api-quality/entrypoint.sh`
- 9 old route files deleted

---

### CHANGE 18 — Fifteen API Route Files

**What:** Wrote 15 complete API route files with full CRUD, Zod validation, auto-generated reference numbers (QMS-XXX-YYYY-NNN), pagination, and filters.

| Route | Model | Reference Pattern | Special Features |
|-------|-------|-------------------|------------------|
| `parties.ts` | QualInterestedParty | `QMS-PRT-YYYY-NNN` | Party type/category filters |
| `issues.ts` | QualIssue | `QMS-ISS-YYYY-NNN` | Internal/external issue tracking |
| `risks.ts` | QualRisk | `QMS-RSK-YYYY-NNN` | Probability × consequence, risk level calc |
| `opportunities.ts` | QualOpportunity | `QMS-OPP-YYYY-NNN` | Probability × benefit scoring |
| `processes.ts` | QualProcess | `QMS-PRC-YYYY-NNN` | Turtle diagram fields, KPIs |
| `nonconformances.ts` | QualNonConformance | `QMS-NC-YYYY-NNN` | Containment, 5-Why RCA |
| `actions.ts` | QualAction | `QMS-ACT-YYYY-NNN` | Verification lifecycle |
| `documents.ts` | QualDocument | `QMS-DOC-YYYY-NNN` | Version control, distribution |
| `capa.ts` | QualCapa | `QMS-CAPA-YYYY-NNN` | Nested QualCapaAction CRUD, 5-Why/Fishbone/8D |
| `legal.ts` | QualLegal | `QMS-LEG-YYYY-NNN` | Compliance assessment |
| `fmea.ts` | QualFmea | `QMS-FMEA-YYYY-NNN` | Nested FmeaRow CRUD, RPN calc (S×O×D) |
| `improvements.ts` | QualImprovement | `QMS-IMP-YYYY-NNN` | PDCA tracking |
| `suppliers.ts` | QualSupplier | `QMS-SUP-YYYY-NNN` | IMS scoring (Quality 50% + H&S 30% + Env 20%) |
| `changes.ts` | QualChange | `QMS-CHG-YYYY-NNN` | Impact assessment grid |
| `objectives.ts` | QualObjective | `QMS-OBJ-YYYY-NNN` | Nested milestone CRUD |

**Files Changed:**
- `apps/api-quality/src/routes/` — 15 route files (8 new, 7 rewritten)

---

### CHANGE 19 — Twelve Frontend Modules

**What:** Created 24 frontend files (page.tsx + client.tsx for each module) with comprehensive forms, AI analysis panels, filters, and card-based list views. Total: ~13,157 lines.

Each module includes: summary metrics cards, filter bar, card-based list with badges, empty state with CTA, full modal form (`<Modal isOpen={...}>`), AI analysis panel, loading/submitting states.

| Module | Lines | Key Features |
|--------|-------|--------------|
| `/risks` | 1,867 | Tabbed: Parties, Issues, Risks, Opportunities (4 sub-modules) |
| `/processes` | 565 | Turtle diagram (inputs/outputs/resources/competence/activities/controls), KPIs |
| `/nonconformances` | 627 | NCR with containment, 5-Why RCA, corrective/preventive actions |
| `/actions` | 1,077 | Action register with progress bar, verification, cross-links |
| `/documents` | 1,101 | Document control with lifecycle, version badges, type icons |
| `/capa` | 1,752 | 9-tab form: 5-Why/Fishbone/8D conditional RCA, inline actions table |
| `/legal` | 1,161 | Legal register with compliance assessment, IMS cross-links |
| `/fmea` | 1,285 | Editable analysis table, live RPN calc (S×O×D), color-coded badges |
| `/improvements` | 1,472 | PDCA tracking, priority score calc, status pipeline visualization |
| `/suppliers` | 1,143 | IMS 3-ring scoring (Quality 50% + H&S 30% + Env 20%) |
| `/changes` | 546 | Impact assessment grid (7 impact areas), approval tracking |
| `/objectives` | 565 | KPI tracking with progress bars, milestone management table |

**Files Changed:**
- `apps/web-quality/src/app/` — 12 directories, 24 files
- `apps/web-quality/src/components/sidebar.tsx` (updated navigation)
- `apps/web-quality/src/lib/api.ts` (fixed baseURL)

---

### CHANGE 20 — Frontend API Client & Sidebar Fix

**What:** Fixed the Quality frontend API client and sidebar navigation.

1. `apps/web-quality/src/lib/api.ts` — Changed baseURL from `${API_URL}/api` to `${API_URL}/api/quality`
2. `apps/web-quality/src/components/sidebar.tsx` — Updated navigation:
   - Quality Section: Dashboard, Risks & Opportunities, Processes, Non-Conformance, Actions
   - Modules Section: Documents, CAPA, Legal, FMEA, Continual Improvement, Supplier Quality, Change Management, Objectives

---

### Session 4 Summary

| Change | Category | Scope |
|--------|----------|-------|
| 16 — Schema rewrite | Database | 18 new models, 50+ enums, 1,489 lines |
| 17 — API infrastructure | Backend | Prisma client, route mounting, CORS, entrypoint, 9 old files deleted |
| 18 — API routes | Backend | 15 route files with full CRUD + Zod validation |
| 19 — Frontend modules | Frontend | 24 files, ~13,157 lines, 12 modules with AI |
| 20 — API client & sidebar | Frontend | baseURL fix + navigation update |

**All 15 API endpoints verified returning 200 through gateway. CRUD operations tested successfully with auto-generated reference numbers.**
