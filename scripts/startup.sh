#!/bin/bash
set -e
export DOCKER_API_VERSION=1.41

echo "=== IMS Startup Script ==="

# Step 1: Kill conflicting host services
echo "Stopping host services..."
sudo systemctl stop postgresql 2>/dev/null || true
sudo systemctl stop redis 2>/dev/null || true
for port in 5432 6379 4000 4001 4002 4003 3000 3001 3002 3003 3004 3005 3006 3007; do
  sudo fuser -k ${port}/tcp 2>/dev/null || true
done
sleep 3

# Step 2: Start all containers
echo "Starting containers..."
cd ~/New-BMS
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
HASH=$(node -e "const b=require('/tmp/node_modules/bcryptjs'); b.hash('admin123',12).then(h=>console.log(h))" 2>/dev/null)
if [ -z "$HASH" ]; then
  cd /tmp && npm install bcryptjs --silent
  HASH=$(node -e "const b=require('/tmp/node_modules/bcryptjs'); b.hash('admin123',12).then(h=>console.log(h))")
fi

docker exec ims-postgres psql -U postgres -d ims -c "
ALTER TABLE users ADD COLUMN IF NOT EXISTS \"deletedAt\" TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS \"lastLoginAt\" TIMESTAMP;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS \"lastActivityAt\" TIMESTAMP;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS \"deletedAt\" TIMESTAMP;
INSERT INTO users (id, email, password, \"firstName\", \"lastName\", role, \"isActive\", \"createdAt\", \"updatedAt\")
VALUES ('cluser001admin000000000000', 'admin@ims.local', '$HASH', 'Admin', 'User', 'ADMIN', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
" 2>/dev/null

# Step 5: Ensure HS tables exist
echo "Checking health-safety tables..."
TABLE_COUNT=$(docker exec ims-postgres psql -U postgres -d ims -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'hs_%';" | tr -d ' ')

if [ "$TABLE_COUNT" -lt "13" ]; then
  echo "Recreating health-safety tables..."
  cd ~/New-BMS/packages/database
  HEALTH_SAFETY_DATABASE_URL="postgresql://postgres:ims_secure_password_2026@localhost:5432/ims" \
    node_modules/.bin/prisma migrate diff \
    --from-empty \
    --to-schema-datamodel prisma/schemas/health-safety.prisma \
    --script 2>/dev/null | \
    docker exec -i ims-postgres psql -U postgres -d ims >/dev/null 2>&1

  # Add missing columns
  docker exec ims-postgres psql -U postgres -d ims -c "
  ALTER TYPE \"ComplianceStatus\" ADD VALUE IF NOT EXISTS 'NOT_ASSESSED';
  ALTER TABLE hs_legal_requirements ADD COLUMN IF NOT EXISTS \"legislationRef\" TEXT;
  ALTER TABLE hs_legal_requirements ADD COLUMN IF NOT EXISTS \"section\" TEXT;
  ALTER TABLE hs_legal_requirements ADD COLUMN IF NOT EXISTS \"applicableAreas\" TEXT;
  ALTER TABLE hs_legal_requirements ADD COLUMN IF NOT EXISTS \"lastReviewedAt\" TIMESTAMP;
  ALTER TABLE hs_legal_requirements ADD COLUMN IF NOT EXISTS \"responsiblePerson\" TEXT;
  ALTER TABLE hs_legal_requirements ADD COLUMN IF NOT EXISTS \"aiKeyObligations\" TEXT;
  ALTER TABLE hs_legal_requirements ADD COLUMN IF NOT EXISTS \"aiGapAnalysis\" TEXT;
  ALTER TABLE hs_legal_requirements ADD COLUMN IF NOT EXISTS \"aiRequiredActions\" TEXT;
  ALTER TABLE hs_legal_requirements ADD COLUMN IF NOT EXISTS \"aiEvidenceRequired\" TEXT;
  ALTER TABLE hs_legal_requirements ADD COLUMN IF NOT EXISTS \"aiPenaltyForNonCompliance\" TEXT;
  ALTER TABLE hs_legal_requirements ADD COLUMN IF NOT EXISTS \"aiAssessmentGenerated\" BOOLEAN DEFAULT false;
  ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS \"objectiveStatement\" TEXT;
  ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS \"ohsPolicyLink\" TEXT;
  ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS \"owner\" TEXT;
  ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS \"startDate\" TIMESTAMP;
  ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS \"completedDate\" TIMESTAMP;
  ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS \"kpiDescription\" TEXT;
  ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS \"progressPercent\" DOUBLE PRECISION DEFAULT 0;
  ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS \"monitoringFrequency\" TEXT;
  ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS \"resourcesRequired\" TEXT;
  ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS \"progressNotes\" TEXT;
  ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS \"aiGenerated\" BOOLEAN DEFAULT false;
  ALTER TABLE hs_ohs_objectives ADD COLUMN IF NOT EXISTS \"aiRecommendations\" TEXT;
  " 2>/dev/null
fi

# Step 6: Verify
echo ""
echo "=== Verification ==="
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ims.local","password":"admin123"}' | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['accessToken'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "Login failed"
  exit 1
fi

for endpoint in risks incidents legal objectives capa; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    http://localhost:4000/api/health-safety/$endpoint \
    -H "Authorization: Bearer $TOKEN" \
    -H "Origin: http://localhost:3001")
  if [ "$CODE" = "200" ]; then
    echo "  $endpoint: $CODE OK"
  else
    echo "  $endpoint: $CODE FAIL"
  fi
done

echo ""
echo "=== System Ready ==="
echo "Dashboard:      http://localhost:3000"
echo "Health & Safety: http://localhost:3001"
echo "Login:          admin@ims.local / admin123"
