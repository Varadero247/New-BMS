# IMS — Claude Code Instructions

## Project Overview

Integrated Management System (IMS) monorepo with 45 API services, 48 web apps, and 398 shared packages. Built with Next.js 15, Express.js, PostgreSQL/Prisma, Docker Compose. 45 Prisma schemas with ~610 database tables. ~1,290,475 unit tests across ~1,200+ suites / 492 Jest projects (all passing).

## Known Issues & Fixes

These are critical bugs that were found during testing. Future Claude Code sessions MUST NOT reintroduce them.

### 1. Modal Component: Use `isOpen`, NOT `open`

The `@ims/ui` Modal component (`packages/ui/src/modal.tsx`) uses `isOpen` as its boolean prop.

```tsx
// CORRECT
<Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Title" size="lg">

// WRONG — modal will never render
<Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Title" size="lg">
```

### 2. CORS: Gateway Handles It, Downstream Services Reflect

- **Gateway** (`apps/api-gateway/src/index.ts`): Raw CORS middleware must be the FIRST middleware (before Helmet). It sets `Access-Control-Allow-Origin` to the requesting origin from the allowed list.
- **Downstream APIs**: Use `cors({ origin: true, credentials: true })` to reflect the request origin.
- **Gateway proxy** must strip downstream CORS headers via `onProxyRes` to prevent header conflicts.
- **Security headers**: `crossOriginResourcePolicy` must be `'cross-origin'` (not `'same-origin'`).

### 3. Do NOT Set `CORS_ORIGIN` in `.env`

An empty `CORS_ORIGIN=` in `.env` overrides the hardcoded allowed-origins array in the gateway code, breaking all cross-origin requests. Remove it entirely and let the code use its built-in array.

### 4. Frontend API Client Pattern (No CSRF, No withCredentials)

H&S module (and other frontends) use Bearer token auth from `localStorage`. Do NOT add:

- `withCredentials: true` on axios (requires non-wildcard CORS)
- CSRF token fetching (the JWT Bearer token is sufficient for API auth)

Correct pattern (`apps/web-health-safety/src/lib/api.ts`):

```typescript
export const api = axios.create({
  baseURL: `${API_URL}/api/health-safety`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### 5. Prisma Mock Pattern for Tests

Route files import from `../prisma` (which re-exports from `@ims/database/health-safety`). Jest mocks must target the actual import path:

```typescript
// CORRECT
jest.mock('../src/prisma', () => ({ prisma: { risk: { findMany: jest.fn() } } }));

