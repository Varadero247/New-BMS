# IMS Deployment Checklist

## Pre-Deployment

### 1. Environment Variables

**Required in `.env`:**
```env
DATABASE_URL=postgresql://postgres:ims_secure_password_2026@postgres:5432/ims
HEALTH_SAFETY_DATABASE_URL=postgresql://postgres:ims_secure_password_2026@postgres:5432/ims
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

Ensure `docker-compose.yml` has all 18 services:
- **Infrastructure**: `postgres`, `redis`
- **APIs** (9): `api-gateway`, `api-health-safety`, `api-environment`, `api-quality`, `api-ai-analysis`, `api-inventory`, `api-hr`, `api-payroll`, `api-workflows`
- **Web Apps** (9): `web-dashboard`, `web-health-safety`, `web-environment`, `web-quality`, `web-settings`, `web-inventory`, `web-hr`, `web-payroll`, `web-workflows`

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
```

### Step 4: Seed Database (First Deploy Only)
```bash
pnpm --filter @ims/database seed
```

Creates default admin user: `admin@ims.local` / `admin123`

### Step 5: Build Docker Images
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
for port in 4000 4001 4002 4003 4004 4005 4006 4007 4008; do
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
for ep in risks incidents legal objectives; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    http://localhost:4000/api/environment/$ep \
    -H "Authorization: Bearer $TOKEN")
  echo "environment/$ep: $CODE"
done

# Quality
for ep in nonconformances actions processes capas audits documents; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    http://localhost:4000/api/quality/$ep \
    -H "Authorization: Bearer $TOKEN")
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
for port in 3000 3001 3002 3003 3004 3005 3006 3007 3008; do
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

---

## Database Tables (Key Models)

### Core
`users`, `sessions`, `audit_logs`, `api_keys`

### Health & Safety
`hs_incidents`, `hs_risks`, `hs_legal_requirements`, `hs_ohs_objectives`, `hs_objective_milestones`, `hs_capas`, `hs_capa_actions`, `hs_hazards`, `hs_safety_inspections`, `hs_safety_metrics`, `hs_safety_permits`, `hs_five_why_analyses`, `hs_fishbone_analyses`, `hs_bow_tie_analyses`

### Environment
`env_aspects`, `env_events`, `env_legal_requirements`, `env_objectives`, `env_objective_milestones`, `env_waste_records`, `env_metrics`, `env_monitoring_data`

### Quality
`qms_nonconformances`, `qms_actions`, `qms_processes`, `qms_capas`, `qms_audits`, `qms_documents`, `qms_risks`, `qms_fmea`, `qms_ci_projects`, `qms_suppliers`, `qms_change_requests`, `qms_training_courses`, `qms_templates`
