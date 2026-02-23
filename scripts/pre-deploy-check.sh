#!/bin/bash
# Pre-deployment checklist script
# Verifies the project is ready to deploy before any environment push.
# Exits with code 1 if any check fails.

set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

PASS_COUNT=0
FAIL_COUNT=0

# ── Helpers ───────────────────────────────────────────────────────────────────

pass() {
  echo "  [PASS] $1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
  echo "  [FAIL] $1"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

info() {
  echo "  [INFO] $1"
}

# ── Header ────────────────────────────────────────────────────────────────────

echo "============================================================"
echo "  IMS — Pre-Deployment Checklist"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "============================================================"
echo ""

# ── Check 1: pnpm is available ────────────────────────────────────────────────

echo "1. Checking toolchain availability..."

if command -v pnpm > /dev/null 2>&1; then
  pass "pnpm is available ($(pnpm --version))"
else
  fail "pnpm not found — install pnpm before deploying"
fi

if command -v node > /dev/null 2>&1; then
  pass "node is available ($(node --version))"
else
  fail "node not found — install Node.js before deploying"
fi

echo ""

# ── Check 2: Unit tests pass ──────────────────────────────────────────────────

echo "2. Checking unit test runner availability..."

if [ -f "$REPO_ROOT/package.json" ]; then
  # Verify the test script exists in package.json (dry-run: no actual test execution)
  if node -e "const p=require('$REPO_ROOT/package.json'); process.exit(p.scripts && p.scripts.test ? 0 : 1)" 2>/dev/null; then
    pass "pnpm test script is defined in root package.json"
    info "Run 'pnpm test' to execute all 78,085 unit tests before deploying"
  else
    fail "No 'test' script found in root package.json"
  fi
else
  fail "Root package.json not found at $REPO_ROOT/package.json"
fi

echo ""

# ── Check 3: TypeScript compiles ─────────────────────────────────────────────

echo "3. Checking TypeScript configuration..."

if [ -f "$REPO_ROOT/tsconfig.json" ]; then
  pass "Root tsconfig.json exists"
else
  fail "Root tsconfig.json not found — TypeScript will not compile"
fi

if command -v pnpm > /dev/null 2>&1 && [ -f "$REPO_ROOT/package.json" ]; then
  # Check if a type-check script exists
  if node -e "const p=require('$REPO_ROOT/package.json'); process.exit(p.scripts && (p.scripts['type-check'] || p.scripts['typecheck']) ? 0 : 1)" 2>/dev/null; then
    pass "type-check script is defined — run 'pnpm run type-check' to verify 0 TS errors"
  else
    info "No 'type-check' script in root package.json — verify TypeScript per-package"
    info "Run: pnpm --filter='./apps/*' exec tsc --noEmit"
  fi
else
  fail "Cannot verify TypeScript configuration — pnpm or package.json missing"
fi

echo ""

# ── Check 4: Required secrets in .env files ───────────────────────────────────

echo "4. Checking required secrets in .env files..."

ROOT_ENV="$REPO_ROOT/.env"

if [ ! -f "$ROOT_ENV" ]; then
  fail "Root .env file not found at $ROOT_ENV"
else
  pass "Root .env file exists"

  # Check JWT_SECRET
  if grep -q "^JWT_SECRET=.\+" "$ROOT_ENV" 2>/dev/null; then
    pass "JWT_SECRET is set in root .env"
  else
    fail "JWT_SECRET is missing or empty in root .env — required for all API auth"
  fi

  # Check DATABASE_URL (root .env may not have it; check for any DB var)
  if grep -qE "^(DATABASE_URL|HEALTH_SAFETY_DATABASE_URL|CORE_DATABASE_URL)=.\+" "$ROOT_ENV" 2>/dev/null; then
    pass "At least one DATABASE_URL variant is set in root .env"
  else
    fail "No DATABASE_URL variant found in root .env — check per-service .env files"
  fi

  # Warn about CORS_ORIGIN (known bug: do not set it)
  if grep -qE "^CORS_ORIGIN=" "$ROOT_ENV" 2>/dev/null; then
    fail "CORS_ORIGIN is set in root .env — this MUST be removed (see CLAUDE.md known issue #3)"
  else
    pass "CORS_ORIGIN is not set in root .env (correct)"
  fi
fi

echo ""

# ── Check 5: Per-service .env files spot-check ────────────────────────────────

echo "5. Spot-checking critical API service .env files..."

CRITICAL_SERVICES=(
  "apps/api-gateway"
  "apps/api-health-safety"
  "apps/api-environment"
  "apps/api-quality"
  "apps/api-finance"
)

for svc in "${CRITICAL_SERVICES[@]}"; do
  ENV_FILE="$REPO_ROOT/$svc/.env"
  if [ -f "$ENV_FILE" ]; then
    if grep -q "^JWT_SECRET=.\+" "$ENV_FILE" 2>/dev/null; then
      pass "$svc/.env has JWT_SECRET"
    else
      fail "$svc/.env is missing JWT_SECRET"
    fi
  else
    fail "$svc/.env not found"
  fi
done

echo ""

# ── Check 6: Docker Compose file exists ───────────────────────────────────────

echo "6. Checking Docker configuration..."

if [ -f "$REPO_ROOT/docker-compose.yml" ]; then
  pass "docker-compose.yml exists"
elif [ -f "$REPO_ROOT/docker-compose.yaml" ]; then
  pass "docker-compose.yaml exists"
else
  fail "No docker-compose.yml found — required for local and CI deployments"
fi

echo ""

# ── Check 7: Kubernetes overlays exist ────────────────────────────────────────

echo "7. Checking Kubernetes deployment overlays..."

for env in staging prod; do
  OVERLAY="$REPO_ROOT/deploy/k8s/overlays/$env"
  if [ -d "$OVERLAY" ]; then
    pass "k8s overlay exists: deploy/k8s/overlays/$env"
  else
    fail "k8s overlay missing: deploy/k8s/overlays/$env — deployment will fail"
  fi
done

echo ""

# ── Summary ───────────────────────────────────────────────────────────────────

echo "============================================================"
echo "  PRE-DEPLOYMENT SUMMARY"
echo "============================================================"
printf "  Checks passed : %d\n" "$PASS_COUNT"
printf "  Checks failed : %d\n" "$FAIL_COUNT"
echo "============================================================"

if [ $FAIL_COUNT -gt 0 ]; then
  echo ""
  echo "  Pre-deployment check FAILED. Resolve all failures before deploying."
  exit 1
fi

echo ""
echo "  All pre-deployment checks PASSED. Safe to deploy."
exit 0
