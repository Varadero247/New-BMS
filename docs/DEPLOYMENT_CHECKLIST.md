# IMS Deployment Checklist

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


## Pre-Deployment

### 1. Environment Variables

**Required in `.env`:**

```env
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/ims
HEALTH_SAFETY_DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/ims
ENVIRONMENT_DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/ims
QUALITY_DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/ims
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
STRIPE_WEBHOOK_SECRET=<whsec_...>  # Required for api-marketing Stripe webhook verification
ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com  # Production CORS origins
```

### 2. Verify Docker Compose

Ensure `docker-compose.yml` has all services:

- **Infrastructure**: `postgres`, `redis`
- **APIs** (42): `api-gateway`, `api-health-safety`, `api-environment`, `api-quality`, `api-ai-analysis`, `api-inventory`, `api-hr`, `api-payroll`, `api-workflows`, `api-project-management`, `api-automotive`, `api-medical`, `api-aerospace`, `api-finance`, `api-crm`, `api-infosec`, `api-esg`, `api-cmms`, `api-portal`, `api-food-safety`, `api-energy`, `api-analytics`, `api-field-service`, `api-iso42001`, `api-iso37001`, `api-marketing`, `api-partners`, `api-risk`, `api-training`, `api-suppliers`, `api-assets`, `api-documents`, `api-complaints`, `api-contracts`, `api-ptw`, `api-reg-monitor`, `api-incidents`, `api-audits`, `api-mgmt-review`, `api-setup-wizard`, `api-chemicals`, `api-emergency`
- **Web Apps** (44): `web-dashboard`, `web-health-safety`, `web-environment`, `web-quality`, `web-settings`, `web-inventory`, `web-hr`, `web-payroll`, `web-workflows`, `web-project-management`, `web-automotive`, `web-medical`, `web-aerospace`, `web-finance`, `web-crm`, `web-infosec`, `web-esg`, `web-cmms`, `web-customer-portal`, `web-supplier-portal`, `web-food-safety`, `web-energy`, `web-analytics`, `web-field-service`, `web-iso42001`, `web-iso37001`, `web-partners`, `web-admin`, `web-marketing`, `web-risk`, `web-training`, `web-suppliers`, `web-assets`, `web-documents`, `web-complaints`, `web-contracts`, `web-finance-compliance`, `web-ptw`, `web-reg-monitor`, `web-incidents`, `web-audits`, `web-mgmt-review`, `web-chemicals`, `web-emergency`

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

# Automotive schema
npx prisma db push --schema=prisma/schemas/automotive.prisma

# Medical schema
npx prisma db push --schema=prisma/schemas/medical.prisma

# Aerospace schema
npx prisma db push --schema=prisma/schemas/aerospace.prisma

# AI schema
npx prisma db push --schema=prisma/schemas/ai.prisma

# Finance schema
npx prisma db push --schema=prisma/schemas/finance.prisma

# CRM schema
npx prisma db push --schema=prisma/schemas/crm.prisma

# InfoSec schema
npx prisma db push --schema=prisma/schemas/infosec.prisma

# ESG schema
npx prisma db push --schema=prisma/schemas/esg.prisma

# CMMS schema
npx prisma db push --schema=prisma/schemas/cmms.prisma

# Portal schema
npx prisma db push --schema=prisma/schemas/portal.prisma

# Food Safety schema
npx prisma db push --schema=prisma/schemas/food-safety.prisma

# Energy schema
npx prisma db push --schema=prisma/schemas/energy.prisma

# Analytics schema
npx prisma db push --schema=prisma/schemas/analytics.prisma

# Field Service schema
npx prisma db push --schema=prisma/schemas/field-service.prisma

# ISO 42001 schema
npx prisma db push --schema=prisma/schemas/iso42001.prisma

# ISO 37001 schema
npx prisma db push --schema=prisma/schemas/iso37001.prisma

# Marketing schema
npx prisma db push --schema=prisma/schemas/marketing.prisma

# Risk schema
npx prisma db push --schema=prisma/schemas/risk.prisma

# Training schema
npx prisma db push --schema=prisma/schemas/training.prisma

# Suppliers schema
npx prisma db push --schema=prisma/schemas/suppliers.prisma

# Assets schema
npx prisma db push --schema=prisma/schemas/assets.prisma

