import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { trace, SpanStatusCode, Span, SpanKind } from '@opentelemetry/api';
import { createLogger } from './logger';

const logger = createLogger('tracing');

export interface TracingConfig {
  serviceName: string;
  serviceVersion?: string;
  environment?: string;
  otlpEndpoint?: string;
  enabled?: boolean;
}

let sdk: NodeSDK | null = null;

/**
 * Initialize OpenTelemetry distributed tracing.
 *
 * Tracing is **opt-in**. It only activates when one of the following is true:
 *   - `config.enabled` is explicitly `true`
 *   - `config.otlpEndpoint` is provided
 *   - The `OTEL_EXPORTER_OTLP_ENDPOINT` environment variable is set
 *   - The `OTEL_TRACING_ENABLED` environment variable is `'true'`
 *
 * When none of these conditions are met, tracing is a no-op (returns null).
 *
 * Call this BEFORE any other imports in your application entry point:
 * ```ts
 * import { initTracing } from '@ims/monitoring';
 * initTracing({ serviceName: 'api-gateway' });
 * ```
 *
 * For cross-service trace propagation (gateway -> downstream), the
 * auto-instrumentations automatically inject and extract W3C Trace Context
 * headers (`traceparent` / `tracestate`) on outgoing HTTP requests.
 */
export function initTracing(config: TracingConfig): NodeSDK | null {
  const otlpEndpoint = config.otlpEndpoint || process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  const isEnabled =
    config.enabled === true ||
    !!otlpEndpoint ||
    process.env.OTEL_TRACING_ENABLED === 'true';

  if (!isEnabled) {
    return null;
  }

  const resource = new Resource({
    [ATTR_SERVICE_NAME]: config.serviceName,
    [ATTR_SERVICE_VERSION]: config.serviceVersion || '1.0.0',
    'deployment.environment': config.environment || process.env.NODE_ENV || 'development',
  });

  const traceExporter = new OTLPTraceExporter({
    url: otlpEndpoint ? `${otlpEndpoint}/v1/traces` : undefined,
  });

  sdk = new NodeSDK({
    resource,
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable noisy low-level instrumentations
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-dns': { enabled: false },
        // Enable the ones we care about for cross-service tracing
        '@opentelemetry/instrumentation-http': { enabled: true },
        '@opentelemetry/instrumentation-express': { enabled: true },
        '@opentelemetry/instrumentation-pg': { enabled: true },
      }),
    ],
  });

  sdk.start();

  // Graceful shutdown on SIGTERM
  process.on('SIGTERM', () => {
    sdk?.shutdown()
      .then(() => logger.info('Tracing terminated', { serviceName: config.serviceName }))
      .catch((error) => logger.error('Error terminating tracing', { error: error instanceof Error ? error.message : String(error) }));
  });

  logger.info('Tracing initialized', { serviceName: config.serviceName, endpoint: otlpEndpoint || 'default' });
  return sdk;
}

/**
 * Shutdown tracing gracefully
 */
export async function shutdownTracing(): Promise<void> {
  if (sdk) {
    await sdk.shutdown();
  }
}

/**
 * Get the current tracer
 */
export function getTracer(name: string = 'default') {
  return trace.getTracer(name);
}

/**
 * Create a new span for tracing
 */
export function createSpan(
  name: string,
  fn: (span: Span) => Promise<void> | void,
  options?: { kind?: SpanKind; attributes?: Record<string, string | number | boolean> }
): Promise<void> {
  const tracer = getTracer();
  return tracer.startActiveSpan(name, { kind: options?.kind }, async (span) => {
    if (options?.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        span.setAttribute(key, value);
      });
    }
    try {
      await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Add attributes to the current span
 */
export function addSpanAttributes(attributes: Record<string, string | number | boolean>): void {
  const span = trace.getActiveSpan();
  if (span) {
    Object.entries(attributes).forEach(([key, value]) => {
      span.setAttribute(key, value);
    });
  }
}

/**
 * Record an exception on the current span
 */
export function recordException(error: Error): void {
  const span = trace.getActiveSpan();
  if (span) {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
  }
}

/**
 * Get the current trace context for propagation
 */
export function getTraceContext(): { traceId: string; spanId: string } | null {
  const span = trace.getActiveSpan();
  if (!span) return null;

  const spanContext = span.spanContext();
  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
  };
}

/**
 * Express middleware to extract trace info and add to request
 */
export function traceMiddleware() {
  return (req: { traceId?: string; spanId?: string }, res: { setHeader: (name: string, value: string) => void }, next: () => void) => {
    const span = trace.getActiveSpan();
    if (span) {
      const spanContext = span.spanContext();
      req.traceId = spanContext.traceId;
      req.spanId = spanContext.spanId;

      // Add trace ID to response headers
      res.setHeader('X-Trace-Id', spanContext.traceId);
    }
    next();
  };
}

/**
 * Wrap a function in a tracing span. If tracing is not configured,
 * the function is called directly without any overhead.
 *
 * ```ts
 * const result = await withSpan('processOrder', async () => {
 *   return await orderService.process(orderId);
 * });
 * ```
 */
export async function withSpan<T>(name: string, fn: () => T | Promise<T>): Promise<T> {
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  const isEnabled =
    !!endpoint ||
    process.env.OTEL_TRACING_ENABLED === 'true';

  if (!isEnabled) {
    return fn();
  }

  const tracer = getTracer();
  return tracer.startActiveSpan(name, async (span) => {
    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

// Re-export OpenTelemetry types for convenience
export { SpanKind, SpanStatusCode } from '@opentelemetry/api';
