import { createLogger } from '../src/logger';
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

    // Restore
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

    // Restore
    if (originalLevel !== undefined) {
      process.env.LOG_LEVEL = originalLevel;
    }
  });
});
