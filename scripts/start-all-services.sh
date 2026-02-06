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
echo ""
echo "View logs: ls -la $LOG_DIR"
echo "Check status: ./scripts/check-services.sh"
echo "Stop all: ./scripts/stop-all-services.sh"
