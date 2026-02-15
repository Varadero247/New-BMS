#!/bin/bash

# IMS - Start All Services Script
set -e

PROJECT_DIR="/home/dyl/New-BMS"
LOG_DIR="$PROJECT_DIR/logs"
DATE=$(date +%Y-%m-%d-%H-%M-%S)

cd "$PROJECT_DIR"
mkdir -p "$LOG_DIR"

echo "Starting IMS Services..."
echo "Logs will be saved to: $LOG_DIR"

# Function to start a service in background
start_service() {
    local filter=$1
    local log_file=$2
    local service_name=$3

    echo "  Starting $service_name..."
    pnpm --filter "$filter" dev > "$LOG_DIR/$log_file-$DATE.log" 2>&1 &
    echo "    PID: $! (log: $log_file-$DATE.log)"
}

# Start API Gateway first (required for all)
echo ""
echo "Starting API Gateway..."
start_service "@ims/api-gateway" "api-gateway" "API Gateway"
sleep 3  # Give gateway time to start

# Start all API services
echo ""
echo "Starting API Services..."
start_service "@ims/api-health-safety" "api-health-safety" "Health & Safety API"
start_service "@ims/api-environment" "api-environment" "Environment API"
start_service "@ims/api-quality" "api-quality" "Quality API"
start_service "@ims/api-ai-analysis" "api-ai" "AI Analysis API"
start_service "@ims/api-inventory" "api-inventory" "Inventory API"
start_service "@ims/api-hr" "api-hr" "HR API"
start_service "@ims/api-payroll" "api-payroll" "Payroll API"
start_service "@ims/api-workflows" "api-workflows" "Workflows API"
start_service "@ims/api-project-management" "api-project-management" "Project Management API"
start_service "@ims/api-automotive" "api-automotive" "Automotive API"
start_service "@ims/api-medical" "api-medical" "Medical API"
start_service "@ims/api-aerospace" "api-aerospace" "Aerospace API"
start_service "@ims/api-finance" "api-finance" "Finance API"
start_service "@ims/api-crm" "api-crm" "CRM API"
start_service "@ims/api-infosec" "api-infosec" "InfoSec API"
start_service "@ims/api-esg" "api-esg" "ESG API"
start_service "@ims/api-cmms" "api-cmms" "CMMS API"
start_service "@ims/api-portal" "api-portal" "Portal API"
start_service "@ims/api-food-safety" "api-food-safety" "Food Safety API"
start_service "@ims/api-energy" "api-energy" "Energy API"
start_service "@ims/api-analytics" "api-analytics" "Analytics API"
start_service "@ims/api-field-service" "api-field-service" "Field Service API"
start_service "@ims/api-iso42001" "api-iso42001" "ISO 42001 AI Management API"
start_service "@ims/api-iso37001" "api-iso37001" "ISO 37001 Anti-Bribery API"
start_service "@ims/api-marketing" "api-marketing" "Marketing API"
start_service "@ims/api-partners" "api-partners" "Partners API"
start_service "@ims/api-risk" "api-risk" "Risk & CAPA API"
start_service "@ims/api-training" "api-training" "Training API"
start_service "@ims/api-suppliers" "api-suppliers" "Suppliers API"
start_service "@ims/api-assets" "api-assets" "Assets API"
start_service "@ims/api-documents" "api-documents" "Documents API"
start_service "@ims/api-complaints" "api-complaints" "Complaints API"
start_service "@ims/api-contracts" "api-contracts" "Contracts API"
start_service "@ims/api-ptw" "api-ptw" "Permit to Work API"
start_service "@ims/api-reg-monitor" "api-reg-monitor" "Regulatory Monitor API"
start_service "@ims/api-incidents" "api-incidents" "Incidents API"
start_service "@ims/api-audits" "api-audits" "Audits API"
start_service "@ims/api-mgmt-review" "api-mgmt-review" "Management Review API"

sleep 3  # Give APIs time to start

