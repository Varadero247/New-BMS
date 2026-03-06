#!/bin/bash
# Start all built web apps in production mode (next start).
# Each app uses ~80-120 MB RAM vs ~700 MB in dev mode.
# Run build-all-web.sh first if apps haven't been built yet.
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$PROJECT_DIR/logs"
mkdir -p "$LOG_DIR"
cd "$PROJECT_DIR"

declare -A APP_PORTS=(
  [web-dashboard]=3000
  [web-health-safety]=3001
  [web-environment]=3002
  [web-quality]=3003
  [web-settings]=3004
  [web-inventory]=3005
  [web-hr]=3006
  [web-payroll]=3007
  [web-workflows]=3008
  [web-project-management]=3009
  [web-automotive]=3010
  [web-medical]=3011
  [web-aerospace]=3012
  [web-finance]=3013
  [web-crm]=3014
  [web-infosec]=3015
  [web-esg]=3016
  [web-cmms]=3017
  [web-customer-portal]=3018
  [web-supplier-portal]=3019
  [web-food-safety]=3020
  [web-energy]=3021
  [web-analytics]=3022
  [web-field-service]=3023
  [web-iso42001]=3024
  [web-iso37001]=3025
  [web-partners]=3026
  [web-admin]=3027
  [web-marketing]=3030
  [web-risk]=3031
  [web-training]=3032
  [web-suppliers]=3033
  [web-assets]=3034
  [web-documents]=3035
  [web-complaints]=3036
  [web-contracts]=3037
  [web-finance-compliance]=3038
  [web-ptw]=3039
  [web-reg-monitor]=3040
  [web-incidents]=3041
  [web-audits]=3042
  [web-mgmt-review]=3043
  [web-chemicals]=3044
  [web-emergency]=3045
  [web-training-portal]=3046
)

# Stop any existing web processes on those ports
echo "Stopping existing web processes..."
for port in "${APP_PORTS[@]}"; do
  pid=$(ss -tlnp 2>/dev/null | grep ":$port " | grep -oP 'pid=\K\d+' | head -1)
  [ -n "$pid" ] && kill -9 "$pid" 2>/dev/null || true
done
pkill -9 -f "next-server" 2>/dev/null || true
sleep 1

STARTED=0; SKIPPED=0

for app in "${!APP_PORTS[@]}"; do
  port="${APP_PORTS[$app]}"
  dir="$PROJECT_DIR/apps/$app"

  if [ ! -f "$dir/.next/BUILD_ID" ]; then
    echo "[SKIP] $app — not built (run ./scripts/build-all-web.sh first)"
    ((SKIPPED++)) || true
    continue
  fi

  stdbuf -oL -eL pnpm --filter "@ims/$app" start >> "$LOG_DIR/$app.log" 2>&1 &
  echo "[START] $app → http://localhost:$port (PID $!)"
  ((STARTED++)) || true
done

echo ""
echo "$STARTED apps started, $SKIPPED skipped (not built)"
echo "Dashboard: http://localhost:3000  |  admin@ims.local / admin123"
