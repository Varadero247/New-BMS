# IMS — Claude Code Instructions

## Project Overview

Integrated Management System (IMS) monorepo with 10 API services, 10 web apps, and 16 shared packages. Built with Next.js 15, Express.js, PostgreSQL/Prisma, Docker Compose.

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
When Docker recreates the postgres container, all data (admin user, hs_* tables, added columns) is lost. The startup script re-seeds the admin user and recreates missing tables automatically.

### 10. Health-Safety Tables Missing After Restart
The 15 hs_* tables must be recreated from the HOST (not container) using `prisma migrate diff` piped to `psql`. This is because Prisma inside Alpine containers fails due to OpenSSL 1.1 incompatibility. After table creation, missing columns on `hs_legal_requirements` and `hs_ohs_objectives` must be added manually. See `docs/DATABASE_SCHEMA_NOTES.md`.

### 11. Prisma OpenSSL in Containers
All Prisma schema `generator` blocks MUST include `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]`. Without this, containers crash with `Error loading shared library libssl.so.1.1`.

### 12. Docker API Version Mismatch
All `docker exec` commands must be prefixed with `DOCKER_API_VERSION=1.41` or the env var set globally. The Docker client (1.53) is newer than the daemon (1.41).

## Architecture Quick Reference

### Service Ports
- APIs: 4000 (Gateway), 4001 (H&S), 4002 (Env), 4003 (Quality), 4004 (AI), 4005 (Inventory), 4006 (HR), 4007 (Payroll), 4008 (Workflows), 4009 (Project Management)
- Web: 3000 (Dashboard), 3001 (H&S), 3002 (Env), 3003 (Quality), 3004 (Settings), 3005 (Inventory), 3006 (HR), 3007 (Payroll), 3008 (Workflows), 3009 (Project Management)

### Gateway Routing
- `/api/auth/*`, `/api/users/*`, `/api/dashboard/*` → handled locally by gateway
- `/api/health-safety/*` → api-health-safety:4001
- `/api/environment/*` → api-environment:4002
- `/api/quality/*` → api-quality:4003
- `/api/ai/*` → api-ai-analysis:4004
- `/api/inventory/*` → api-inventory:4005
- `/api/hr/*` → api-hr:4006
- `/api/payroll/*` → api-payroll:4007
- `/api/workflows/*` → api-workflows:4008
- `/api/v1/project-management/*` → api-project-management:4009

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
pnpm test                        # 2,579 Jest unit tests (99 suites)
./scripts/test-all-modules.sh    # All integration tests (8 modules, ~425 assertions)
./scripts/test-hs-modules.sh     # H&S integration tests (70 assertions)
./scripts/test-env-modules.sh    # Environment integration tests (~60)
./scripts/test-quality-modules.sh # Quality integration tests (~80)
./scripts/test-hr-modules.sh     # HR integration tests (~50)
./scripts/test-payroll-modules.sh # Payroll integration tests (~40)
./scripts/test-inventory-modules.sh # Inventory integration tests (~40)
./scripts/test-workflows-modules.sh # Workflows integration tests (~40)
./scripts/test-pm-modules.sh     # PM integration tests (~45)
./scripts/check-services.sh      # Service health checks
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

## Documentation
- `docs/FIXES_LOG.md` — Detailed log of all changes (Session 1: 6 critical fixes, Session 2: 5 startup fixes, Session 3: Environment modules)
- `docs/API_REFERENCE.md` — Full API reference (H&S + Environment + AI + Gateway)
- `docs/DEPLOYMENT_CHECKLIST.md` — Step-by-step deployment guide + restart procedure
- `docs/SYSTEM-ARCHITECTURE.md` — System architecture overview
- `docs/SECURITY.md` — Security implementation details
- `docs/DATABASE_ARCHITECTURE.md` — Database design
- `docs/DATABASE_SCHEMA_NOTES.md` — Schema recreation, missing columns, OpenSSL issues
- `QUICK_REFERENCE.md` — Quick reference card