# Documents schema
npx prisma db push --schema=prisma/schemas/documents.prisma

# Complaints schema
npx prisma db push --schema=prisma/schemas/complaints.prisma

# Contracts schema
npx prisma db push --schema=prisma/schemas/contracts.prisma

# PTW schema
npx prisma db push --schema=prisma/schemas/ptw.prisma

# Reg Monitor schema
npx prisma db push --schema=prisma/schemas/reg-monitor.prisma

# Incidents schema
npx prisma db push --schema=prisma/schemas/incidents.prisma

# Audits schema
npx prisma db push --schema=prisma/schemas/audits.prisma

# Mgmt Review schema
npx prisma db push --schema=prisma/schemas/mgmt-review.prisma

# Platform schema
npx prisma db push --schema=prisma/schemas/platform.prisma

# Wizard schema
npx prisma db push --schema=prisma/schemas/wizard.prisma

# Partner Portal schema
npx prisma db push --schema=prisma/schemas/partner-portal.prisma

# Chemicals schema
npx prisma db push --schema=prisma/schemas/chemicals.prisma

# Emergency schema
npx prisma db push --schema=prisma/schemas/emergency.prisma

# Marketplace schema
npx prisma db push --schema=prisma/schemas/marketplace.prisma
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
npx prisma generate --schema=prisma/schemas/automotive.prisma
npx prisma generate --schema=prisma/schemas/medical.prisma
npx prisma generate --schema=prisma/schemas/aerospace.prisma
npx prisma generate --schema=prisma/schemas/ai.prisma
npx prisma generate --schema=prisma/schemas/finance.prisma
npx prisma generate --schema=prisma/schemas/crm.prisma
npx prisma generate --schema=prisma/schemas/infosec.prisma
npx prisma generate --schema=prisma/schemas/esg.prisma
npx prisma generate --schema=prisma/schemas/cmms.prisma
npx prisma generate --schema=prisma/schemas/portal.prisma
npx prisma generate --schema=prisma/schemas/food-safety.prisma
npx prisma generate --schema=prisma/schemas/energy.prisma
npx prisma generate --schema=prisma/schemas/analytics.prisma
npx prisma generate --schema=prisma/schemas/field-service.prisma
npx prisma generate --schema=prisma/schemas/iso42001.prisma
npx prisma generate --schema=prisma/schemas/iso37001.prisma
npx prisma generate --schema=prisma/schemas/marketing.prisma
npx prisma generate --schema=prisma/schemas/risk.prisma
npx prisma generate --schema=prisma/schemas/training.prisma
npx prisma generate --schema=prisma/schemas/suppliers.prisma
npx prisma generate --schema=prisma/schemas/assets.prisma
npx prisma generate --schema=prisma/schemas/documents.prisma
npx prisma generate --schema=prisma/schemas/complaints.prisma
npx prisma generate --schema=prisma/schemas/contracts.prisma
npx prisma generate --schema=prisma/schemas/ptw.prisma
npx prisma generate --schema=prisma/schemas/reg-monitor.prisma
npx prisma generate --schema=prisma/schemas/incidents.prisma
npx prisma generate --schema=prisma/schemas/audits.prisma
npx prisma generate --schema=prisma/schemas/mgmt-review.prisma
npx prisma generate --schema=prisma/schemas/platform.prisma
npx prisma generate --schema=prisma/schemas/wizard.prisma
npx prisma generate --schema=prisma/schemas/partner-portal.prisma
npx prisma generate --schema=prisma/schemas/chemicals.prisma
npx prisma generate --schema=prisma/schemas/emergency.prisma
npx prisma generate --schema=prisma/schemas/marketplace.prisma
```

### Step 3b: Seed Demo Data (First Deploy Only)

After pushing all schemas, run the unified seed script to populate demo data across all modules:

```bash
./scripts/seed-all.sh
```

This creates the default admin user (`admin@ims.local` / `admin123`) plus seed data for chemicals, emergency, risk, marketing, and other modules.

### Step 4: Seed Database (First Deploy Only — Alternative)

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
for port in $(seq 4000 4041); do
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
for port in $(seq 3000 3045); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port)
  echo "Web port $port: $CODE"
done
```

---

## Pre-Launch Checklist

