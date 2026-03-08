#!/bin/bash
# Build all web apps for production (next build).
# Runs up to 4 builds concurrently to use available CPUs without OOM.
# Already-built apps (with valid BUILD_ID) are skipped unless --force is passed.
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

FORCE=false
for arg in "$@"; do [ "$arg" = "--force" ] && FORCE=true; done

CONCURRENCY=4

APPS=(
  web-admin web-aerospace web-analytics web-assets web-audits
  web-automotive web-chemicals web-cmms web-complaints web-contracts
  web-crm web-customer-portal web-dashboard web-documents web-emergency
  web-energy web-environment web-esg web-field-service web-finance
  web-finance-compliance web-food-safety web-health-safety web-hr
  web-incidents web-infosec web-inventory web-iso37001 web-iso42001
  web-marketing web-medical web-mgmt-review web-partners web-payroll
  web-project-management web-ptw web-quality web-reg-monitor web-risk
  web-settings web-supplier-portal web-suppliers web-training
  web-training-portal web-workflows
  web-onboarding web-regional-dashboard web-partner-portal
)

TOTAL=${#APPS[@]}
PASS=0; FAIL=0; SKIP=0

build_app() {
  local app=$1
  local dir="$PROJECT_DIR/apps/$app"
  local logfile="$PROJECT_DIR/logs/build-$app.log"

  if [ "$FORCE" = "false" ] && [ -f "$dir/.next/BUILD_ID" ]; then
    echo "[SKIP] $app (already built)"
    echo "skip"
    return
  fi

  echo "[BUILD] $app ..."
  if pnpm --filter "@ims/$app" build > "$logfile" 2>&1; then
    echo "[OK]   $app"
    echo "ok"
  else
    echo "[FAIL] $app — see logs/build-$app.log"
    echo "fail"
  fi
}

export -f build_app
export PROJECT_DIR FORCE

echo "Building $TOTAL web apps ($CONCURRENCY concurrent)..."
echo "Logs: $PROJECT_DIR/logs/build-*.log"
echo ""

# Run builds in batches using background jobs
batch=()
results=()

flush_batch() {
  local pids=() names=() tmpfiles=()
  for entry in "${batch[@]}"; do
    local app="${entry%%:*}"
    local tmp
    tmp=$(mktemp)
    tmpfiles+=("$tmp")
    names+=("$app")
    ( build_app "$app" > "$tmp" 2>&1 ) &
    pids+=("$!")
  done

  for i in "${!pids[@]}"; do
    wait "${pids[$i]}" 2>/dev/null || true
    local out
    out=$(cat "${tmpfiles[$i]}")
    echo "$out"
    if echo "$out" | grep -q "^\[OK\]"; then   ((PASS++)) || true
    elif echo "$out" | grep -q "^\[SKIP\]"; then ((SKIP++)) || true
    else ((FAIL++)) || true
    fi
    rm -f "${tmpfiles[$i]}"
  done
  batch=()
}

for app in "${APPS[@]}"; do
  batch+=("$app:")
  if [ ${#batch[@]} -ge $CONCURRENCY ]; then
    flush_batch
  fi
done
[ ${#batch[@]} -gt 0 ] && flush_batch

echo ""
echo "=== Build complete: $PASS built, $SKIP skipped, $FAIL failed ==="
[ $FAIL -gt 0 ] && echo "Check logs/build-<app>.log for failed apps"
