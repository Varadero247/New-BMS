# ADR-006: One DB Connection Pool Per Service (connection_limit=1)

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


**Date**: 2026-02-19
**Status**: Accepted

## Context

With 42 API services all connecting to the same PostgreSQL instance, connection pooling strategy is critical. The database's `max_connections` is configured at 100.

Without a connection strategy:
- Each service's Prisma client opens a pool of connections by default (typically 5–10)
- 42 services × 5 connections = 210 connections → exceeds `max_connections=100`
- Services start failing with "too many clients" errors under load

Options:
1. **PgBouncer** — external connection pooler, adds infrastructure complexity
2. **Increase `max_connections`** — requires PostgreSQL restart, still doesn't scale indefinitely
3. **Set `connection_limit=1` per service** — each service holds one connection max
4. **Shared connection pool package** — single pool across all services (not feasible in separate processes)

## Decision

Add `?connection_limit=1` to every service's `DATABASE_URL` / domain-specific URL in all `.env` files.

```
HEALTH_SAFETY_DATABASE_URL=postgresql://postgres:...@localhost:5432/ims?connection_limit=1
```

This is applied to all 42 API services and `packages/database/.env`.

## Consequences

**Positive:**
- 42 services × 1 connection = 42 total connections — well within `max_connections=100`
- No PgBouncer required — reduces operational complexity
- Prisma lazy-connects (opens the connection only on first query) — services that are idle hold 0 connections
- Sufficient for current load: each service handles requests sequentially per connection; under low-to-medium load this is adequate

**Negative:**
- Under high concurrent load, a service with `connection_limit=1` queues queries. **Impact**: increases latency for bursty traffic
- If a service receives many simultaneous long-running queries, the single connection becomes a bottleneck
- **Not suitable for production under heavy load** — should be increased to 3–5 per service and PgBouncer deployed when traffic grows

**Production recommendation:**
Scale `connection_limit` per service based on load testing results. High-traffic services (gateway, analytics, dashboard) should use `connection_limit=5`. Deploy PgBouncer in transaction mode as a long-term solution for 100+ concurrent users per service.
