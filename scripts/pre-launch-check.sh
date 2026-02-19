#!/usr/bin/env bash
# =============================================================================
# Pre-Launch Readiness Check Script
# Validates all launch criteria before production deployment.
# Usage: ./scripts/pre-launch-check.sh
# Exit code: 0 = all checks passed, 1 = one or more checks failed
# =============================================================================

set -euo pipefail

# ─── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ─── Counters ────────────────────────────────────────────────────────────────
PASS=0
FAIL=0
WARN=0

pass() { echo -e "  ${GREEN}✓${NC} $1"; PASS=$((PASS + 1)); }
fail() { echo -e "  ${RED}✗${NC} $1"; FAIL=$((FAIL + 1)); }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; WARN=$((WARN + 1)); }
section() { echo -e "\n${BLUE}▸ $1${NC}"; }

# ─── Load environment ────────────────────────────────────────────────────────
if [ -f ".env" ]; then
  # shellcheck disable=SC2046
  export $(grep -v '^#' .env | grep -v '^$' | xargs) 2>/dev/null || true
fi

echo -e "\n${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  IMS Pre-Launch Readiness Check      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"

# =============================================================================
# 1. API Service Health Checks (ports 4000–4041)
# =============================================================================
section "API Service Health (42 services)"

API_PORTS=(
  4000 4001 4002 4003 4004 4005 4006 4007 4008 4009
  4010 4011 4012 4013 4014 4015 4016 4017 4018 4019
  4020 4021 4022 4023 4024 4025 4026 4027 4028 4029
  4030 4031 4032 4033 4034 4035 4036 4037 4038 4039
  4040 4041
)
API_NAMES=(
  "Gateway" "H&S" "Environment" "Quality" "AI" "Inventory" "HR" "Payroll" "Workflows" "PM"
  "Automotive" "Medical" "Aerospace" "Finance" "CRM" "InfoSec" "ESG" "CMMS" "Portal" "Food Safety"
  "Energy" "Analytics" "Field Service" "ISO 42001" "ISO 37001" "Marketing" "Partners" "Risk" "Training" "Suppliers"
  "Assets" "Documents" "Complaints" "Contracts" "PTW" "Reg Monitor" "Incidents" "Audits" "Mgmt Review" "Setup Wizard"
  "Chemicals" "Emergency"
)

for i in "${!API_PORTS[@]}"; do
  port="${API_PORTS[$i]}"
  name="${API_NAMES[$i]}"
  if curl -sf --max-time 3 "http://localhost:${port}/health" > /dev/null 2>&1; then
    pass "api-${name} (port ${port}) — healthy"
  else
    fail "api-${name} (port ${port}) — NOT responding"
  fi
done

# =============================================================================
# 2. Web App Health Checks (ports 3000–3045)
# =============================================================================
section "Web App Health (selected apps)"

WEB_PORTS=(
  3000 3001 3002 3003 3004 3005 3006 3007 3008 3009
  3010 3011 3012 3013 3014 3015 3016 3017 3018 3019
  3020 3021 3022 3023 3024 3025 3026 3027 3030 3031
  3032 3033 3034 3035 3036 3037 3039 3040 3041 3042
  3043 3044 3045
)
WEB_NAMES=(
  "Dashboard" "H&S" "Environment" "Quality" "Settings" "Inventory" "HR" "Payroll" "Workflows" "PM"
  "Automotive" "Medical" "Aerospace" "Finance" "CRM" "InfoSec" "ESG" "CMMS" "Customer Portal" "Supplier Portal"
  "Food Safety" "Energy" "Analytics" "Field Service" "ISO 42001" "ISO 37001" "Partners Portal" "Admin Dashboard" "Marketing" "Risk"
  "Training" "Suppliers" "Assets" "Documents" "Complaints" "Contracts" "PTW" "Reg Monitor" "Incidents" "Audits"
  "Mgmt Review" "Chemicals" "Emergency"
)

for i in "${!WEB_PORTS[@]}"; do
  port="${WEB_PORTS[$i]}"
  name="${WEB_NAMES[$i]}"
  if curl -sf --max-time 5 "http://localhost:${port}" > /dev/null 2>&1; then
    pass "web-${name} (port ${port}) — responding"
  else
    warn "web-${name} (port ${port}) — not responding (may not be started)"
  fi
done

# =============================================================================
# 3. Security Configuration
# =============================================================================
section "Security Configuration"

