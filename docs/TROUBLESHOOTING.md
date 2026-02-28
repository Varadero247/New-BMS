# Nexara IMS Monorepo — Troubleshooting Guide

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


This guide covers the most common issues encountered when developing in the Nexara IMS monorepo. Every section follows **SYMPTOM / CAUSE / FIX** format with copy-paste-ready commands.

**Stack:** pnpm workspaces + Turborepo, 43 Express.js APIs + api-search (ports 4000-4041, 4050), 44 Next.js 15 web apps (ports 3000-3045), 392 shared packages, PostgreSQL, Redis, Prisma v5.22.0, Node 20.

---

## Table of Contents

1. [EMFILE: too many open files](#1-emfile-too-many-open-files)
2. [Prisma P2022: column does not exist](#2-prisma-p2022-column-does-not-exist)
3. [Login returns INTERNAL_ERROR](#3-login-returns-internal_error)
4. [Port already in use (EADDRINUSE)](#4-port-already-in-use-eaddrinuse)
5. [DTS watch mode hanging](#5-dts-watch-mode-hanging)
6. [@ims/i18n deep import errors](#6-imsi18n-deep-import-errors)
7. [lucide-react icon not found](#7-lucide-react-icon-not-found)
8. [Service-specific DATABASE_URL missing](#8-service-specific-database_url-missing)
9. [Turbo cache serving stale build](#9-turbo-cache-serving-stale-build)
10. [pnpm install fails with peer dependency errors](#10-pnpm-install-fails-with-peer-dependency-errors)
11. [Gateway starts but services return 502](#11-gateway-starts-but-services-return-502)
12. [Mobile app causes EMFILE crash](#12-mobile-app-causes-emfile-crash)
13. [Docker API version mismatch](#13-docker-api-version-mismatch)
14. [Rate limits persist after gateway restart](#14-rate-limits-persist-after-gateway-restart)
15. [Prisma CLI v7 incompatibility](#15-prisma-cli-v7-incompatibility)

---

## 1. EMFILE: too many open files

**Symptom:**

```
Error: EMFILE: too many open files, watch '/home/user/New-BMS/packages/...'
```

Processes crash shortly after starting `pnpm dev`, especially when running multiple services or the full monorepo.

**Cause:**

The default Linux `ulimit` for open files is 1024. This monorepo has 5000+ source files across 392 packages and 88 apps. File watchers (chokidar, Next.js, tsup) each hold file descriptors open, easily exhausting the limit.

**Fix:**

Raise the limit in the same shell session before starting dev:

```bash
ulimit -n 65536
```

Make it permanent by adding to your shell profile:

```bash
echo 'ulimit -n 65536' >> ~/.bashrc
source ~/.bashrc
```

Verify it took effect:

```bash
ulimit -n
# Should print: 65536
```

---

## 2. Prisma P2022: column does not exist

**Symptom:**

```
PrismaClientKnownRequestError:
Invalid `prisma.someModel.findMany()` invocation:
The column `some_table.new_column` does not exist in the current database.
P2022
```

**Cause:**

The Prisma schema file was updated with new fields, but either:

- The database was not synced (`db push` was not run), or
- The Prisma client was not regenerated after the schema change.

**Fix:**

Run all three steps for the affected domain schema:

```bash
# 1. Push schema changes to the database
npx prisma@5.22.0 db push --schema=packages/database/prisma/schemas/<domain>.prisma

# 2. Regenerate the Prisma client
npx prisma@5.22.0 generate --schema=packages/database/prisma/schemas/<domain>.prisma

# 3. Restart the affected API service
kill $(ss -tlnp | grep ':PORT' | grep -oP 'pid=\K\d+')
```

For multi-schema safety (to avoid dropping tables from other schemas), use migrate-diff instead of `db push`:

```bash
npx prisma@5.22.0 migrate diff \
  --from-empty \
  --to-schema-datamodel=packages/database/prisma/schemas/<domain>.prisma \
  --script | \
  PGPASSWORD=${POSTGRES_PASSWORD} psql -h localhost -U postgres -d ims -v ON_ERROR_STOP=0
```

---

## 3. Login returns INTERNAL_ERROR

**Symptom:**

`POST /api/auth/login` returns:

```json
{ "success": false, "error": "INTERNAL_ERROR" }
```

**Cause:**

Almost always a P2022 on the `users` table in the core schema. A column referenced in the login query does not exist in the database. This commonly happens after a fresh PostgreSQL container is created (losing all data) or after schema changes.

**Fix:**

1. Check gateway logs for the real error:

```bash
# If running via Docker:
DOCKER_API_VERSION=1.41 docker logs ims-api-gateway --tail 50

# If running locally, check the terminal output for the gateway process
```

2. Push the core schema and regenerate:

```bash
npx prisma@5.22.0 db push --schema=packages/database/prisma/schema.prisma
npx prisma@5.22.0 generate --schema=packages/database/prisma/schema.prisma
```

3. Restart the gateway:

```bash
kill $(ss -tlnp | grep ':4000' | grep -oP 'pid=\K\d+')
```

4. Re-seed the admin user if the database was wiped:

```bash
./scripts/startup.sh
```

---

## 4. Port already in use (EADDRINUSE)

**Symptom:**

```
Error: listen EADDRINUSE: address already in use :::4001
```

**Cause:**

A previous instance of the service is still running on that port. Common after a crash or incomplete shutdown.

**Fix:**

```bash
# Find the PID on the target port
ss -tlnp | grep ':4001'

# Kill it
kill <PID>

# If it refuses to die:
kill -9 <PID>
```

To kill all IMS services at once:

```bash
./scripts/stop-all-services.sh
```

For PostgreSQL/Redis port conflicts on restart:

```bash
sudo systemctl stop postgresql redis 2>/dev/null
sudo fuser -k 5432/tcp 6379/tcp 2>/dev/null
```

---

## 5. DTS watch mode hanging

**Symptom:**

Running `pnpm dev` on a shared package hangs indefinitely. No output, no errors, the terminal is stuck.

**Cause:**

The `tsup` bundler's `--dts` flag combined with `--watch` mode causes an infinite loop. DTS generation re-triggers the watcher, which re-triggers DTS generation.

**Fix:**

Edit the affected package's `package.json` and remove `--dts` from the `dev` script:

```jsonc
{
  "scripts": {
    "dev": "tsup src/index.ts --format esm,cjs --watch",
    "build": "tsup src/index.ts --format esm,cjs --dts --clean",
  },
}
```

---

## 6. @ims/i18n deep import errors

**Symptom:**

```
Module not found: Can't resolve '@ims/i18n/src/provider'
```

**Cause:**

Deep imports into the `src/` directory bypass the package's `exports` map. The package only exposes a single entry point.

**Fix:**

```typescript
// WRONG
import { I18nProvider } from '@ims/i18n/src/provider';

// CORRECT
import { I18nProvider, useTranslation } from '@ims/i18n';
```

---

## 7. lucide-react icon not found

**Symptom:**

```
Module '"lucide-react"' has no exported member 'HandshakeIcon'.
```

**Cause:**

Newer versions of `lucide-react` dropped the `Icon` suffix. `HandshakeIcon` became `Handshake`.

**Fix:**

1. Ensure the correct version:

```bash
pnpm add lucide-react@^0.474.0 --filter=<app-name>
```

2. Remove the `Icon` suffix from imports:

```typescript
// WRONG
import { CheckIcon, AlertTriangleIcon } from 'lucide-react';

// CORRECT
import { Check, AlertTriangle } from 'lucide-react';
```

---

## 8. Service-specific DATABASE_URL missing

**Symptom:**

```
Error: Environment variable not found: INVENTORY_DATABASE_URL
```

**Cause:**

Each Prisma domain schema references a named env var, not the generic `DATABASE_URL`. The variable must exist in both the root `.env` and the service's `.env`.

**Fix:**

Add to both root `.env` and service `.env`:

```bash
INVENTORY_DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/ims?schema=public"
```

Common service-specific env vars:

| Service           | Env Variable                 |
| ----------------- | ---------------------------- |
| api-health-safety | `HEALTH_SAFETY_DATABASE_URL` |
| api-environment   | `ENVIRONMENT_DATABASE_URL`   |
| api-inventory     | `INVENTORY_DATABASE_URL`     |
| api-iso42001      | `ISO42001_DATABASE_URL`      |
| api-iso37001      | `ISO37001_DATABASE_URL`      |

All point to the same database (`ims` on port 5432).

---

## 9. Turbo cache serving stale build

**Symptom:**

You changed code in a shared package, but the consuming app still uses the old version. The build output looks instant (cache hit).

**Cause:**

Turborepo caches build outputs based on input file hashes. If the change is not captured in the hash (env var, config), it serves stale artifacts.

**Fix:**

```bash
# Force rebuild
pnpm turbo build --force

# Or delete cache entirely
rm -rf .turbo node_modules/.cache/turbo
pnpm turbo build
```

---

## 10. pnpm install fails with peer dependency errors

**Symptom:**

```
ERR_PNPM_PEER_DEP_ISSUES  Unmet peer dependencies
```

**Cause:**

The lockfile is out of sync with `package.json` changes, or `node_modules` contains artifacts from a different branch.

**Fix:**

```bash
rm -rf node_modules
rm -rf apps/*/node_modules packages/*/node_modules
pnpm install --no-frozen-lockfile
```

If the lockfile itself is corrupted:

```bash
rm pnpm-lock.yaml
pnpm install
```

---

## 11. Gateway starts but services return 502

**Symptom:**

Proxied routes like `/api/health-safety/risks` return `502 Bad Gateway`.

**Cause:**

The downstream service is not running. The gateway proxies to `http://localhost:PORT` and gets a connection refused.

**Fix:**

1. Check which services are running:

```bash
./scripts/check-services.sh
```

2. Check the specific service:

```bash
curl -s http://localhost:4001/health | jq .
```

3. If down, start it:

```bash
pnpm --filter @ims/api-health-safety dev
```

4. If running in Docker:

```bash
DOCKER_API_VERSION=1.41 docker ps | grep api-health-safety
DOCKER_API_VERSION=1.41 docker logs ims-api-health-safety --tail 50
```

---

## 12. Mobile app causes EMFILE crash

**Symptom:**

`pnpm dev` crashes with EMFILE errors traced to `@ims/mobile`.

**Cause:**

The React Native Metro bundler creates thousands of additional file watchers, exceeding the limit even with `ulimit -n 65536`.

**Fix:**

Always exclude mobile:

```bash
pnpm dev --filter='!@ims/mobile'
```

Or run specific services:

```bash
pnpm dev:health-safety
```

---

## 13. Docker API version mismatch

**Symptom:**

```
Error response from daemon: client version 1.53 is too new. Maximum supported API version is 1.41
```

**Cause:**

The Docker CLI client (v1.53) is newer than the daemon (v1.41).

**Fix:**

Prefix every docker command:

```bash
DOCKER_API_VERSION=1.41 docker exec ims-postgres psql -U postgres -d ims -c "SELECT 1"
DOCKER_API_VERSION=1.41 docker logs ims-api-gateway --tail 50
```

Make permanent:

```bash
echo 'export DOCKER_API_VERSION=1.41' >> ~/.bashrc
source ~/.bashrc
```

---

## 14. Rate limits persist after gateway restart

**Symptom:**

After restarting the gateway, login still returns `RATE_LIMITED`.

**Cause:**

Rate limits are stored in Redis (`ims-redis:6379`), not in-memory. The auth limiter allows 5 attempts per 15 minutes; the API limiter allows 100 requests per 15 minutes.

**Fix:**

```bash
DOCKER_API_VERSION=1.41 docker exec ims-redis redis-cli FLUSHALL
```

---

## 15. Prisma CLI v7 incompatibility

**Symptom:**

```
Error: Prisma schema validation - Unknown field "binaryTargets" in generator block
```

**Cause:**

A globally installed Prisma CLI v7 is being invoked instead of the project-pinned v5.22.0.

**Fix:**

Always use the explicit version:

```bash
# CORRECT
npx prisma@5.22.0 generate --schema=packages/database/prisma/schema.prisma

# WRONG
prisma generate --schema=...
npx prisma generate --schema=...
```

Remove the global install if it interferes:

```bash
npm uninstall -g prisma
```

---

## Quick Diagnostic Commands

```bash
# Check all service health
./scripts/check-services.sh

# See what is running on IMS ports
ss -tlnp | grep -E ':(3[0-9]{3}|4[0-9]{3})\b'

# Check database connectivity
PGPASSWORD=${POSTGRES_PASSWORD} psql -h localhost -U postgres -d ims -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';"

# Check Redis connectivity
DOCKER_API_VERSION=1.41 docker exec ims-redis redis-cli PING

# Full system startup
./scripts/startup.sh
```
