# IMS Deployment Checklist

## Pre-Deployment

### 1. Environment Variables

**Required in `.env`:**
```env
DATABASE_URL=postgresql://postgres:ims_secure_password_2026@postgres:5432/ims
HEALTH_SAFETY_DATABASE_URL=postgresql://postgres:ims_secure_password_2026@postgres:5432/ims
ENVIRONMENT_DATABASE_URL=postgresql://postgres:ims_secure_password_2026@postgres:5432/ims
QUALITY_DATABASE_URL=postgresql://postgres:ims_secure_password_2026@postgres:5432/ims
REDIS_URL=redis://redis:6379
JWT_SECRET=<strong-random-string>
JWT_REFRESH_SECRET=<strong-random-string>
ANTHROPIC_API_KEY=<your-key>  # Required for AI analysis features
```

**Do NOT set:**
```env
# CORS_ORIGIN=          # DO NOT SET — empty string breaks CORS (see Fix #6)
```

The gateway uses a hardcoded allowed-origins array in code. Setting `CORS_ORIGIN` to any value (including empty string) overrides this and breaks cross-origin requests.

**Optional:**
```env
OPENAI_API_KEY=<your-key>     # For OpenAI AI features
XAI_API_KEY=<your-key>        # For Grok AI features
VAULT_TOKEN=<token>           # For HashiCorp Vault secrets management
```

### 2. Verify Docker Compose

Ensure `docker-compose.yml` has all 20 services:
- **Infrastructure**: `postgres`, `redis`
- **APIs** (10): `api-gateway`, `api-health-safety`, `api-environment`, `api-quality`, `api-ai-analysis`, `api-inventory`, `api-hr`, `api-payroll`, `api-workflows`, `api-project-management`
- **Web Apps** (10): `web-dashboard`, `web-health-safety`, `web-environment`, `web-quality`, `web-settings`, `web-inventory`, `web-hr`, `web-payroll`, `web-workflows`, `web-project-management`

---

## Deployment Steps

### Step 1: Start Infrastructure
```bash
cd /home/dyl/New-BMS
docker compose up -d postgres redis
```

Wait for healthy status:
```bash
docker compose ps postgres redis
# Both should show "healthy"
```

### Step 2: Push Database Schemas

> **Important:** When multiple schemas share one database, `prisma db push` for one schema may try to DROP tables from other schemas. Use `prisma migrate diff --from-empty --script` piped through `psql` as the safe alternative (see Restart Procedure below for examples).

```bash
cd packages/database

# Core schema (users, sessions, audit_logs, api_keys)
npx prisma db push --schema=prisma/schema.prisma

# Health & Safety schema
npx prisma db push --schema=prisma/schemas/health-safety.prisma

# Environment schema
npx prisma db push --schema=prisma/schemas/environment.prisma

# Quality schema
npx prisma db push --schema=prisma/schemas/quality.prisma

# HR schema
npx prisma db push --schema=prisma/schemas/hr.prisma

# Payroll schema
npx prisma db push --schema=prisma/schemas/payroll.prisma

# Inventory schema
npx prisma db push --schema=prisma/schemas/inventory.prisma

# Workflows schema
npx prisma db push --schema=prisma/schemas/workflows.prisma

# Project Management schema
npx prisma db push --schema=prisma/schemas/project-management.prisma
```

### Step 3: Generate Prisma Clients
```bash
npx prisma generate --schema=prisma/schema.prisma
npx prisma generate --schema=prisma/schemas/health-safety.prisma
npx prisma generate --schema=prisma/schemas/environment.prisma
npx prisma generate --schema=prisma/schemas/quality.prisma
npx prisma generate --schema=prisma/schemas/hr.prisma
npx prisma generate --schema=prisma/schemas/payroll.prisma
npx prisma generate --schema=prisma/schemas/inventory.prisma
npx prisma generate --schema=prisma/schemas/workflows.prisma
npx prisma generate --schema=prisma/schemas/project-management.prisma
```

### Step 4: Seed Database (First Deploy Only)
```bash
pnpm --filter @ims/database seed
```

Creates default admin user: `admin@ims.local` / `admin123`

### Step 5: Build Docker Images

All API services use `tsup` as the build tool (not `tsc`). This is configured in each service's `package.json`.

```bash
docker compose build --no-cache
```

Or build specific services:
```bash
docker compose build --no-cache api-gateway api-health-safety web-health-safety
```

### Step 6: Start All Services
```bash
docker compose up -d
```

### Step 7: Verify Services
```bash
# Check all containers are running
docker compose ps

# Check health endpoints
for port in 4000 4001 4002 4003 4004 4005 4006 4007 4008 4009; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/health)
  echo "Port $port: $CODE"
done
```

---

## Post-Deployment Verification

### Authentication Check
```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ims.local","password":"admin123"}' | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['accessToken'])")

echo "Token: ${TOKEN:0:20}..."
```

### H&S Module Endpoints
```bash
for endpoint in risks incidents legal objectives capa; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    http://localhost:4000/api/health-safety/$endpoint \
    -H "Authorization: Bearer $TOKEN" \
    -H "Origin: http://localhost:3001")
  echo "health-safety/$endpoint: $CODE"
done
```

