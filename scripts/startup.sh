#!/bin/bash
set -euo pipefail
export DOCKER_HOST=unix:///var/run/docker.sock
export DOCKER_API_VERSION=1.44

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

# Source root .env for database credentials
if [ -f "$PROJECT_DIR/.env" ]; then
  set -a; source "$PROJECT_DIR/.env"; set +a
fi
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD not set — create .env from .env.example or run scripts/generate-secrets.sh}"

echo "=== IMS Startup Script ==="

# Step 1: Kill conflicting host services
echo "Stopping host services..."
sudo systemctl stop postgresql 2>/dev/null || true
sudo systemctl stop redis 2>/dev/null || true
for port in 5432 6379; do
  sudo fuser -k ${port}/tcp 2>/dev/null || true
done
sleep 3

# Step 2: Start infrastructure containers only (postgres + redis)
# App services run on the host via pnpm dev (see start-all-services.sh)
echo "Starting infrastructure containers..."
docker compose up -d postgres redis
sleep 5

# Step 3: Wait for postgres to be healthy (check host-accessible port, not just inside container)
echo "Waiting for postgres..."
for i in $(seq 1 30); do
  if PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U postgres -d ims -c "SELECT 1" >/dev/null 2>&1; then
    break
  fi
  echo "  waiting for port 5432... ($i/30)"
  sleep 3
done
PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U postgres -d ims -c "SELECT 1" >/dev/null 2>&1 || {
  echo "WARNING: postgres not reachable on localhost:5432 after 90s — trying container restart"
  docker compose restart postgres
  sleep 10
  until PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U postgres -d ims -c "SELECT 1" >/dev/null 2>&1; do
    sleep 3
  done
}
echo "Postgres ready!"

# Step 3b: Wait for Redis to be host-accessible
echo "Waiting for Redis..."
nc -z localhost 6379 >/dev/null 2>&1 || {
  echo "WARNING: Redis not reachable on localhost:6379 — trying container restart"
  docker compose restart redis
  sleep 5
  until nc -z localhost 6379 >/dev/null 2>&1; do sleep 2; done
}
echo "Redis ready!"

# Step 4: Ensure admin user exists
echo "Seeding admin user..."
HASH=$(cd "$PROJECT_DIR/apps/api-gateway" && node -e "const b=require('bcryptjs'); b.hash('admin123',12).then(h=>process.stdout.write(h))" 2>/dev/null) || HASH=""
if [ -z "$HASH" ]; then
  cd /tmp && npm install bcryptjs --silent 2>/dev/null || true
  HASH=$(node -e "const b=require('/tmp/node_modules/bcryptjs'); b.hash('admin123',12).then(h=>process.stdout.write(h))" 2>/dev/null) || HASH=""
  cd "$PROJECT_DIR"
fi
if [ -n "$HASH" ]; then
  PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U postgres -d ims -v ON_ERROR_STOP=0 -c "
