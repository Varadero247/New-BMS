import * as Sentry from '@sentry/node';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('sentry');

export function initSentry(serviceName: string): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    logger.info('Sentry DSN not configured — skipping initialization', { service: serviceName });
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    release: `${serviceName}@${process.env.npm_package_version || '1.0.0'}`,
    serverName: serviceName,
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    integrations: [Sentry.httpIntegration()],
    beforeSend(event) {
      // Strip all sensitive headers from error reports
      if (event.request?.headers) {
        const sensitiveHeaders = [
          'authorization',
          'cookie',
          'x-api-key',
          'x-scim-token',
          'x-auth-token',
          'x-csrf-token',
          'proxy-authorization',
          'set-cookie',
        ];
        for (const header of sensitiveHeaders) {
          delete event.request.headers[header];
        }
      }

      // Strip sensitive query parameters from the URL
      if (event.request?.url) {
        try {
          const url = new URL(event.request.url);
          const sensitiveParams = ['token', 'access_token', 'api_key', 'key', 'secret', 'password'];
          for (const param of sensitiveParams) {
            if (url.searchParams.has(param)) {
              url.searchParams.set(param, '[REDACTED]');
            }
          }
          event.request.url = url.toString();
        } catch {
          // URL parsing failed — leave as-is
        }
      }

      // Strip sensitive data from extra/contexts
      if (event.extra) {
        const sensitiveKeys = ['password', 'secret', 'token', 'apiKey', 'api_key', 'authorization'];
        for (const key of Object.keys(event.extra)) {
          if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
            event.extra[key] = '[REDACTED]';
          }
        }
      }

      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      // Scrub sensitive data from HTTP breadcrumbs
      if (breadcrumb.category === 'http' && breadcrumb.data?.url) {
        try {
          const url = new URL(breadcrumb.data.url);
          const sensitiveParams = ['token', 'access_token', 'api_key', 'key', 'secret'];
          for (const param of sensitiveParams) {
            if (url.searchParams.has(param)) {
              url.searchParams.set(param, '[REDACTED]');
            }
          }
          breadcrumb.data.url = url.toString();
        } catch {
          // URL parsing failed — leave as-is
        }
      }
      return breadcrumb;
    },
  });

  logger.info('Sentry initialized', { service: serviceName, environment: process.env.NODE_ENV });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sentryErrorHandler(): (...args: any[]) => void {
  return Sentry.expressErrorHandler() as (...args: any[]) => void;
}

export { Sentry };
