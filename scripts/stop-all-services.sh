#!/bin/bash

echo "Stopping all IMS services..."

# Kill processes by port (most reliable method)
for port in 4000 4001 4002 4003 4004 4005 4006 4007 4008 4009 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009; do
    # Get PID using ss (more reliable than lsof)
    pid=$(ss -tlnp 2>/dev/null | grep ":$port " | grep -oP 'pid=\K\d+' | head -1)
    if [ -n "$pid" ]; then
        kill -9 "$pid" 2>/dev/null && echo "  Stopped port $port (PID $pid)"
    fi
done

sleep 1

# Fallback: kill by process name patterns
pkill -9 -f "tsx watch.*api-" 2>/dev/null || true
pkill -9 -f "next-server" 2>/dev/null || true
pkill -9 -f "ts-node-dev" 2>/dev/null || true

sleep 1

# Verify using ss
REMAINING=$(ss -tlnp 2>/dev/null | grep -E ":(300[0-9]|400[0-9]) " | wc -l)

if [ "$REMAINING" -eq 0 ]; then
    echo "All services stopped"
else
    echo "Warning: $REMAINING services may still be running"
    ss -tlnp 2>/dev/null | grep -E ":(300[0-9]|400[0-9]) "
fi