ALTER TABLE users ADD COLUMN IF NOT EXISTS \"deletedAt\" TIMESTAMP(3);
ALTER TABLE users ADD COLUMN IF NOT EXISTS \"lastLoginAt\" TIMESTAMP(3);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS \"lastActivityAt\" TIMESTAMP(3);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS \"deletedAt\" TIMESTAMP(3);
INSERT INTO users (id, email, password, \"firstName\", \"lastName\", role, \"isActive\", \"createdAt\", \"updatedAt\")
VALUES ('cm6p7v0000001lc04citizen01', 'admin@ims.local', '$HASH', 'System', 'Admin', 'ADMIN', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET password = '$HASH';
" 2>/dev/null || true
else
  echo "WARNING: could not generate bcrypt hash — admin user may not be seeded"
fi

# Step 5: Ensure ALL domain tables exist (safe --from-empty, no DROPs)
echo "Checking domain tables..."
cd "$PROJECT_DIR"

# Core schema first
npx prisma@5.22.0 migrate diff --from-empty \
  --to-schema-datamodel packages/database/prisma/schema.prisma \
  --script 2>/dev/null | \
  PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U postgres -d ims -v ON_ERROR_STOP=0 >/dev/null 2>&1 || true

# All domain schemas
for schema in health-safety environment quality ai inventory hr payroll workflows \
  project-management automotive medical aerospace finance crm infosec esg cmms \
  portal food-safety energy analytics field-service iso42001 iso37001 platform \
  risk training suppliers assets documents complaints contracts ptw reg-monitor \
  incidents audits mgmt-review wizard partner-portal marketing chemicals emergency \
  marketplace; do
  schema_file="packages/database/prisma/schemas/${schema}.prisma"
  if [ -f "$schema_file" ]; then
    npx prisma@5.22.0 migrate diff --from-empty \
      --to-schema-datamodel "$schema_file" \
      --script 2>/dev/null | \
      PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U postgres -d ims -v ON_ERROR_STOP=0 >/dev/null 2>&1 || true
  fi
done

# Add commonly missing columns
PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U postgres -d ims -v ON_ERROR_STOP=0 -c "
ALTER TABLE hr_employees ADD COLUMN IF NOT EXISTS \"deletedAt\" TIMESTAMP(3);
ALTER TABLE hr_employees ADD COLUMN IF NOT EXISTS \"salary\" DECIMAL(12,2);
ALTER TABLE payroll_payslips ADD COLUMN IF NOT EXISTS \"deletedAt\" TIMESTAMP(3);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS \"orgId\" TEXT;
ALTER TABLE ai_systems ADD COLUMN IF NOT EXISTS \"reference\" TEXT;
ALTER TABLE ai_systems ADD COLUMN IF NOT EXISTS \"department\" TEXT;
ALTER TABLE ai_systems ADD COLUMN IF NOT EXISTS \"dataTypes\" TEXT;
ALTER TABLE ai_systems ADD COLUMN IF NOT EXISTS \"userBase\" TEXT;
ALTER TABLE ai_systems ADD COLUMN IF NOT EXISTS \"notes\" TEXT;
ALTER TABLE ai_systems ADD COLUMN IF NOT EXISTS \"updatedBy\" TEXT;
ALTER TABLE ai_systems ADD COLUMN IF NOT EXISTS \"deletedBy\" TEXT;
ALTER TABLE esg_reports ADD COLUMN IF NOT EXISTS \"referenceNumber\" TEXT;
ALTER TABLE esg_reports ADD COLUMN IF NOT EXISTS \"aiGenerated\" BOOLEAN DEFAULT false;
ALTER TABLE esg_reports ADD COLUMN IF NOT EXISTS \"generatedBy\" TEXT;
ALTER TABLE esg_reports ADD COLUMN IF NOT EXISTS \"orgId\" TEXT;
ALTER TABLE ab_risk_assessments ADD COLUMN IF NOT EXISTS \"referenceNumber\" TEXT;
ALTER TABLE ab_risk_assessments ADD COLUMN IF NOT EXISTS \"updatedBy\" TEXT;
ALTER TABLE ab_risk_assessments ADD COLUMN IF NOT EXISTS \"organisationId\" TEXT;
ALTER TABLE chem_sds ADD COLUMN IF NOT EXISTS \"updatedBy\" TEXT;
ALTER TABLE chem_sds ADD COLUMN IF NOT EXISTS \"deletedAt\" TIMESTAMP(3);
ALTER TABLE chem_sds ADD COLUMN IF NOT EXISTS \"deletedBy\" TEXT;
ALTER TABLE chem_coshh ADD COLUMN IF NOT EXISTS \"updatedBy\" TEXT;
ALTER TABLE chem_coshh ADD COLUMN IF NOT EXISTS \"deletedBy\" TEXT;
ALTER TABLE chem_coshh ADD COLUMN IF NOT EXISTS \"deletedAt\" TIMESTAMP(3);
ALTER TABLE chem_incompat_alerts ADD COLUMN IF NOT EXISTS \"createdBy\" TEXT;
ALTER TABLE chem_incompat_alerts ADD COLUMN IF NOT EXISTS \"updatedBy\" TEXT;
ALTER TABLE chem_incompat_alerts ADD COLUMN IF NOT EXISTS \"deletedAt\" TIMESTAMP(3);
ALTER TABLE chem_incompat_alerts ADD COLUMN IF NOT EXISTS \"deletedBy\" TEXT;
ALTER TABLE chem_incompat_alerts ADD COLUMN IF NOT EXISTS \"orgId\" TEXT;
ALTER TABLE chem_inventory ADD COLUMN IF NOT EXISTS \"createdBy\" TEXT;
ALTER TABLE chem_inventory ADD COLUMN IF NOT EXISTS \"updatedBy\" TEXT;
ALTER TABLE chem_inventory ADD COLUMN IF NOT EXISTS \"deletedBy\" TEXT;
ALTER TABLE chem_monitoring ADD COLUMN IF NOT EXISTS \"createdBy\" TEXT;
ALTER TABLE chem_monitoring ADD COLUMN IF NOT EXISTS \"updatedBy\" TEXT;
ALTER TABLE chem_monitoring ADD COLUMN IF NOT EXISTS \"deletedBy\" TEXT;
ALTER TABLE chem_disposal ADD COLUMN IF NOT EXISTS \"createdBy\" TEXT;
ALTER TABLE chem_disposal ADD COLUMN IF NOT EXISTS \"updatedBy\" TEXT;
ALTER TABLE chem_disposal ADD COLUMN IF NOT EXISTS \"deletedBy\" TEXT;
ALTER TABLE chem_incidents ADD COLUMN IF NOT EXISTS \"createdBy\" TEXT;
ALTER TABLE chem_incidents ADD COLUMN IF NOT EXISTS \"updatedBy\" TEXT;
ALTER TABLE chem_incidents ADD COLUMN IF NOT EXISTS \"deletedBy\" TEXT;
ALTER TABLE chem_health_surveillance ADD COLUMN IF NOT EXISTS \"createdBy\" TEXT;
ALTER TABLE chem_health_surveillance ADD COLUMN IF NOT EXISTS \"updatedBy\" TEXT;
ALTER TABLE chem_health_surveillance ADD COLUMN IF NOT EXISTS \"deletedBy\" TEXT;
ALTER TABLE chem_usage ADD COLUMN IF NOT EXISTS \"createdBy\" TEXT;
ALTER TABLE chem_usage ADD COLUMN IF NOT EXISTS \"updatedBy\" TEXT;
ALTER TABLE chem_usage ADD COLUMN IF NOT EXISTS \"deletedBy\" TEXT;
ALTER TABLE chem_fumigations ADD COLUMN IF NOT EXISTS \"createdBy\" TEXT;
ALTER TABLE chem_fumigations ADD COLUMN IF NOT EXISTS \"updatedBy\" TEXT;
ALTER TABLE chem_fumigations ADD COLUMN IF NOT EXISTS \"deletedBy\" TEXT;
ALTER TABLE chem_biological_monitoring ADD COLUMN IF NOT EXISTS \"createdBy\" TEXT;
ALTER TABLE chem_biological_monitoring ADD COLUMN IF NOT EXISTS \"updatedBy\" TEXT;
ALTER TABLE chem_biological_monitoring ADD COLUMN IF NOT EXISTS \"deletedBy\" TEXT;
ALTER TABLE chem_registers ADD COLUMN IF NOT EXISTS \"updatedBy\" TEXT;
ALTER TABLE chem_registers ADD COLUMN IF NOT EXISTS \"deletedBy\" TEXT;
ALTER TABLE fem_assembly_points ADD COLUMN IF NOT EXISTS \"createdBy\" TEXT;
ALTER TABLE fem_assembly_points ADD COLUMN IF NOT EXISTS \"updatedBy\" TEXT;
ALTER TABLE fem_assembly_points ADD COLUMN IF NOT EXISTS \"deletedBy\" TEXT;
ALTER TABLE fem_assembly_points ADD COLUMN IF NOT EXISTS \"deletedAt\" TIMESTAMP(3);
ALTER TABLE fem_assembly_points ADD COLUMN IF NOT EXISTS \"orgId\" TEXT;
ALTER TABLE fem_emergency_contacts ADD COLUMN IF NOT EXISTS \"createdBy\" TEXT;
ALTER TABLE fem_emergency_contacts ADD COLUMN IF NOT EXISTS \"updatedBy\" TEXT;
ALTER TABLE fem_emergency_contacts ADD COLUMN IF NOT EXISTS \"deletedBy\" TEXT;
ALTER TABLE fem_emergency_equipment ADD COLUMN IF NOT EXISTS \"updatedBy\" TEXT;
ALTER TABLE fem_emergency_equipment ADD COLUMN IF NOT EXISTS \"deletedBy\" TEXT;
ALTER TABLE fem_premises ADD COLUMN IF NOT EXISTS \"updatedBy\" TEXT;
ALTER TABLE fem_premises ADD COLUMN IF NOT EXISTS \"deletedBy\" TEXT;
ALTER TABLE fem_premises ADD COLUMN IF NOT EXISTS \"orgId\" TEXT;
ALTER TABLE config_items ADD COLUMN IF NOT EXISTS \"deletedAt\" TIMESTAMP(3);
ALTER TABLE config_items ADD COLUMN IF NOT EXISTS \"updatedBy\" TEXT;
ALTER TABLE config_items ADD COLUMN IF NOT EXISTS \"deletedBy\" TEXT;
ALTER TABLE config_items ADD COLUMN IF NOT EXISTS \"createdBy\" TEXT;
ALTER TABLE config_items ADD COLUMN IF NOT EXISTS \"orgId\" TEXT;
ALTER TABLE aero_manufacturing_changes ADD COLUMN IF NOT EXISTS \"createdBy\" TEXT;
ALTER TABLE aero_manufacturing_changes ADD COLUMN IF NOT EXISTS \"orgId\" TEXT;
ALTER TABLE aero_nadcap_scopes ADD COLUMN IF NOT EXISTS \"createdBy\" TEXT;
ALTER TABLE aero_nadcap_scopes ADD COLUMN IF NOT EXISTS \"orgId\" TEXT;
ALTER TABLE aero_product_risks ADD COLUMN IF NOT EXISTS \"createdBy\" TEXT;
ALTER TABLE aero_product_risks ADD COLUMN IF NOT EXISTS \"orgId\" TEXT;
ALTER TABLE aero_requalification_triggers ADD COLUMN IF NOT EXISTS \"createdBy\" TEXT;
ALTER TABLE aero_requalification_triggers ADD COLUMN IF NOT EXISTS \"orgId\" TEXT;
" 2>/dev/null || true

TABLE_COUNT=$(PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U postgres -d ims -t -c \
  "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public';" 2>/dev/null | tr -d ' ')
echo "Database ready: $TABLE_COUNT tables"

# Step 6: Start all services
echo "Starting all services..."
./scripts/stop-all-services.sh 2>/dev/null || true
sleep 2
./scripts/start-all-services.sh

# Step 7: Wait for services to start
echo "Waiting for services to start..."
sleep 30

# Step 8: Verify
echo ""
echo "=== Verification ==="

# Flush rate limiter to ensure clean login
docker exec ims-redis redis-cli -a "$REDIS_PASSWORD" FLUSHALL >/dev/null 2>&1 || true
sleep 2

TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ims.local","password":"admin123"}' | \
  node -e "process.stdin.on('data',d=>{try{console.log(JSON.parse(d).data.accessToken)}catch(e){}})" 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "undefined" ]; then
  echo "WARNING: Login failed — check gateway logs"
else
  echo "Login: OK"

  # Skip setup wizard so dashboard loads directly after login
  WIZARD_STATUS=$(curl -s "http://localhost:4000/api/wizard/status" \
    -H "Authorization: Bearer $TOKEN" | \
    node -e "process.stdin.on('data',d=>{try{const p=JSON.parse(d);console.log(p.data.exists?p.data.status:'NONE')}catch(e){console.log('ERROR')}})" 2>/dev/null)
  if [ "$WIZARD_STATUS" = "NONE" ] || [ "$WIZARD_STATUS" = "ERROR" ]; then
    curl -s -X POST "http://localhost:4000/api/wizard/skip" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" >/dev/null 2>&1 && echo "Setup wizard: skipped (dashboard will load directly)" || echo "WARNING: Could not skip wizard"
  else
    echo "Setup wizard: $WIZARD_STATUS"
  fi
  OK=0; FAIL=0
  for path in health-safety/risks environment/aspects quality/documents \
    hr/employees payroll/payslips inventory/inventory \
    workflows/definitions project-management/projects \
    automotive/ppap medical/complaints aerospace/audits \
    finance/budgets crm/contacts infosec/assets \
    esg/reports cmms/assets food-safety/allergens \
    energy/meters analytics/dashboards field-service/jobs \
    iso42001/ai-systems iso37001/risk-assessments \
    risk/risks training/courses suppliers/suppliers \
    assets/assets documents/documents complaints/complaints \
    contracts/contracts ptw/permits reg-monitor/changes \
    incidents/incidents audits/audits mgmt-review/reviews \
    chemicals/chemicals emergency/equipment \
    marketplace/plugins; do
    CODE=$(curl -s -o /dev/null -w "%{http_code}" \
      "http://localhost:4000/api/$path" \
      -H "Authorization: Bearer $TOKEN")
    if [ "$CODE" = "200" ]; then
      OK=$((OK+1))
    else
      echo "  FAIL: /api/$path ($CODE)"
      FAIL=$((FAIL+1))
    fi
  done
  echo "Services: $OK OK, $FAIL failed (of 35 tested)"
fi

echo ""
echo "=== System Ready ==="
echo "Dashboard:       http://localhost:3000"
echo "API Gateway:     http://localhost:4000"
echo "Login:           admin@ims.local / admin123"
echo ""
echo "Check status:    ./scripts/check-services.sh"
echo "Stop all:        ./scripts/stop-all-services.sh"
