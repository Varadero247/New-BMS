#!/bin/bash

# Check if services are running
echo "Checking IMS Services..."
echo ""

check_service() {
    local port=$1
    local name=$2
    local health_url="http://localhost:$port/health"

    # Check if port is listening using ss (more reliable than lsof)
    if ss -tlnp 2>/dev/null | grep -q ":$port "; then
        # Try to get health status
        status=$(curl -s --max-time 2 "$health_url" 2>/dev/null | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        if [ -n "$status" ]; then
            echo "[OK] $name (port $port) - $status"
        else
            echo "[OK] $name (port $port) - running"
        fi
        return 0
    else
        echo "[--] $name (port $port) - not running"
        return 1
    fi
}

echo "API Services:"
check_service 4000 "API Gateway"
check_service 4001 "Health & Safety API"
check_service 4002 "Environment API"
check_service 4003 "Quality API"
check_service 4004 "AI Analysis API"
check_service 4005 "Inventory API"
check_service 4006 "HR API"
check_service 4007 "Payroll API"
check_service 4008 "Workflows API"
check_service 4009 "Project Management API"
check_service 4010 "Automotive API"
check_service 4011 "Medical API"
check_service 4012 "Aerospace API"
check_service 4013 "Finance API"
check_service 4014 "CRM API"
check_service 4015 "InfoSec API"
check_service 4016 "ESG API"
check_service 4017 "CMMS API"
check_service 4018 "Portal API"
check_service 4019 "Food Safety API"
check_service 4020 "Energy API"
check_service 4021 "Analytics API"
check_service 4022 "Field Service API"
check_service 4023 "ISO 42001 AI Management API"
check_service 4024 "ISO 37001 Anti-Bribery API"

echo ""
echo "Web Applications:"
check_service 3000 "Dashboard"
check_service 3001 "Health & Safety Web"
check_service 3002 "Environment Web"
check_service 3003 "Quality Web"
check_service 3004 "Settings Web"
check_service 3005 "Inventory Web"
check_service 3006 "HR Web"
check_service 3007 "Payroll Web"
check_service 3008 "Workflows Web"
check_service 3009 "Project Management Web"
check_service 3010 "Automotive Web"
check_service 3011 "Medical Web"
check_service 3012 "Aerospace Web"
check_service 3013 "Finance Web"
check_service 3014 "CRM Web"
check_service 3015 "InfoSec Web"
check_service 3016 "ESG Web"
check_service 3017 "CMMS Web"
check_service 3018 "Customer Portal"
check_service 3019 "Supplier Portal"
check_service 3020 "Food Safety Web"
check_service 3021 "Energy Web"
check_service 3022 "Analytics Web"
check_service 3023 "Field Service Web"
check_service 3024 "ISO 42001 AI Management Web"
check_service 3025 "ISO 37001 Anti-Bribery Web"

echo ""
# Count running services using ss
RUNNING=$(ss -tlnp 2>/dev/null | grep -cE ":(30[0-2][0-9]|40[0-2][0-9]) ")
echo "Total services running: $RUNNING / 50"
