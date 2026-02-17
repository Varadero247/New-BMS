# @ims/database

Multi-schema Prisma database layer for IMS. Provides domain-isolated Prisma clients for all 44 schemas (~590 tables).

## Architecture

Each domain has its own Prisma schema in `prisma/schemas/` and generates a separate client to `generated/<domain>/`. This allows domain isolation while sharing a single PostgreSQL database.

## Usage

```typescript
// In an API service's src/prisma.ts
import { PrismaClient } from '@ims/database/health-safety';
export const prisma = new PrismaClient();

// In route handlers
import { prisma } from '../prisma';
const risks = await prisma.hsRiskAssessment.findMany();
```

## Available Domain Exports

`core`, `hr`, `payroll`, `quality`, `health-safety`, `environment`, `inventory`, `workflows`, `ai`, `project-management`, `automotive`, `medical`, `aerospace`, `finance`, `crm`, `infosec`, `esg`, `cmms`, `portal`, `food-safety`, `energy`, `analytics`, `field-service`, `iso42001`, `iso37001`, `marketing`, `risk`, `training`, `suppliers`, `assets`, `documents`, `complaints`, `contracts`, `ptw`, `reg-monitor`, `incidents`, `audits`, `mgmt-review`, `wizard`, `partner-portal`, `platform`, `chemicals`, `emergency`, `marketplace`

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm generate:all` | Regenerate all 44 Prisma clients |
| `pnpm push:all` | Push all schemas to database |
| `pnpm seed:all` | Run all seed scripts |
| `pnpm generate:<domain>` | Regenerate a specific domain client |

## Important Notes

- **Never use `prisma db push`** for a single schema — it drops tables from other schemas
- **Safe approach:** `prisma migrate diff --from-empty --to-schema-datamodel ... --script | psql`
- All schemas must include `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]`
- Each schema uses a domain-specific DATABASE_URL env var (e.g., `HEALTH_SAFETY_DATABASE_URL`)
