# ADR-003: One Prisma Schema Per Domain (44 Schemas)

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


**Date**: 2026-02-05
**Status**: Accepted

## Context

The platform manages ~590 database tables across domains including health & safety, environment, quality, finance, HR, and 38 more modules. Decisions:

1. **Single Prisma schema** — all 590 tables in one `schema.prisma`
2. **One schema per service** — each of the 43 services has its own schema
3. **One schema per domain** — logical grouping (e.g., `core.prisma` covers auth/users/dashboard)

## Decision

Use **one Prisma schema per domain**, stored in `packages/database/prisma/schemas/`. Each schema generates a separate Prisma client in `packages/database/generated/<domain>/`.

Each API service has a `src/prisma.ts` that re-exports only its domain client:
```typescript
// apps/api-health-safety/src/prisma.ts
export { prisma } from '@ims/database/health-safety';
```

Each domain uses a named `DATABASE_URL` environment variable (e.g., `HEALTH_SAFETY_DATABASE_URL`) rather than the generic `DATABASE_URL`.

## Consequences

**Positive:**
- Each service imports only the models it needs — no accidental cross-domain queries
- Schema changes to one domain don't regenerate clients for unrelated domains
- Smaller generated clients = faster TypeScript compilation per service
- Clear ownership: the health-safety team owns `health-safety.prisma`

**Negative:**
- 44 `prisma generate` commands required after schema changes (`pnpm --filter @ims/database generate:all`)
- **Critical gotcha**: `prisma db push` for one schema will DROP tables belonging to other schemas if they're in the same database. **Safe approach**: always use `prisma migrate diff --from-empty --to-schema-datamodel ... --script | psql` (generates only CREATE statements, no DROPs)
- For adding columns: `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` — never re-push the full schema
- All 44 schemas point to the same PostgreSQL database (`ims`) but use different table prefixes (e.g., `hs_*`, `env_*`, `qual_*`)
- Prisma's `binaryTargets` must include `["native", "linux-musl-openssl-3.0.x"]` in every schema generator block for Alpine container compatibility

**Pinned version:** `npx prisma@5.22.0` — matches the installed client version `5.22.0`. Using a different CLI version risks generated client/schema mismatches.
