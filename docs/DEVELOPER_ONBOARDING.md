# Developer Onboarding Guide — IMS

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


Welcome to the Integrated Management System (IMS) monorepo. This guide gets you from zero to productive as quickly as possible.

## Project Overview

IMS is a monorepo containing 43 API services, 45 web apps, and 394 shared packages. It covers domains such as health & safety, environment, quality, HR, finance, CRM, infosec, and more.

**Stack:** Next.js 15, Express.js, PostgreSQL/Prisma, Docker Compose, pnpm workspaces, TypeScript
**Scale:** 44 Prisma schemas, ~590 database tables, ~1,203,000 unit tests across ~1,085 suites / 439 projects (all passing)

## Prerequisites

Install these before cloning:

- **Node.js** >= 20
- **pnpm** >= 9 (`npm install -g pnpm`)
- **Docker** + **Docker Compose**
- **Git**

One critical environment quirk: the Docker daemon on this machine is older than the client, so you must set `DOCKER_API_VERSION=1.41` before any `docker exec` command. Add it to your shell profile:

```bash
export DOCKER_API_VERSION=1.41
```

## Initial Setup (Day 1)

### 1. Clone and install dependencies

```bash
git clone <repo-url> New-BMS
cd New-BMS
pnpm install
```

`pnpm install` resolves all workspace dependencies across every service and package in one step.

### 2. Environment files

Each service ships with a pre-configured `.env`. If you need to start fresh from scratch, copy `.env.example` to `.env` in each service directory. The startup script handles most defaults for local development.

**Important:** Never set `CORS_ORIGIN=` in any `.env` file. An empty value overrides the hardcoded allowed-origins array in the gateway and breaks all cross-origin requests.

### 3. Stop host PostgreSQL and Redis

Docker binds to ports 5432 and 6379. If the host services are running, Docker will fail to start:

```bash
sudo systemctl stop postgresql redis 2>/dev/null
sudo fuser -k 5432/tcp 6379/tcp 2>/dev/null
```

### 4. Start all services

```bash
./scripts/startup.sh
```

This script handles port conflicts, starts Docker Compose, seeds the admin user, and recreates any missing database tables.

### 5. Verify everything is running

```bash
./scripts/check-services.sh
```

This checks all 89 services (43 APIs + api-search + 45 web apps) for health. Expect ~15 web apps to show warnings in dev mode since they require a running Next.js dev server.

### 6. Log in

Open `http://localhost:3000` and use:

- **Email:** `admin@ims.local`
- **Password:** `admin123`

## Architecture at a Glance

### Port Layout

| Layer      | Range      | Examples                                        |
|------------|------------|-------------------------------------------------|
| API Gateway| 4000       | All traffic enters here                         |
| API Services | 4001–4041 | H&S: 4001, Env: 4002, Quality: 4003, Finance: 4013 |
| Web Apps   | 3000–3046  | Dashboard: 3000, H&S: 3001, Training Portal: 3046 |

See `CLAUDE.md` and `SYSTEM_STATE.md` for the complete port map.

### Request Flow

```
Browser → Gateway (4000) → API Service (400x) → PostgreSQL (5432)
```

The gateway handles authentication, CORS, rate limiting, and routing. Downstream services trust the gateway and use `cors({ origin: true, credentials: true })` to reflect the request origin.

### Authentication

- Login: `POST /api/auth/login` returns `{ data: { accessToken } }`
- Token stored in `localStorage` as `token`
- All subsequent requests: `Authorization: Bearer <token>` header
- No CSRF tokens, no `withCredentials` — Bearer tokens are sufficient

## Database

**Active database:** `localhost:5432`, user `postgres`, password `ims_secure_password_2026`, database `ims`

Each domain has its own Prisma schema:

```
packages/database/prisma/schemas/
  health-safety.prisma
  environment.prisma
  quality.prisma
  finance.prisma
  ... (44 schemas total)
```

Generated Prisma clients live in `packages/database/generated/<domain>/`. Each API service re-exports its client from `src/prisma.ts`:

```typescript
// apps/api-health-safety/src/prisma.ts
export { prisma } from '@ims/database/health-safety';
```