- [ ] Run `scripts/seed-all.sh` after initial schema push for demo data
- [ ] Verify `STRIPE_WEBHOOK_SECRET` is set for api-marketing
- [ ] Verify `ALLOWED_ORIGINS` is set for production CORS
- [ ] Rotate Anthropic API key before launch (replace development key with production key)
- [ ] Database backups: backup service runs daily via docker-compose; manual backup via `scripts/backup-db.sh`
- [ ] Run the Full System Review to verify all services: `npx tsx scripts/generate-review-report.ts` (generates `docs/Full_System_Review_v3_Report.docx` with findings across all 43 API services + api-search)

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
5. **Recreates HS tables if missing** — Checks hs\_\* table count; if < 13, runs `prisma migrate diff` from the host and adds missing columns

**Environment tables:** If env\_\* tables are missing after restart, recreate from host:

```bash
cd ~/New-BMS/packages/database
ENVIRONMENT_DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/ims" \
  npx prisma migrate diff --from-empty \
  --to-schema-datamodel=prisma/schemas/environment.prisma --script | \
  PGPASSWORD=${POSTGRES_PASSWORD} psql -h localhost -p 5432 -U postgres -d ims -v ON_ERROR_STOP=0
```

**Quality tables:** If qual\_\* tables are missing after restart, recreate from host:

```bash
cd ~/New-BMS/packages/database
QUALITY_DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/ims" \
  npx prisma migrate diff --from-empty \
  --to-schema-datamodel=prisma/schemas/quality.prisma --script | \
  PGPASSWORD=${POSTGRES_PASSWORD} psql -h localhost -p 5432 -U postgres -d ims -v ON_ERROR_STOP=0
```

### Manual Restart (If Script Fails)

