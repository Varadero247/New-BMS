# IMS — Fixes Log

## Phase 21 — Frontend Gap Closure (February 22, 2026)

Gap analysis of web-admin, web-customer-portal, web-partners. 17 new pages + 3 sidebars updated.

**New pages — web-admin (9):**
- `/chat` — AI marketing assistant chat interface
- `/digest` — Marketing digest generator with sentiment badge + history table
- `/expansion` — Expansion revenue pipeline (upsell/cross-sell/add-on) with modal
- `/health-score` — Customer health scoring with tier cards and sub-scores
- `/leads` — Lead pipeline with stage progression and add-lead modal
- `/onboarding` — Customer onboarding tracker with step progress bars
- `/partner-onboarding` — Partner onboarding with approve/reject/activate workflow
- `/renewal` — Renewal pipeline sorted by urgency with color-coded days-until-renewal
- `/winback` — Win-back campaign tracker with recovered MRR stats

**New pages — web-customer-portal (7):**
- `/announcements` — Portal announcements with HIGH/MEDIUM/LOW priority filtering
- `/approvals` — Approval requests with inline approve/reject (PATCH optimistic update)
- `/notifications` — Notifications with read/unread state and mark-all-read
- `/orders` — Order history table with status tracking and search
- `/quality-reports` — Quality report cards (AUDIT/INSPECTION/CERTIFICATE/TEST_REPORT)
- `/scorecards` — Performance scorecards with score progress bars per category
- `/users` — Portal user management with invite-user modal

**New pages — web-partners (1):**
- `/profile` — Partner profile with tier badge (gold/silver/bronze) and ISO specialism editor

**Sidebars updated (3):** web-admin (+9), web-customer-portal (+7), web-partners (+1)

**Commit:** 8ba17aca | Tests: 17,853/674 | TypeScript: 0 errors

---

## Phase 20 — Frontend Gap Closure (February 22, 2026)

Systematic audit of remaining API-to-web-app pairs. 9 new pages across 6 apps. 6 sidebars updated.

**New pages — web-health-safety (2):**
- `/contractor-management` — ISO 45001 Cl. 8.4 contractor OHS management (company, induction, insurance, status)
- `/management-reviews` — ISO 45001 management review register (ref HS-MR-YYYY-NN, performance summaries, decisions)

**New pages — web-aerospace (2):**
- `/nadcap-scope` — Nadcap commodity code scope verification (gap detection: required vs certified)
- `/oasis` — OASIS database supplier lookup (CAGE code, DUNS, certifications, status)

**New pages — web-suppliers (1):**
- `/portal` — Supplier self-service profile portal (banking details, masked account, certifications, capabilities)

**New pages — web-complaints (1):**
- `/public` — Unauthenticated public complaint submission form (reference number on success)

**New pages — web-emergency (2):**
- `/analytics` — Emergency KPI dashboard (wardens, drills, BCP, equipment, incident trend bars)
- `/wardens` — Emergency warden/ICS role register (training expiry colour coding)

**New pages — web-chemicals (1):**
- `/analytics` — Chemicals/COSHH analytics (CMR count, SDS overdue, category + risk distribution bars)

**Sidebars updated (6):** web-health-safety, web-aerospace, web-suppliers, web-complaints, web-emergency, web-chemicals

**Commit:** 3d90d228 | Tests: 17,853/674 | TypeScript: 0 errors

---

## Phase 19 — Frontend Gap Closure (February 22, 2026)

Systematic audit of remaining API services. Built 17 missing frontend pages across 7 apps.

**New pages — web-finance (4):**
- `/controls` — Financial controls register (SOX/audit readiness, status filter, modal)
- `/hmrc-calendar` — UK HMRC tax filing deadlines with urgency colour coding
- `/ir35` — IR35 contractor status assessments (INSIDE/OUTSIDE/PENDING determinations)
- `/sod-matrix` — Segregation of Duties conflict rules with mitigating controls

**New pages — web-quality (5 + 5 client.tsx):**
- `/issues` — ISO 9001 Cl. 4.1 issues of concern (bias/priority/status, linked parties)
- `/opportunities` — ISO 9001 Cl. 6.1 opportunities with priority scoring formula
- `/evidence-pack` — Audit evidence packs with clause mapping, section previews
- `/headstart` — Pre-implementation gap assessment with SVG score rings
- `/template-generator` — ISO 9001 document template generator (DOCX/PDF/XLSX)

**New pages — web-environment (2 + 2 client.tsx):**
- `/audits` — ISO 14001 environmental audit register with findings/NC tracking
- `/management-reviews` — Management review register with inputs/outputs/decisions

**New pages — web-esg (2):**
- `/defra-factors` — UK DEFRA emission conversion factors browser (5 d.p. formatting)
- `/scope-emissions` — GHG Scope 1/2/3 aggregation dashboard with percentage breakdown

**New pages — web-workflows (2):**
- `/admin` — Workflow system administration with maintenance actions + confirmation
- `/webhooks` — Webhook management with event multi-select, toggle, delete

**New pages — web-infosec (1):**
- `/gdpr-extended` — GDPR DPIA register (risk level, legal basis, DPO review)

**New pages — web-hr (1):**
- `/gdpr` — HR GDPR employee data rights requests with 30-day deadline countdown

Sidebar entries added to all 7 apps. TS: 0 errors. Tests: 17,853/674 passing.
Commit: `efaad703`

---

## Phase 18 — Frontend Gap Closure (February 22, 2026)

Systematic audit of all 42 API services against frontend page directories. Identified and built 17 missing pages across 3 apps.

**New pages — web-analytics (14):**
- `/executive` — Executive KPI summary (My Actions, Platform Health, Risk Summary, Compliance Activity)
- `/board-packs` — Board pack management with DRAFT→FINAL→DISTRIBUTED workflow
- `/cashflow` — Cash flow forecasts with current position + weekly projection table
- `/monthly-review` — Monthly snapshot history with regenerate action
- `/meetings` — Meeting notes CRUD (BOARD/MANAGEMENT_REVIEW/DEPARTMENT/OTHER)
- `/expenses` — Expense approval workflow (PENDING→APPROVED/REJECTED/REIMBURSED)
- `/certifications` — Certification deadline tracker with days-to-expiry colour coding
- `/competitors` — Competitor intelligence with per-competitor intel entry feed
- `/contracts` — Contract portfolio with expiry alerts and total annual value
- `/dsars` — GDPR data subject requests (6 request types, status progression buttons)
- `/gdpr` — GDPR data categories + data processing agreements (tabbed)
- `/feature-requests` — Feature voting board sorted by votes, status pipeline
- `/release-notes` — Platform changelog (FEATURE/BUGFIX/IMPROVEMENT/BREAKING/SECURITY)
- `/uptime` — Uptime monitoring dashboard with expandable incident history

**New pages — web-risk (3):**
- `/controls` — Risk controls with per-risk selector dropdown
- `/categories` — Risk category breakdown
- `/treatments` — Risk treatment breakdown

