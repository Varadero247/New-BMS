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
    integrations: [
      Sentry.httpIntegration(),
    ],
    beforeSend(event) {
      // Strip sensitive data
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      return event;
    },
  });

  logger.info('Sentry initialized', { service: serviceName, environment: process.env.NODE_ENV });
}

export function sentryErrorHandler() {
  return Sentry.expressErrorHandler();
}

export { Sentry };