```bash
export DOCKER_API_VERSION=1.41

# 1. Kill conflicting ports
sudo systemctl stop postgresql 2>/dev/null || true
sudo systemctl stop redis 2>/dev/null || true
for port in 5432 6379 $(seq 4000 4041) $(seq 3000 3045); do
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
HEALTH_SAFETY_DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/ims" \
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

| Service                | Container Port | Host Port |
| ---------------------- | -------------- | --------- |
| PostgreSQL             | 5432           | 5432      |
| Redis                  | 6379           | 6379      |
| **APIs**               |                |           |
| API Gateway            | 4000           | 4000      |
| API Health & Safety    | 4001           | 4001      |
| API Environment        | 4002           | 4002      |
| API Quality            | 4003           | 4003      |
| API AI Analysis        | 4004           | 4004      |
| API Inventory          | 4005           | 4005      |
| API HR                 | 4006           | 4006      |
| API Payroll            | 4007           | 4007      |
| API Workflows          | 4008           | 4008      |
| API Project Management | 4009           | 4009      |
| API Automotive         | 4010           | 4010      |
| API Medical            | 4011           | 4011      |
| API Aerospace          | 4012           | 4012      |
| API Finance            | 4013           | 4013      |
| API CRM                | 4014           | 4014      |
| API InfoSec            | 4015           | 4015      |
| API ESG                | 4016           | 4016      |
| API CMMS               | 4017           | 4017      |
| API Portal             | 4018           | 4018      |
| API Food Safety        | 4019           | 4019      |
| API Energy             | 4020           | 4020      |
| API Analytics          | 4021           | 4021      |
| API Field Service      | 4022           | 4022      |
| API ISO 42001          | 4023           | 4023      |
| API ISO 37001          | 4024           | 4024      |
| API Marketing          | 4025           | 4025      |
| API Partners           | 4026           | 4026      |
| API Risk (ERM)         | 4027           | 4027      |
| API Training           | 4028           | 4028      |
| API Suppliers          | 4029           | 4029      |
| API Assets             | 4030           | 4030      |
| API Documents          | 4031           | 4031      |
| API Complaints         | 4032           | 4032      |
| API Contracts          | 4033           | 4033      |
| API Permit to Work     | 4034           | 4034      |
| API Regulatory Monitor | 4035           | 4035      |
| API Incidents          | 4036           | 4036      |
| API Audits             | 4037           | 4037      |
| API Mgmt Review        | 4038           | 4038      |
| API Setup Wizard       | 4039           | 4039      |
| API Chemicals          | 4040           | 4040      |
| API Emergency          | 4041           | 4041      |
| **Web Apps**           |                |           |
| Web Dashboard          | 3000           | 3000      |
| Web Health & Safety    | 3001           | 3001      |
| Web Environment        | 3002           | 3002      |
| Web Quality            | 3003           | 3003      |
| Web Settings           | 3004           | 3004      |
| Web Inventory          | 3005           | 3005      |
| Web HR                 | 3006           | 3006      |
| Web Payroll            | 3007           | 3007      |
| Web Workflows          | 3008           | 3008      |
| Web Project Management | 3009           | 3009      |
| Web Automotive         | 3010           | 3010      |
| Web Medical            | 3011           | 3011      |
| Web Aerospace          | 3012           | 3012      |
| Web Finance            | 3013           | 3013      |
| Web CRM                | 3014           | 3014      |
| Web InfoSec            | 3015           | 3015      |
| Web ESG                | 3016           | 3016      |
| Web CMMS               | 3017           | 3017      |
| Web Customer Portal    | 3018           | 3018      |
| Web Supplier Portal    | 3019           | 3019      |
| Web Food Safety        | 3020           | 3020      |
| Web Energy             | 3021           | 3021      |
| Web Analytics          | 3022           | 3022      |
| Web Field Service      | 3023           | 3023      |
| Web ISO 42001          | 3024           | 3024      |
| Web ISO 37001          | 3025           | 3025      |
| Web Partners Portal    | 3026           | 3026      |
| Web Admin Dashboard    | 3027           | 3027      |
| Web Marketing          | 3030           | 3030      |
| Web Risk (ERM)         | 3031           | 3031      |
| Web Training           | 3032           | 3032      |
| Web Suppliers          | 3033           | 3033      |
| Web Assets             | 3034           | 3034      |
| Web Documents          | 3035           | 3035      |
| Web Complaints         | 3036           | 3036      |
| Web Contracts          | 3037           | 3037      |
| Web Fin. Compliance    | 3038           | 3038      |
| Web Permit to Work     | 3039           | 3039      |
| Web Reg Monitor        | 3040           | 3040      |
| Web Incidents          | 3041           | 3041      |
| Web Audits             | 3042           | 3042      |
| Web Mgmt Review        | 3043           | 3043      |
| Web Chemicals          | 3044           | 3044      |
| Web Emergency          | 3045           | 3045      |

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

### Automotive (IATF 16949)

`auto_ppaps`, `auto_apqps`, `auto_fmeas`, `auto_fmea_rows`, `auto_spcs`, `auto_msas`, `auto_control_plans`, `auto_control_plan_chars`, `auto_8ds`, `auto_8d_actions`, `auto_lpas`, `auto_lpa_questions`, `auto_lpa_findings`

### Medical (ISO 13485)

`med_devices`, `med_design_controls`, `med_design_reviews`, `med_risk_analyses`, `med_risk_items`, `med_capas`, `med_capa_actions`, `med_complaints`, `med_audits`, `med_audit_findings`, `med_trainings`, `med_training_records`, `med_suppliers`, `med_supplier_evaluations`

### Aerospace (AS9100)

`aero_products`, `aero_first_articles`, `aero_fai_chars`, `aero_special_processes`, `aero_process_approvals`, `aero_ofi_items`, `aero_risk_analyses`, `aero_risk_items`, `aero_counterfeit_controls`, `aero_test_records`, `aero_flowdowns`, `aero_flowdown_items`

### AI

`ai_analyses`, `ai_analysis_results`

### Finance

`fin_accounts`, `fin_journal_entries`, `fin_journal_lines`, `fin_invoices`, `fin_invoice_lines`, `fin_payments`, `fin_budgets`, `fin_budget_lines`, `fin_fixed_assets`, `fin_bank_reconciliations`, `fin_bank_transactions`, `fin_tax_records`

### CRM

`crm_contacts`, `crm_companies`, `crm_deals`, `crm_activities`, `crm_pipelines`, `crm_pipeline_stages`, `crm_campaigns`, `crm_campaign_contacts`

### InfoSec (ISO 27001)

`isec_assets`, `isec_risks`, `isec_risk_treatments`, `isec_controls`, `isec_incidents`, `isec_incident_actions`, `isec_policies`, `isec_policy_versions`, `isec_audits`, `isec_audit_findings`, `isec_access_reviews`, `isec_access_review_items`

### ESG

`esg_metrics`, `esg_metric_values`, `esg_targets`, `esg_initiatives`, `esg_initiative_milestones`, `esg_reports`, `esg_report_sections`, `esg_frameworks`, `esg_framework_mappings`, `esg_stakeholders`, `esg_stakeholder_engagements`, `esg_materiality_topics`, `esg_materiality_assessments`, `esg_supply_chain_assessments`, `esg_assessment_items`

### CMMS

`cmms_assets`, `cmms_locations`, `cmms_work_orders`, `cmms_work_order_parts`, `cmms_work_order_labor`, `cmms_preventive_schedules`, `cmms_preventive_tasks`, `cmms_meter_readings`, `cmms_failure_codes`, `cmms_failure_analyses`, `cmms_parts`, `cmms_part_transactions`, `cmms_vendors`, `cmms_purchase_orders`, `cmms_purchase_order_items`, `cmms_downtime_records`

### Portal

`portal_organisations`, `portal_portal_users`, `portal_portal_sessions`, `portal_documents`, `portal_document_shares`, `portal_tickets`, `portal_ticket_messages`, `portal_orders`, `portal_order_items`, `portal_invoices`, `portal_supplier_profiles`, `portal_rfqs`

### Food Safety (HACCP / ISO 22000)

`fs_haccp_plans`, `fs_hazard_analyses`, `fs_ccps`, `fs_ccp_monitoring`, `fs_corrective_actions`, `fs_verification_records`, `fs_prp_programs`, `fs_prp_tasks`, `fs_audits`, `fs_audit_findings`, `fs_supplier_approvals`, `fs_supplier_evaluations`, `fs_traceability_records`, `fs_recall_events`

### Energy (ISO 50001)

`en_baselines`, `en_baseline_data`, `en_performance_indicators`, `en_indicator_values`, `en_audits`, `en_audit_findings`, `en_action_plans`, `en_action_items`, `en_meters`, `en_meter_readings`, `en_projects`, `en_project_savings`

### Analytics

`an_dashboards`, `an_dashboard_widgets`, `an_reports`, `an_report_schedules`, `an_data_sources`, `an_data_connections`, `an_kpis`, `an_kpi_values`, `an_alerts`, `an_alert_notifications`

### Field Service

`fld_work_orders`, `fld_work_order_tasks`, `fld_technicians`, `fld_technician_skills`, `fld_customers`, `fld_customer_sites`, `fld_service_contracts`, `fld_contract_slas`, `fld_inventory_items`, `fld_inventory_transactions`, `fld_schedules`, `fld_schedule_slots`, `fld_timesheets`, `fld_timesheet_entries`

### ISO 42001 (AI Management)

`ai42_systems`, `ai42_risk_assessments`, `ai42_risk_items`, `ai42_controls`, `ai42_impact_assessments`, `ai42_impact_items`, `ai42_audits`, `ai42_audit_findings`, `ai42_data_governance`, `ai42_data_records`

### ISO 37001 (Anti-Bribery)

`ab_risk_assessments`, `ab_risk_items`, `ab_due_diligences`, `ab_due_diligence_checks`, `ab_controls`, `ab_control_reviews`, `ab_incidents`, `ab_incident_actions`, `ab_trainings`, `ab_training_records`, `ab_gifts`, `ab_policies`

### Risk Management (ISO 31000:2018)

`risk_registers`, `risk_reviews`, `risk_capas`, `risk_controls`, `risk_kris`, `risk_kri_readings`, `risk_actions`, `risk_bowties`, `risk_appetite_statements`, `risk_frameworks`

### Chemical Management (ISO 11014 / COSHH)

`chem_registers`, `chem_sds`, `chem_coshh`, `chem_inventory`, `chem_usage`, `chem_monitoring`, `chem_disposal`, `chem_incidents`, `chem_incompat_alerts`

### Emergency Management (ISO 22320 / ISO 22301)

`fem_premises`, `fem_fire_risk_assessments`, `fem_assembly_points`, `fem_evacuation_routes`, `fem_peeps`, `fem_fire_wardens`, `fem_emergency_contacts`, `fem_emergency_equipment`, `fem_emergency_incidents`, `fem_incident_decision_logs`, `fem_incident_resource_logs`, `fem_incident_communication_logs`, `fem_incident_timeline_events`, `fem_evacuation_drills`, `fem_business_continuity_plans`, `fem_bcp_exercises`
