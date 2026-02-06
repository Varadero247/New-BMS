#!/bin/bash

echo "Stopping all IMS services..."

# Kill all node/pnpm processes related to the project
pkill -f "pnpm.*@ims" 2>/dev/null || true
pkill -f "next dev --port 300" 2>/dev/null || true
pkill -f "tsx watch.*api-" 2>/dev/null || true
pkill -f "node.*next-server" 2>/dev/null || true

sleep 2

# Verify
REMAINING=$(lsof -i :3000,:3001,:3002,:3003,:3004,:3005,:3006,:3007,:3008,:4000,:4001,:4002,:4003,:4004,:4005,:4006,:4007,:4008 2>/dev/null | grep LISTEN | wc -l)

if [ "$REMAINING" -eq 0 ]; then
    echo "All services stopped"
else
    echo "Warning: $REMAINING services may still be running"
    echo "Run 'lsof -i :3000-3008,4000-4008 | grep LISTEN' to check"
fi
