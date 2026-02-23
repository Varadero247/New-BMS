# IMS Structured Logging Guide

> **Package**: `@ims/monitoring`
> **Source**: `packages/monitoring/src/logger.ts` + `packages/monitoring/src/correlationId.ts`
> **Updated**: 2026-02-23

---

## Overview

All IMS services use [Winston](https://github.com/winstonjs/winston) via the shared
`@ims/monitoring` package.  Every log line is structured — meaning it carries consistent
machine-readable fields regardless of which service emits it.

- **Production** (`NODE_ENV=production`): pure JSON on stdout, no ANSI colour codes.
  Container runtimes (Docker, Kubernetes) and log aggregators (Loki, Datadog, CloudWatch
  Logs) consume this directly.
- **Development** (all other `NODE_ENV` values): colourised single-line text with a
  compact timestamp, making local tailing comfortable without losing the structured fields.

---

## Quick Start

```typescript
import { createLogger, createRequestLogger } from '@ims/monitoring';

// One logger per service — pass the service name once.
const logger = createLogger('api-inventory');

// Basic log calls
logger.info('Server started', { port: 4005 });
logger.warn('High memory usage', { heapUsedMb: 512 });
logger.error('Database connection failed', { err });
logger.debug('Cache miss', { key: 'inv:product:abc' });
```

---

## Log Levels

Levels follow the standard Winston/syslog severity order (lower number = more severe):

| Level   | When to use                                                        |
|---------|--------------------------------------------------------------------|
| `error` | Unrecoverable failures, uncaught exceptions, data loss scenarios   |
| `warn`  | Degraded state, retried operations, deprecated usage               |
| `info`  | Normal operational events — service start/stop, request summaries  |
| `debug` | Verbose diagnostic detail useful during active development         |

The active level is controlled by the `LOG_LEVEL` environment variable (default: `info`).
Set `LOG_LEVEL=debug` locally to enable debug output.

---

## Required Fields

Every logger created with `createLogger(serviceName)` automatically injects a `service`
field into every log entry via Winston's `defaultMeta`.  No action required.

When handling an HTTP request, attach a `correlationId` so log lines from the same
request can be grouped:

```typescript
import { createRequestLogger } from '@ims/monitoring';

router.get('/products', (req, res) => {
  const log = createRequestLogger(logger, req);
  log.info('Listing products');  // automatically includes correlationId
});
```

`createRequestLogger` reads `req.correlationId` (set by the gateway middleware) or falls
back to the `x-correlation-id` request header.

### Field Reference

| Field           | Type     | Source                               | Required          |
|-----------------|----------|--------------------------------------|-------------------|
| `timestamp`     | string   | Winston (auto)                       | Always            |
| `level`         | string   | Winston (auto)                       | Always            |
| `message`       | string   | caller                               | Always            |
| `service`       | string   | `createLogger(name)` defaultMeta     | Always            |
| `correlationId` | string   | `createRequestLogger` child logger   | On HTTP requests  |
| `err` / `stack` | string   | pass `{ err }` to log call           | On errors         |

---

## Production JSON Format

In production each log line is a single JSON object on stdout:

```json
{
  "timestamp": "2026-02-23 14:31:05",
  "level": "info",
  "message": "POST /api/inventory/products 201 142ms",
  "service": "api-inventory",
  "correlationId": "b3a1f2e0-9c4d-4a7b-8e2f-1d3c5f7a9b0e",
  "method": "POST",
  "path": "/api/inventory/products",
  "statusCode": 201,
  "durationMs": 142
}
```

Error with stack trace:

```json
{
  "timestamp": "2026-02-23 14:31:09",
  "level": "error",
  "message": "Unhandled route error",
  "service": "api-inventory",
  "correlationId": "b3a1f2e0-9c4d-4a7b-8e2f-1d3c5f7a9b0e",
  "stack": "Error: Cannot read properties of undefined...\n    at ...",
  "path": "/api/inventory/products/not-found"
}
```

---

## Development Format

```
14:31:05 [api-inventory] info: POST /api/inventory/products 201 142ms [b3a1f2e0]
14:31:09 [api-inventory] error: Unhandled route error [b3a1f2e0] {"path":"/api/..."}
```

---

## Correlation ID Middleware

The gateway attaches a correlation ID to every inbound request and propagates it to
downstream services via the `x-correlation-id` header.

```typescript
// apps/api-gateway/src/index.ts  (already applied — line 275)
import { correlationIdMiddleware } from '@ims/monitoring';
app.use(correlationIdMiddleware());
```

Downstream services receive the header and can attach it to their own request loggers:

```typescript
// Any downstream route handler
const log = createRequestLogger(logger, req);
log.info('Handling request');
// => { ..., correlationId: "b3a1f2e0-9c4d-4a7b-8e2f-1d3c5f7a9b0e" }
```

The correlation ID is also reflected in the HTTP response as `x-correlation-id`, so
clients and load balancers can tie a request to its log lines.

---

## Common Logging Patterns

### Service startup

```typescript
const logger = createLogger('api-crm');

app.listen(PORT, () => {
  logger.info('Service started', { port: PORT, env: process.env.NODE_ENV });
});
```

### HTTP request summary (middleware)

```typescript
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const log = createRequestLogger(logger, req);
    log.info(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - start}ms`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
    });
  });
  next();
});
```

### Database query timing

```typescript
const log = createRequestLogger(logger, req);
const t0 = Date.now();
const result = await prisma.product.findMany({ where: { orgId } });
log.debug('DB query complete', { table: 'product', rows: result.length, durationMs: Date.now() - t0 });
```

### External API call

```typescript
try {
  const response = await fetch('https://api.example.com/data');
  log.info('External API call succeeded', { url: 'https://api.example.com/data', status: response.status });
} catch (err) {
  log.error('External API call failed', { url: 'https://api.example.com/data', err });
}
```

### Business event

```typescript
log.info('Invoice created', {
  invoiceId: invoice.id,
  organisationId: invoice.orgId,
  amount: invoice.totalAmount,
  currency: invoice.currency,
});
```

### Authentication failure

```typescript
log.warn('Authentication failed', {
  reason: 'TOKEN_EXPIRED',
  userId: decoded?.sub,
  ip: req.ip,
  correlationId: req.correlationId,
});
```

---

## Searching Logs in Production

All services write JSON to stdout.  Collect logs with your preferred aggregator then use
`jq` for ad-hoc inspection.

### Filter by service

```bash
docker logs ims-api-inventory 2>&1 | jq 'select(.service == "api-inventory")'
```

### Filter by level

```bash
docker logs ims-api-gateway 2>&1 | jq 'select(.level == "error")'
```

### Find all errors for a correlation ID

```bash
docker logs ims-api-inventory 2>&1 \
  | jq 'select(.correlationId == "b3a1f2e0-9c4d-4a7b-8e2f-1d3c5f7a9b0e")'