**New pages — web-medical (1):**
- `/dmr-dhr` — FDA 21 CFR 820.181/820.184 DMR & DHR management (tabbed, full CRUD)

**Sidebar updates:** web-analytics (4 new sections: Business, Finance, Compliance, Platform), web-risk (Controls added to Controls & KRIs; new Register Breakdown section), web-medical (DMR/DHR added to Production section).

**Result:** 0 TypeScript errors | 17,853/674 tests passing | Commit: `eb210fde`

---

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
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    'http://localhost:3006',
    'http://localhost:3007',
    'http://localhost:3008',
  ];
  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type,Authorization,X-CSRF-Token,X-Correlation-ID'
  );
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
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
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
  'http://localhost:3006',
  'http://localhost:3007',
  'http://localhost:3008',
];

app.use(
  cors({
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
  })
);
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
2. A tagged template literal bug: `axios.get\`${url}\``instead of`axios.get(url)`
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

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

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

| Fix                  | Severity | Category | Root Cause                                  |
| -------------------- | -------- | -------- | ------------------------------------------- |
| 1 — Modal prop       | CRITICAL | Frontend | Prop name `open` vs `isOpen`                |
| 2 — H&S CORS         | CRITICAL | Backend  | Wildcard CORS with credentials              |
| 3 — Gateway CORS     | CRITICAL | Infra    | Middleware ordering + proxy header override |
| 4 — Security headers | MODERATE | Infra    | `same-origin` resource policy               |
| 5 — api.ts rewrite   | CRITICAL | Frontend | Over-engineered CSRF + template literal bug |
| 6 — CORS_ORIGIN env  | MODERATE | Config   | Empty env var overriding code defaults      |

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

**Problem:** When Docker recreates the postgres container, all data is lost including the `ims_user` role, admin user record, all hs\_\* table schemas, and columns added after initial migration.

**Root Cause:** The postgres container uses a volume but when killed with `fuser`, the volume may be recreated fresh or the container was recreated with `--force-recreate`.

**Solution:** After postgres restarts, re-initialize:

1. Reset postgres password
2. Add missing columns to users/sessions tables (`deletedAt`, `lastLoginAt`, `lastActivityAt`)
3. Re-seed admin user with bcrypt hash

See `scripts/startup.sh` for the automated procedure.

---

### FIX 9 — Health-Safety Tables Missing After Restart

**Problem:** The 15 hs\_\* tables do not exist in a fresh postgres container because `prisma db push` fails inside containers due to OpenSSL 1.1 incompatibility, and no migration files exist for the health-safety schema.

**Root Cause:** Prisma 5.22.0 needs `libssl.so.1.1` but Alpine containers only have OpenSSL 3.

**Solution:** Push schema from HOST machine using `prisma migrate diff`:

```bash
cd ~/New-BMS/packages/database
HEALTH_SAFETY_DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/ims" \
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

| Fix                   | Severity | Category | Root Cause                                     |
| --------------------- | -------- | -------- | ---------------------------------------------- |
| 7 — Port conflicts    | HIGH     | Infra    | Host services occupying container ports        |
| 8 — Data loss         | CRITICAL | Database | Volume loss on container recreation            |
| 9 — Missing HS tables | CRITICAL | Database | No migration files + OpenSSL incompatibility   |
| 10 — OpenSSL          | HIGH     | Infra    | Prisma needs OpenSSL 1.1, Alpine has OpenSSL 3 |
| 11 — Docker API       | LOW      | Config   | Client/daemon version mismatch                 |

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

| Route           | Model                 | Reference Pattern   | Special Features                                 |
| --------------- | --------------------- | ------------------- | ------------------------------------------------ |
| `aspects.ts`    | `prisma.envAspect`    | `ENV-ASP-YYYY-NNN`  | Weighted significance scoring formula            |
| `events.ts`     | `prisma.envEvent`     | `ENV-EVT-YYYY-NNN`  | Auto-sets closureDate on CLOSED                  |
| `legal.ts`      | `prisma.envLegal`     | `ENV-LEG-YYYY-NNN`  | Compliance status defaults                       |
| `objectives.ts` | `prisma.envObjective` | `ENV-OBJ-YYYY-NNN`  | Nested milestone CRUD, PATCH milestones endpoint |
| `actions.ts`    | `prisma.envAction`    | `ENV-ACT-YYYY-NNN`  | Auto-sets completionDate on COMPLETED            |
| `capa.ts`       | `prisma.envCapa`      | `ENV-CAPA-YYYY-NNN` | Nested capaActions, POST/PUT sub-actions         |

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

| Change                | Category | Scope                                           |
| --------------------- | -------- | ----------------------------------------------- |
| 12 — Schema rewrite   | Database | 8 new models, 30+ enums, 11 tables              |
| 13 — API routing fix  | Backend  | Prisma client, route mounting, CORS, entrypoint |
| 14 — API routes       | Backend  | 6 route files with full CRUD + validation       |
| 15 — Frontend modules | Frontend | 12 files, ~7,100 lines, 6 modules with AI       |

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

| Route                | Model               | Reference Pattern   | Special Features                              |
| -------------------- | ------------------- | ------------------- | --------------------------------------------- |
| `parties.ts`         | QualInterestedParty | `QMS-PRT-YYYY-NNN`  | Party type/category filters                   |
| `issues.ts`          | QualIssue           | `QMS-ISS-YYYY-NNN`  | Internal/external issue tracking              |
| `risks.ts`           | QualRisk            | `QMS-RSK-YYYY-NNN`  | Probability × consequence, risk level calc    |
| `opportunities.ts`   | QualOpportunity     | `QMS-OPP-YYYY-NNN`  | Probability × benefit scoring                 |
| `processes.ts`       | QualProcess         | `QMS-PRC-YYYY-NNN`  | Turtle diagram fields, KPIs                   |
| `nonconformances.ts` | QualNonConformance  | `QMS-NC-YYYY-NNN`   | Containment, 5-Why RCA                        |
| `actions.ts`         | QualAction          | `QMS-ACT-YYYY-NNN`  | Verification lifecycle                        |
| `documents.ts`       | QualDocument        | `QMS-DOC-YYYY-NNN`  | Version control, distribution                 |
| `capa.ts`            | QualCapa            | `QMS-CAPA-YYYY-NNN` | Nested QualCapaAction CRUD, 5-Why/Fishbone/8D |
| `legal.ts`           | QualLegal           | `QMS-LEG-YYYY-NNN`  | Compliance assessment                         |
| `fmea.ts`            | QualFmea            | `QMS-FMEA-YYYY-NNN` | Nested FmeaRow CRUD, RPN calc (S×O×D)         |
| `improvements.ts`    | QualImprovement     | `QMS-IMP-YYYY-NNN`  | PDCA tracking                                 |
| `suppliers.ts`       | QualSupplier        | `QMS-SUP-YYYY-NNN`  | IMS scoring (Quality 50% + H&S 30% + Env 20%) |
| `changes.ts`         | QualChange          | `QMS-CHG-YYYY-NNN`  | Impact assessment grid                        |
| `objectives.ts`      | QualObjective       | `QMS-OBJ-YYYY-NNN`  | Nested milestone CRUD                         |

**Files Changed:**

- `apps/api-quality/src/routes/` — 15 route files (8 new, 7 rewritten)

---

### CHANGE 19 — Twelve Frontend Modules

**What:** Created 24 frontend files (page.tsx + client.tsx for each module) with comprehensive forms, AI analysis panels, filters, and card-based list views. Total: ~13,157 lines.

Each module includes: summary metrics cards, filter bar, card-based list with badges, empty state with CTA, full modal form (`<Modal isOpen={...}>`), AI analysis panel, loading/submitting states.

| Module             | Lines | Key Features                                                                   |
| ------------------ | ----- | ------------------------------------------------------------------------------ |
| `/risks`           | 1,867 | Tabbed: Parties, Issues, Risks, Opportunities (4 sub-modules)                  |
| `/processes`       | 565   | Turtle diagram (inputs/outputs/resources/competence/activities/controls), KPIs |
| `/nonconformances` | 627   | NCR with containment, 5-Why RCA, corrective/preventive actions                 |
| `/actions`         | 1,077 | Action register with progress bar, verification, cross-links                   |
| `/documents`       | 1,101 | Document control with lifecycle, version badges, type icons                    |
| `/capa`            | 1,752 | 9-tab form: 5-Why/Fishbone/8D conditional RCA, inline actions table            |
| `/legal`           | 1,161 | Legal register with compliance assessment, IMS cross-links                     |
| `/fmea`            | 1,285 | Editable analysis table, live RPN calc (S×O×D), color-coded badges             |
| `/improvements`    | 1,472 | PDCA tracking, priority score calc, status pipeline visualization              |
| `/suppliers`       | 1,143 | IMS 3-ring scoring (Quality 50% + H&S 30% + Env 20%)                           |
| `/changes`         | 546   | Impact assessment grid (7 impact areas), approval tracking                     |
| `/objectives`      | 565   | KPI tracking with progress bars, milestone management table                    |

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

| Change                    | Category | Scope                                                                |
| ------------------------- | -------- | -------------------------------------------------------------------- |
| 16 — Schema rewrite       | Database | 18 new models, 50+ enums, 1,489 lines                                |
| 17 — API infrastructure   | Backend  | Prisma client, route mounting, CORS, entrypoint, 9 old files deleted |
| 18 — API routes           | Backend  | 15 route files with full CRUD + Zod validation                       |
| 19 — Frontend modules     | Frontend | 24 files, ~13,157 lines, 12 modules with AI                          |
| 20 — API client & sidebar | Frontend | baseURL fix + navigation update                                      |

**All 15 API endpoints verified returning 200 through gateway. CRUD operations tested successfully with auto-generated reference numbers.**

---

## Session 5 — CI/CD Pipeline Fixes (2026-02-11)

Fixed all CI/CD pipeline failures: 9/9 Docker builds pass, 35/35 test suites (939/939 tests) pass, lint and build all green.

---

### CHANGE 21 — Build Tool Migration (api-workflows + service-auth)

**Problem:** `api-workflows` and `service-auth` used `tsc` for builds, which failed in Docker containers:

- `service-auth`: `Cannot read file '/app/tsconfig.base.json'` and `Module 'jsonwebtoken' has no default export`
- `api-workflows`: 14+ TypeScript errors — missing declaration files for `@ims/monitoring` and `@ims/database`

**Root Cause:** All other API services use `tsup` (a zero-config TypeScript bundler) which bundles dependencies without needing `tsconfig.base.json` or declaration files. These two packages were the only ones still using raw `tsc`.

**Solution:** Switched both packages to `tsup`, consistent with all other API services:

```json
// apps/api-workflows/package.json
"build": "tsup src/index.ts --format cjs --no-dts"

