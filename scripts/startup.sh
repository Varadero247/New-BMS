#!/bin/bash
set -e
export DOCKER_API_VERSION=1.41

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

# Step 2: Start all containers
echo "Starting containers..."
docker compose up -d
sleep 30

# Step 3: Wait for postgres to be healthy
echo "Waiting for postgres..."
until docker exec ims-postgres psql -U postgres -d ims -c "SELECT 1" >/dev/null 2>&1; do
  sleep 2
done
echo "Postgres ready!"

# Step 4: Ensure admin user exists
echo "Seeding admin user..."
HASH=$(cd "$PROJECT_DIR/apps/api-gateway" && node -e "const b=require('bcryptjs'); b.hash('admin123',12).then(h=>console.log(h))" 2>/dev/null)
if [ -z "$HASH" ]; then
  cd /tmp && npm install bcryptjs --silent 2>/dev/null
  HASH=$(node -e "const b=require('/tmp/node_modules/bcryptjs'); b.hash('admin123',12).then(h=>console.log(h))")
fi

PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U postgres -d ims -v ON_ERROR_STOP=0 -c "
ALTER TABLE users ADD COLUMN IF NOT EXISTS \"deletedAt\" TIMESTAMP(3);
ALTER TABLE users ADD COLUMN IF NOT EXISTS \"lastLoginAt\" TIMESTAMP(3);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS \"lastActivityAt\" TIMESTAMP(3);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS \"deletedAt\" TIMESTAMP(3);
INSERT INTO users (id, email, password, \"firstName\", \"lastName\", role, \"isActive\", \"createdAt\", \"updatedAt\")
VALUES ('cm6p7v0000001lc04citizen01', 'admin@ims.local', '$HASH', 'System', 'Admin', 'ADMIN', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET password = '$HASH';
" 2>/dev/null

# Step 5: Ensure ALL domain tables exist (safe --from-empty, no DROPs)
echo "Checking domain tables..."
cd "$PROJECT_DIR"

# Core schema first
npx prisma@5.22.0 migrate diff --from-empty \
  --to-schema-datamodel packages/database/prisma/schema.prisma \
  --script 2>/dev/null | \
  PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U postgres -d ims -v ON_ERROR_STOP=0 >/dev/null 2>&1

# All domain schemas
for schema in health-safety environment quality ai inventory hr payroll workflows \
  project-management automotive medical aerospace finance crm infosec esg cmms \
  portal food-safety energy analytics field-service iso42001 iso37001 platform; do
  schema_file="packages/database/prisma/schemas/${schema}.prisma"
  if [ -f "$schema_file" ]; then
    npx prisma@5.22.0 migrate diff --from-empty \
      --to-schema-datamodel "$schema_file" \
      --script 2>/dev/null | \
      PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U postgres -d ims -v ON_ERROR_STOP=0 >/dev/null 2>&1
  fi
done

# Add commonly missing columns
PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U postgres -d ims -v ON_ERROR_STOP=0 -c "
ALTER TABLE hr_employees ADD COLUMN IF NOT EXISTS \"deletedAt\" TIMESTAMP(3);
ALTER TABLE hr_employees ADD COLUMN IF NOT EXISTS \"salary\" DECIMAL(12,2);
ALTER TABLE payroll_payslips ADD COLUMN IF NOT EXISTS \"deletedAt\" TIMESTAMP(3);
" 2>/dev/null

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
docker exec ims-redis redis-cli FLUSHALL >/dev/null 2>&1 || true
sleep 2

TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ims.local","password":"admin123"}' | \
  node -e "process.stdin.on('data',d=>{try{console.log(JSON.parse(d).data.accessToken)}catch(e){}})" 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "undefined" ]; then
  echo "WARNING: Login failed — check gateway logs"
else
  echo "Login: OK"
  OK=0; FAIL=0
  for path in health-safety/risks environment/aspects quality/documents \
    hr/employees payroll/payslips inventory/inventory \
    workflows/definitions project-management/projects \
    automotive/ppap medical/complaints aerospace/audits \
    finance/budgets crm/contacts infosec/assets \
    esg/reports cmms/assets food-safety/allergens \
    energy/meters analytics/dashboards field-service/jobs \
    iso42001/ai-systems iso37001/risk-assessments; do
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
  echo "Services: $OK OK, $FAIL failed (of 22 tested)"
fi

echo ""
echo "=== System Ready ==="
echo "Dashboard:       http://localhost:3000"
echo "API Gateway:     http://localhost:4000"
echo "Login:           admin@ims.local / admin123"
echo ""
echo "Check status:    ./scripts/check-services.sh"
echo "Stop all:        ./scripts/stop-all-services.sh"
