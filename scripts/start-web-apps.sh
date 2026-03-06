#!/bin/bash
# DEPRECATED: This script started web apps in dev/polling mode (next dev + WATCHPACK_POLLING).
# All web apps now run in production mode (next start) for ~100 MB/app vs ~700 MB in dev mode.
# Use: ./scripts/start-all-web.sh     — start all 45 apps in production mode
#      ./scripts/build-all-web.sh     — build apps before starting (required first time)
#      ./scripts/start-web-app.sh <name>  — start a single app in dev mode for editing
exec "$(dirname "$0")/start-all-web.sh" "$@"