// packages/service-auth/package.json (exports types, so uses --dts)
"build": "tsup src/index.ts --format cjs --dts"
```

**Files Changed:**

- `apps/api-workflows/package.json`
- `packages/service-auth/package.json`

---

### CHANGE 22 — Four CI Test Suite Fixes

**Problem:** 4 test suites (11 tests) failed in CI but passed locally due to CI-specific environment variables (`REDIS_URL`, `JWT_SECRET`).

#### Fix 22a — api-quality nonconformances test

**Issue:** `moduleNameMapper` couldn't resolve `@ims/database/quality` subpath export. Test also used wrong model name (`incident` instead of `qualNonConformance`) and wrong Prisma methods.

**Solution:** Complete rewrite — mock `../src/prisma` instead of `@ims/database`, use `qualNonConformance` model, match actual route behavior (findUnique not findFirst, ncType not type, status REPORTED not OPEN, PUT not PATCH for updates).

```typescript
// CORRECT — mock the local prisma module
jest.mock('../src/prisma', () => ({
  prisma: { qualNonConformance: { findMany: jest.fn(), ... } },
}));

// WRONG — moduleNameMapper can't resolve subpath exports
jest.mock('@ims/database', () => ({ prisma: { ... } }));
```

**File:** `apps/api-quality/__tests__/nonconformances.api.test.ts`

#### Fix 22b — service-auth token generation test

**Issue:** CI sets `JWT_SECRET` env var. The `DEFAULT_CONFIG` object captures `process.env.JWT_SECRET` at module load time. Deleting env vars in tests doesn't clear the cached value.

**Solution:** Added `configureServiceAuth({ secret: '' })` after deleting env vars to explicitly clear the cached config.

**File:** `packages/service-auth/__tests__/service-auth.test.ts`

#### Fix 22c — Gateway account-lockout test

**Issue:** CI has `REDIS_URL=redis://localhost:6379`. `AccountLockoutManager` constructor creates a real Redis connection when `REDIS_URL` is set. Data persists across test instances.

**Solution:** Added `delete process.env.REDIS_URL` in `beforeEach` to force in-memory store for tests.

**File:** `apps/api-gateway/__tests__/account-lockout.test.ts`

#### Fix 22d — Gateway CSRF test

**Issue:** Test used path `/api/auth/login` but `ignorePaths` has `/auth/login`. The gateway strips the `/api` prefix before CSRF middleware runs, so `startsWith` never matches.

**Solution:** Changed test path from `/api/auth/login` to `/auth/login`.

**File:** `apps/api-gateway/__tests__/csrf.test.ts`

---

### CHANGE 23 — pnpm Lockfile Update

**Problem:** After adding `tsup` to `api-workflows` and `service-auth` package.json files, CI failed at "Install dependencies" because `pnpm install --frozen-lockfile` detected the lockfile was outdated.

**Solution:** Ran `pnpm install` locally to update `pnpm-lock.yaml` with the new tsup entries.

**File:** `pnpm-lock.yaml`

---

### Session 5 Summary