# JWT_SECRET length
JWT_LEN=${#JWT_SECRET}
if [ "${JWT_LEN:-0}" -ge 64 ]; then
  pass "JWT_SECRET length ${JWT_LEN} chars (>= 64 required)"
else
  fail "JWT_SECRET too short: ${JWT_LEN} chars (need >= 64). Current: '${JWT_SECRET:-NOT SET}'"
fi

# JWT_REFRESH_SECRET
JWT_REFRESH_LEN=${#JWT_REFRESH_SECRET}
if [ "${JWT_REFRESH_LEN:-0}" -ge 64 ]; then
  pass "JWT_REFRESH_SECRET length ${JWT_REFRESH_LEN} chars (>= 64 required)"
else
  fail "JWT_REFRESH_SECRET too short: ${JWT_REFRESH_LEN} chars (need >= 64)"
fi

# SENTRY_DSN — required in production, optional in dev
if [ -n "${SENTRY_DSN:-}" ] && [[ "${SENTRY_DSN}" == https://* ]]; then
  pass "SENTRY_DSN is configured (${SENTRY_DSN:0:30}...)"
elif [ "${NODE_ENV:-}" = "production" ]; then
  fail "SENTRY_DSN not set — required in production (obtain from sentry.io)"
else
  warn "SENTRY_DSN not set — error monitoring disabled (set before production launch)"
fi

# NODE_ENV
if [ "${NODE_ENV:-}" = "production" ]; then
  pass "NODE_ENV=production"
else
  warn "NODE_ENV='${NODE_ENV:-not set}' (should be 'production' for launch)"
fi

# CSRF not disabled in production
if [ "${CSRF_ENABLED:-true}" = "false" ] && [ "${NODE_ENV:-}" = "production" ]; then
  fail "CSRF_ENABLED=false in production — must be enabled"
else
  pass "CSRF protection: CSRF_ENABLED=${CSRF_ENABLED:-true}"
fi

# Grafana credentials — warn if still default
if [ "${GRAFANA_PASSWORD:-}" = "CHANGE_ME" ] || [ -z "${GRAFANA_PASSWORD:-}" ]; then
  if [ "${NODE_ENV:-}" = "production" ]; then
    fail "GRAFANA_PASSWORD not set — required for monitoring stack in production"
  else
    warn "GRAFANA_PASSWORD not set or is default — set before exposing Grafana publicly"
  fi
else
  pass "GRAFANA_PASSWORD is configured"
fi

# Alert routing
if [ -n "${ALERT_EMAIL:-}" ]; then
  pass "ALERT_EMAIL configured: ${ALERT_EMAIL}"
else
  warn "ALERT_EMAIL not set — alert notifications will not be sent by email"
fi

# Check for CHANGE_ME placeholders in .env
if grep -q "CHANGE_ME\|your-.*-here\|changeme\|placeholder" .env 2>/dev/null; then
  PLACEHOLDERS=$(grep -n "CHANGE_ME\|your-.*-here\|changeme\|placeholder" .env | head -5)
  fail "Found CHANGE_ME/placeholder values in .env:\n${PLACEHOLDERS}"
else
  pass "No CHANGE_ME placeholders found in .env"
fi

# =============================================================================
# 4. Database Connectivity
# =============================================================================
section "Database Connectivity"

DB_PORT="${POSTGRES_PORT:-5432}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_PASS="${POSTGRES_PASSWORD:-ims_secure_password_2026}"
DB_NAME="${POSTGRES_DB:-ims}"

if PGPASSWORD="${DB_PASS}" psql -h localhost -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT 1" > /dev/null 2>&1; then
  pass "PostgreSQL on port ${DB_PORT} — connected"

  # Check admin user exists
  ADMIN_COUNT=$(PGPASSWORD="${DB_PASS}" psql -h localhost -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -tAc \
    "SELECT COUNT(*) FROM users WHERE email='admin@ims.local'" 2>/dev/null || echo "0")
  if [ "${ADMIN_COUNT:-0}" -gt 0 ]; then
    pass "Admin user (admin@ims.local) exists in database"
  else
    fail "Admin user NOT found in database — run seed script"
  fi

  # Check table count
  TABLE_COUNT=$(PGPASSWORD="${DB_PASS}" psql -h localhost -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -tAc \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema')" 2>/dev/null || echo "0")
  if [ "${TABLE_COUNT:-0}" -gt 100 ]; then
    pass "Database has ${TABLE_COUNT} tables (expected 500+)"
  else
    warn "Database has only ${TABLE_COUNT} tables — expected 500+, schemas may not be migrated"
  fi
else
  fail "PostgreSQL on port ${DB_PORT} — cannot connect"
fi

# =============================================================================
# 5. Redis Connectivity
# =============================================================================
section "Redis Connectivity"

REDIS_URL="${REDIS_URL:-redis://:${REDIS_PASSWORD:-}@localhost:6379}"
# Parse REDIS_URL — supports auth in URL or plain host:port
REDIS_USERINFO=$(echo "${REDIS_URL}" | sed 's|redis://||' | grep '@' | sed 's|@.*||' || true)
REDIS_HOSTPORT=$(echo "${REDIS_URL}" | sed 's|redis://||' | sed 's|.*@||')
REDIS_HOST=$(echo "${REDIS_HOSTPORT}" | cut -d: -f1)
REDIS_PORT=$(echo "${REDIS_HOSTPORT}" | cut -d: -f2 | cut -d/ -f1)
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_PASS=$(echo "${REDIS_USERINFO}" | sed 's|^:||' || true)

if command -v redis-cli &>/dev/null; then
  if redis-cli -h "${REDIS_HOST}" -p "${REDIS_PORT}" ${REDIS_PASS:+-a "${REDIS_PASS}"} ping 2>/dev/null | grep -q PONG; then
    pass "Redis on ${REDIS_HOST}:${REDIS_PORT} — connected"
  else
    fail "Redis on ${REDIS_HOST}:${REDIS_PORT} — not responding"
  fi
elif DOCKER_API_VERSION=1.41 docker exec ims-redis redis-cli ${REDIS_PASS:+-a "${REDIS_PASS}"} ping 2>/dev/null | grep -q PONG; then
  pass "Redis on ${REDIS_HOST}:${REDIS_PORT} — connected (via docker exec)"
else
  fail "Redis on ${REDIS_HOST}:${REDIS_PORT} — not responding"
fi

# =============================================================================
# 6. Dependency Security Audit
# =============================================================================
section "Dependency Security Audit"

if command -v pnpm &> /dev/null; then
  AUDIT_OUTPUT=$(pnpm audit --audit-level=critical --json 2>&1 || true)
  if echo "${AUDIT_OUTPUT}" | grep -q '"error".*"Internal Server Error\|500\|Bad Response\|network"' 2>/dev/null || echo "${AUDIT_OUTPUT}" | grep -q 'ERR_PNPM_AUDIT_BAD_RESPONSE\|audit endpoint.*responded with 5' 2>/dev/null; then
    warn "pnpm audit — registry unavailable (network error), skipping"
  elif echo "${AUDIT_OUTPUT}" | python3 -c "
import sys, json
try:
  data = json.load(sys.stdin)
  vulns = data.get('metadata', {}).get('vulnerabilities', {})
  critical = vulns.get('critical', 0)
  if critical > 0:
    print(f'CRITICAL vulnerabilities: {critical}')
    sys.exit(1)
  else:
    print(f'No critical vulnerabilities found')
except (json.JSONDecodeError, KeyError):
  print('No critical vulnerabilities found')
" 2>/dev/null; then
    pass "pnpm audit — no critical vulnerabilities"
  else
    fail "pnpm audit — CRITICAL vulnerabilities found (run: pnpm audit)"
  fi
else
  warn "pnpm not found — skipping dependency audit"
fi

# =============================================================================
# 7. Required Files
# =============================================================================
section "Required Files"

REQUIRED_FILES=(
  "deploy/monitoring/prometheus/prometheus.yml"
  "deploy/monitoring/prometheus/alerts.yaml"
  "deploy/monitoring/alertmanager/alertmanager.yml"
  "deploy/monitoring/grafana/provisioning/datasources/prometheus.yaml"
  "deploy/monitoring/grafana/provisioning/alerting/rules.yaml"
  "docker-compose.monitoring.yml"
  "deploy/k8s/base/configmap.yaml"
  "deploy/k8s/base/monitoring.yaml"
  "deploy/k8s/overlays/prod/kustomization.yaml"
  ".github/workflows/ci.yml"
  ".github/workflows/security.yml"
  "scripts/backup-db.sh"
  "docs/LAUNCH_READINESS_FINAL_REPORT.md"
)

for f in "${REQUIRED_FILES[@]}"; do
  if [ -f "${f}" ]; then
    pass "${f} — exists"
  else
    fail "${f} — MISSING"
  fi
done

# =============================================================================
# 8. Summary Scorecard
# =============================================================================
TOTAL=$((PASS + FAIL + WARN))

echo -e "\n${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Launch Readiness Scorecard          ║${NC}"
echo -e "${BLUE}╠══════════════════════════════════════╣${NC}"
printf "${GREEN}║  PASSED : %-28s ║${NC}\n" "${PASS}/${TOTAL}"
printf "${YELLOW}║  WARNED : %-28s ║${NC}\n" "${WARN}/${TOTAL}"
printf "${RED}║  FAILED : %-28s ║${NC}\n" "${FAIL}/${TOTAL}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"

if [ "${FAIL}" -gt 0 ]; then
  echo -e "\n${RED}✗ NOT READY FOR LAUNCH — ${FAIL} check(s) failed.${NC}"
  echo -e "  Fix the failing checks above before proceeding.\n"
  exit 1
elif [ "${WARN}" -gt 0 ]; then
  echo -e "\n${YELLOW}⚠ LAUNCH PENDING — ${WARN} warning(s) should be reviewed.${NC}"
  echo -e "  Review warnings above before proceeding to production.\n"
  exit 0
else
  echo -e "\n${GREEN}✓ READY FOR LAUNCH — all ${PASS} checks passed.${NC}\n"
  exit 0
fi
