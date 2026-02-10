#!/bin/sh
cd /app
echo "Running prisma generate..."
PRISMA_QUERY_ENGINE_LIBRARY=/app/packages/database/generated/core/libquery_engine-linux-musl-openssl-3.0.x.so.node node_modules/.pnpm/node_modules/.bin/prisma generate --schema=packages/database/prisma/schemas/core.prisma 2>&1 || true
echo "Engine copied. Starting server..."
exec env PRISMA_QUERY_ENGINE_LIBRARY=/app/packages/database/generated/core/libquery_engine-linux-musl-openssl-3.0.x.so.node   node apps/api-environment/dist/index.js