// WRONG — mock never intercepts
jest.mock('@ims/database', () => ({ prisma: { risk: { findMany: jest.fn() } } }));
```

### 6. API Response Shape

All API responses wrap data in `{ success: true, data: ... }`. Frontend must access `response.data.data` (axios `.data` + API `.data`).

### 7. Incident Field Names

Use `title` (not `incidentTitle`), `dateOccurred` (not `incidentDate`), `severity` values are UPPERCASE (`MINOR`, `MODERATE`, `MAJOR`, `CRITICAL`, `CATASTROPHIC`).

## Startup Issues

These issues occur when restarting the system after a shutdown. The automated fix is `./scripts/startup.sh`.

### 8. Port Conflicts on Restart

Host PostgreSQL/Redis may still occupy ports 5432/6379. Kill them before starting Docker:

```bash
sudo systemctl stop postgresql redis 2>/dev/null
sudo fuser -k 5432/tcp 6379/tcp 2>/dev/null
```

### 9. Fresh PostgreSQL Container Loses All Data

When Docker recreates the postgres container, all data (admin user, hs\_\* tables, added columns) is lost. The startup script re-seeds the admin user and recreates missing tables automatically.

### 10. Health-Safety Tables Missing After Restart

The 15 hs\_\* tables must be recreated from the HOST (not container) using `prisma migrate diff` piped to `psql`. This is because Prisma inside Alpine containers fails due to OpenSSL 1.1 incompatibility. After table creation, missing columns on `hs_legal_requirements` and `hs_ohs_objectives` must be added manually. See `docs/DATABASE_SCHEMA_NOTES.md`.

### 11. Prisma OpenSSL in Containers

All Prisma schema `generator` blocks MUST include `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]`. Without this, containers crash with `Error loading shared library libssl.so.1.1`.

### 12. Docker API Version Mismatch

All `docker exec` commands must be prefixed with `DOCKER_API_VERSION=1.44` or the env var set globally. The daemon minimum is 1.44 (daemon updated March 2026).

### 13. Gateway `createServiceProxy` — Downstream Must Mount at `/api/*`

`createServiceProxy(name, target, basePath, errorMsg)` uses `pathRewrite: { ['^' + basePath]: '/api' }`. This strips the gateway prefix and replaces it with `/api`, so the downstream service MUST mount its routes at `/api/*` (not at `/api/<prefix>/*`).

**Example (correct)**: Gateway mounts at `/api/health-safety`, downstream (`api-health-safety`) has `app.use('/api/risks', ...)`.

**Example (wrong)**: Gateway mounts at `/api/region-config`, downstream has `app.use('/api/region-config', ...)` — the rewrite sends `/api/region-config/SG` → `/api/SG` which hits a 404 on the downstream.

**Fix for services that need a non-`/api` target**: Pass an optional `targetPath` 5th arg to `createServiceProxy`:
```typescript
createServiceProxy('RegionConfig', SERVICES.regional, '/api/v1/region-config', 'error', '/api/region-config')
// rewrites /api/v1/region-config/SG → /api/region-config/SG on downstream
```

### 14. Express Router — Named Routes Before Parametrised Routes

In an Express router, named/fixed paths **must** be registered before `:param` paths, or the param handler fires first (treating the literal segment as a parameter value).

```typescript
// WRONG — /:code/compliance fires for /report/compliance with code='report'
router.get('/:code/compliance', handler);
router.get('/report/compliance', handler); // never reached

// CORRECT — specific paths first
router.get('/report/compliance', handler);
router.get('/:code/compliance', handler);
```

### 15. Supertest with `isolatedModules` — Avoid Importing `src/index.ts`

When `src/index.ts` calls init functions (e.g. `initTracing()`) before the corresponding import in source order, importing the whole app in tests causes a TDZ ReferenceError under `isolatedModules: true`. Mount only the router under test in a minimal `express()` app instead:

```typescript
// CORRECT — no TDZ, no external dep mocks needed
import express from 'express';
import myRouter from '../src/routes/my-route';
const testApp = express();
testApp.use(express.json());
testApp.use('/api/prefix', myRouter);
```

### 16. `getRegionConfig` Returns `undefined`, Not `null`

`allRegionConfigs.find(...)` returns `undefined` when no match. Use `!== undefined` or `Boolean(c)` as filter predicate — `c !== null` lets `undefined` pass through.

## Architecture Quick Reference

### Service Ports

- APIs: 4000 (Gateway), 4001 (H&S), 4002 (Env), 4003 (Quality), 4004 (AI), 4005 (Inventory), 4006 (HR), 4007 (Payroll), 4008 (Workflows), 4009 (PM), 4010 (Automotive), 4011 (Medical), 4012 (Aerospace), 4013 (Finance), 4014 (CRM), 4015 (InfoSec), 4016 (ESG), 4017 (CMMS), 4018 (Portal), 4019 (Food Safety), 4020 (Energy), 4021 (Analytics), 4022 (Field Service), 4023 (ISO 42001), 4024 (ISO 37001), 4025 (Marketing), 4026 (Partners), 4027 (Risk), 4028 (Training), 4029 (Suppliers), 4030 (Assets), 4031 (Documents), 4032 (Complaints), 4033 (Contracts), 4034 (PTW), 4035 (Reg Monitor), 4036 (Incidents), 4037 (Audits), 4038 (Mgmt Review), 4040 (Chemicals), 4041 (Emergency), 4042 (Regional/APAC), 4043 (Billing), 4050 (Search)
- Web: 3000 (Dashboard), 3001 (H&S), 3002 (Env), 3003 (Quality), 3004 (Settings), 3005 (Inventory), 3006 (HR), 3007 (Payroll), 3008 (Workflows), 3009 (PM), 3010 (Automotive), 3011 (Medical), 3012 (Aerospace), 3013 (Finance), 3014 (CRM), 3015 (InfoSec), 3016 (ESG), 3017 (CMMS), 3018 (Customer Portal), 3019 (Supplier Portal), 3020 (Food Safety), 3021 (Energy), 3022 (Analytics), 3023 (Field Service), 3024 (ISO 42001), 3025 (ISO 37001), 3026 (Partners Portal), 3027 (Admin Dashboard), 3030 (Marketing), 3031 (Risk), 3032 (Training), 3033 (Suppliers), 3034 (Assets), 3035 (Documents), 3036 (Complaints), 3037 (Contracts), 3038 (Fin Compliance), 3039 (PTW), 3040 (Reg Monitor), 3041 (Incidents), 3042 (Audits), 3043 (Mgmt Review), 3044 (Chemicals), 3045 (Emergency), 3046 (Training Portal), 3047 (Onboarding)

### Gateway Routing

- `/api/auth/*`, `/api/users/*`, `/api/dashboard/*` → handled locally by gateway
- `/api/notifications/*`, `/api/organisations/*`, `/api/compliance/*`, `/api/roles/*` → handled locally by gateway
- `/api/health-safety/*` → api-health-safety:4001
- `/api/environment/*` → api-environment:4002
- `/api/quality/*` → api-quality:4003
- `/api/ai/*` → api-ai-analysis:4004
- `/api/inventory/*` → api-inventory:4005
- `/api/hr/*` → api-hr:4006
- `/api/payroll/*` → api-payroll:4007
- `/api/workflows/*` → api-workflows:4008
- `/api/project-management/*` → api-project-management:4009
- `/api/automotive/*` → api-automotive:4010
- `/api/medical/*` → api-medical:4011
- `/api/aerospace/*` → api-aerospace:4012
- `/api/finance/*` → api-finance:4013
- `/api/crm/*` → api-crm:4014
- `/api/infosec/*` → api-infosec:4015
- `/api/esg/*` → api-esg:4016
- `/api/cmms/*` → api-cmms:4017
- `/api/portal/*` → api-portal:4018
- `/api/food-safety/*` → api-food-safety:4019
- `/api/energy/*` → api-energy:4020
- `/api/analytics/*` → api-analytics:4021
- `/api/field-service/*` → api-field-service:4022
- `/api/iso42001/*` → api-iso42001:4023
- `/api/iso37001/*` → api-iso37001:4024
- `/api/marketing/*` → api-marketing:4025
- `/api/partners/*` → api-partners:4026
- `/api/risk/*` → api-risk:4027
- `/api/training/*` → api-training:4028
- `/api/suppliers/*` → api-suppliers:4029
- `/api/assets/*` → api-assets:4030
- `/api/documents/*` → api-documents:4031
- `/api/complaints/*` → api-complaints:4032
- `/api/contracts/*` → api-contracts:4033
- `/api/ptw/*` → api-ptw:4034
- `/api/reg-monitor/*` → api-reg-monitor:4035
- `/api/incidents/*` → api-incidents:4036
- `/api/audits/*` → api-audits:4037
- `/api/mgmt-review/*` → api-mgmt-review:4038
- `/api/chemicals/*` → api-chemicals:4040
- `/api/emergency/*` → api-emergency:4041
- `/api/search/*` → api-search:4050 (Global Search microservice)
- `/api/billing/*` → api-billing:4043 (Billing, subscriptions, trials, partners)
- `/api/regional/*` → api-regional:4042 (APAC Regional Localisation service)
- All routes also available under `/api/v1/` prefix

### Database

- Separate Prisma schemas per domain in `packages/database/prisma/schemas/`
- Each API service imports its prisma client from a local `src/prisma.ts` that re-exports from `@ims/database/<domain>`
- Schema push: `npx prisma db push --schema=prisma/schemas/<domain>.prisma`

### Auth

- Login: `POST /api/auth/login` → returns `{ data: { accessToken } }`
- Token stored in `localStorage` as `token`
- Sent as `Authorization: Bearer <token>` header
- Test credentials: `admin@ims.local` / `admin123`

### Testing

```bash
pnpm test                        # ~1,224,570 Jest unit tests (~1,193 suites / 489 projects)
pnpm test:integration:ci         # 111 Jest integration tests (12 suites, real DB + Redis)
./scripts/test-all-modules.sh    # All integration tests (40 shell scripts, ~1,800+ assertions)
./scripts/test-hs-modules.sh     # H&S integration tests (~70)
./scripts/test-env-modules.sh    # Environment integration tests (~60)
./scripts/test-quality-modules.sh # Quality integration tests (~80)
./scripts/test-hr-modules.sh     # HR integration tests (~50)
./scripts/test-payroll-modules.sh # Payroll integration tests (~40)
./scripts/test-inventory-modules.sh # Inventory integration tests (~40)
./scripts/test-workflows-modules.sh # Workflows integration tests (~40)
./scripts/test-pm-modules.sh     # PM integration tests (~45)
./scripts/test-finance-modules.sh # Finance integration tests (~40)
./scripts/check-services.sh      # Service health checks (56 services)
./scripts/seed-all.sh            # Seed all database schemas
./scripts/backup-db.sh           # Backup PostgreSQL database
./scripts/generate-review-report.ts # Generate Full System Review Word report
```

## Environment Module (ISO 14001:2015)

### Schema

- `packages/database/prisma/schemas/environment.prisma` — 8 models (EnvAspect, EnvEvent, EnvLegal, EnvObjective, EnvMilestone, EnvAction, EnvCapa, EnvCapaAction) + 3 kept models + 30+ enums
- Domain-specific Prisma client: `apps/api-environment/src/prisma.ts` imports from `@ims/database/environment`

### API Routes (port 4002)

- Gateway: `/api/environment/*` → rewritten to `/api/*` via `pathRewrite`
- 6 routes: `/api/aspects`, `/api/events`, `/api/legal`, `/api/objectives`, `/api/actions`, `/api/capa`
- Reference numbers: `ENV-ASP-YYYY-NNN`, `ENV-EVT-YYYY-NNN`, etc.
- Significance scoring: `severity*1.5 + probability*1.5 + duration + extent + reversibility + regulatory + stakeholder` (>= 15 = significant)

### Frontend (port 3002)

- 6 modules with page.tsx + client.tsx each (~7,100 lines total)
- All use `<Modal isOpen={...}>` and `response.data.data` pattern
- Green theme, AI analysis panels, significance scoring, filter bars

### Multi-Schema DB Push

Use `prisma migrate diff` + `psql` instead of `prisma db push` for environment schema (avoids dropping tables from other schemas):

```bash
npx prisma migrate diff --from-empty --to-schema-datamodel=prisma/schemas/environment.prisma --script | \
  PGPASSWORD=... psql -h localhost -U postgres -d ims -v ON_ERROR_STOP=0
```

### Shared Packages (85)

See `SYSTEM_STATE.md` for the complete list. Key packages:

- `@ims/rbac` — Role-based access control (44 roles, 28 modules, 7 permission levels)
- `@ims/notifications` — WebSocket real-time notifications
- `@ims/pwa` — Progressive Web App (service worker, offline sync)
- `@ims/performance` — k6 load tests, Lighthouse CI, WCAG audit
- `@ims/templates` — 192 built-in document/report templates
- `@ims/emission-factors` — GHG emission factor database
- `@ims/finance-calculations` — Financial calculation engine
- `@ims/tax-engine` — Multi-jurisdiction tax calculation
- `@ims/nlq` — Natural language query engine
- `@ims/oee-engine` — Overall Equipment Effectiveness engine
- `@ims/portal-auth` — Portal authentication (customer/supplier)
- `@ims/regulatory-feed` — Live regulatory change feed
- `@ims/standards-convergence` — Cross-standard mapping engine
- `@ims/event-bus` — Cross-service event bus
- `@ims/command-palette` — Cmd+K command palette with fuzzy search (1,426 tests)
- `@ims/keyboard-shortcuts` — Global keyboard shortcut registry (1,368 tests)
- `@ims/bulk-actions` — Bulk selection and batch operations (1,375 tests)
- `@ims/inline-edit` — Inline field editing with validation (1,668 tests)
- `@ims/deep-links` — Deep link URL builder and registry (1,294 tests)
- `@ims/search` — Global search client and utilities (1,335 tests)
- `@ims/graphql-schema` — Shared GraphQL type definitions (Q2 2026)
- `@ims/collab` — Real-time collaboration engine (OT, cursors) (Q2 2026)
- `@ims/workflow-builder` — Workflow automation DSL and runtime (Q2 2026)
- `@ims/report-builder` — Custom report builder and query engine (Q2 2026)
- `@ims/risk-ml` — Predictive risk scoring ML engine (Q3 2026)
- `@ims/iot-gateway` — IoT device integration gateway (Q3 2026)
- `@ims/plugin-registry` — Plugin marketplace registry (Q4 2026)
- `@ims/developer-portal` — Developer portal and SDK docs (Q4 2026)
- `@ims/module-owner-training` — Module Owner Training source materials (5 one-day programmes)
- `@ims/end-user-training` — End User Training source materials (4-hour Foundation programme)
- `@ims/train-the-trainer` — Train-the-Trainer programme (2-day, dual assessment, 14 CPD, max 8)

### New API Service (port 4050)
- `apps/api-search` — Global Search microservice (port 4050, proxied at `/api/search/*`)

### New API Service (port 4043) — Phase 164
- `apps/api-billing` — Billing, subscriptions, trials, design partners, stack calculator, partner programme (port 4043, proxied at `/api/billing/*`)
- `packages/config` — `@ims/config` — canonical pricing source of truth (`packages/config/src/pricing.config.ts`); 240 tests
- `packages/database/prisma/schemas/billing.prisma` — 13 billing models targeting `BILLING_DATABASE_URL`
- **Pricing**: PRICING constant in `packages/config/src/pricing.config.ts` — SINGLE SOURCE OF TRUTH. Never hardcode prices in JSX.
- **Stripe sync**: `apps/api-billing/src/stripe/sync-stripe-products.ts` — run after price changes
- **Seeds**: `apps/api-billing/src/seed/pricing-seed.ts`, `volume-bands-seed.ts`
- **Email templates**: `apps/api-billing/src/email-templates/` — 14 HTML templates (trial + partner sequences)
- **CRM integration**: `apps/api-crm/src/routes/pricing-integration.ts` — syncPricingToOpportunity, createROIReport, flagDesignPartner, logStackCalculatorResult

## Documentation

- `SYSTEM_STATE.md` — Single source of truth (all services, packages, schemas, ports)
- `QUICK_REFERENCE.md` — Quick reference card
- `docs/FIXES_LOG.md` — Detailed log of all changes (Sessions 1-5 + Phases 0-11)
- `docs/API_REFERENCE.md` — Full API reference (all 25 services)
- `docs/DEPLOYMENT_CHECKLIST.md` — Step-by-step deployment guide + restart procedure
- `docs/SYSTEM-ARCHITECTURE.md` — System architecture overview
- `docs/SECURITY.md` — Security implementation details
- `docs/DATABASE_ARCHITECTURE.md` — Database design (25 schemas)
- `docs/DATABASE_SCHEMA_NOTES.md` — Schema recreation, missing columns, OpenSSL issues
- `docs/TEMPLATES.md` — Template library developer guide
- `docs/Full_System_Review_v3_Report.docx` — 10-page Word report from Full System Review v3 (Feb 17, 2026)