| Change                  | Category | Scope                                           |
| ----------------------- | -------- | ----------------------------------------------- |
| 21 — tsup migration     | Build    | 2 packages switched from tsc to tsup            |
| 22a — Quality test      | Test     | Rewrite mock to use correct model + import path |
| 22b — Service-auth test | Test     | Clear cached config after deleting env vars     |
| 22c — Lockout test      | Test     | Force in-memory store by removing REDIS_URL     |
| 22d — CSRF test         | Test     | Fix path to match gateway prefix stripping      |
| 23 — Lockfile           | Build    | Update pnpm-lock.yaml for new dependencies      |

**CI/CD Results (commit ce6e906):**

- CI: Lint PASS, Build PASS, Test PASS (35 suites, 939 tests)
- CD: 9/9 Docker builds PASS, Deploy to Staging skipped (no K8s)

**Lesson Learned:** CI environments set additional env vars (`REDIS_URL`, `JWT_SECRET`) that aren't present locally. Tests that manipulate environment variables must account for module-level caching (values captured at import time) and Redis connections (created in constructors). Always run full test suite in CI-like conditions before assuming tests pass.

---

## Session 6 — Phase 2-5: Finance, CRM, InfoSec, ESG, CMMS (2026-02-12)

Built 5 new API services and 5 web applications covering financial management, customer relationships, information security, ESG reporting, and maintenance management.

### CHANGE 24 — Finance Module (Phase 2)

- **API**: `api-finance` on port 4013, 7 route files, ~321 tests
- **Web**: `web-finance` on port 3013
- **Schema**: `finance.prisma` — 23 models (accounts, transactions, budgets, invoices, journal entries)
- **Package**: `@ims/finance-calculations` — financial calculation engine

### CHANGE 25 — CRM Module (Phase 3)

- **API**: `api-crm` on port 4014, 8 route files
- **Web**: `web-crm` on port 3014
- **Schema**: `crm.prisma` — 17 models (contacts, companies, opportunities, campaigns)

### CHANGE 26 — InfoSec Module (Phase 3)

- **API**: `api-infosec` on port 4015, 7 route files
- **Web**: `web-infosec` on port 3015
- **Schema**: `infosec.prisma` — 14 models (ISO 27001 controls, risks, incidents)

### CHANGE 27 — ESG Module (Phase 4)

- **API**: `api-esg` on port 4016, 14 route files, ~207 tests
- **Web**: `web-esg` on port 3016
- **Schema**: `esg.prisma` — 15 models (environmental, social, governance metrics)
- **Package**: `@ims/emission-factors` — GHG emission factor database

### CHANGE 28 — CMMS Module (Phase 5)

- **API**: `api-cmms` on port 4017, 12 route files, ~226 tests
- **Web**: `web-cmms` on port 3017
- **Schema**: `cmms.prisma` — 16 models (work orders, assets, preventive maintenance)
- **Package**: `@ims/oee-engine` — Overall Equipment Effectiveness engine

---

## Session 7 — Phase 6-7: Portals, Food Safety, Energy (2026-02-12)

Built portal system for external stakeholders and two industry-specific compliance modules.

### CHANGE 29 — Portal Module (Phase 6)

- **API**: `api-portal` on port 4018, 16 route files, ~168 tests
- **Web**: `web-customer-portal` on port 3018, `web-supplier-portal` on port 3019
- **Schema**: `portal.prisma` — 12 models (portal users, documents, messages)
- **Package**: `@ims/portal-auth` — portal authentication

### CHANGE 30 — Food Safety Module (Phase 7a)

- **API**: `api-food-safety` on port 4019, 14 route files, ~241 tests
- **Web**: `web-food-safety` on port 3020
- **Schema**: `food-safety.prisma` — 14 models (HACCP plans, hazard analyses, CCPs)

### CHANGE 31 — Energy Module (Phase 7b)

- **API**: `api-energy` on port 4020, 12 route files, ~196 tests
- **Web**: `web-energy` on port 3021
- **Schema**: `energy.prisma` — 12 models (ISO 50001 baselines, meters, consumption)

---

## Session 8 — Phase 8-10: Analytics, Payroll Localisation, Field Service (2026-02-12)

Built analytics platform, extended payroll with multi-jurisdiction support, and added field service management.

### CHANGE 32 — Analytics Module (Phase 8)

- **API**: `api-analytics` on port 4021, 9 route files, ~142 tests
- **Web**: `web-analytics` on port 3022
- **Schema**: `analytics.prisma` — 10 models (dashboards, reports, datasets)
- **Package**: `@ims/nlq` — natural language query engine

### CHANGE 33 — Payroll Localisation (Phase 9)

- 2 new route files: `jurisdictions.ts`, `tax-calculator.ts`
- ~140 additional tests
- **Package**: `@ims/tax-engine` — multi-jurisdiction tax calculation

### CHANGE 34 — Field Service Module (Phase 10)

- **API**: `api-field-service` on port 4022, 13 route files, ~189 tests
- **Web**: `web-field-service` on port 3023
- **Schema**: `field-service.prisma` — 14 models (work orders, dispatch, technicians)

---

## Session 9 — Phase 0: Platform Hardening (2026-02-13)

Retrofitted cross-cutting platform capabilities across all 24 API services.

### CHANGE 35 — RBAC Retrofit

- `attachPermissions()` middleware added to all 24 API services
- **Package**: `@ims/rbac` — 39 roles, 17 modules, 7 permission levels
- **Tests**: `rbac.test.ts` (65 tests)

### CHANGE 36 — Role Management UI

- `web-settings/src/app/roles/page.tsx` — Role assignment interface
- `web-settings/src/app/users/page.tsx` — User RBAC management
- `web-settings/src/app/access-log/page.tsx` — Access audit log
- `web-settings/src/app/my-profile/page.tsx` — User profile

### CHANGE 37 — Role Management API

- 8 endpoints in `api-gateway/src/routes/roles.ts`
- **Tests**: `roles.test.ts` (51 tests)

### CHANGE 38 — WebSocket Notifications

- **Package**: `@ims/notifications` — WebSocket server + notification bell React component
- 5 gateway endpoints for notification management
- **Tests**: `notifications.test.ts` (31 tests)

### CHANGE 39 — Visual Workflow Builder

- `web-workflows/src/app/builder/` — 1,171-line client with 4 node types and 6 ISO templates

### CHANGE 40 — PWA Offline

- **Package**: `@ims/pwa` — service worker, sync queue, offline cache, React hook
- **Tests**: 33 tests

### CHANGE 41 — Performance Baseline

- **Package**: `@ims/performance` — k6 load tests, Lighthouse CI, axe-core WCAG 2.2 AA, 56-item checklist
- **Tests**: 10 tests

---

## Session 10 — Phase 11: Unique Differentiators (2026-02-13)

Built competitive differentiators: evidence packs, headstart tool, MSP mode, regulatory feed, and two new ISO standards.

### CHANGE 42 — Evidence Pack Generator

- 4 endpoints at `api-quality /api/evidence-pack`
- **Tests**: `evidence-pack.test.ts`

### CHANGE 43 — Headstart Tool

- 4 endpoints at `api-quality /api/headstart` with 8 ISO standard templates
- **Tests**: `headstart.test.ts`