### Other Module Endpoints
```bash
# Environment
for ep in aspects events legal objectives actions capa; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    http://localhost:4000/api/environment/$ep \
    -H "Authorization: Bearer $TOKEN" \
    -H "Origin: http://localhost:3002")
  echo "environment/$ep: $CODE"
done

# Quality (15 endpoints)
for ep in parties issues risks opportunities processes nonconformances actions documents capa legal fmea improvements suppliers changes objectives; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    http://localhost:4000/api/quality/$ep \
    -H "Authorization: Bearer $TOKEN" \
    -H "Origin: http://localhost:3003")
  echo "quality/$ep: $CODE"
done

# HR
for ep in employees attendance departments; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    http://localhost:4000/api/hr/$ep \
    -H "Authorization: Bearer $TOKEN")
  echo "hr/$ep: $CODE"
done

# Payroll
for ep in runs payslips stats; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    http://localhost:4000/api/payroll/$ep \
    -H "Authorization: Bearer $TOKEN")
  echo "payroll/$ep: $CODE"
done

# Inventory
for ep in products inventory warehouses categories suppliers; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    http://localhost:4000/api/inventory/$ep \
    -H "Authorization: Bearer $TOKEN")
  echo "inventory/$ep: $CODE"
done

# Workflows
for ep in templates definitions instances tasks; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    http://localhost:4000/api/workflows/$ep \
    -H "Authorization: Bearer $TOKEN")
  echo "workflows/$ep: $CODE"
done

# Project Management
for ep in projects tasks milestones risks issues changes resources stakeholders documents sprints timesheets reports; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    http://localhost:4000/api/v1/project-management/$ep \
    -H "Authorization: Bearer $TOKEN")
  echo "project-management/$ep: $CODE"
done
```

### CORS Verification
```bash
curl -s -I http://localhost:4000/api/health-safety/incidents \
  -H "Origin: http://localhost:3001" | grep -i "access-control"

# Expected:
# Access-Control-Allow-Origin: http://localhost:3001
# Access-Control-Allow-Credentials: true
```

### Web App Verification
```bash
for port in 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port)
  echo "Web port $port: $CODE"
done
```

---

## Rebuild After Code Changes

```bash
# Rebuild specific services
docker compose build --no-cache api-health-safety web-health-safety
docker compose up -d api-health-safety web-health-safety

# Or rebuild everything
docker compose build --no-cache
docker compose up -d
```

---

## Common Issues & Solutions

### Issue 1: Modals don't open
**Symptom:** Clicking "Report Incident" / "Add Requirement" etc. does nothing.
**Cause:** Modal component uses `isOpen` prop, not `open`.
**Fix:** Change `<Modal open={...}>` to `<Modal isOpen={...}>` in client.tsx files.

### Issue 2: CORS errors in browser console
**Symptom:** `Access to XMLHttpRequest has been blocked by CORS policy`
**Causes & Fixes:**
1. **Downstream CORS wildcard:** Set `cors({ origin: true, credentials: true })` on downstream APIs
2. **Gateway middleware order:** Raw CORS middleware must be FIRST (before Helmet)
3. **Proxy header override:** Add `onProxyRes` to strip downstream CORS headers
4. **Security headers:** Set `crossOriginResourcePolicy: { policy: 'cross-origin' }` in Helmet config
5. **Empty CORS_ORIGIN env var:** Remove `CORS_ORIGIN` from `.env` entirely

### Issue 3: 403 errors on API requests
**Symptom:** All API calls return 403.
**Causes:**
1. CSRF token mismatch — the api.ts was fetching `/api/v1/csrf-token` (wrong path)
2. `withCredentials: true` combined with wildcard CORS
**Fix:** Use simple Bearer token auth without `withCredentials` or CSRF on the H&S frontend.

### Issue 4: Database tables missing
**Symptom:** Prisma errors about missing tables.
**Fix:** Run `npx prisma db push --schema=prisma/schemas/<module>.prisma` for each schema.

### Issue 5: Container can't connect to database
**Symptom:** `Connection refused` errors in API logs.
**Fix:** Ensure `DATABASE_URL` uses `postgres` (Docker service name) not `localhost`:
```
postgresql://postgres:password@postgres:5432/ims
```

### Issue 6: Services start before DB is ready
**Symptom:** API crashes on startup with connection errors.
**Fix:** `docker-compose.yml` should have `depends_on: postgres: condition: service_healthy`.

---

## Restart Procedure

After a system shutdown or Docker restart, use the automated startup script:

```bash
cd ~/New-BMS
./scripts/startup.sh
```

This script handles all 5 known restart issues automatically:

1. **Kills conflicting host services** — Stops host PostgreSQL/Redis and frees ports 3000-4008
2. **Starts all Docker containers** — `docker compose up -d` with a 30s warm-up wait
3. **Waits for PostgreSQL** — Polls until the database accepts connections
4. **Seeds admin user** — Adds missing columns to users/sessions and ensures admin account exists
5. **Recreates HS tables if missing** — Checks hs_* table count; if < 13, runs `prisma migrate diff` from the host and adds missing columns