### NEVER use `prisma db push`

`prisma db push` for one schema drops tables belonging to other schemas. Always use `migrate diff` piped to `psql`:

```bash
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel=packages/database/prisma/schemas/<domain>.prisma \
  --script | \
  PGPASSWORD=ims_secure_password_2026 psql -h localhost -U postgres -d ims -v ON_ERROR_STOP=0
```

To add a column safely:

```sql
ALTER TABLE <table> ADD COLUMN IF NOT EXISTS <col> <type>;
```

## Key Patterns

### API Response Shape

All API responses use a consistent envelope:

```json
{ "success": true, "data": { ... } }
```

Frontend code using Axios must account for both Axios's `.data` wrapper and the API's `.data` field:

```typescript
const result = await api.get('/risks');
const risks = result.data.data; // Axios .data + API .data
```

### Modal Component

The `@ims/ui` Modal component uses `isOpen`, not `open`:

```tsx
// Correct
<Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Edit Record">

// Wrong — modal never renders
<Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Edit Record">
```

### Prisma Mocks in Tests

Mock the local `../src/prisma` path, not the package name:

```typescript
// Correct
jest.mock('../src/prisma', () => ({
  prisma: { risk: { findMany: jest.fn() } },
}));

// Wrong — mock never intercepts the import
jest.mock('@ims/database', () => ({ ... }));
```

## Running Tests

### Unit Tests

```bash
pnpm test
```

Runs ~1,203,000 Jest tests across ~1,085 suites / 439 projects. All must pass. Every `.test.ts` file has at minimum 1,000 tests.

### Integration Tests

```bash
./scripts/test-all-modules.sh   # all 40 integration scripts (~465+ assertions)
./scripts/test-hs-modules.sh    # Health & Safety only
./scripts/test-env-modules.sh   # Environment only
```

### Load Tests

```bash
k6 run tests/load/scenarios/baseline.js
```

Expected thresholds: error rate < 5%, p95 latency < 500ms for paginated endpoints.

### Mutation Testing

```bash
npx stryker run
```

## Common Issues and Fixes

| Problem | Fix |
|---|---|
| Port 5432/6379 already in use | `sudo systemctl stop postgresql redis && sudo fuser -k 5432/tcp 6379/tcp` |
| `docker exec` fails with API version error | Prefix with `DOCKER_API_VERSION=1.41` or export it |
| Rate limiter blocking requests after restart | `DOCKER_API_VERSION=1.41 docker exec ims-redis redis-cli FLUSHALL` |
| Prisma crash in Alpine container | Ensure `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` in the schema generator block |
| `lsof -i :PORT` shows nothing | Use `ss -tlnp` instead — `lsof` is unreliable on this system |
| Fresh PostgreSQL container loses all data | Run `./scripts/startup.sh` — it re-seeds the admin user and recreates missing tables |

## Week 1 Checklist

By the end of your first week, you should be comfortable with:

- [ ] Starting and stopping all services with `startup.sh` and `check-services.sh`
- [ ] Navigating the port map (CLAUDE.md has the full list)
- [ ] Adding a field to a Prisma schema using `migrate diff | psql` (never `db push`)
- [ ] Writing a Jest unit test for an Express route using the Prisma mock pattern
- [ ] Running `pnpm test` and verifying 0 failures
- [ ] Using the API via the gateway at `localhost:4000/api/...`
- [ ] Reading `SYSTEM_STATE.md` to understand which service owns which domain

## Key Reference Files

| File | Purpose |
|---|---|
| `CLAUDE.md` | Project instructions, known bugs, critical patterns |
| `SYSTEM_STATE.md` | Single source of truth — all services, ports, schemas |
| `QUICK_REFERENCE.md` | Quick reference card for day-to-day commands |
| `docs/FIXES_LOG.md` | Full history of changes across all sessions |
| `docs/TESTING_GUIDE.md` | Comprehensive testing reference |
| `docs/DATABASE_ARCHITECTURE.md` | Database design across all 44 schemas |
| `docs/API_REFERENCE.md` | Full API reference for all services |
