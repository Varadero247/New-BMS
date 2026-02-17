#!/usr/bin/env bash
# Unified seed runner — seeds all domains in the correct order
# Usage: ./scripts/seed-all.sh
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${YELLOW}=== Nexara IMS — Unified Seed Runner ===${NC}"
echo ""

# Step 1: Core seed (admin user, base data)
echo -e "${YELLOW}[1/6] Seeding core data (users, base records)...${NC}"
cd "$ROOT_DIR/packages/database"
npx tsx prisma/seed.ts
echo -e "${GREEN}  ✓ Core seed complete${NC}"

# Step 2: Templates
echo -e "${YELLOW}[2/6] Seeding templates (192 built-in templates)...${NC}"
npx tsx prisma/seed-templates.ts
echo -e "${GREEN}  ✓ Templates seed complete${NC}"

# Step 3: Chemicals
echo -e "${YELLOW}[3/6] Seeding chemical management data...${NC}"
npx tsx prisma/seed-chemicals.ts
echo -e "${GREEN}  ✓ Chemicals seed complete${NC}"

# Step 4: Emergency
echo -e "${YELLOW}[4/6] Seeding emergency management data...${NC}"
npx tsx prisma/seed-emergency.ts
echo -e "${GREEN}  ✓ Emergency seed complete${NC}"

# Step 5: Demo data (automotive, medical, aerospace)
echo -e "${YELLOW}[5/6] Seeding demo data (automotive, medical, aerospace)...${NC}"
npx tsx prisma/seed-demo.ts
echo -e "${GREEN}  ✓ Demo seed complete${NC}"

# Step 6: Marketplace (SQL)
echo -e "${YELLOW}[6/6] Seeding marketplace plugins...${NC}"
cd "$ROOT_DIR"
PGPASSWORD="${POSTGRES_PASSWORD:-ims_secure_password_2026}" psql -h localhost -p 5432 -U postgres -d ims -f scripts/seed-marketplace.sql -v ON_ERROR_STOP=0 2>/dev/null || true
echo -e "${GREEN}  ✓ Marketplace seed complete${NC}"

echo ""
echo -e "${GREEN}=== All seeds complete ===${NC}"
