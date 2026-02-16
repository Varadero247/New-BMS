# Database Reference — Nexara IMS

## PostgreSQL Setup

- **Host**: localhost
- **Port**: 5432
- **Database**: ims
- **User**: postgres
- **Password**: ${POSTGRES_PASSWORD}
- **Connection string**:
  ```
  postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/ims?schema=public
  ```

---

## CRITICAL: Prisma CLI Version

> **Never use the global `prisma` CLI. Always use `npx prisma@5.22.0`. The global CLI v7 is incompatible and WILL error.**

```bash
npx prisma@5.22.0
```

Every Prisma command in this document uses `npx prisma@5.22.0`. Do not omit the version suffix.

---

## Schema Files

### Core Schema

`packages/database/prisma/schema.prisma` — 200+ models including Users, Sessions, Risks, Incidents, Actions, Documents, and more.

### Domain Schemas

All domain schemas live in `packages/database/prisma/schemas/`:

| File | Domain | Details |
|------|--------|---------|
| `health-safety.prisma` | ISO 45001 | hs_* tables |
| `environment.prisma` | ISO 14001 | 8 models, env_* tables |
| `automotive.prisma` | IATF 16949 | Automotive quality |
| `aerospace.prisma` | AS9100 | Aerospace quality |
| `esg.prisma` | ESG/CSRD | 15 models |
| `cmms.prisma` | Asset Management | 16 models |
| `portal.prisma` | Customer/Supplier Portals | 12 models |
| `food-safety.prisma` | ISO 22001 | 14 models |
| `energy.prisma` | ISO 50001 | 12 models |
| `analytics.prisma` | Analytics | 10 models |
| `field-service.prisma` | Field Service | 14 models |
| `marketing.prisma` | Sales & Marketing | 13 models |

---

## Syncing Schema to Database

```bash
DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/ims?schema=public" \
  npx prisma@5.22.0 db push --schema=packages/database/prisma/schema.prisma
```

---

## Multi-Schema Safety Warning

> **`prisma db push` for one schema WILL DROP tables from other schemas.**

### Safe method for domain schemas

Use `migrate diff --from-empty` to generate CREATE-only SQL:

```bash
npx prisma@5.22.0 migrate diff --from-empty \
  --to-schema-datamodel=packages/database/prisma/schemas/environment.prisma \
  --script | PGPASSWORD=${POSTGRES_PASSWORD} psql -h localhost -U postgres -d ims -v ON_ERROR_STOP=0
```

### Adding columns to existing tables

Use direct SQL instead of `db push`:

```sql
ALTER TABLE tablename ADD COLUMN IF NOT EXISTS "columnName" TYPE DEFAULT value;
```

---

## Regenerating Prisma Client

```bash
# Core schema
npx prisma@5.22.0 generate --schema=packages/database/prisma/schema.prisma

# Domain schemas
npx prisma@5.22.0 generate --schema=packages/database/prisma/schemas/environment.prisma
```

Generated client locations:

| Schema | Output |
|--------|--------|
| Core (`schema.prisma`) | `node_modules/.prisma/client` |
| Domain schemas | `packages/database/generated/<domain>/` |

**Always restart the affected service after regenerating.** The running process uses a cached client.

---

## Seeding

```bash
PGPASSWORD=${POSTGRES_PASSWORD} \
DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/ims?schema=public" \
npx tsx packages/database/prisma/seed.ts
```

Default seed users:

| Email | Password | Role |
|-------|----------|------|
| admin@ims.local | admin123 | ADMIN |
| manager@ims.local | admin123 | MANAGER |
| auditor@ims.local | admin123 | AUDITOR |

---

## Service-Specific DATABASE_URL Variables

| Service | Env Variable |
|---------|-------------|
| api-health-safety | `HEALTH_SAFETY_DATABASE_URL` |
| api-environment | `ENVIRONMENT_DATABASE_URL` |
| api-inventory | `INVENTORY_DATABASE_URL` |
| api-iso42001 | `ISO42001_DATABASE_URL` |
| api-iso37001 | `ISO37001_DATABASE_URL` |

All point to: `postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/ims?schema=public`

Set in both the root `.env` and each service's `.env`.

---

## Database Reset

```bash
PGPASSWORD=${POSTGRES_PASSWORD} psql -h localhost -U postgres -c "DROP DATABASE IF EXISTS ims;"
PGPASSWORD=${POSTGRES_PASSWORD} psql -h localhost -U postgres -c "CREATE DATABASE ims;"

# Then re-push and re-seed
DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/ims?schema=public" \
  npx prisma@5.22.0 db push --schema=packages/database/prisma/schema.prisma

PGPASSWORD=${POSTGRES_PASSWORD} \
DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/ims?schema=public" \
npx tsx packages/database/prisma/seed.ts
```

---

## Backup & Restore

```bash
# Backup
PGPASSWORD=${POSTGRES_PASSWORD} pg_dump -h localhost -U postgres ims > backup.sql

# Restore
PGPASSWORD=${POSTGRES_PASSWORD} psql -h localhost -U postgres ims < backup.sql
```

---

## Prisma Studio

```bash
DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/ims" \
npx prisma@5.22.0 studio --schema=packages/database/prisma/schema.prisma
```

Opens a web UI at `http://localhost:5555` for browsing and editing data.