**Environment tables:** If env_* tables are missing after restart, recreate from host:
```bash
cd ~/New-BMS/packages/database
ENVIRONMENT_DATABASE_URL="postgresql://postgres:ims_secure_password_2026@localhost:5432/ims" \
  npx prisma migrate diff --from-empty \
  --to-schema-datamodel=prisma/schemas/environment.prisma --script | \
  PGPASSWORD=ims_secure_password_2026 psql -h localhost -p 5432 -U postgres -d ims -v ON_ERROR_STOP=0
```

**Quality tables:** If qual_* tables are missing after restart, recreate from host:
```bash
cd ~/New-BMS/packages/database
QUALITY_DATABASE_URL="postgresql://postgres:ims_secure_password_2026@localhost:5432/ims" \
  npx prisma migrate diff --from-empty \
  --to-schema-datamodel=prisma/schemas/quality.prisma --script | \
  PGPASSWORD=ims_secure_password_2026 psql -h localhost -p 5432 -U postgres -d ims -v ON_ERROR_STOP=0
```

### Manual Restart (If Script Fails)

```bash
export DOCKER_API_VERSION=1.41

# 1. Kill conflicting ports
sudo systemctl stop postgresql 2>/dev/null || true
sudo systemctl stop redis 2>/dev/null || true
for port in 5432 6379 4000 4001 4002 4003 4004 4005 4006 4007 4008 4009 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009; do
  sudo fuser -k ${port}/tcp 2>/dev/null || true
done
sleep 3

# 2. Start containers
cd ~/New-BMS && docker compose up -d
sleep 30

# 3. Verify postgres
docker exec ims-postgres psql -U postgres -d ims -c "SELECT 1"

# 4. Check HS tables
docker exec ims-postgres psql -U postgres -d ims -t -c \
  "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'hs_%';"
# Expected: 15

# 5. If tables missing, recreate from host
cd ~/New-BMS/packages/database
HEALTH_SAFETY_DATABASE_URL="postgresql://postgres:ims_secure_password_2026@localhost:5432/ims" \
  node_modules/.bin/prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schemas/health-safety.prisma \
  --script 2>/dev/null | \
  docker exec -i ims-postgres psql -U postgres -d ims
```

### Docker API Version Note

If you see `client version 1.53 is too new`, prefix all docker commands with:
```bash
export DOCKER_API_VERSION=1.41
```

---

## Service Port Reference

| Service | Container Port | Host Port |
|---------|---------------|-----------|
| PostgreSQL | 5432 | 5432 |
| Redis | 6379 | 6379 |
| API Gateway | 4000 | 4000 |
| API Health & Safety | 4001 | 4001 |
| API Environment | 4002 | 4002 |
| API Quality | 4003 | 4003 |
| API AI Analysis | 4004 | 4004 |
| API Inventory | 4005 | 4005 |
| API HR | 4006 | 4006 |
| API Payroll | 4007 | 4007 |
| API Workflows | 4008 | 4008 |
| Web Dashboard | 3000 | 3000 |
| Web Health & Safety | 3001 | 3001 |
| Web Environment | 3002 | 3002 |
| Web Quality | 3003 | 3003 |
| Web Settings | 3004 | 3004 |
| Web Inventory | 3005 | 3005 |
| Web HR | 3006 | 3006 |
| Web Payroll | 3007 | 3007 |
| Web Workflows | 3008 | 3008 |
| API Project Management | 4009 | 4009 |
| Web Project Management | 3009 | 3009 |

---

## Database Tables (Key Models)

### Core
`users`, `sessions`, `audit_logs`, `api_keys`

### Health & Safety
`hs_incidents`, `hs_risks`, `hs_legal_requirements`, `hs_ohs_objectives`, `hs_objective_milestones`, `hs_capas`, `hs_capa_actions`, `hs_hazards`, `hs_safety_inspections`, `hs_safety_metrics`, `hs_safety_permits`, `hs_five_why_analyses`, `hs_fishbone_analyses`, `hs_bow_tie_analyses`

### Environment
`env_aspects`, `env_events`, `env_legal`, `env_objectives`, `env_milestones`, `env_actions`, `env_capas`, `env_capa_actions`, `env_waste_records`, `env_metrics`, `env_monitoring_data`

### Quality
`qual_interested_parties`, `qual_issues`, `qual_risks`, `qual_opportunities`, `qual_processes`, `qual_nonconformances`, `qual_actions`, `qual_documents`, `qual_capas`, `qual_capa_actions`, `qual_legal`, `qual_fmeas`, `qual_fmea_rows`, `qual_improvements`, `qual_suppliers`, `qual_changes`, `qual_objectives`, `qual_milestones`

### Project Management
`projects`, `project_tasks`, `project_milestones`, `project_risks`, `project_issues`, `project_changes`, `project_resources`, `project_stakeholders`, `project_documents`, `project_sprints`, `project_user_stories`, `project_timesheets`, `project_expenses`, `project_status_reports`