### CHANGE 44 — MSP Mode

- 6 endpoints at `api-gateway /api/organisations/msp-*`
- **Tests**: `msp.test.ts`

### CHANGE 45 — Regulatory Feed

- 5 endpoints at `api-gateway /api/compliance/regulations` with 10 seeded regulations
- **Package**: `@ims/regulatory-feed`
- **Tests**: `compliance.test.ts`

### CHANGE 46 — ISO 42001 (AI Management System)

- **API**: `api-iso42001` on port 4023, 7 test files
- **Web**: `web-iso42001` on port 3024
- **Schema**: `iso42001.prisma` — 7 models

### CHANGE 47 — ISO 37001 (Anti-Bribery)

- **API**: `api-iso37001` on port 4024, 6 test files
- **Web**: `web-iso37001` on port 3025
- **Schema**: `iso37001.prisma` — 6 models

### CHANGE 48 — Template Library

- 67 built-in templates across 11 modules
- 3 Prisma models (Template, TemplateVersion, TemplateInstance)
- 12 API endpoints at `/api/v1/templates`
- 12 frontend integrations
- **Package**: `@ims/templates`

### CHANGE 49 — Docker Compose Update

- Updated `docker-compose.yml` with all 25 API services + 26 web apps
- Updated all startup/stop/check scripts for 52 services

---

### Sessions 6-10 Summary

| Session | Changes | Category    | New Services                                        |
| ------- | ------- | ----------- | --------------------------------------------------- |
| 6       | 24-28   | Phases 2-5  | Finance, CRM, InfoSec, ESG, CMMS                    |
| 7       | 29-31   | Phases 6-7  | Portal (+ 2 web apps), Food Safety, Energy          |
| 8       | 32-34   | Phases 8-10 | Analytics, Payroll extensions, Field Service        |
| 9       | 35-41   | Phase 0     | Platform hardening (RBAC, notifications, PWA, etc.) |
| 10      | 42-49   | Phase 11    | ISO 42001, ISO 37001, differentiators, templates    |

**Total across all sessions: 49 changes, 25 API services, 26 web apps, 39 packages, 25 Prisma schemas, ~5,450+ tests.**

---

## Session 13 — System Status Module Fixes

**Date:** February 15, 2026

Four bugs fixed in the System Status page (`apps/web-dashboard/src/app/system-status/page.tsx`).

---

### FIX 50 — Missing API services in System Status (Medium)

**Problem:** The SERVICES array only listed 24 of 28 API services. AI Analysis (4004), Project Management (4009), Marketing (4025), and Partners (4026) were missing from the status dashboard.

**Solution:** Added 4 missing entries to the SERVICES array:

- AI Analysis API (port 4004, category: Core)
- Project Management API (port 4009, category: Operations)
- Marketing API (port 4025, category: Portals)
- Partners API (port 4026, category: Portals)

**Files Changed:** `apps/web-dashboard/src/app/system-status/page.tsx`

---

### FIX 51 — Health checks using `mode: 'no-cors'` (High)

**Problem:** `checkService()` used `fetch(url, { mode: 'no-cors' })` for cross-port health checks. Opaque responses from `no-cors` mode always report `status: 0` and `ok: false` is inaccessible — meaning a 500 Internal Server Error was indistinguishable from a 200 OK. Every reachable service appeared "Healthy" regardless of actual HTTP status.

**Solution:** Created a server-side Next.js API route at `/api/health-check` that proxies health check requests. The server-side fetch has no CORS restrictions and returns `{ ok, status, latency }`. The client `checkService()` now calls this proxy and can properly distinguish:

- 200 → Healthy
- 500/503 → Degraded
- Unreachable → Down

**Files Changed:**

- `apps/web-dashboard/src/app/api/health-check/route.ts` (NEW)
- `apps/web-dashboard/src/app/system-status/page.tsx`

---

### FIX 52 — Dynamic Tailwind classes purged at build time (Medium)

**Problem:** Summary stat cards used dynamic class interpolation (`bg-${stat.color}-100`, `text-${stat.color}-600`). Tailwind's JIT compiler scans source for complete class strings at build time — dynamic interpolations are never found, so the classes are purged from the production CSS. All stat card icon backgrounds rendered with no color.

**Solution:** Replaced dynamic interpolation with a static `statColorMap` lookup object containing literal class strings:

```ts
const statColorMap: Record<string, { bg: string; icon: string }> = {
  green: { bg: 'bg-green-100', icon: 'text-green-600' },
  yellow: { bg: 'bg-yellow-100', icon: 'text-yellow-600' },
  red: { bg: 'bg-red-100', icon: 'text-red-600' },
  blue: { bg: 'bg-blue-100', icon: 'text-blue-600' },
};
```

**Files Changed:** `apps/web-dashboard/src/app/system-status/page.tsx`

---

### FIX 53 — Dead `client.tsx` file (Low)

**Problem:** `apps/web-dashboard/src/app/system-status/client.tsx` (220 lines) was never imported by any file. It duplicated `page.tsx` functionality with its own bugs (sequential health checks instead of parallel, hardcoded `localhost` instead of env vars, fake uptime percentages).

**Solution:** Deleted the file.

**Files Deleted:** `apps/web-dashboard/src/app/system-status/client.tsx`

---

### Verification

- `next build` — passed with all routes compiled (`/system-status` static, `/api/health-check` dynamic)
- TypeScript type-check — no errors in changed files
- 28 services visible in SERVICES array
- Static Tailwind classes present in source for JIT scanning

---

### Session 13 Summary

| Fix | Issue                                         | Severity | Category     |
| --- | --------------------------------------------- | -------- | ------------ |
| 50  | 4 missing API services in status dashboard    | Medium   | Completeness |
| 51  | `no-cors` opaque responses hide HTTP errors   | High     | Correctness  |
| 52  | Dynamic Tailwind classes purged in production | Medium   | Styling      |
| 53  | Dead `client.tsx` (220 lines)                 | Low      | Cleanup      |

**Total across all sessions: 53 fixes, 27 API services, 30 web apps, 42 packages, 26 Prisma schemas, ~8,037 tests.**

---

## Session 14 — Full System Review v3 (2026-02-17)

Automated full-system review across all 42 API services. Identified and fixed error handling gaps, unbounded queries, and missing input validation.

---

### FIX 54 — Missing try/catch in api-quality headstart GET /standards

**Problem:** The `GET /standards` handler in `apps/api-quality/src/routes/headstart.ts` had no try/catch block, meaning any unexpected error would crash the process instead of returning a 500 response.

**Solution:** Wrapped the handler body in a try/catch that returns `{ success: false, error }` on failure.

**Files Changed:**

- `apps/api-quality/src/routes/headstart.ts`

---

### FIX 55 — Unbounded findMany in api-aerospace audits GET /schedule/upcoming

**Problem:** The `GET /schedule/upcoming` endpoint in `apps/api-aerospace/src/routes/audits.ts` called `prisma.findMany()` with no `take` limit, potentially returning an unbounded result set.

