# IMS — Claude Code Instructions

## Project Overview

Integrated Management System (IMS) monorepo with 9 API services, 9 web apps, and 16 shared packages. Built with Next.js 15, Express.js, PostgreSQL/Prisma, Docker Compose.

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

## Architecture Quick Reference

### Service Ports
- APIs: 4000 (Gateway), 4001 (H&S), 4002 (Env), 4003 (Quality), 4004 (AI), 4005 (Inventory), 4006 (HR), 4007 (Payroll), 4008 (Workflows)
- Web: 3000 (Dashboard), 3001 (H&S), 3002 (Env), 3003 (Quality), 3004 (Settings), 3005 (Inventory), 3006 (HR), 3007 (Payroll), 3008 (Workflows)

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
pnpm test                        # 117 Jest unit tests
./scripts/test-hs-modules.sh     # 70 integration tests
./scripts/check-services.sh      # Service health checks
```

## Documentation
- `docs/FIXES_LOG.md` — Detailed log of all 6 critical fixes
- `docs/API_REFERENCE.md` — Full API reference with field names
- `docs/DEPLOYMENT_CHECKLIST.md` — Step-by-step deployment guide
- `docs/SYSTEM-ARCHITECTURE.md` — System architecture overview
- `docs/SECURITY.md` — Security implementation details
- `docs/DATABASE_ARCHITECTURE.md` — Database design
- `QUICK_REFERENCE.md` — Quick reference card
