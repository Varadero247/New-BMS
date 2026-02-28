# IMS Platform — Operational Runbook

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


**Last updated:** 2026-02-25
**Scope:** 43 API services (ports 4000–4050), 45 web apps (ports 3000–3046)
**On-call channel:** #ims-alerts-critical (Slack)

---

## Table of Contents

1. [Alert Response Procedures](#1-alert-response-procedures)
2. [Common Operational Tasks](#2-common-operational-tasks)
3. [Log Investigation](#3-log-investigation)
4. [Database Operations](#4-database-operations)
5. [Incident Response](#5-incident-response)
6. [Deployment Procedure](#6-deployment-procedure)

---

## 1. Alert Response Procedures

Alert rules are evaluated every 15 seconds by Prometheus. Critical alerts route to `#ims-alerts-critical` + email; warnings route to `#ims-alerts`. Security alerts (auth failures, rate limits) route to `#ims-security-alerts`.

---

### 1.1 HighErrorRate

**Condition:** 5xx response rate > 5% sustained for 5 minutes on any service.

**What it means:** A downstream service, database connection, or unhandled exception is causing a significant portion of requests to fail.

**Diagnosis steps:**

1. Identify the failing service from the alert label `job`:
   ```bash
   # Check error rate by service in Prometheus
   # Query: sum(rate(http_requests_total{status=~"5.."}[5m])) by (job)
   ```

2. Tail the service logs for stack traces:
   ```bash
   DOCKER_API_VERSION=1.41 docker logs ims-<service-name> --tail 200 -f
   ```

3. Check if the gateway is receiving errors (rules may fire on the gateway if it cannot reach downstream):
   ```bash
   DOCKER_API_VERSION=1.41 docker logs ims-api-gateway --tail 100 -f
   ```

4. Test the service health endpoint directly:
   ```bash
   curl -s http://localhost:<PORT>/health | jq .
   ```

5. Check DB connectivity from inside the container:
   ```bash
   DOCKER_API_VERSION=1.41 docker exec ims-<service-name> \
     sh -c 'nc -zv $PGHOST 5432 && echo "DB reachable"'
   ```

**Remediation:**

- If DB is unreachable: see [Section 4 — Database Operations](#4-database-operations).
- If a downstream service is returning errors, restart it: `docker compose restart <service-name>`.
- If logs show `ECONNREFUSED` to Redis: restart Redis with `docker compose restart ims-redis`.
- If the issue persists after restart, escalate to P1.

---

### 1.2 HighLatency

**Condition:** p95 response time > 1 second sustained for 10 minutes.

**What it means:** The service is processing requests but is slow. Typically caused by slow DB queries, resource exhaustion, or inefficient code paths.

**Diagnosis steps:**

1. Check current p95 latency by service:
   ```
   Prometheus query: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) by (job)
   ```

2. Identify slow database queries:
   ```sql
   SELECT query, calls, mean_exec_time, total_exec_time
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

3. Check host resource usage:
   ```bash
   # CPU and memory by container
   DOCKER_API_VERSION=1.41 docker stats --no-stream
   ```

4. Look for lock contention in PostgreSQL:
   ```sql
   SELECT pid, wait_event_type, wait_event, state, query
   FROM pg_stat_activity
   WHERE wait_event IS NOT NULL AND state != 'idle'
   ORDER BY wait_event_type;
   ```

5. Review the OpenTelemetry trace for a slow request in Jaeger UI:
   ```
   http://localhost:16686
   Service: ims-<service-name>
   Sort by: Most Recent
   ```

**Remediation:**

- Add a missing index if a specific table scan is identified (consult DBA).
- If memory pressure is high, restart the affected service: `docker compose restart <service-name>`.
- If CPU is pegged, check for runaway loops in logs; consider scaling with `--scale` flag.
- For chronic latency, review slow query log and open an engineering ticket.

---

### 1.3 ServiceDown

**Condition:** Health check endpoint returns non-200 for 2 consecutive minutes.

**What it means:** The service container has crashed, is stuck in a restart loop, or its health endpoint is broken.

**Diagnosis steps:**

1. Check container status:
   ```bash
   DOCKER_API_VERSION=1.41 docker ps -a | grep ims-<service-name>
   ```

2. Read the last 50 lines of logs before the crash:
   ```bash
   DOCKER_API_VERSION=1.41 docker logs ims-<service-name> --tail 50
   ```

3. Inspect exit code and restart count:
   ```bash
   DOCKER_API_VERSION=1.41 docker inspect ims-<service-name> \
     --format '{{.State.ExitCode}} restarts={{.RestartCount}}'
   ```

4. Check for port conflicts:
   ```bash
   ss -tlnp | grep <PORT>
   ```

**Remediation:**

1. Restart the service:
   ```bash
   docker compose restart <service-name>
   ```

2. If restart fails, force recreate:
   ```bash
   docker compose up -d --force-recreate <service-name>
   ```

3. If the container exits immediately, check for a missing `.env` variable or database migration issue. Verify the DB schema is up to date.

4. If the gateway (port 4000) is down, run the full startup script:
   ```bash
   ./scripts/startup.sh
   ```

---

### 1.4 DBConnectionPoolExhausted

**Condition:** Active DB connections > 90% of `connection_limit` (each service is configured with `connection_limit=1`, so 42 connections total; pool exhaustion means connections are leaking or not releasing).

**What it means:** Connections are being opened but not closed, or a service is holding transactions open.

**Diagnosis steps:**

1. Check current connections by state:
   ```sql
   SELECT count(*), state, application_name
   FROM pg_stat_activity
   GROUP BY state, application_name
   ORDER BY count DESC;
   ```

2. Find long-running transactions:
   ```sql
   SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
   FROM pg_stat_activity
   WHERE state != 'idle' AND query_start < now() - interval '30 seconds'
   ORDER BY duration DESC;
   ```

3. Identify which service has leaked connections (match `application_name` to service).

**Remediation:**

- Terminate idle connections from a specific service:
  ```sql
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE application_name = '<service-name>' AND state = 'idle';
  ```

- Restart the leaking service to force Prisma to reconnect cleanly:
  ```bash
  docker compose restart <service-name>
  ```

- If the problem is systemic, run `./scripts/startup.sh` to reset all services.

---

### 1.5 HighMemoryUsage

**Condition:** Container memory usage > 85% of its limit for 5 minutes.

**What it means:** A service is retaining large amounts of data in memory (e.g. unbounded caches, large result sets, memory leak in a third-party library).

**Diagnosis steps:**

1. Identify the high-memory container:
   ```bash
   DOCKER_API_VERSION=1.41 docker stats --no-stream --format \
     "table {{.Name}}\t{{.MemUsage}}\t{{.MemPerc}}"
   ```

2. Check recent log output for OOM-related messages or heap warnings:
   ```bash
   DOCKER_API_VERSION=1.41 docker logs ims-<service-name> --tail 100 | grep -i "heap\|memory\|oom"
   ```

3. If Node.js, check if `--max-old-space-size` is set in the service's Dockerfile or start command.

**Remediation:**

- Restart the service to free memory immediately:
  ```bash
  docker compose restart <service-name>
  ```

- If memory climbs again within minutes, open an engineering ticket for heap profiling.
- Do not increase memory limits without root-cause analysis.

---

### 1.6 RateLimitExceeded

**Condition:** Frequent HTTP 429 responses observed (auth: 5 req/15min, API: 100 req/15min).

**What it means:** A client (user, API key, or bot) is exceeding the configured rate limits stored in Redis.

**Diagnosis steps:**

1. Check which IP or API key is triggering 429s in the gateway logs:
   ```bash
   DOCKER_API_VERSION=1.41 docker logs ims-api-gateway --tail 200 | \
     jq 'select(.status==429) | {ip: .ip, path: .path, apiKey: .apiKey}'
   ```

2. Check Redis key counts to confirm it is a real-traffic issue and not a Redis configuration bug:
   ```bash
   DOCKER_API_VERSION=1.41 docker exec ims-redis redis-cli INFO keyspace
   ```

**Remediation:**

- If caused by a legitimate service (e.g. scheduled job, integration partner), add the IP or API key to the allowlist in gateway configuration.
- If caused by a bot or abuse attempt, block the IP at the reverse proxy level.
- To clear all rate-limit counters (use only if justified — this affects all clients):
  ```bash
  DOCKER_API_VERSION=1.41 docker exec ims-redis redis-cli FLUSHALL
  ```
  **Warning:** FLUSHALL clears all Redis data including session cache. Confirm with the team before running in production.

---

### 1.7 CertExpiringSoon

**Condition:** TLS certificate expires in fewer than 30 days.

**What it means:** The TLS certificate for the platform's public-facing domain is near expiry. Browsers will show security warnings once expired.

**Diagnosis steps:**

1. Check current expiry:
   ```bash
   echo | openssl s_client -connect <your-domain>:443 -servername <your-domain> 2>/dev/null \
     | openssl x509 -noout -dates
   ```

2. Identify the certificate location in the reverse proxy configuration (nginx/Caddy/Traefik).

**Remediation:**

1. Renew the certificate (Let's Encrypt example):
   ```bash
   certbot renew --cert-name <your-domain> --dry-run   # dry-run first
   certbot renew --cert-name <your-domain>
   ```

2. Reload the reverse proxy to pick up the new certificate:
   ```bash
   # nginx
   nginx -s reload
   # Caddy
   caddy reload --config /etc/caddy/Caddyfile
   ```

3. Verify the new expiry date with the openssl command above.

4. If using a commercially-issued cert, follow the CA's reissuance process and update the cert files in the reverse proxy config directory.

---

## 2. Common Operational Tasks

### 2.1 Restart a single service

```bash
docker compose restart <service-name>
# Example: docker compose restart api-health-safety
```

### 2.2 View service logs

```bash
# Last 100 lines, follow
DOCKER_API_VERSION=1.41 docker logs ims-<service-name> --tail 100 -f

# Example — gateway
DOCKER_API_VERSION=1.41 docker logs ims-api-gateway --tail 100 -f
```

### 2.3 Database backup

```bash
./scripts/backup-db.sh
```

Backups are written to `backups/` with a timestamped filename. Verify the file was created and is non-zero before proceeding with any destructive operation.

### 2.4 Verify backup restore

```bash
./scripts/verify-backup-restore.sh
```

This restores the most recent backup to a temporary database and runs integrity checks. Confirm output shows no errors before signing off.

### 2.5 Clear rate limits

```bash
DOCKER_API_VERSION=1.41 docker exec ims-redis redis-cli FLUSHALL
```

Use only when confirmed abuse or a runaway job has filled the rate-limit counters. This affects all Redis-backed state.

### 2.6 Check all service health

```bash
./scripts/check-services.sh
```

Runs health checks against all 57 services (43 API + 14 shared infrastructure). Exit code 0 = all healthy.

### 2.7 Full system restart

Use after a machine reboot or when multiple services are down:

```bash
./scripts/startup.sh
```

This script: stops host PostgreSQL/Redis to free ports 5432/6379, starts Docker Compose services, seeds the admin user, and recreates any missing database tables.

### 2.8 Pre-deploy validation

```bash
./scripts/pre-deploy-check.sh
```

Runs 111 checks covering environment variables, schema integrity, service connectivity, and security configuration. Review the output before deploying. Expect 41 warnings in dev (NODE_ENV, SENTRY_DSN, web apps not started); 0 failures is the requirement.

---

## 3. Log Investigation

### 3.1 Log format

All services emit structured JSON logs with the following fields:

```json
{
  "timestamp": "2026-02-23T10:00:00.000Z",
  "level": "error",
  "service": "api-health-safety",
  "correlationId": "c1a2b3d4-...",
  "message": "Database query failed",
  "error": "..."
}
```

### 3.2 Trace a request across services by correlationId

Every inbound request through the gateway is assigned a `correlationId` that is forwarded to downstream services.

```bash
# Find all log lines for a given correlation ID across all containers
DOCKER_API_VERSION=1.41 docker compose logs --no-log-prefix 2>/dev/null | \
  jq -c 'select(.correlationId == "<YOUR-CORRELATION-ID>")'
```

### 3.3 Useful jq queries

```bash
# All error-level logs from a service in the last run
DOCKER_API_VERSION=1.41 docker logs ims-<service-name> 2>&1 | \
  jq 'select(.level == "error")'

# Requests slower than 1000ms
DOCKER_API_VERSION=1.41 docker logs ims-api-gateway 2>&1 | \
  jq 'select(.durationMs > 1000) | {path, durationMs, correlationId}'

# Authentication failures
DOCKER_API_VERSION=1.41 docker logs ims-api-gateway 2>&1 | \
  jq 'select(.message | test("auth|token|unauthorized"; "i")) | {timestamp, ip, path, message}'

# 5xx responses only
DOCKER_API_VERSION=1.41 docker logs ims-api-gateway 2>&1 | \
  jq 'select(.status >= 500) | {timestamp, status, path, correlationId}'
```

### 3.4 OpenTelemetry trace lookup in Jaeger

1. Open Jaeger UI: `http://localhost:16686`
2. Select the service from the dropdown (e.g. `ims-api-health-safety`).
3. Set time range and click **Find Traces**.
4. For a specific request: search by `correlationId` tag — Jaeger accepts tag filters in the format `correlationId=<value>`.
5. The trace view shows span durations across all participating services, revealing exactly where latency occurred.

---

## 4. Database Operations

### 4.1 Connect to the database

```bash
PGPASSWORD=ims_secure_password_2026 psql -h localhost -U postgres -d ims
```

**Important:** The active database is at `localhost:5432`. Do not use `localhost:5433` (host PostgreSQL 14, not the IMS instance).

### 4.2 Check connection count and state

```sql
SELECT count(*), state
FROM pg_stat_activity
GROUP BY state
ORDER BY count DESC;
```

Expected in steady state: ~42 active connections (1 per API service), remainder idle or idle-in-transaction.

### 4.3 Identify slow queries

Requires `pg_stat_statements` extension (enabled by default):

```sql
SELECT
  left(query, 80) AS query_snippet,
  calls,
  round(mean_exec_time::numeric, 2) AS mean_ms,
  round(total_exec_time::numeric, 2) AS total_ms
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### 4.4 Kill a blocking query

```sql
-- Find blocking PIDs
SELECT pid, query, state, wait_event
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;

-- Terminate a specific PID
SELECT pg_terminate_backend(<pid>);
```

### 4.5 Safe schema changes (multi-schema Prisma)

**Never** run `prisma db push` — it will drop tables belonging to other domain schemas.

Use the safe migration path:

```bash
# Generate SQL diff without applying it
npx prisma@5.22.0 migrate diff \
  --from-empty \
  --to-schema-datamodel=packages/database/prisma/schemas/<domain>.prisma \
  --script | \
  PGPASSWORD=ims_secure_password_2026 psql -h localhost -U postgres -d ims \
    -v ON_ERROR_STOP=0
```

For adding a single column:

```sql
ALTER TABLE <table_name> ADD COLUMN IF NOT EXISTS <column_name> <type> <constraints>;
```

### 4.6 Regenerate a Prisma client after schema changes

```bash
npx prisma@5.22.0 generate --schema=packages/database/prisma/schemas/<domain>.prisma
```

---

## 5. Incident Response

### 5.1 Severity Levels

| Level | Definition | Response Time | Communication |
|-------|-----------|---------------|---------------|
| **P1** | System-wide outage — users cannot log in or core functions are unavailable | Respond in 15 min, resolve or mitigate in 1 hour | Immediate Slack + email to all stakeholders |
| **P2** | Major feature degradation — one or more modules are failing for most users | Respond in 30 min, resolve in 4 hours | Slack notification to stakeholders |
| **P3** | Minor issue — edge-case failure, cosmetic bug, single user affected | Respond in 1 business day | Ticket created, next sprint |

### 5.2 P1 Response Procedure

1. Acknowledge the alert in #ims-alerts-critical within 15 minutes.
2. Open a dedicated incident channel: `#incident-YYYYMMDD-<short-description>`.
3. Run a health check to determine scope:
   ```bash
   ./scripts/check-services.sh
   ```
4. Check gateway logs first — it is the single entry point for all traffic:
   ```bash
   DOCKER_API_VERSION=1.41 docker logs ims-api-gateway --tail 200
   ```
5. Attempt the fastest mitigation first (service restart, clear rate limits, full restart).
6. Post a status update every 30 minutes (see template below).
7. After resolution, schedule a post-incident review within 48 hours.

### 5.3 P2 Response Procedure

1. Acknowledge in #ims-alerts within 30 minutes.
2. Identify affected module(s) from the alert `job` label.
3. Follow the relevant alert-specific procedure in Section 1.
4. Post a status update when mitigated.
5. Create a ticket for root-cause fix if not immediately resolvable.

### 5.4 Status Update Template

```
[IMS Status Update — <HH:MM UTC>]
Incident: <short description>
Severity: P1 / P2
Status: Investigating / Mitigating / Resolved
Impact: <what is broken and how many users affected>
Last action taken: <what was done>
Next update: <HH:MM UTC>
```

### 5.5 Post-Incident Review Checklist

- [ ] Timeline of events documented (when alert fired, when acknowledged, when resolved)
- [ ] Root cause identified and written up
- [ ] Contributing factors listed (e.g. missing index, capacity, deployment change)
- [ ] Immediate fix described
- [ ] Follow-up action items created in the issue tracker with owners and due dates
- [ ] Alert thresholds or runbook steps updated if they proved insufficient
- [ ] Review meeting held within 48 hours of resolution (P1) or 1 week (P2)
- [ ] Review notes shared with the wider team in #ims-engineering

---

## 6. Deployment Procedure

### 6.1 Pre-deploy

Run all validation checks and confirm zero failures:

```bash
./scripts/pre-deploy-check.sh
```

Review the output. The only acceptable output is zero failures (41 warnings in dev are expected and safe).

### 6.2 Deploy

Pull new images and recreate containers with zero-downtime rolling update:

```bash
docker compose pull
docker compose up -d
```

This updates containers one by one, keeping old instances running until the new ones are healthy.

### 6.3 Post-deploy smoke tests

Run integration tests against the live system to confirm all modules respond correctly:

```bash
./scripts/test-all-modules.sh
```

All 465+ assertions must pass. If any fail, proceed to rollback (Section 6.4).

Individual module checks:

```bash
./scripts/test-hs-modules.sh        # Health & Safety
./scripts/test-env-modules.sh       # Environment
./scripts/test-quality-modules.sh   # Quality
./scripts/test-hr-modules.sh        # HR
./scripts/test-finance-modules.sh   # Finance
```

### 6.4 Rollback

If smoke tests fail or a critical alert fires immediately after deploy:

1. Scale down the broken service to zero:
   ```bash
   docker compose up -d --scale <service-name>=0
   ```

2. Pull and redeploy the previous image by tag:
   ```bash
   docker compose pull <service-name>   # or specify previous image tag in compose file
   docker compose up -d <service-name>
   ```

3. Confirm health:
   ```bash
   curl -s http://localhost:<PORT>/health | jq .
   ```

4. Run smoke tests again to confirm the rollback is stable:
   ```bash
   ./scripts/check-services.sh
   ```

5. Post an incident update and create a ticket to investigate the failed deployment.

---

## Quick Reference

| Task | Command |
|------|---------|
| Restart a service | `docker compose restart <service-name>` |
| View logs | `DOCKER_API_VERSION=1.41 docker logs ims-<service> --tail 100 -f` |
| Full system restart | `./scripts/startup.sh` |
| Health check all | `./scripts/check-services.sh` |
| DB backup | `./scripts/backup-db.sh` |
| DB connect | `PGPASSWORD=ims_secure_password_2026 psql -h localhost -U postgres -d ims` |
| Clear rate limits | `DOCKER_API_VERSION=1.41 docker exec ims-redis redis-cli FLUSHALL` |
| Rotate JWT secrets | `./scripts/rotate-secrets.sh --dry-run` then `./scripts/rotate-secrets.sh --apply` |
| Jaeger traces | `http://localhost:16686` |
| Prometheus | `http://localhost:9090` |
| Grafana | `http://localhost:3000` (4 dashboards: overview, API perf, security, SLO) |
| Alertmanager | `http://localhost:9093` |

---

*For startup and restart issues after a machine reboot, see `docs/DEPLOYMENT_CHECKLIST.md`.*
*For schema recreation and OpenSSL issues inside containers, see `docs/DATABASE_SCHEMA_NOTES.md`.*
*For the full API reference, see `docs/API_REFERENCE.md`.*
