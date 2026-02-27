#!/bin/sh
cd /app
echo "Starting Global Search API (port 4050)..."
exec node apps/api-search/dist/index.js
