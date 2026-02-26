# Distributed Tracing — Nexara IMS

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


> **Package**: `@ims/monitoring`
> **Function**: `initTracing()` in `packages/monitoring/src/tracing.ts`

---

## Architecture

```
┌─────────────────┐    OTLP/HTTP    ┌──────────────────────┐
│  api-gateway    │ ──────────────► │  OpenTelemetry       │
│  api-health-*   │                 │  Collector           │
│  api-environment│                 │  (port 4317 gRPC,    │
│  … 42 services  │                 │   port 4318 HTTP)    │
└─────────────────┘                 └──────────┬───────────┘
                                               │
                           ┌───────────────────┼───────────────────┐
                           ▼                   ▼                   ▼
                    ┌─────────────┐   ┌──────────────┐   ┌─────────────────┐
                    │   Jaeger    │   │ Grafana Tempo │   │   Prometheus    │
                    │  (dev/stg)  │   │  (production) │   │   (metrics)     │
                    │  :16686 UI  │   │               │   │   :9090         │
                    └─────────────┘   └──────────────┘   └─────────────────┘
```

All 42 API services call `initTracing()` at startup. Tracing is **opt-in** — it is a no-op unless `OTEL_TRACING_ENABLED=true` or `OTEL_EXPORTER_OTLP_ENDPOINT` is set.

### Trace propagation

When the gateway proxies a request to a downstream service, OpenTelemetry automatically injects a **W3C `traceparent` header**. The downstream service picks this up and creates a child span, linking the entire request chain into a single distributed trace.

---

## Enabling Tracing Locally

1. Start Jaeger alongside the IMS stack:

   ```bash
   # Via Docker directly:
   docker run -d --name ims-jaeger \
     -p 16686:16686 -p 4317:4317 -p 4318:4318 \
     -e COLLECTOR_OTLP_ENABLED=true \
     jaegertracing/all-in-one:1.56
   ```

   Or add to `docker-compose.yml` — a `jaeger` service is already defined in the compose file.

2. Set environment variables in any API service `.env`:

   ```env
   OTEL_TRACING_ENABLED=true
   OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
   ```

3. Start the service and make some requests.

4. Open the Jaeger UI at **http://localhost:16686** → select service → Find Traces.

---

## Creating Custom Spans

Use the helpers exported from `@ims/monitoring`:

```typescript
import { withSpan, createSpan, addSpanAttributes } from '@ims/monitoring';

// Simple wrapper — zero boilerplate
const result = await withSpan('processInvoice', async () => {
  return await invoiceService.process(invoiceId);
});

// Full control with attributes
await createSpan('validateRiskScore', async (span) => {
  addSpanAttributes({ 'risk.id': riskId, 'risk.score': score });
  span.setAttribute('validation.result', 'pass');
  await validateScore(riskId, score);
}, { kind: SpanKind.INTERNAL });
```

---

## Span Naming Convention

| Layer       | Format                        | Example                       |
|-------------|-------------------------------|-------------------------------|
| HTTP route  | `HTTP METHOD /path`           | `HTTP POST /api/incidents`    |
| DB query    | `MODEL.operation`             | `Incident.findMany`           |
| Business    | `camelCaseAction`             | `calculateRiskScore`          |
| External    | `service.operation`           | `ai-analysis.analyse`         |

---

## Production Setup

In production, traces go to Grafana Tempo via the OpenTelemetry Collector:

```env
OTEL_TRACING_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
```

The Collector config is at `deploy/monitoring/otel/otel-collector.yaml`.

Tempo retention is configured in `deploy/monitoring/grafana/datasources/tempo.yaml`.

---

## Debugging Tracing Issues

```bash
# Check if spans are being received by Jaeger
curl http://localhost:16686/api/services

# Check OTEL Collector health
curl http://localhost:13133/

# Check zpages for pipeline details
curl http://localhost:55679/debug/tracez

# Enable verbose OTEL SDK logging
export OTEL_LOG_LEVEL=debug
```

---

## Key Files

| File | Purpose |
|------|---------|
| `packages/monitoring/src/tracing.ts` | `initTracing()`, `withSpan()`, `createSpan()` |
| `deploy/monitoring/otel/otel-collector.yaml` | Collector config |
| `.github/workflows/ci.yml` | CI doesn't run tracing (opt-in only) |
| `apps/api-gateway/src/index.ts` | Gateway calls `initTracing({ serviceName: 'api-gateway' })` |