# Start all Web services (with delays to avoid port conflicts)
echo ""
echo "Starting Web Applications..."
start_service "@ims/web-dashboard" "web-dashboard" "Dashboard"
sleep 2
start_service "@ims/web-health-safety" "web-health-safety" "Health & Safety Web"
sleep 2
start_service "@ims/web-environment" "web-environment" "Environment Web"
sleep 2
start_service "@ims/web-quality" "web-quality" "Quality Web"
sleep 2
start_service "@ims/web-settings" "web-settings" "Settings Web"
sleep 2
start_service "@ims/web-inventory" "web-inventory" "Inventory Web"
sleep 2
start_service "@ims/web-hr" "web-hr" "HR Web"
sleep 2
start_service "@ims/web-payroll" "web-payroll" "Payroll Web"
sleep 2
start_service "@ims/web-workflows" "web-workflows" "Workflows Web"
sleep 2
start_service "@ims/web-project-management" "web-project-management" "Project Management Web"
sleep 2
start_service "@ims/web-automotive" "web-automotive" "Automotive Web"
sleep 2
start_service "@ims/web-medical" "web-medical" "Medical Web"
sleep 2
start_service "@ims/web-aerospace" "web-aerospace" "Aerospace Web"
sleep 2
start_service "@ims/web-finance" "web-finance" "Finance Web"
sleep 2
start_service "@ims/web-crm" "web-crm" "CRM Web"
sleep 2
start_service "@ims/web-infosec" "web-infosec" "InfoSec Web"
sleep 2
start_service "@ims/web-esg" "web-esg" "ESG Web"
sleep 2
start_service "@ims/web-cmms" "web-cmms" "CMMS Web"
sleep 2
start_service "@ims/web-customer-portal" "web-customer-portal" "Customer Portal"
sleep 2
start_service "@ims/web-supplier-portal" "web-supplier-portal" "Supplier Portal"
sleep 2
start_service "@ims/web-food-safety" "web-food-safety" "Food Safety Web"
sleep 2
start_service "@ims/web-energy" "web-energy" "Energy Web"
sleep 2
start_service "@ims/web-analytics" "web-analytics" "Analytics Web"
sleep 2
start_service "@ims/web-field-service" "web-field-service" "Field Service Web"
sleep 2
start_service "@ims/web-iso42001" "web-iso42001" "ISO 42001 AI Management Web"
sleep 2
start_service "@ims/web-iso37001" "web-iso37001" "ISO 37001 Anti-Bribery Web"
sleep 2
start_service "@ims/web-partners" "web-partners" "Partners Portal Web"
sleep 2
start_service "@ims/web-admin" "web-admin" "Admin Dashboard Web"
sleep 2
start_service "@ims/web-risk" "web-risk" "Risk & CAPA Web"
sleep 2
start_service "@ims/web-training" "web-training" "Training Web"
sleep 2
start_service "@ims/web-suppliers" "web-suppliers" "Suppliers Web"
sleep 2
start_service "@ims/web-assets" "web-assets" "Assets Web"
sleep 2
start_service "@ims/web-documents" "web-documents" "Documents Web"
sleep 2
start_service "@ims/web-complaints" "web-complaints" "Complaints Web"
sleep 2
start_service "@ims/web-contracts" "web-contracts" "Contracts Web"
sleep 2
start_service "@ims/web-finance-compliance" "web-finance-compliance" "Finance Compliance Web"
sleep 2
start_service "@ims/web-ptw" "web-ptw" "Permit to Work Web"
sleep 2
start_service "@ims/web-reg-monitor" "web-reg-monitor" "Regulatory Monitor Web"
sleep 2
start_service "@ims/web-incidents" "web-incidents" "Incidents Web"
sleep 2
start_service "@ims/web-audits" "web-audits" "Audits Web"
sleep 2
start_service "@ims/web-mgmt-review" "web-mgmt-review" "Management Review Web"

echo ""
echo "All services starting..."
echo ""
echo "Service URLs:"
echo "  API Gateway:        http://localhost:4000"
echo "  Dashboard:          http://localhost:3000"
echo "  Health & Safety:    http://localhost:3001 (API: 4001)"
echo "  Environment:        http://localhost:3002 (API: 4002)"
echo "  Quality:            http://localhost:3003 (API: 4003)"
echo "  Settings:           http://localhost:3004"
echo "  Inventory:          http://localhost:3005 (API: 4005)"
echo "  HR:                 http://localhost:3006 (API: 4006)"
echo "  Payroll:            http://localhost:3007 (API: 4007)"
echo "  Workflows:          http://localhost:3008 (API: 4008)"
echo "  Project Management: http://localhost:3009 (API: 4009)"
echo "  Automotive:         http://localhost:3010 (API: 4010)"
echo "  Medical:            http://localhost:3011 (API: 4011)"
echo "  Aerospace:          http://localhost:3012 (API: 4012)"
echo "  Finance:            http://localhost:3013 (API: 4013)"
echo "  CRM:                http://localhost:3014 (API: 4014)"
echo "  InfoSec:            http://localhost:3015 (API: 4015)"
echo "  ESG:                http://localhost:3016 (API: 4016)"
echo "  CMMS:               http://localhost:3017 (API: 4017)"
echo "  Customer Portal:    http://localhost:3018 (API: 4018)"
echo "  Supplier Portal:    http://localhost:3019 (API: 4018)"
echo "  Food Safety:        http://localhost:3020 (API: 4019)"
echo "  Energy:             http://localhost:3021 (API: 4020)"
echo "  Analytics:          http://localhost:3022 (API: 4021)"
echo "  Field Service:      http://localhost:3023 (API: 4022)"
echo "  ISO 42001 AI Mgmt:  http://localhost:3024 (API: 4023)"
echo "  ISO 37001 Anti-Brib:http://localhost:3025 (API: 4024)"
echo "  Marketing:          http://localhost:3030 (API: 4025)"
echo "  Partners Portal:    http://localhost:3026 (API: 4026)"
echo "  Admin Dashboard:    http://localhost:3027"
echo "  Risk & CAPA:        http://localhost:3031 (API: 4027)"
echo "  Training:           http://localhost:3032 (API: 4028)"
echo "  Suppliers:          http://localhost:3033 (API: 4029)"
echo "  Assets:             http://localhost:3034 (API: 4030)"
echo "  Documents:          http://localhost:3035 (API: 4031)"
echo "  Complaints:         http://localhost:3036 (API: 4032)"
echo "  Contracts:          http://localhost:3037 (API: 4033)"
echo "  Fin. Compliance:    http://localhost:3038 (API: 4013)"
echo "  Permit to Work:     http://localhost:3039 (API: 4034)"
echo "  Reg Monitor:        http://localhost:3040 (API: 4035)"
echo "  Incidents:          http://localhost:3041 (API: 4036)"
echo "  Audits:             http://localhost:3042 (API: 4037)"
echo "  Mgmt Review:        http://localhost:3043 (API: 4038)"
echo ""
echo "View logs: ls -la $LOG_DIR"
echo "Check status: ./scripts/check-services.sh"
echo "Stop all: ./scripts/stop-all-services.sh"