**Solution:** Added pagination (`take` limit) to the query.

**Files Changed:**

- `apps/api-aerospace/src/routes/audits.ts`

---

### FIX 56 — Added Zod validation to 7 unvalidated mutating routes

**Problem:** Seven POST/PUT routes across four services accepted request bodies without Zod schema validation, relying only on Prisma-level type checks. This allowed malformed data to reach the database layer.

**Routes fixed:**

- `apps/api-marketing/src/routes/digest.ts` — POST /trigger
- `apps/api-marketing/src/routes/expansion.ts` — POST /check
- `apps/api-marketing/src/routes/health-score.ts` — POST /recalculate
- `apps/api-marketing/src/routes/winback.ts` — POST /start/:orgId
- `apps/api-mgmt-review/src/routes/agenda.ts` — POST /:id/generate
- `apps/api-partners/src/routes/payouts.ts` — POST /request
- `apps/api-portal/src/routes/portal-notifications.ts` — PUT /read-all, PUT /:id/read

**Solution:** Added Zod request body validation schemas to each route, returning 400 on invalid input before reaching the database.

**Files Changed:**

- `apps/api-marketing/src/routes/digest.ts`
- `apps/api-marketing/src/routes/expansion.ts`
- `apps/api-marketing/src/routes/health-score.ts`
- `apps/api-marketing/src/routes/winback.ts`
- `apps/api-mgmt-review/src/routes/agenda.ts`
- `apps/api-partners/src/routes/payouts.ts`
- `apps/api-portal/src/routes/portal-notifications.ts`

---

### CHANGE 57 — Full System Review v3 Report

**What:** Generated a comprehensive Word document report (`docs/Full_System_Review_v3_Report.docx`) covering automated analysis of all 42 API services, summarizing findings and fixes.

---

### Session 14 Summary

| Fix | Issue                                         | Severity | Category         |
| --- | --------------------------------------------- | -------- | ---------------- |
| 54  | Missing try/catch in headstart GET /standards | Medium   | Error Handling   |
| 55  | Unbounded findMany in aerospace audits        | Medium   | Performance      |
| 56  | Missing Zod validation on 7 mutating routes   | Medium   | Input Validation |
| 57  | Full System Review v3 report generated        | —        | Documentation    |

**All 12,326 tests passing across 578 suites.**

**Total across all sessions: 57 fixes/changes, 42 API services, 44 web apps, 60 packages, 44 Prisma schemas, ~12,326 tests.**

---

## Session 15 — Multi-Tenant Security Hardening + TODO Resolution (2026-02-18)

Systematic security hardening pass across the entire API surface, plus resolution of two long-standing high-priority TODOs.

---

### FIX 58 — Multi-tenant orgId scoping across all API routes

**Problem:** 60+ `findFirst`/`findMany` queries across 20+ API services did not filter by `orgId`, meaning a user in one organisation could potentially access records from another organisation if they guessed an ID.

**Services hardened:** assets, audits, chemicals, complaints, contracts, documents, emergency, environment, ESG, finance, food-safety, incidents, mgmt-review, partners, ptw, reg-monitor, risk, suppliers, training.

**Solution:** Added `orgId` to all `where` clauses on record-level queries. The `orgId` is derived from the authenticated user's JWT payload.

**Files Changed:** ~60 route files across 20 services

---

### FIX 59 — Sanitised error messages in catch blocks

**Problem:** Raw `(error as Error).message` was returned in HTTP error responses, leaking internal implementation details (database field names, query structures, file paths) to API consumers.

**Solution:** Replaced all raw error messages in catch blocks with generic `"Internal server error"`, while still logging the real error server-side via `logger.error()`.

**Files Changed:** ~60 route files across 20 services

---

### FIX 60 — Multi-field search queries

**Problem:** Several search endpoints filtered on a single field (e.g. only `name`), making it impossible to find records by reference number, tag, or other identifiers.

**Solution:** Updated search `where` clauses to use multi-field `OR` queries (e.g. `name`, `referenceNumber`, `assetTag`, `serialNumber`).

**Files Changed:** assets, documents, suppliers, training, and several other routes

---

### FIX 61 — Sidebar external links use env var

**Problem:** 30+ web app sidebars had hardcoded `http://localhost:PORT` URLs for cross-app navigation links, breaking deployments to non-localhost environments.

**Solution:** All sidebars now read `process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost'` and interpolate the port from that base.

**Files Changed:** 30+ `apps/web-*/src/components/sidebar.tsx`

---

### FIX 62 — Prisma schema improvements (orgId, deletedAt, cascade)

**Problem:** Several newer schemas (risk, emergency, chemicals, assets, etc.) were missing `orgId` and `deletedAt` fields on child models, and some relations lacked `onDelete: Cascade`, leaving orphan rows on parent deletion.

**Solution:**

- Added `orgId String?` + `@@index([orgId])` to RiskControl, RiskKri, RiskAction, RiskBowtie + child models in chemicals, emergency, assets, audits, contracts, documents, ptw, suppliers, training schemas
- Added `deletedAt DateTime?` + `@@index([deletedAt])` to models missing soft-delete support
- Added `onDelete: Cascade` to RiskReview, RiskControl, RiskKri → RiskRegister relations

**Files Changed:** 11 `packages/database/prisma/schemas/*.prisma`

---

### FIX 63 — Payroll → HR cross-service integration (resolves TODO)

**Problem:** `POST /api/payroll/runs/:id/calculate` returned 501 NOT_IMPLEMENTED because it had no way to get employee data. Employee data lives in the HR service, not the payroll schema.

**Solution:**

- Added `fetchActiveEmployees()` helper that calls `GET http://localhost:4006/api/employees?status=ACTIVE` with a service-to-service JWT from `createServiceHeaders('api-payroll')`
- For each active employee, a `Payslip` record is created/upserted for the run with:
  - `basicSalary` from `employee.salary`
  - Flat 20% income tax + 12% NI contributions as placeholder statutory deductions
  - `netPay = basicSalary - totalDeductions`
  - Working days calculated from the period date range
- Run status transitions: `DRAFT → CALCULATING → CALCULATED`
- Returns `422 NO_EMPLOYEES` if HR service returns zero active employees

**Files Changed:**

- `apps/api-payroll/src/routes/payroll.ts`
- `apps/api-payroll/__tests__/payroll.api.test.ts` (replaced NOT_IMPLEMENTED test with 2 new tests)

---

### FIX 64 — SAML cryptographic signature verification (resolves TODO)

**Problem:** `parseSamlResponse()` only checked for the _presence_ of a `<SignatureValue>` element in the XML, which is trivially bypassable — an attacker could include a fake `<SignatureValue>` tag with any content and bypass authentication.

**Solution:**

