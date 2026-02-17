# @ims/monitoring

Observability package for all IMS API services. Provides structured logging, Prometheus metrics, health checks, and request correlation.

## Features

- Structured JSON logging with Winston
- Prometheus-compatible metrics (request count, duration, error rate)
- Correlation ID propagation across services
- Health check endpoint generator
- OpenTelemetry tracing support
- Sentry error reporting integration

## Usage

```typescript
import {
  createLogger,
  metricsMiddleware,
  metricsHandler,
  correlationIdMiddleware,
  createHealthCheck,
} from '@ims/monitoring';

const logger = createLogger('api-quality');
const app = express();

// Add middleware
app.use(correlationIdMiddleware);
app.use(metricsMiddleware);

// Health check endpoint
app.get('/health', createHealthCheck({ service: 'api-quality', version: '1.0.0' }));

// Metrics endpoint (Prometheus scraping)
app.get('/metrics', metricsHandler);

// Structured logging
logger.info('Server started', { port: 4003 });
logger.error('Request failed', { error: err.message, correlationId: req.correlationId });
```

## Exports

| Export | Description |
|--------|-------------|
| `createLogger(name)` | Creates a Winston logger with JSON format |
| `metricsMiddleware` | Express middleware — tracks request count, duration, status |
| `metricsHandler` | Express handler — serves Prometheus metrics at `/metrics` |
| `correlationIdMiddleware` | Propagates `x-correlation-id` header across requests |
| `createHealthCheck(opts)` | Returns Express handler with service health status |
