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

echo ""
# Count running services using ss
RUNNING=$(ss -tlnp 2>/dev/null | grep -E ":(300[0-8]|400[0-8]) " | wc -l)
echo "Total services running: $RUNNING / 18"
