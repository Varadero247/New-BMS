#!/bin/bash
# Start all web apps with polling mode (bypasses inotify limit)
# Usage: ./scripts/start-web-apps.sh

PROJECT_DIR="/home/dyl/New-BMS"
LOG_DIR="$PROJECT_DIR/logs"
DATE=$(date +%Y-%m-%d-%H-%M-%S)
mkdir -p "$LOG_DIR"

export WATCHPACK_POLLING=true
export CHOKIDAR_USEPOLLING=true

start_web() {
  local dir=$1 port=$2 name=$3
  if ! fuser $port/tcp >/dev/null 2>&1; then
    echo "  Starting $name (port $port)..."
    cd "$PROJECT_DIR/apps/$dir"
    WATCHPACK_POLLING=true CHOKIDAR_USEPOLLING=true \
      nohup npx next dev --port $port \
      > "$LOG_DIR/${dir}-nowatch-${DATE}.log" 2>&1 &
    echo "    PID=$!"
  else
    echo "  $name already on port $port — skipping"
  fi
  cd "$PROJECT_DIR"
}

echo "=== Starting Web Applications (polling mode) ==="
echo ""

# Core
start_web web-settings          3004 "Settings"

# ISO Compliance
start_web web-health-safety     3001 "Health & Safety"
start_web web-environment       3002 "Environmental"
start_web web-quality           3003 "Quality"
start_web web-infosec           3015 "InfoSec"
start_web web-esg               3016 "ESG"
start_web web-food-safety       3020 "Food Safety"
start_web web-energy            3021 "Energy"
start_web web-iso42001          3024 "ISO 42001 (AI)"
start_web web-iso37001          3025 "ISO 37001"
start_web web-aerospace         3012 "Aerospace"
start_web web-chemicals         3044 "Chemicals"

# Operations
start_web web-inventory         3005 "Inventory"
start_web web-hr                3006 "HR"
start_web web-payroll           3007 "Payroll"
start_web web-workflows         3008 "Workflows"
start_web web-project-management 3009 "Project Management"
start_web web-finance           3013 "Finance"
start_web web-crm               3014 "CRM"
start_web web-cmms              3017 "CMMS"
start_web web-analytics         3022 "Analytics"
start_web web-field-service     3023 "Field Service"

# Portals & Specialist
start_web web-customer-portal   3018 "Customer Portal"
start_web web-supplier-portal   3019 "Supplier Portal"
start_web web-automotive        3010 "Automotive"
start_web web-medical           3011 "Medical"
start_web web-partners          3026 "Partners Portal"
start_web web-admin             3027 "Admin Dashboard"
start_web web-marketing         3030 "Marketing"

# Risk & Governance
start_web web-risk              3031 "Risk & CAPA"
start_web web-complaints        3036 "Complaints"
start_web web-ptw               3039 "Permit to Work"
start_web web-reg-monitor       3040 "Regulatory Monitor"
start_web web-incidents         3041 "Incidents"
start_web web-audits            3042 "Audits"
start_web web-mgmt-review       3043 "Mgmt Review"
start_web web-emergency         3045 "Emergency"

# Resources
start_web web-training          3032 "Training"
start_web web-suppliers         3033 "Suppliers"
start_web web-assets            3034 "Assets"
start_web web-documents         3035 "Documents"
start_web web-contracts         3037 "Contracts"
start_web web-finance-compliance 3038 "Finance Compliance"

echo ""
echo "All web apps starting in background. Compilation takes 30-90s per app."
echo "Monitor: tail -f $LOG_DIR/web-health-safety-nowatch-${DATE}.log"
