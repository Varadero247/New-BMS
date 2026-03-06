# Contributing to IMS (Nexara)

Monorepo: 43 API services, 45 web apps, 396 shared packages. Stack: Next.js 15, Express.js, PostgreSQL/Prisma 5.22.0, TypeScript 5, pnpm workspaces. 1,196,395 unit tests across 1,079 suites / 442 projects — all passing, 0 TS errors.

---

## 1. Getting Started

```bash
# Fork and clone
git clone https://github.com/<your-fork>/New-BMS.git
cd New-BMS

# Install dependencies
pnpm install

# Copy environment files
cp .env.example .env
# Copy per-service .env files as needed (each apps/api-*/  has its own)

# Start all services
./scripts/startup.sh

# Verify everything is running (56 services)
./scripts/check-services.sh
```

See `DEVELOPER_ONBOARDING.md` for full setup details including Docker, PostgreSQL, and seeding.

---

## 2. How to Add a New API Service

Follow the pattern of existing services (e.g., `apps/api-risk/`, `apps/api-training/`).

1. **Create the service directory:**
   ```
   apps/api-<name>/
     src/
       index.ts       # Express app, port binding
       routes/        # Route handlers
       prisma.ts      # Re-exports domain Prisma client
     package.json
     tsconfig.json
     .env
   ```

2. **Create the Prisma schema** at `packages/database/prisma/schemas/<name>.prisma`. The `generator` block must include:
   ```prisma
   generator client {
     provider      = "prisma-client-js"
     output        = "../generated/<name>"
     binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
   }
   ```

3. **Add the domain client re-export** in `packages/database/src/<name>.ts`:
   ```typescript
   export { PrismaClient } from '../generated/<name>';
   ```

4. **Register the gateway route** in `apps/api-gateway/src/index.ts`:
   ```typescript
   proxyRoute('/api/<name>/*', 'http://api-<name>:<port>');
   ```

5. **Add a Docker Compose service** in `docker-compose.yml` on the next available port (API services: 4001–4041, Gateway: 4000).

6. **Create an integration test script** at `scripts/test-<name>-modules.sh` following the bash/curl pattern in existing scripts. Add it to `scripts/test-all-modules.sh`.

7. **Create a UAT plan** at `docs/uat/UAT_<NAME>.md` with 25 test cases across 5 groups.

8. **Write unit tests** — see Testing Requirements below.

---

## 3. How to Add a New Web App

1. **Create the app directory** at `apps/web-<name>/` using the Next.js 15 app router structure:
   ```
   apps/web-<name>/
     src/app/
       layout.tsx
       page.tsx
     src/lib/
       api.ts         # Axios client with Bearer token auth
     package.json     # dev script: "next dev -p <port>"
   ```

2. **Add to pnpm workspace** in `pnpm-workspace.yaml` and configure the port in `package.json`:
   ```json
   "scripts": { "dev": "next dev -p 30XX" }
   ```
   Web app ports: 3000–3045.

3. **API client pattern** — Bearer token from `localStorage`, no `withCredentials`:
   ```typescript
   export const api = axios.create({
     baseURL: `${API_URL}/api/<name>`,
     headers: { 'Content-Type': 'application/json' },
   });

   api.interceptors.request.use((config) => {
     const token = localStorage.getItem('token');
     if (token) config.headers.Authorization = `Bearer ${token}`;
     return config;
   });
   ```

4. **Modal component** — use `isOpen` from `@ims/ui`, never `open`:
   ```tsx
   // Correct
   <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Title" size="lg">

   // Wrong — modal will never render
   <Modal open={modalOpen} ...>
   ```

5. **API response shape** — all responses are wrapped; access as `response.data.data`:
   ```typescript
   const res = await api.get('/items');
   const items = res.data.data; // { success: true, data: [...] }
   ```

6. **Add SEO metadata** in `layout.tsx`:
   ```typescript
   export const metadata: Metadata = {
     title: '...',
     description: '...',
     keywords: [...],
     openGraph: { ... },
     robots: { index: true, follow: true },
   };
   ```

---

## 4. Code Standards

- **TypeScript strict mode** — 0 `as any` in production code. Approved alternatives: `value as EnumType`, `obj as Prisma.InputJsonValue`, `as Prisma.XxxUncheckedCreateInput`, discriminated union type guards.
- **Express route ordering** — named routes must be defined before `/:id` to avoid interception:
  ```typescript
  router.get('/access-log', handler);  // before
  router.get('/:id', handler);         // after
  ```
- **API response shape** — always use:
  ```typescript
  res.json({ success: true, data: result });
  res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: '...' } });
  ```
- **UUIDs** — all UUID fields must use proper UUIDs, never strings like `'item-1'`.
- **No in-memory Maps for persistent data** — use Prisma models. Ephemeral rate-limiting state is the only accepted exception.
- **Auth** — all protected routes must use the `authenticate` middleware from `@ims/auth`.

---

## 5. Testing Requirements

- **Minimum test count**: every new `.test.ts` file must have **at least 1,000 tests**.
- **Mock path**: always mock `../src/prisma`, never `@ims/database`:
  ```typescript
  // Correct
  jest.mock('../src/prisma', () => ({
    prisma: { item: { findMany: jest.fn() } },
  }));

  // Wrong — mock never intercepts
  jest.mock('@ims/database', () => ({ ... }));
  ```
- **Integration tests**: follow the bash/curl pattern in `scripts/test-*-modules.sh`.
- **Before submitting a PR**, run:
  ```bash
  pnpm test          # All 1,196,395 tests must pass
  pnpm typecheck     # 0 TypeScript errors required
  ```
- **`jest.clearAllMocks()` does not clear `mockResolvedValueOnce` queues.** Use `mockFn.mockReset()` in `beforeEach` when tests across `describe` blocks share a module-level mock.

---

## 6. Database Changes

- **NEVER** use `prisma db push` — it drops tables from other schemas in the multi-schema setup.
- **Safe schema creation** (CREATE only, no DROP):
  ```bash
  npx prisma migrate diff \
    --from-empty \
    --to-schema-datamodel=packages/database/prisma/schemas/<name>.prisma \
    --script | \
    PGPASSWORD=<password> psql -h localhost -U postgres -d ims -v ON_ERROR_STOP=0
  ```
- **Adding columns** — use direct SQL, never schema push:
  ```sql
  ALTER TABLE <table> ADD COLUMN IF NOT EXISTS <column> <type>;
  ```
- **Regenerating Prisma clients** — always pin to version 5.22.0:
  ```bash
  npx prisma@5.22.0 generate --schema=packages/database/prisma/schemas/<name>.prisma
  ```
- **Extending enums**:
  ```sql
  ALTER TYPE "<EnumName>" ADD VALUE IF NOT EXISTS 'NEW_VALUE';
  ```

---

## 7. Pull Request Process

1. Branch from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```
2. Run the full test suite and typecheck (both must be clean).
3. Include unit tests for all new code (≥1,000 tests per file).
4. Update the `[Unreleased]` section of `CHANGELOG.md`.
5. Reference any related issues in the PR description.
6. PR titles should be short (under 70 characters); use the body for details.

---

## 8. Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     new feature
fix:      bug fix
docs:     documentation only
test:     adding or updating tests
chore:    build, deps, config (no production code change)
refactor: code restructuring without behavior change
```

When using AI assistance, add a `Co-Authored-By` footer:

```
feat: add risk assessment module

Implements CRUD endpoints and Prisma schema for risk management.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```