- Extracts `<ds:SignatureValue>` bytes and `<ds:SignedInfo>` XML from the SAML response
- Normalises the IdP certificate to PEM format
- Detects the signature algorithm from the `Algorithm` attribute (rsa-sha256 / rsa-sha512 / rsa-sha1)
- Calls `crypto.createVerify(algo).verify(cert, sigBytes)` for real RSA signature verification
- Returns `{ valid: false, error: 'SAML signature verification failed' }` on crypto failure
- Note: Full XML-DSig canonical form (C14N) requires `xml-crypto` for strict compliance; this implementation covers the common case where `SignedInfo` is already serialised in canonical form by the IdP.

**Files Changed:**

- `apps/api-gateway/src/routes/saml.ts`

---

### Session 15 Summary

| Fix | Issue                                      | Severity | Category                                  |
| --- | ------------------------------------------ | -------- | ----------------------------------------- |
| 58  | orgId missing from 60+ route queries       | High     | Security (multi-tenant isolation)         |
| 59  | Raw error messages leaked to API responses | Medium   | Security (information disclosure)         |
| 60  | Single-field search limiting usability     | Low      | UX                                        |
| 61  | Hardcoded localhost URLs in all sidebars   | Medium   | Portability                               |
| 62  | Missing orgId/deletedAt/cascade in schemas | Medium   | Data integrity                            |
| 63  | Payroll calculation returned 501           | High     | Functionality (cross-service integration) |
| 64  | SAML signature presence-only check         | Critical | Security (authentication bypass)          |

**All tests passing. Total: 12,371 tests across 579 suites (2 new payroll tests added).**

**Total across all sessions: 64 fixes/changes, 42 API services, 44 web apps, 60 packages, 44 Prisma schemas, ~12,371 tests.**

---

## Session 7 — February 19, 2026

