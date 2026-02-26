# Database Schema Notes

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


## Why hs\_\* Tables May Be Missing After Restart

When Docker recreates the postgres container (e.g. after `fuser -k` kills the process, or `--force-recreate` is used), the volume may be lost. This means:

1. The `ims_user` role no longer exists (only `postgres` superuser)
2. The admin user record is gone
3. All 15 hs\_\* tables are missing
4. Any columns added after initial migration are lost

The health-safety schema uses a separate Prisma schema file (`packages/database/prisma/schemas/health-safety.prisma`) and does not have migration files — it was created with `prisma db push`.

## Recreating hs\_\* Tables

**Important:** You MUST push the schema from the HOST machine, not from inside a container.

### Why `prisma db push` Fails in Containers

Prisma 5.22.0 uses `linux-musl` binaries that require OpenSSL 1.1 (`libssl.so.1.1`), but Alpine-based Docker containers only have OpenSSL 3. This causes:

```
Error loading shared library libssl.so.1.1: No such file or directory
```

**Fix applied:** All Prisma schema `generator` blocks now include:

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
  output        = "../../generated/<domain>"
}
```

This was added to:

- `packages/database/prisma/schema.prisma`
- `packages/database/prisma/schemas/health-safety.prisma`
- All other schemas in `packages/database/prisma/schemas/`

### Correct Way to Recreate Tables

Use `prisma migrate diff` to generate SQL, then pipe it directly to psql in the postgres container:

```bash
export DOCKER_API_VERSION=1.41

cd ~/New-BMS/packages/database
HEALTH_SAFETY_DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/ims" \
  node_modules/.bin/prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schemas/health-safety.prisma \
  --script 2>/dev/null | \
  docker exec -i ims-postgres psql -U postgres -d ims
```

This generates the CREATE TABLE statements from the Prisma schema and executes them directly in PostgreSQL, bypassing the OpenSSL issue entirely.

## Columns That Need Manual Addition

Due to table creation ordering issues in the generated SQL, some columns may fail to be created. These must be added manually after the initial table creation:

### ComplianceStatus Enum

```sql
ALTER TYPE "ComplianceStatus" ADD VALUE IF NOT EXISTS 'NOT_ASSESSED';
```

The `NOT_ASSESSED` value was added after the initial enum creation and may not be included in the generated migration script.

### hs_legal_requirements

```sql
ALTER TABLE hs_legal_requirements ADD COLUMN IF NOT EXISTS "legislationRef" TEXT;
ALTER TABLE hs_legal_requirements ADD COLUMN IF NOT EXISTS "section" TEXT;
ALTER TABLE hs_legal_requirements ADD COLUMN IF NOT EXISTS "applicableAreas" TEXT;
ALTER TABLE hs_legal_requirements ADD COLUMN IF NOT EXISTS "lastReviewedAt" TIMESTAMP;
ALTER TABLE hs_legal_requirements ADD COLUMN IF NOT EXISTS "responsiblePerson" TEXT;
ALTER TABLE hs_legal_requirements ADD COLUMN IF NOT EXISTS "aiKeyObligations" TEXT;
ALTER TABLE hs_legal_requirements ADD COLUMN IF NOT EXISTS "aiGapAnalysis" TEXT;
ALTER TABLE hs_legal_requirements ADD COLUMN IF NOT EXISTS "aiRequiredActions" TEXT;
ALTER TABLE hs_legal_requirements ADD COLUMN IF NOT EXISTS "aiEvidenceRequired" TEXT;
ALTER TABLE hs_legal_requirements ADD COLUMN IF NOT EXISTS "aiPenaltyForNonCompliance" TEXT;
ALTER TABLE hs_legal_requirements ADD COLUMN IF NOT EXISTS "aiAssessmentGenerated" BOOLEAN DEFAULT false;
```

### hs_ohs_objectives

```sql
ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS "objectiveStatement" TEXT;
ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS "ohsPolicyLink" TEXT;
ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS "owner" TEXT;
ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP;
ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS "completedDate" TIMESTAMP;
ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS "kpiDescription" TEXT;
ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS "progressPercent" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS "monitoringFrequency" TEXT;
ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS "resourcesRequired" TEXT;
ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS "progressNotes" TEXT;
ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS "aiGenerated" BOOLEAN DEFAULT false;
ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS "aiRecommendations" TEXT;
```

### Core Tables (users/sessions)

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS "lastActivityAt" TIMESTAMP;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;
```

## All 15 hs\_\* Tables

```
hs_actions, hs_bow_tie_analyses, hs_capa_actions, hs_capas,
hs_fishbone_analyses, hs_five_why_analyses, hs_hazards, hs_incidents,
hs_legal_requirements, hs_objective_milestones, hs_ohs_objectives,
hs_risks, hs_safety_inspections, hs_safety_metrics, hs_safety_permits
```

## Quick Verification

Check how many hs\_\* tables exist:

```bash
export DOCKER_API_VERSION=1.41
docker exec ims-postgres psql -U postgres -d ims -t -c \
  "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'hs_%';"
```

Expected: 15 tables. If fewer than 13, run the startup script to recreate them.
