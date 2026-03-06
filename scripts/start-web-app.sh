#!/bin/bash
# Start a single web app by short name.
# Usage: ./scripts/start-web-app.sh <name> [<name2> ...]
# Examples:
#   ./scripts/start-web-app.sh dashboard
#   ./scripts/start-web-app.sh health-safety quality
#   ./scripts/start-web-app.sh all   (starts all 45 — needs ~25GB RAM)

set -e
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$PROJECT_DIR/logs"
mkdir -p "$LOG_DIR"

declare -A WEB_MAP=(
  [dashboard]="3000:@ims/web-dashboard:web-dashboard"
  [health-safety]="3001:@ims/web-health-safety:web-health-safety"
  [environment]="3002:@ims/web-environment:web-environment"
  [quality]="3003:@ims/web-quality:web-quality"
  [settings]="3004:@ims/web-settings:web-settings"
  [inventory]="3005:@ims/web-inventory:web-inventory"
  [hr]="3006:@ims/web-hr:web-hr"
  [payroll]="3007:@ims/web-payroll:web-payroll"
  [workflows]="3008:@ims/web-workflows:web-workflows"
  [project-management]="3009:@ims/web-project-management:web-project-management"
  [automotive]="3010:@ims/web-automotive:web-automotive"
  [medical]="3011:@ims/web-medical:web-medical"
  [aerospace]="3012:@ims/web-aerospace:web-aerospace"
  [finance]="3013:@ims/web-finance:web-finance"
  [crm]="3014:@ims/web-crm:web-crm"
  [infosec]="3015:@ims/web-infosec:web-infosec"
  [esg]="3016:@ims/web-esg:web-esg"
  [cmms]="3017:@ims/web-cmms:web-cmms"
  [customer-portal]="3018:@ims/web-customer-portal:web-customer-portal"
  [supplier-portal]="3019:@ims/web-supplier-portal:web-supplier-portal"
  [food-safety]="3020:@ims/web-food-safety:web-food-safety"
  [energy]="3021:@ims/web-energy:web-energy"
  [analytics]="3022:@ims/web-analytics:web-analytics"
  [field-service]="3023:@ims/web-field-service:web-field-service"
  [iso42001]="3024:@ims/web-iso42001:web-iso42001"
  [iso37001]="3025:@ims/web-iso37001:web-iso37001"
  [partners]="3026:@ims/web-partners:web-partners"
  [admin]="3027:@ims/web-admin:web-admin"
  [marketing]="3030:@ims/web-marketing:web-marketing"
  [risk]="3031:@ims/web-risk:web-risk"
  [training]="3032:@ims/web-training:web-training"
  [suppliers]="3033:@ims/web-suppliers:web-suppliers"
  [assets]="3034:@ims/web-assets:web-assets"
  [documents]="3035:@ims/web-documents:web-documents"
  [complaints]="3036:@ims/web-complaints:web-complaints"
  [contracts]="3037:@ims/web-contracts:web-contracts"
  [finance-compliance]="3038:@ims/web-finance-compliance:web-finance-compliance"
  [ptw]="3039:@ims/web-ptw:web-ptw"
  [reg-monitor]="3040:@ims/web-reg-monitor:web-reg-monitor"
  [incidents]="3041:@ims/web-incidents:web-incidents"
  [audits]="3042:@ims/web-audits:web-audits"
  [mgmt-review]="3043:@ims/web-mgmt-review:web-mgmt-review"
  [chemicals]="3044:@ims/web-chemicals:web-chemicals"
  [emergency]="3045:@ims/web-emergency:web-emergency"
  [training-portal]="3046:@ims/web-training-portal:web-training-portal"
)

if [ $# -eq 0 ]; then
  echo "Usage: $0 <name> [<name2> ...]"
  echo "Available apps:"
  for k in $(echo "${!WEB_MAP[@]}" | tr ' ' '\n' | sort); do
    port=$(echo "${WEB_MAP[$k]}" | cut -d: -f1)
    echo "  $k  →  http://localhost:$port"
  done
  exit 0
fi

cd "$PROJECT_DIR"

start_one() {
  local name=$1
  if [ "$name" = "all" ]; then
    for k in "${!WEB_MAP[@]}"; do start_one "$k"; done
    return
  fi
  if [ -z "${WEB_MAP[$name]+x}" ]; then
    echo "Unknown app: $name  (run $0 with no args to list)"
    return 1
  fi
  local entry="${WEB_MAP[$name]}"
  local port filter log
  port=$(echo "$entry" | cut -d: -f1)
  filter=$(echo "$entry" | cut -d: -f2)
  log=$(echo "$entry" | cut -d: -f3)

  # Kill existing process on that port if any
  existing=$(ss -tlnp 2>/dev/null | grep ":$port " | grep -oP 'pid=\K\d+' | head -1)
  [ -n "$existing" ] && kill -9 "$existing" 2>/dev/null && echo "  Stopped existing $name (PID $existing)"

  echo "Starting $name → http://localhost:$port"
  stdbuf -oL -eL pnpm --filter "$filter" dev >> "$LOG_DIR/$log.log" 2>&1 &
  echo "  PID: $!  log: logs/$log.log"
}

for name in "$@"; do
  start_one "$name"
done