```

### Errors in the last hour (requires `timestamp` field)

```bash
docker logs ims-api-gateway --since 1h 2>&1 | jq 'select(.level == "error")'
```

### Count errors per service across all containers

```bash
for svc in api-gateway api-inventory api-hr api-finance; do
  count=$(docker logs ims-$svc 2>&1 | jq -r 'select(.level=="error") | .level' | wc -l)
  echo "$svc: $count errors"
done
```

### Extract slow requests (> 500 ms)

```bash
docker logs ims-api-inventory 2>&1 | jq 'select(.durationMs > 500)'
```

---

## Log Retention Policy

| Log type      | Retention | Rationale                              |
|---------------|-----------|----------------------------------------|
| `error`       | 30 days   | Incident investigation window          |
| `warn`        | 14 days   | Trend analysis and SLA monitoring      |
| `info`        | 7 days    | Operational audit (high volume)        |
| `debug`       | 1 day     | Transient; never enabled in production |

These policies apply at the log aggregator level (Loki retention rules, CloudWatch log
group retention, etc.).  In development, local file transports rotate at 10 MB / 5 files
per service (controlled in `packages/monitoring/src/logger.ts`).

> Note: File transports are disabled in production.  All log data flows through stdout
> to the container runtime, then to the configured aggregator.

---

## Environment Variables

| Variable    | Default | Description                                         |
|-------------|---------|-----------------------------------------------------|
| `LOG_LEVEL` | `info`  | Minimum level to emit (`error`/`warn`/`info`/`debug`) |
| `NODE_ENV`  | —       | Set to `production` to enable JSON-only stdout output |

---

## Exports from `@ims/monitoring`

```typescript
import {
  createLogger,          // (serviceName: string) => winston.Logger
  createRequestLogger,   // (logger, req) => winston.Logger (child with correlationId)
  correlationIdMiddleware, // Express middleware — sets req.correlationId
  getCorrelationId,      // (req) => string
  CORRELATION_ID_HEADER, // 'x-correlation-id'
} from '@ims/monitoring';
```