### k6 Large-Dataset Load Test Fix (P0)
- **Problem**: 47% error rate in `large-dataset.js` k6 test. Root cause: gateway routing H&S requests to root-owned dist process (PID 3273) on port 4001 with stale JWT_SECRET → TOKEN_INVALID on every auth check.
- **Fix**: Gateway already had `SERVICE_HEALTH_SAFETY_URL=http://localhost:5001` — pointed to fresh tsx H&S process. H&S on 5001 had DB column errors (`hs_risks.orgId does not exist`). Applied safe ADD COLUMN migration for all 17 `hs_*` tables (extracted only ADD COLUMN statements to avoid dropping other schemas' tables).
- **Result**: k6 now passes — `errors: 0.71%` ✓ and `http_req_failed: 0.94%` ✓ (both < 5% threshold)

### Sentry DSN Configuration (All 42 API Services)
- Added `SENTRY_DSN=` and `SENTRY_TRACES_SAMPLE_RATE=0.1` to all 42 API service `.env.example` files.
- Added `initSentry()` call in all 42 API `src/index.ts` files.
- Sentry SDK already wired in `@ims/sentry` package — services will auto-report errors when DSN is set.

### PostgreSQL Connection Pool Fix
- **Problem**: Running all 42 API services exhausted PostgreSQL max_connections=100 on the active postgres instance.
- **Fix**: Added `?connection_limit=1` to all DATABASE_URL, CORE_DATABASE_URL, and domain-specific DATABASE_URL vars in all 42 API service `.env` files and `packages/database/.env`.
- **Result**: Prisma uses lazy connections (only opens on first query). All 42 services run with only ~42 DB connections total.
- **Note**: Active postgres (localhost:5432 via docker-proxy from Feb18) has max_connections=100. The `ims-postgres` container (172.18.0.3) has max_connections=500 set via ALTER SYSTEM.

### Pre-Launch Check Script Fixes
- Fixed Redis check: script now uses `DOCKER_API_VERSION=1.41 docker exec ims-redis redis-cli ... ping` as fallback when `redis-cli` is not installed on host.
- Fixed pnpm audit check: gracefully handles npm registry 500 errors (treats as warning, not failure).
- **Result**: Pre-launch check now scores **70/111 PASSED, 41 warnings, 0 failures**.

### H&S Table Migration (DB Schema Fix)
- 17 `hs_*` tables were missing `orgId` column (new schema field added but not migrated to active DB).
- Applied safe migration via `prisma migrate diff --from-empty` filtered to only ADD COLUMN statements.
- Also added missing columns to `hs_communications` (attendees, content, deletedBy, location, type, etc.).

### Tests Added
- Cookie consent tests: `apps/api-gateway/__tests__/cookie-consent.test.ts` (~21 tests)
- New total: **12,702 tests across 589 suites — ALL PASSING**

---

## Sessions 15-25: Code Evaluation + Test Expansion (Feb 20-21, 2026)

### Code Evaluation Sprint — 100/100 Score

Three sprint phases brought the composite Code Evaluation score from 65 → 100/100:

**Phase 1 (87→91/100):** JWT key rotation, magic link auth, adaptive risk scoring, RASP middleware, behavioral analytics, adaptive timeout, response compression.

**Phase 2 (91→97/100):** SIEM event correlation engine (6 rules), envelope encryption (DEK/KEK + key rotation), per-user tier-based rate limiting (RFC 6585 headers), property-based tests (fast-check), 4 k6 load test scenarios.

**Phase 3 (97→100/100):** Credential/secret leak scanner (8 pattern types), graceful shutdown utility (in-flight draining + signal handlers), request hedging (`withHedging`/`withHedgingDetailed`/`RequestHedger`).

### Test Coverage Expansion

**Package test suites added:** `@ims/templates` (77), `@ims/i18n` (29), `@ims/audit` EnhancedAuditService (31), `@ims/notifications` bell+WS (49), `@ims/email` 8 templates (63), `@ims/shared` cursor-pagination+validation (55), `@ims/sdk` (35), `@ims/openapi` (38), `@ims/hubspot-client` (17), `@ims/intercom-client` (13), `@ims/stripe-client` (12), `@ims/presence` (22), `@ims/types` (20), `@ims/ui` utilities (25), `@ims/comments` (13), `@ims/cache` (20), `@ims/dpa` (15), `@ims/dsar` (15), `@ims/scheduled-reports` (14), `@ims/testing` (75), `@ims/charts` (33). All 61 packages now have test suites.

**E2E specs added:** 48 Playwright spec files covering all 44 modules. Includes data-integrity, performance-SLA, security-headers, concurrent-operations, GDPR, SCIM, webhooks, AI analysis, multi-org isolation.

**Integration suites added:** Cross-service integration (66 tests — auth enforcement, CORS, API versioning, correlation ID), event-bus advanced (43 tests — 15 NEXARA_EVENTS trigger chains, FIFO ordering, Redis xadd).

**Gateway security suites:** security-headers-http (30 tests — XSS/CSP/injection payloads), rate-limit-advanced (18 tests — distributed rate limiting, Redis store).

**Resilience suites expanded:** circuit-breaker (15→36), request-hedging (17→29), logger (15→24), metrics (18→30), tracing (15→23).

**TypeScript:** 0 errors across all 42 APIs + 44 web apps + 61 packages (148 projects). Fixed TS6059 rootDir in 8 packages, TS2688 uuid stubs.

**In-memory → Prisma migrations:** msp, api-keys, unified-audit, saml, scim, evidence-pack, headstart, payroll-jurisdictions — all persistent Maps now backed by DB.

**Thin-file sweep (Feb 21):** Every `.test.ts` file brought to ≥20 tests. Fixed 8 test API mismatches discovered during expansion (PermissionLevel enum values, ownershipFilter arity, checkLimit arity, listEntries sync API, HubSpotClient methods, graceful-shutdown `resolves.toBeUndefined`, OfflineCache URL validation, roiPercent integer rounding).

### Final Test Count
**17,361 tests across 652 suites — ALL PASSING (0 failures, 0 TypeScript errors)**

---

## Session 26 — February 22, 2026 — Compliance Gap Closure Sprint (Phase 17)

### Scope
Closed 20 compliance standard gaps across 5 domains: ISO 45001, COSHH, GRI/TCFD, ISO 27001:2022, AS9100D. Created 11 new API route files + test suites (245 tests), and 15 new frontend pages.

### Test Fixes

**worker-consultation.test.ts — POST /barriers returning 400**
- Root cause: `consultationId: 'cons-1'` failed `z.string().uuid()` in `barrierSchema`
- Fix: Changed test body to use `'00000000-0000-0000-0000-000000000001'`

**contractor-management.test.ts — 2 inspection POST tests returning 400**
- Root cause: Route merges `req.params.id` into `inspectionSchema` as `contractorId` (uuid-typed); non-UUID `:id` like `'cont-1'` fails before DB is reached
- Fix: Changed both test paths from `/cont-1/inspections` to `/00000000-0000-0000-0000-000000000001/inspections`

### TypeScript Fix

**web-aerospace/nadcap/page.tsx — 3 TS errors in toggleCommodity**
- Root cause: `setList(prev => prev.includes(c) ? ...)` used React updater-function pattern, but `setList` was typed as `(v: string[]) => void`
- Fix: Used the already-available `list` param directly: `setList(list.includes(c) ? list.filter(x => x !== c) : [...list, c])`

### New Backend Routes (api-health-safety)

| Route file | Standard | Clause | Tests |
|---|---|---|---|
| `management-of-change.ts` | ISO 45001 | 8.1.3 | 20 |
| `contractor-management.ts` | ISO 45001 | 8.1.4 | 22 |
| `worker-consultation.ts` | ISO 45001 | 5.4 | 23 |

### New Backend Routes (api-medical — HIPAA)

| Route file | Standard | Module | Tests |
|---|---|---|---|
| `hipaa-privacy.ts` | HIPAA | Privacy Officer | 21 |
| `hipaa-security.ts` | HIPAA | Security Risk Assessment | 22 |
| `hipaa-breach.ts` | HIPAA | Breach Notification | 20 |

### New Backend Routes (api-chemicals — COSHH)

| Route file | Standard | Regulation | Tests |
|---|---|---|---|
| `health-surveillance.ts` | COSHH | Reg 11 | 21 |
| `biological-monitoring.ts` | COSHH | Reg 14 | 22 |
| `fumigation.ts` | COSHH | Reg 18 | 21 |

### New Backend Routes (api-esg — GRI/TCFD)

| Route file | Standard | Clause | Tests |
|---|---|---|---|
| `whistleblowing.ts` | GRI | 2-26 | 20 |
| `stakeholder-plans.ts` | GRI | 2-29 | 20 |
| `supplier-social-screening.ts` | GRI | 414-1 | 21 |
| `scenario-analysis.ts` | TCFD | Risk Scenarios | 20 |

### New Backend Routes (api-infosec — ISO 27001:2022)

| Route file | Standard | Control | Tests |
|---|---|---|---|
| `threat-intel.ts` | ISO 27001:2022 | A.5.7 | 20 |
| `cloud-security.ts` | ISO 27001:2022 | A.5.23 | 22 |
| `dlp.ts` | ISO 27001:2022 | A.8.12 | 20 |

### New Backend Routes (api-aerospace — AS9100D)

| Route file | Standard | Clause | Tests |
|---|---|---|---|
| `nadcap-scope.ts` | AS9100D | 8.5.1.2 | 22 |
| `process-parameters.ts` | AS9100D | 8.5.1.2 | 21 |

### New Frontend Pages (15 total)

| Page | App | Standard |
|---|---|---|
| `management-of-change/page.tsx` | web-health-safety | ISO 45001 §8.1.3 |
| `contractors/page.tsx` | web-health-safety | ISO 45001 §8.1.4 |
| `worker-consultation/page.tsx` | web-health-safety | ISO 45001 §5.4 |
| `whistleblowing/page.tsx` | web-esg | GRI 2-26 |
| `stakeholder-plans/page.tsx` | web-esg | GRI 2-29 |
| `supplier-screening/page.tsx` | web-esg | GRI 414-1 |
| `scenario-analysis/page.tsx` | web-esg | TCFD |
| `health-surveillance/page.tsx` | web-chemicals | COSHH Reg 11 |
| `biological-monitoring/page.tsx` | web-chemicals | COSHH Reg 14 |
| `fumigation/page.tsx` | web-chemicals | COSHH Reg 18 |
| `threat-intel/page.tsx` | web-infosec | ISO 27001 A.5.7 |
| `cloud-security/page.tsx` | web-infosec | ISO 27001 A.5.23 |
| `dlp/page.tsx` | web-infosec | ISO 27001 A.8.12 |
| `nadcap/page.tsx` | web-aerospace | AS9100D 8.5.1.2 |
| `process-parameters/page.tsx` | web-aerospace | AS9100D 8.5.1.2 |

### Sidebar Navigation Updates (Feb 22, 2026)

All 15 new compliance-gap pages (and 4 HIPAA pages in web-medical) added to their respective sidebar navigation components:

| App | New Nav Items Added |
|---|---|
| web-health-safety | Worker Consultation (Cl. 5), Management of Change (Cl. 8), Contractors (Cl. 8) |
| web-esg | Whistleblowing (Social & Governance), Supplier Screening (Social & Governance), Stakeholder Plans (Reporting), Scenario Analysis (Reporting) |
| web-chemicals | Health Surveillance, Biological Monitoring, Fumigation (new "Health Monitoring Regs 11-18" section) |
| web-infosec | Threat Intelligence, Cloud Security, DLP (new "Advanced Controls (2022)" section) |
| web-aerospace | Nadcap Scope, Process Parameters (Modules section) |
| web-medical | Privacy Officer, Security Risk Assessment, Breach Notification, Business Associates (new "HIPAA Compliance" section) |

New icons imported per app: `Users`, `HardHat`, `RefreshCw` (H&S); `Bell`, `Truck`, `TrendingUp` (ESG); `Stethoscope`, `Microscope`, `Wind` (Chemicals); `Globe`, `Cloud`, `Lock` (InfoSec); `Medal`, `Gauge` (Aerospace); `Lock`, `ShieldAlert`, `Bell`, `FileLock` (Medical).

**All 6 apps: 0 TypeScript errors after sidebar updates.**

### Final Test Count
**17,853 tests across 674 suites — ALL PASSING (0 failures, 0 TypeScript errors)**
