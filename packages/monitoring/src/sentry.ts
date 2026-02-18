import { createLogger } from './logger';

const logger = createLogger('sentry');

let sentryInitialized = false;
let SentryModule: any = null;

/**
 * Initialize Sentry error tracking.
 *
 * This is **opt-in**. It only activates when `SENTRY_DSN` environment variable
 * is set. When not configured, all exports are no-ops.
 *
 * Note: Requires `@sentry/node` to be installed. If the dependency is missing,
 * initialization is silently skipped (graceful degradation).
 *
 * @param serviceName - The name of the service (used as serverName in Sentry)
 */
export function initSentry(serviceName: string): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    logger.info('Sentry DSN not configured — error tracking disabled', { serviceName });
    return;
  }

  try {
    // Dynamic import with try/catch — gracefully handles missing @sentry/node
    SentryModule = require('@sentry/node');

    SentryModule.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
      serverName: serviceName,
      release: process.env.SENTRY_RELEASE || `${serviceName}@1.0.0`,
    });

    sentryInitialized = true;
    logger.info('Sentry initialized', {
      serviceName,
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error: unknown) {
    // @sentry/node not installed — graceful degradation
    logger.info('Sentry SDK not available (@sentry/node not installed) — error tracking disabled', {
      serviceName,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Returns an Express error-handling middleware for Sentry.
 * If Sentry is not initialized, returns a passthrough middleware.
 */
export function sentryErrorHandler(): (
  err: unknown,
  req: unknown,
  res: unknown,
  next: (err?: unknown) => void
) => void {
  if (sentryInitialized && SentryModule?.Handlers?.errorHandler) {
    return SentryModule.Handlers.errorHandler();
  }

  // No-op middleware — just forwards the error
  return (err: unknown, _req: unknown, _res: unknown, next: (err?: unknown) => void) => {
    next(err);
  };
}

/**
 * Capture an exception in Sentry.
 * No-op if Sentry is not initialized.
 */
export function captureException(error: Error | unknown): void {
  if (sentryInitialized && SentryModule?.captureException) {
    SentryModule.captureException(error);
  }
}

/**
 * Capture a message in Sentry.
 * No-op if Sentry is not initialized.
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  if (sentryInitialized && SentryModule?.captureMessage) {
    SentryModule.captureMessage(message, level);
  }
}

/**
 * Set user context in Sentry for error reports.
 * No-op if Sentry is not initialized.
 */
export function setSentryUser(
  user: { id: string; email?: string; username?: string } | null
): void {
  if (sentryInitialized && SentryModule?.setUser) {
    SentryModule.setUser(user);
  }
}

/**
 * Check whether Sentry is currently initialized.
 */
export function isSentryInitialized(): boolean {
  return sentryInitialized;
}
