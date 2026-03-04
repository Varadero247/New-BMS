#!/bin/bash

echo "Stopping all IMS services..."

# Kill processes by port (most reliable method)
for port in 4000 4001 4002 4003 4004 4005 4006 4007 4008 4009 4010 4011 4012 4013 4014 4015 4016 4017 4018 4019 4020 4021 4022 4023 4024 4025 4026 4027 4028 4029 4030 4031 4032 4033 4034 4035 4036 4037 4038 4039 4040 4041 4050 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010 3011 3012 3013 3014 3015 3016 3017 3018 3019 3020 3021 3022 3023 3024 3025 3026 3027 3030 3031 3032 3033 3034 3035 3036 3037 3038 3039 3040 3041 3042 3043 3044 3045 3046; do
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
REMAINING=$(ss -tlnp 2>/dev/null | grep -E ":(3[0-9]{3}|4[0-9]{3}) " | grep -E ":(30[0-2][0-9]|40[0-2][0-9]) " | wc -l)

if [ "$REMAINING" -eq 0 ]; then
    echo "All services stopped"
else
    echo "Warning: $REMAINING services may still be running"
    ss -tlnp 2>/dev/null | grep -E ":(30[0-2][0-9]|40[0-2][0-9]) "
fi
