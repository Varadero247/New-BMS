import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { trace, context, SpanStatusCode, Span, SpanKind } from '@opentelemetry/api';

export interface TracingConfig {
  serviceName: string;
  serviceVersion?: string;
  environment?: string;
  jaegerEndpoint?: string;
  otlpEndpoint?: string;
  enabled?: boolean;
  debug?: boolean;
}

let sdk: NodeSDK | null = null;

/**
 * Initialize OpenTelemetry tracing
 * Call this BEFORE any other imports in your application entry point
 */
export function initTracing(config: TracingConfig): void {
  if (!config.enabled && config.enabled !== undefined) {
    console.log('Tracing disabled');
    return;
  }

  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: config.serviceName,
    [SemanticResourceAttributes.SERVICE_VERSION]: config.serviceVersion || '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.environment || process.env.NODE_ENV || 'development',
  });

  // Choose exporter based on configuration
  let spanProcessor;
  if (config.otlpEndpoint) {
    const exporter = new OTLPTraceExporter({
      url: config.otlpEndpoint,
    });
    spanProcessor = new BatchSpanProcessor(exporter);
  } else if (config.jaegerEndpoint) {
    const exporter = new JaegerExporter({
      endpoint: config.jaegerEndpoint,
    });
    spanProcessor = config.debug
      ? new SimpleSpanProcessor(exporter)
      : new BatchSpanProcessor(exporter);
  } else {
    // Default to OTLP endpoint from environment
    const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';
    const exporter = new OTLPTraceExporter({ url: endpoint });
    spanProcessor = new BatchSpanProcessor(exporter);
  }

  sdk = new NodeSDK({
    resource,
    spanProcessor,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-dns': { enabled: false },
      }),
    ],
  });

  sdk.start();

  // Handle shutdown
  process.on('SIGTERM', () => {
    sdk?.shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.error('Error terminating tracing', error));
  });

  console.log(`Tracing initialized for ${config.serviceName}`);
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
  return (req: any, res: any, next: () => void) => {
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

// Re-export OpenTelemetry types for convenience
export { SpanKind, SpanStatusCode } from '@opentelemetry/api';
