import { createLogger, createRequestLogger } from '../src/logger';
import type { Logger } from '../src/logger';

describe('createLogger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = createLogger('test-service');
  });

  it('returns a logger instance', () => {
    expect(logger).toBeDefined();
    expect(typeof logger).toBe('object');
  });

  it('has expected logging methods', () => {
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('default meta includes the service name', () => {
    expect(logger.defaultMeta).toBeDefined();
    expect(logger.defaultMeta).toEqual(expect.objectContaining({ service: 'test-service' }));
  });

  it('can log info level messages without throwing', () => {
    expect(() => {
      logger.info('Test info message');
    }).not.toThrow();
  });

  it('can log error level messages without throwing', () => {
    expect(() => {
      logger.error('Test error message');
    }).not.toThrow();
  });

  it('can log with additional metadata without throwing', () => {
    expect(() => {
      logger.info('Test with meta', { userId: 123, action: 'login' });
    }).not.toThrow();
  });

  it('creates distinct loggers for different service names', () => {
    const loggerA = createLogger('service-a');
    const loggerB = createLogger('service-b');

    expect(loggerA).not.toBe(loggerB);
    expect(loggerA.defaultMeta).toEqual(expect.objectContaining({ service: 'service-a' }));
    expect(loggerB.defaultMeta).toEqual(expect.objectContaining({ service: 'service-b' }));
  });

  it('respects LOG_LEVEL environment variable', () => {
    const originalLevel = process.env.LOG_LEVEL;

    process.env.LOG_LEVEL = 'debug';
    const debugLogger = createLogger('debug-service');
    expect(debugLogger.level).toBe('debug');

    process.env.LOG_LEVEL = 'warn';
    const warnLogger = createLogger('warn-service');
    expect(warnLogger.level).toBe('warn');

    if (originalLevel !== undefined) {
      process.env.LOG_LEVEL = originalLevel;
    } else {
      delete process.env.LOG_LEVEL;
    }
  });

  it('defaults to info level when LOG_LEVEL is not set', () => {
    const originalLevel = process.env.LOG_LEVEL;
    delete process.env.LOG_LEVEL;

    const infoLogger = createLogger('info-service');
    expect(infoLogger.level).toBe('info');

    if (originalLevel !== undefined) {
      process.env.LOG_LEVEL = originalLevel;
    }
  });
});

describe('createLogger — extended', () => {
  it('can log warn level messages without throwing', () => {
    const logger = createLogger('warn-test-service');
    expect(() => {
      logger.warn('Test warning message');
    }).not.toThrow();
  });

  it('can log debug level messages without throwing', () => {
    const logger = createLogger('debug-test-service');
    expect(() => {
      logger.debug('Test debug message');
    }).not.toThrow();
  });

  it('logger instance is an object with defaultMeta property', () => {
    const logger = createLogger('meta-service');
    expect(typeof logger).toBe('object');
    expect(logger).toHaveProperty('defaultMeta');
  });

  it('defaultMeta service name matches the argument passed', () => {
    const logger = createLogger('my-unique-service-xyz');
    expect(logger.defaultMeta).toEqual(
      expect.objectContaining({ service: 'my-unique-service-xyz' })
    );
  });

  it('logger level is a string value', () => {
    const logger = createLogger('level-check-service');
    expect(typeof logger.level).toBe('string');
    expect(logger.level.length).toBeGreaterThan(0);
  });

  it('can log error with an Error object as metadata without throwing', () => {
    const logger = createLogger('error-meta-service');
    expect(() => {
      logger.error('Something went wrong', { error: new Error('inner error') });
    }).not.toThrow();
  });

  it('accepts error level LOG_LEVEL', () => {
    const orig = process.env.LOG_LEVEL;
    process.env.LOG_LEVEL = 'error';
    const logger = createLogger('error-level-svc');
    expect(logger.level).toBe('error');
    if (orig !== undefined) process.env.LOG_LEVEL = orig;
    else delete process.env.LOG_LEVEL;
  });

  it('accepts verbose LOG_LEVEL', () => {
    const orig = process.env.LOG_LEVEL;
    process.env.LOG_LEVEL = 'verbose';
    const logger = createLogger('verbose-svc');
    expect(logger.level).toBe('verbose');
    if (orig !== undefined) process.env.LOG_LEVEL = orig;
    else delete process.env.LOG_LEVEL;
  });

  it('logger has add and remove transport methods', () => {
    const logger = createLogger('transport-test');
    expect(typeof logger.add).toBe('function');
    expect(typeof logger.remove).toBe('function');
  });

  it('can log verbose level messages without throwing', () => {
    const orig = process.env.LOG_LEVEL;
    process.env.LOG_LEVEL = 'verbose';
    const logger = createLogger('verbose-log-svc');
    expect(() => logger.verbose('verbose msg')).not.toThrow();
    if (orig !== undefined) process.env.LOG_LEVEL = orig;
    else delete process.env.LOG_LEVEL;
  });

  it('can log with numeric metadata without throwing', () => {
    const logger = createLogger('numeric-meta-svc');
    expect(() => {
      logger.info('Numeric metadata', { count: 42, duration: 1.5 });
    }).not.toThrow();
  });
});

describe('createRequestLogger', () => {
  it('returns a child logger when correlationId is on the request', () => {
    const parent = createLogger('req-logger-svc');
    const req = { correlationId: 'abc-123' };
    const child = createRequestLogger(parent, req);
    expect(child).toBeDefined();
    expect(typeof child.info).toBe('function');
  });

  it('returns a child logger when correlation ID is in headers', () => {
    const parent = createLogger('req-logger-header-svc');
    const req = { headers: { 'x-correlation-id': 'header-id-456' } };
    const child = createRequestLogger(parent, req);
    expect(child).toBeDefined();
  });

  it('returns a child logger with unknown correlation ID when none is set', () => {
    const parent = createLogger('req-logger-unknown-svc');
    const child = createRequestLogger(parent, {});
    expect(child).toBeDefined();
    expect(typeof child.info).toBe('function');
  });

  it('child logger can log without throwing', () => {
    const parent = createLogger('req-child-log-svc');
    const child = createRequestLogger(parent, { correlationId: 'test-id' });
    expect(() => child.info('Request processed')).not.toThrow();
  });
});
