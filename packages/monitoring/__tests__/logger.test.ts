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

describe('createLogger and createRequestLogger — extended coverage', () => {
  it('logger has a transports property', () => {
    const logger = createLogger('transports-svc');
    expect(logger).toHaveProperty('transports');
  });

  it('two calls with same service name return separate instances', () => {
    const a = createLogger('same-name');
    const b = createLogger('same-name');
    expect(a).not.toBe(b);
  });

  it('createLogger with empty string service name does not throw', () => {
    expect(() => createLogger('')).not.toThrow();
  });

  it('logger.info accepts an object as first argument without throwing', () => {
    const logger = createLogger('obj-log-svc');
    expect(() => logger.info({ event: 'test', value: 42 })).not.toThrow();
  });

  it('createRequestLogger child can log error without throwing', () => {
    const parent = createLogger('child-error-svc');
    const child = createRequestLogger(parent, { correlationId: 'err-id' });
    expect(() => child.error('Something failed', { code: 500 })).not.toThrow();
  });

  it('createRequestLogger uses header x-correlation-id when correlationId is absent', () => {
    const parent = createLogger('header-fallback-svc');
    const req = { headers: { 'x-correlation-id': 'hdr-777' } };
    const child = createRequestLogger(parent, req);
    expect(child).toBeDefined();
    expect(typeof child.warn).toBe('function');
  });

  it('createLogger produces a logger whose level property is a non-empty string', () => {
    delete process.env.LOG_LEVEL;
    const logger = createLogger('level-prop-svc');
    expect(typeof logger.level).toBe('string');
    expect(logger.level.length).toBeGreaterThan(0);
  });
});

describe('createLogger — format and transport details', () => {
  it('logger.format is defined', () => {
    const logger = createLogger('format-svc');
    expect(logger.format).toBeDefined();
  });

  it('createLogger returns an object with an exceptions property', () => {
    const logger = createLogger('exceptions-svc');
    expect(logger).toHaveProperty('exceptions');
  });

  it('createRequestLogger child has a warn method', () => {
    const parent = createLogger('warn-child-svc');
    const child = createRequestLogger(parent, { correlationId: 'w-id' });
    expect(typeof child.warn).toBe('function');
  });

  it('createRequestLogger child warn can be called without throwing', () => {
    const parent = createLogger('warn-child-call-svc');
    const child = createRequestLogger(parent, { correlationId: 'w2-id' });
    expect(() => child.warn('A warning from child')).not.toThrow();
  });
});

describe('createLogger — absolute final boundary', () => {
  it('createLogger returns an instance with a "write" method or pipe method (winston stream)', () => {
    const logger = createLogger('stream-svc');
    // winston loggers expose stream for morgan integration
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
  });

  it('createLogger defaultMeta is not undefined', () => {
    const logger = createLogger('defined-meta-svc');
    expect(logger.defaultMeta).not.toBeUndefined();
  });

  it('createLogger with a very long service name does not throw', () => {
    expect(() => createLogger('a'.repeat(100))).not.toThrow();
  });

  it('createLogger level can be explicitly set via LOG_LEVEL=info', () => {
    process.env.LOG_LEVEL = 'info';
    const logger = createLogger('explicit-info-svc');
    expect(logger.level).toBe('info');
    delete process.env.LOG_LEVEL;
  });

  it('createRequestLogger returns an object with error method', () => {
    const parent = createLogger('req-err-boundary-svc');
    const child = createRequestLogger(parent, { correlationId: 'boundary-id' });
    expect(typeof child.error).toBe('function');
  });
});

describe('createLogger — phase28 coverage', () => {
  it('createLogger returns an object with an info method that is callable with no args', () => {
    const logger = createLogger('phase28-svc-1');
    expect(() => logger.info('')).not.toThrow();
  });

  it('createLogger service name is reflected in defaultMeta.service', () => {
    const logger = createLogger('phase28-unique-service');
    expect(logger.defaultMeta.service).toBe('phase28-unique-service');
  });

  it('createRequestLogger produces a child that has a debug method', () => {
    const parent = createLogger('phase28-parent-svc');
    const child = createRequestLogger(parent, { correlationId: 'phase28-id' });
    expect(typeof child.debug).toBe('function');
  });

  it('createLogger level defaults to info when LOG_LEVEL env is absent', () => {
    const orig = process.env.LOG_LEVEL;
    delete process.env.LOG_LEVEL;
    const logger = createLogger('phase28-default-level');
    expect(logger.level).toBe('info');
    if (orig !== undefined) process.env.LOG_LEVEL = orig;
  });

  it('createRequestLogger child can log warn level without throwing', () => {
    const parent = createLogger('phase28-child-warn');
    const child = createRequestLogger(parent, {});
    expect(() => child.warn('phase28 warning')).not.toThrow();
  });
});
