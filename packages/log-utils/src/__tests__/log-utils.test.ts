// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  Logger,
  createLogger,
  getLogLevelName,
  parseLogLevel,
  isValidLogLevel,
  formatError,
  mergeContext,
  sanitizeLogEntry,
  jsonFormatter,
  textFormatter,
  prettyFormatter,
  consoleTransport,
  memoryTransport,
  nullTransport,
  redact,
  createRedactingFormatter,
  redactString,
  createCorrelationContext,
  withCorrelation,
} from '../log-utils';
import { LogLevel, LogEntry } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEntry(overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level: LogLevel.INFO,
    levelName: 'INFO',
    name: 'test',
    message: 'hello',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// LOOP 1: logger.info + getLogs — 100 iterations
// ---------------------------------------------------------------------------

describe('Logger.info + getLogs (100 iterations)', () => {
  for (let i = 0; i < 100; i++) {
    it(`iteration ${i}: logs message with meta and getLogs returns correct entry`, () => {
      const logger = new Logger({ name: `svc-${i}`, level: LogLevel.TRACE });
      logger.info(`message-${i}`, { index: i, tag: `loop-${i}` });
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe(`message-${i}`);
      expect(logs[0].meta).toEqual({ index: i, tag: `loop-${i}` });
      expect(logs[0].level).toBe(LogLevel.INFO);
      expect(logs[0].levelName).toBe('INFO');
      expect(logs[0].name).toBe(`svc-${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// LOOP 2: child logger inherits context — 100 iterations
// ---------------------------------------------------------------------------

describe('child logger context inheritance (100 iterations)', () => {
  for (let i = 0; i < 100; i++) {
    it(`iteration ${i}: child inherits parent context and merges own`, () => {
      const parent = new Logger({
        name: 'parent',
        level: LogLevel.TRACE,
        context: { env: 'test', parentId: i },
      });
      const child = parent.child({ childId: i * 2, request: `req-${i}` });
      child.info(`child-message-${i}`);
      const logs = child.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].context).toEqual({
        env: 'test',
        parentId: i,
        childId: i * 2,
        request: `req-${i}`,
      });
      expect(logs[0].name).toBe('parent');
    });
  }
});

// ---------------------------------------------------------------------------
// LOOP 3: setLevel filters correctly — 100 iterations
// ---------------------------------------------------------------------------

describe('setLevel filtering (100 iterations)', () => {
  for (let i = 0; i < 100; i++) {
    it(`iteration ${i}: messages below set level are suppressed`, () => {
      const logger = new Logger({ name: 'filter-test', level: LogLevel.WARN });
      logger.trace(`trace-${i}`);
      logger.debug(`debug-${i}`);
      logger.info(`info-${i}`);
      logger.warn(`warn-${i}`);
      logger.error(`error-${i}`);
      const logs = logger.getLogs();
      // Only WARN and ERROR pass through (level >= WARN)
      expect(logs).toHaveLength(2);
      expect(logs[0].level).toBe(LogLevel.WARN);
      expect(logs[1].level).toBe(LogLevel.ERROR);
    });
  }
});

// ---------------------------------------------------------------------------
// LOOP 4: jsonFormatter produces valid JSON — 50 iterations
// ---------------------------------------------------------------------------

describe('jsonFormatter valid JSON (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: jsonFormatter returns parseable JSON with correct fields`, () => {
      const entry = makeEntry({
        message: `json-test-${i}`,
        meta: { value: i, tag: `t${i}` },
        level: LogLevel.DEBUG,
        levelName: 'DEBUG',
      });
      const result = jsonFormatter(entry);
      expect(() => JSON.parse(result)).not.toThrow();
      const parsed = JSON.parse(result);
      expect(parsed.message).toBe(`json-test-${i}`);
      expect(parsed.level).toBe(LogLevel.DEBUG);
      expect(parsed.meta.value).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// LOOP 5: textFormatter includes level name — 50 iterations
// ---------------------------------------------------------------------------

describe('textFormatter includes level name (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: textFormatter output includes level name and message`, () => {
      const levelValues = [LogLevel.TRACE, LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
      const level = levelValues[i % levelValues.length];
      const levelName = getLogLevelName(level);
      const entry = makeEntry({ message: `text-msg-${i}`, level, levelName });
      const result = textFormatter(entry);
      expect(result).toContain(levelName);
      expect(result).toContain(`text-msg-${i}`);
      expect(result).toContain('[test]');
    });
  }
});

// ---------------------------------------------------------------------------
// LOOP 6: redact hides specified fields — 50 iterations
// ---------------------------------------------------------------------------

describe('redact hides specified fields (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: redact replaces sensitive fields in meta and context`, () => {
      const entry = makeEntry({
        meta: { password: `secret-${i}`, username: `user-${i}`, value: i },
        context: { token: `tok-${i}`, env: 'test' },
      });
      const result = redact(entry, { fields: ['password', 'token'] });
      expect(result.meta?.password).toBe('***REDACTED***');
      expect(result.meta?.username).toBe(`user-${i}`);
      expect(result.meta?.value).toBe(i);
      expect(result.context?.token).toBe('***REDACTED***');
      expect(result.context?.env).toBe('test');
    });
  }
});

// ---------------------------------------------------------------------------
// LOOP 7: parseLogLevel round-trips — 50 iterations
// ---------------------------------------------------------------------------

describe('parseLogLevel round-trips (50 iterations)', () => {
  const pairs: Array<[string, LogLevel]> = [
    ['trace', LogLevel.TRACE],
    ['debug', LogLevel.DEBUG],
    ['info', LogLevel.INFO],
    ['warn', LogLevel.WARN],
    ['error', LogLevel.ERROR],
    ['fatal', LogLevel.FATAL],
  ];

  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: parseLogLevel correctly maps level string to enum`, () => {
      const [str, expected] = pairs[i % pairs.length];
      // lowercase
      expect(parseLogLevel(str)).toBe(expected);
      // uppercase
      expect(parseLogLevel(str.toUpperCase())).toBe(expected);
      // mixed case
      const mixed = str.charAt(0).toUpperCase() + str.slice(1);
      expect(parseLogLevel(mixed)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// LOOP 8: memoryTransport captures entries — 50 iterations
// ---------------------------------------------------------------------------

describe('memoryTransport captures entries (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: memoryTransport stores and retrieves entries`, () => {
      const mt = memoryTransport();
      const entry = makeEntry({ message: `mem-${i}`, meta: { idx: i } });
      mt.write(entry);
      const entries = mt.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].message).toBe(`mem-${i}`);
      expect(entries[0].meta?.idx).toBe(i);
      mt.clear();
      expect(mt.getEntries()).toHaveLength(0);
    });
  }
});

// ---------------------------------------------------------------------------
// LOOP 9: createCorrelationContext produces unique IDs — 50 iterations
// ---------------------------------------------------------------------------

describe('createCorrelationContext produces unique IDs (50 iterations)', () => {
  const seenIds = new Set<string>();

  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: createCorrelationContext generates a unique UUID`, () => {
      const ctx = createCorrelationContext();
      expect(typeof ctx.requestId).toBe('string');
      expect(ctx.requestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(seenIds.has(ctx.requestId)).toBe(false);
      seenIds.add(ctx.requestId);
      expect(typeof ctx.startTime).toBe('number');
      expect(typeof ctx.elapsed()).toBe('number');
      expect(ctx.elapsed()).toBeGreaterThanOrEqual(0);
    });
  }
});

// ---------------------------------------------------------------------------
// LOOP 10: mergeContext merges correctly — 50 iterations
// ---------------------------------------------------------------------------

describe('mergeContext merges correctly (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: mergeContext combines multiple context objects`, () => {
      const a = { env: 'prod', iteration: i };
      const b = { service: `svc-${i}`, version: '1.0' };
      const c = { requestId: `req-${i}` };
      const merged = mergeContext(a, b, c);
      expect(merged.env).toBe('prod');
      expect(merged.iteration).toBe(i);
      expect(merged.service).toBe(`svc-${i}`);
      expect(merged.version).toBe('1.0');
      expect(merged.requestId).toBe(`req-${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// Correctness tests for all functions and classes
// ---------------------------------------------------------------------------

describe('getLogLevelName', () => {
  it('returns TRACE for LogLevel.TRACE', () => {
    expect(getLogLevelName(LogLevel.TRACE)).toBe('TRACE');
  });
  it('returns DEBUG for LogLevel.DEBUG', () => {
    expect(getLogLevelName(LogLevel.DEBUG)).toBe('DEBUG');
  });
  it('returns INFO for LogLevel.INFO', () => {
    expect(getLogLevelName(LogLevel.INFO)).toBe('INFO');
  });
  it('returns WARN for LogLevel.WARN', () => {
    expect(getLogLevelName(LogLevel.WARN)).toBe('WARN');
  });
  it('returns ERROR for LogLevel.ERROR', () => {
    expect(getLogLevelName(LogLevel.ERROR)).toBe('ERROR');
  });
  it('returns FATAL for LogLevel.FATAL', () => {
    expect(getLogLevelName(LogLevel.FATAL)).toBe('FATAL');
  });
});

describe('isValidLogLevel', () => {
  it('returns true for valid levels', () => {
    expect(isValidLogLevel('trace')).toBe(true);
    expect(isValidLogLevel('DEBUG')).toBe(true);
    expect(isValidLogLevel('Info')).toBe(true);
    expect(isValidLogLevel('WARN')).toBe(true);
    expect(isValidLogLevel('error')).toBe(true);
    expect(isValidLogLevel('FATAL')).toBe(true);
  });
  it('returns false for invalid levels', () => {
    expect(isValidLogLevel('verbose')).toBe(false);
    expect(isValidLogLevel('critical')).toBe(false);
    expect(isValidLogLevel('')).toBe(false);
    expect(isValidLogLevel('log')).toBe(false);
  });
});

describe('formatError', () => {
  it('formats an error with message, name, and stack', () => {
    const err = new Error('something went wrong');
    const result = formatError(err);
    expect(result.message).toBe('something went wrong');
    expect(result.name).toBe('Error');
    expect(typeof result.stack).toBe('string');
  });

  it('formats a custom error type', () => {
    class CustomError extends Error {
      constructor(msg: string) {
        super(msg);
        this.name = 'CustomError';
      }
    }
    const err = new CustomError('custom message');
    const result = formatError(err);
    expect(result.name).toBe('CustomError');
    expect(result.message).toBe('custom message');
  });

  it('returns undefined stack when error has no stack', () => {
    const err = new Error('no-stack');
    delete err.stack;
    const result = formatError(err);
    expect(result.stack).toBeUndefined();
  });
});

describe('mergeContext', () => {
  it('merges two contexts', () => {
    const result = mergeContext({ a: 1 }, { b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('later keys override earlier keys', () => {
    const result = mergeContext({ x: 'first' }, { x: 'second' });
    expect(result.x).toBe('second');
  });

  it('merges zero contexts to empty object', () => {
    const result = mergeContext();
    expect(result).toEqual({});
  });

  it('merges one context unchanged', () => {
    const result = mergeContext({ hello: 'world' });
    expect(result).toEqual({ hello: 'world' });
  });

  it('does not mutate input objects', () => {
    const a = { x: 1 };
    const b = { y: 2 };
    mergeContext(a, b);
    expect(a).toEqual({ x: 1 });
    expect(b).toEqual({ y: 2 });
  });
});

describe('sanitizeLogEntry', () => {
  it('returns a new entry with same basic fields', () => {
    const entry = makeEntry({ message: 'hello' });
    const result = sanitizeLogEntry(entry);
    expect(result.message).toBe('hello');
    expect(result.level).toBe(entry.level);
    expect(result.levelName).toBe(entry.levelName);
    expect(result.name).toBe(entry.name);
  });

  it('truncates messages longer than 10,000 chars', () => {
    const longMsg = 'x'.repeat(11_000);
    const entry = makeEntry({ message: longMsg });
    const result = sanitizeLogEntry(entry);
    expect(result.message.length).toBeLessThan(11_000);
    expect(result.message).toContain('[truncated]');
  });

  it('handles circular references in meta', () => {
    const circular: Record<string, unknown> = { name: 'outer' };
    circular.self = circular;
    const entry = makeEntry({ meta: circular });
    expect(() => sanitizeLogEntry(entry)).not.toThrow();
    const result = sanitizeLogEntry(entry);
    expect(result.meta?.name).toBe('outer');
  });

  it('truncates long string values in meta', () => {
    const entry = makeEntry({ meta: { longVal: 'y'.repeat(11_000) } });
    const result = sanitizeLogEntry(entry);
    const val = result.meta?.longVal as string;
    expect(val).toContain('[truncated]');
  });

  it('preserves error field', () => {
    const entry = makeEntry({
      error: { name: 'Error', message: 'boom', stack: 'Error: boom\n  at ...' },
    });
    const result = sanitizeLogEntry(entry);
    expect(result.error?.name).toBe('Error');
    expect(result.error?.message).toBe('boom');
  });
});

describe('jsonFormatter', () => {
  it('serializes entry to valid JSON', () => {
    const entry = makeEntry({ message: 'test', meta: { key: 'value' } });
    const json = jsonFormatter(entry);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('preserves all entry fields', () => {
    const entry = makeEntry({
      message: 'full',
      meta: { a: 1 },
      error: { name: 'Error', message: 'err' },
    });
    const parsed = JSON.parse(jsonFormatter(entry));
    expect(parsed.message).toBe('full');
    expect(parsed.meta.a).toBe(1);
    expect(parsed.error.name).toBe('Error');
  });
});

describe('textFormatter', () => {
  it('includes timestamp, level, name, message', () => {
    const entry = makeEntry({ message: 'text test', name: 'myapp' });
    const result = textFormatter(entry);
    expect(result).toContain('INFO');
    expect(result).toContain('[myapp]');
    expect(result).toContain('text test');
  });

  it('includes meta key=value pairs', () => {
    const entry = makeEntry({ meta: { foo: 'bar', count: 42 } });
    const result = textFormatter(entry);
    expect(result).toContain('foo=');
    expect(result).toContain('count=');
  });

  it('includes error information', () => {
    const entry = makeEntry({
      error: { name: 'TypeError', message: 'bad type' },
    });
    const result = textFormatter(entry);
    expect(result).toContain('TypeError');
    expect(result).toContain('bad type');
  });

  it('does not include meta section when meta is empty', () => {
    const entry = makeEntry({ meta: {} });
    const result = textFormatter(entry);
    // No stray key= pairs
    expect(result).not.toContain('key=');
  });
});

describe('prettyFormatter', () => {
  it('includes ANSI escape codes', () => {
    const entry = makeEntry({ message: 'pretty test', level: LogLevel.ERROR, levelName: 'ERROR' });
    const result = prettyFormatter(entry);
    expect(result).toContain('\x1b[');
  });

  it('includes level name and message', () => {
    const entry = makeEntry({ message: 'pretty msg', levelName: 'WARN', level: LogLevel.WARN });
    const result = prettyFormatter(entry);
    expect(result).toContain('WARN');
    expect(result).toContain('pretty msg');
  });
});

describe('consoleTransport', () => {
  it('calls console.log for INFO level', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const transport = consoleTransport(jsonFormatter);
    const entry = makeEntry({ level: LogLevel.INFO, levelName: 'INFO' });
    transport.write(entry);
    expect(logSpy).toHaveBeenCalledTimes(1);
    logSpy.mockRestore();
  });

  it('calls console.warn for WARN level', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const transport = consoleTransport(jsonFormatter);
    const entry = makeEntry({ level: LogLevel.WARN, levelName: 'WARN' });
    transport.write(entry);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });

  it('calls console.error for ERROR level', () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const transport = consoleTransport(jsonFormatter);
    const entry = makeEntry({ level: LogLevel.ERROR, levelName: 'ERROR' });
    transport.write(entry);
    expect(errSpy).toHaveBeenCalledTimes(1);
    errSpy.mockRestore();
  });

  it('calls console.error for FATAL level', () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const transport = consoleTransport(jsonFormatter);
    const entry = makeEntry({ level: LogLevel.FATAL, levelName: 'FATAL' });
    transport.write(entry);
    expect(errSpy).toHaveBeenCalledTimes(1);
    errSpy.mockRestore();
  });

  it('uses jsonFormatter by default', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const transport = consoleTransport();
    const entry = makeEntry({ message: 'default fmt' });
    transport.write(entry);
    const calledWith = logSpy.mock.calls[0][0] as string;
    expect(() => JSON.parse(calledWith)).not.toThrow();
    logSpy.mockRestore();
  });
});

describe('memoryTransport', () => {
  it('stores entries in order', () => {
    const mt = memoryTransport();
    mt.write(makeEntry({ message: 'first' }));
    mt.write(makeEntry({ message: 'second' }));
    mt.write(makeEntry({ message: 'third' }));
    const entries = mt.getEntries();
    expect(entries).toHaveLength(3);
    expect(entries[0].message).toBe('first');
    expect(entries[1].message).toBe('second');
    expect(entries[2].message).toBe('third');
  });

  it('getEntries returns a copy, not the internal array', () => {
    const mt = memoryTransport();
    mt.write(makeEntry({ message: 'entry' }));
    const e1 = mt.getEntries();
    e1.push(makeEntry({ message: 'injected' }));
    expect(mt.getEntries()).toHaveLength(1);
  });

  it('clear empties the store', () => {
    const mt = memoryTransport();
    mt.write(makeEntry({ message: 'a' }));
    mt.write(makeEntry({ message: 'b' }));
    mt.clear();
    expect(mt.getEntries()).toHaveLength(0);
  });
});

describe('nullTransport', () => {
  it('does not throw when writing', () => {
    const transport = nullTransport();
    expect(() => transport.write(makeEntry({ message: 'discarded' }))).not.toThrow();
  });

  it('silently discards all entries', () => {
    const transport = nullTransport();
    for (let i = 0; i < 10; i++) {
      transport.write(makeEntry({ message: `msg-${i}` }));
    }
    // No error and no state to check — just confirming it doesn't crash
    expect(true).toBe(true);
  });
});

describe('redact', () => {
  it('uses ***REDACTED*** as default replacement', () => {
    const entry = makeEntry({ meta: { secret: 'my-secret' } });
    const result = redact(entry, { fields: ['secret'] });
    expect(result.meta?.secret).toBe('***REDACTED***');
  });

  it('uses custom replacement string', () => {
    const entry = makeEntry({ meta: { apiKey: 'key-123' } });
    const result = redact(entry, { fields: ['apiKey'], replacement: '[HIDDEN]' });
    expect(result.meta?.apiKey).toBe('[HIDDEN]');
  });

  it('does not modify fields not listed', () => {
    const entry = makeEntry({ meta: { safe: 'visible', secret: 'hidden' } });
    const result = redact(entry, { fields: ['secret'] });
    expect(result.meta?.safe).toBe('visible');
  });

  it('does not throw when meta is absent', () => {
    const entry = makeEntry();
    expect(() => redact(entry, { fields: ['password'] })).not.toThrow();
  });

  it('does not throw when context is absent', () => {
    const entry = makeEntry({ meta: { x: 1 } });
    expect(() => redact(entry, { fields: ['x'] })).not.toThrow();
  });

  it('does not mutate the original entry', () => {
    const entry = makeEntry({ meta: { password: 'original' } });
    redact(entry, { fields: ['password'] });
    expect(entry.meta?.password).toBe('original');
  });

  it('redacts fields in both meta and context simultaneously', () => {
    const entry = makeEntry({
      meta: { token: 'tok1', user: 'alice' },
      context: { token: 'tok2', env: 'prod' },
    });
    const result = redact(entry, { fields: ['token'] });
    expect(result.meta?.token).toBe('***REDACTED***');
    expect(result.context?.token).toBe('***REDACTED***');
    expect(result.meta?.user).toBe('alice');
    expect(result.context?.env).toBe('prod');
  });
});

describe('createRedactingFormatter', () => {
  it('wraps base formatter and redacts fields', () => {
    const fmt = createRedactingFormatter(['password'], jsonFormatter);
    const entry = makeEntry({ meta: { password: 'secret', name: 'alice' } });
    const result = fmt(entry);
    const parsed = JSON.parse(result);
    expect(parsed.meta.password).toBe('***REDACTED***');
    expect(parsed.meta.name).toBe('alice');
  });

  it('uses jsonFormatter when no base formatter provided', () => {
    const fmt = createRedactingFormatter(['token']);
    const entry = makeEntry({ meta: { token: 'abc', visible: true } });
    const result = fmt(entry);
    expect(() => JSON.parse(result)).not.toThrow();
    const parsed = JSON.parse(result);
    expect(parsed.meta.token).toBe('***REDACTED***');
  });
});

describe('redactString', () => {
  it('replaces matches with ***', () => {
    const result = redactString('my password is secret123', [/secret\d+/g]);
    expect(result).toBe('my password is ***');
  });

  it('replaces multiple patterns', () => {
    const result = redactString('user=alice token=abc123', [/alice/g, /abc123/g]);
    expect(result).toBe('user=*** token=***');
  });

  it('returns original when no match', () => {
    const result = redactString('safe text', [/secret/g]);
    expect(result).toBe('safe text');
  });

  it('handles empty pattern list', () => {
    const result = redactString('unchanged', []);
    expect(result).toBe('unchanged');
  });

  it('replaces all occurrences with global flag', () => {
    const result = redactString('abc abc abc', [/abc/g]);
    expect(result).toBe('*** *** ***');
  });
});

describe('createCorrelationContext', () => {
  it('uses provided requestId', () => {
    const ctx = createCorrelationContext('custom-id-123');
    expect(ctx.requestId).toBe('custom-id-123');
  });

  it('generates a UUID v4 when no requestId provided', () => {
    const ctx = createCorrelationContext();
    expect(ctx.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('startTime is a recent timestamp', () => {
    const before = Date.now();
    const ctx = createCorrelationContext();
    const after = Date.now();
    expect(ctx.startTime).toBeGreaterThanOrEqual(before);
    expect(ctx.startTime).toBeLessThanOrEqual(after);
  });

  it('elapsed returns a non-negative number', () => {
    const ctx = createCorrelationContext();
    expect(ctx.elapsed()).toBeGreaterThanOrEqual(0);
  });

  it('elapsed increases over time', async () => {
    const ctx = createCorrelationContext();
    await new Promise((r) => setTimeout(r, 10));
    expect(ctx.elapsed()).toBeGreaterThanOrEqual(1);
  });
});

describe('withCorrelation', () => {
  it('creates a child logger with correlation fields', () => {
    const logger = new Logger({ name: 'corr-test', level: LogLevel.TRACE });
    const ctx = createCorrelationContext('test-req-id');
    const correlated = withCorrelation(logger, ctx);
    correlated.info('correlated message');
    const logs = correlated.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].context?.requestId).toBe('test-req-id');
    expect(logs[0].context?.startTime).toBe(ctx.startTime);
  });

  it('does not affect parent logger logs', () => {
    const parent = new Logger({ name: 'parent', level: LogLevel.TRACE });
    const ctx = createCorrelationContext();
    const child = withCorrelation(parent, ctx);
    child.info('child log');
    expect(parent.getLogs()).toHaveLength(0);
  });
});

describe('Logger class', () => {
  describe('constructor defaults', () => {
    it('uses "app" as default name', () => {
      const logger = new Logger();
      logger.info('test');
      expect(logger.getLogs()[0].name).toBe('app');
    });

    it('uses INFO as default level', () => {
      const logger = new Logger();
      logger.debug('should not appear');
      logger.info('should appear');
      expect(logger.getLogs()).toHaveLength(1);
    });
  });

  describe('all log levels', () => {
    it('trace logs at TRACE level', () => {
      const logger = new Logger({ level: LogLevel.TRACE });
      logger.trace('trace msg', { x: 1 });
      const logs = logger.getLogs();
      expect(logs[0].level).toBe(LogLevel.TRACE);
      expect(logs[0].levelName).toBe('TRACE');
    });

    it('debug logs at DEBUG level', () => {
      const logger = new Logger({ level: LogLevel.TRACE });
      logger.debug('debug msg');
      expect(logger.getLogs()[0].level).toBe(LogLevel.DEBUG);
    });

    it('warn logs at WARN level', () => {
      const logger = new Logger({ level: LogLevel.TRACE });
      logger.warn('warn msg');
      expect(logger.getLogs()[0].level).toBe(LogLevel.WARN);
    });

    it('error attaches error object', () => {
      const logger = new Logger({ level: LogLevel.TRACE });
      const err = new Error('test error');
      logger.error('error msg', err);
      const logs = logger.getLogs();
      expect(logs[0].level).toBe(LogLevel.ERROR);
      expect(logs[0].error?.message).toBe('test error');
      expect(logs[0].error?.name).toBe('Error');
    });

    it('fatal logs at FATAL level with error', () => {
      const logger = new Logger({ level: LogLevel.TRACE });
      const err = new Error('fatal error');
      logger.fatal('fatal msg', err, { critical: true });
      const logs = logger.getLogs();
      expect(logs[0].level).toBe(LogLevel.FATAL);
      expect(logs[0].error?.message).toBe('fatal error');
      expect(logs[0].meta?.critical).toBe(true);
    });
  });

  describe('setLevel', () => {
    it('dynamically changes the active level', () => {
      const logger = new Logger({ level: LogLevel.INFO });
      logger.debug('before change');
      expect(logger.getLogs()).toHaveLength(0);

      logger.setLevel(LogLevel.DEBUG);
      logger.debug('after change');
      expect(logger.getLogs()).toHaveLength(1);
    });
  });

  describe('addTransport', () => {
    it('routes log entries to added transport', () => {
      const mt = memoryTransport();
      const logger = new Logger({ level: LogLevel.TRACE });
      logger.addTransport(mt);
      logger.info('transport test');
      expect(mt.getEntries()).toHaveLength(1);
      expect(mt.getEntries()[0].message).toBe('transport test');
    });

    it('supports multiple transports', () => {
      const mt1 = memoryTransport();
      const mt2 = memoryTransport();
      const logger = new Logger({ level: LogLevel.TRACE, transports: [mt1] });
      logger.addTransport(mt2);
      logger.warn('multi-transport');
      expect(mt1.getEntries()).toHaveLength(1);
      expect(mt2.getEntries()).toHaveLength(1);
    });
  });

  describe('getLogs and clearLogs', () => {
    it('getLogs returns copy of captured entries', () => {
      const logger = new Logger({ level: LogLevel.TRACE });
      logger.info('a');
      logger.info('b');
      const logs = logger.getLogs();
      expect(logs).toHaveLength(2);
      logs.push(makeEntry({ message: 'injected' }));
      expect(logger.getLogs()).toHaveLength(2); // original unaffected
    });

    it('clearLogs empties the capture buffer', () => {
      const logger = new Logger({ level: LogLevel.TRACE });
      logger.info('a');
      logger.info('b');
      logger.clearLogs();
      expect(logger.getLogs()).toHaveLength(0);
    });
  });

  describe('timestamp', () => {
    it('includes a valid ISO timestamp', () => {
      const logger = new Logger({ level: LogLevel.TRACE });
      logger.info('timestamp test');
      const ts = logger.getLogs()[0].timestamp;
      expect(() => new Date(ts)).not.toThrow();
      expect(new Date(ts).toISOString()).toBe(ts);
    });
  });

  describe('meta handling', () => {
    it('excludes meta key when no meta provided', () => {
      const logger = new Logger({ level: LogLevel.TRACE });
      logger.info('no meta');
      const entry = logger.getLogs()[0];
      expect(entry.meta).toBeUndefined();
    });

    it('excludes meta key when empty meta object provided', () => {
      const logger = new Logger({ level: LogLevel.TRACE });
      logger.info('empty meta', {});
      const entry = logger.getLogs()[0];
      expect(entry.meta).toBeUndefined();
    });

    it('includes meta when non-empty meta provided', () => {
      const logger = new Logger({ level: LogLevel.TRACE });
      logger.info('with meta', { key: 'value' });
      const entry = logger.getLogs()[0];
      expect(entry.meta).toEqual({ key: 'value' });
    });
  });

  describe('child logger', () => {
    it('child logs do not appear in parent getLogs', () => {
      const parent = new Logger({ level: LogLevel.TRACE });
      const child = parent.child({ childKey: 'val' });
      child.info('child log');
      expect(parent.getLogs()).toHaveLength(0);
      expect(child.getLogs()).toHaveLength(1);
    });

    it('child inherits parent level', () => {
      const parent = new Logger({ level: LogLevel.WARN });
      const child = parent.child({ x: 1 });
      child.info('should be filtered');
      expect(child.getLogs()).toHaveLength(0);
    });

    it('child context overwrites same-named parent context keys', () => {
      const parent = new Logger({ level: LogLevel.TRACE, context: { env: 'prod' } });
      const child = parent.child({ env: 'test' });
      child.info('override');
      expect(child.getLogs()[0].context?.env).toBe('test');
    });
  });
});

describe('createLogger factory', () => {
  it('creates logger with specified name', () => {
    const logger = createLogger('my-service');
    logger.info('factory test');
    expect(logger.getLogs()[0].name).toBe('my-service');
  });

  it('passes options through to Logger', () => {
    const logger = createLogger('opt-test', { level: LogLevel.DEBUG });
    logger.debug('debug msg');
    expect(logger.getLogs()).toHaveLength(1);
  });
});

describe('parseLogLevel edge cases', () => {
  it('returns INFO for unknown strings', () => {
    expect(parseLogLevel('unknown')).toBe(LogLevel.INFO);
    expect(parseLogLevel('verbose')).toBe(LogLevel.INFO);
    expect(parseLogLevel('')).toBe(LogLevel.INFO);
  });

  it('handles whitespace-padded strings', () => {
    expect(parseLogLevel('  warn  ')).toBe(LogLevel.WARN);
  });
});

describe('Logger with transport integration', () => {
  it('transport receives entries with all fields', () => {
    const mt = memoryTransport();
    const logger = new Logger({
      name: 'integration',
      level: LogLevel.TRACE,
      transports: [mt],
      context: { env: 'test' },
    });
    const err = new Error('transport error');
    logger.error('integration error', err, { userId: 42 });
    const entries = mt.getEntries();
    expect(entries).toHaveLength(1);
    const e = entries[0];
    expect(e.name).toBe('integration');
    expect(e.level).toBe(LogLevel.ERROR);
    expect(e.message).toBe('integration error');
    expect(e.meta?.userId).toBe(42);
    expect(e.context?.env).toBe('test');
    expect(e.error?.message).toBe('transport error');
  });

  it('null transport does not interfere with captured logs', () => {
    const nt = nullTransport();
    const logger = new Logger({ level: LogLevel.TRACE, transports: [nt] });
    logger.info('null transport test');
    expect(logger.getLogs()).toHaveLength(1);
  });
});

describe('LogLevel enum values', () => {
  it('has correct numeric values', () => {
    expect(LogLevel.TRACE).toBe(0);
    expect(LogLevel.DEBUG).toBe(1);
    expect(LogLevel.INFO).toBe(2);
    expect(LogLevel.WARN).toBe(3);
    expect(LogLevel.ERROR).toBe(4);
    expect(LogLevel.FATAL).toBe(5);
  });

  it('maintains ordering for level comparison', () => {
    expect(LogLevel.TRACE < LogLevel.DEBUG).toBe(true);
    expect(LogLevel.DEBUG < LogLevel.INFO).toBe(true);
    expect(LogLevel.INFO < LogLevel.WARN).toBe(true);
    expect(LogLevel.WARN < LogLevel.ERROR).toBe(true);
    expect(LogLevel.ERROR < LogLevel.FATAL).toBe(true);
  });
});

describe('memoryTransport as Logger transport', () => {
  it('captures all log levels when logger threshold is TRACE', () => {
    const mt = memoryTransport();
    const logger = new Logger({ level: LogLevel.TRACE, transports: [mt] });
    logger.trace('t');
    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');
    logger.fatal('f');
    expect(mt.getEntries()).toHaveLength(6);
  });
});

describe('createRedactingFormatter with textFormatter base', () => {
  it('redacts and formats using text formatter', () => {
    const fmt = createRedactingFormatter(['apiKey'], textFormatter);
    const entry = makeEntry({ meta: { apiKey: 'super-secret', name: 'alice' } });
    const result = fmt(entry);
    expect(result).not.toContain('super-secret');
    expect(result).toContain('alice');
  });
});

describe('sanitizeLogEntry with context', () => {
  it('sanitizes long strings in context', () => {
    const entry = makeEntry({
      context: { bigField: 'z'.repeat(11_000) },
    });
    const result = sanitizeLogEntry(entry);
    expect((result.context?.bigField as string)).toContain('[truncated]');
  });

  it('handles nested objects in meta', () => {
    const entry = makeEntry({
      meta: { nested: { inner: { deep: 'value' } } },
    });
    const result = sanitizeLogEntry(entry);
    const nested = result.meta?.nested as Record<string, unknown>;
    const inner = nested.inner as Record<string, unknown>;
    expect(inner.deep).toBe('value');
  });
});

describe('withCorrelation context fields', () => {
  it('includes requestId and startTime in context', () => {
    const logger = new Logger({ level: LogLevel.TRACE });
    const ctx = createCorrelationContext('req-abc-456');
    const corr = withCorrelation(logger, ctx);
    corr.debug('debug with correlation');
    const entry = corr.getLogs()[0];
    expect(entry.context?.requestId).toBe('req-abc-456');
    expect(entry.context?.startTime).toBe(ctx.startTime);
  });

  it('preserves existing parent context', () => {
    const logger = new Logger({
      level: LogLevel.TRACE,
      context: { service: 'api-gateway' },
    });
    const ctx = createCorrelationContext();
    const corr = withCorrelation(logger, ctx);
    corr.info('with existing context');
    const entry = corr.getLogs()[0];
    expect(entry.context?.service).toBe('api-gateway');
    expect(entry.context?.requestId).toBe(ctx.requestId);
  });
});

describe('Logger with formatters stored (informational)', () => {
  it('stores formatters option without error', () => {
    const logger = new Logger({
      level: LogLevel.TRACE,
      formatters: [jsonFormatter, textFormatter],
    });
    logger.info('formatter storage test');
    expect(logger.getLogs()).toHaveLength(1);
  });
});

describe('redactString edge cases', () => {
  it('handles regex with no global flag (replaces first match only)', () => {
    const result = redactString('abc abc abc', [/abc/]);
    expect(result).toBe('*** abc abc');
  });

  it('handles special regex characters in pattern', () => {
    const result = redactString('price: $100.00', [/\$[\d.]+/g]);
    expect(result).toBe('price: ***');
  });
});

describe('child logger does not share transport list', () => {
  it('adding transport to child does not affect parent', () => {
    const parent = new Logger({ level: LogLevel.TRACE });
    const mt = memoryTransport();
    const child = parent.child({ x: 1 });
    child.addTransport(mt);
    parent.info('parent only');
    expect(mt.getEntries()).toHaveLength(0);
    child.info('child message');
    expect(mt.getEntries()).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// LOOP 11: prettyFormatter includes ANSI codes per level — 100 iterations
// ---------------------------------------------------------------------------

describe('prettyFormatter ANSI codes per level (100 iterations)', () => {
  const levelValues = [
    LogLevel.TRACE,
    LogLevel.DEBUG,
    LogLevel.INFO,
    LogLevel.WARN,
    LogLevel.ERROR,
    LogLevel.FATAL,
  ];
  const levelNames = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];

  for (let i = 0; i < 100; i++) {
    it(`iteration ${i}: prettyFormatter output contains ANSI reset and level name`, () => {
      const level = levelValues[i % levelValues.length];
      const levelName = levelNames[i % levelNames.length];
      const entry = makeEntry({
        message: `pretty-${i}`,
        level,
        levelName,
        meta: { idx: i },
      });
      const result = prettyFormatter(entry);
      expect(result).toContain('\x1b[0m'); // reset
      expect(result).toContain(levelName);
      expect(result).toContain(`pretty-${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// LOOP 12: sanitizeLogEntry with various meta values — 75 iterations
// ---------------------------------------------------------------------------

describe('sanitizeLogEntry with various meta values (75 iterations)', () => {
  for (let i = 0; i < 75; i++) {
    it(`iteration ${i}: sanitizeLogEntry handles numeric and boolean meta values`, () => {
      const entry = makeEntry({
        message: `sanitize-${i}`,
        meta: { count: i, active: i % 2 === 0, label: `label-${i}` },
      });
      const result = sanitizeLogEntry(entry);
      expect(result.meta?.count).toBe(i);
      expect(result.meta?.active).toBe(i % 2 === 0);
      expect(result.meta?.label).toBe(`label-${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// LOOP 13: createLogger factory produces named loggers — 75 iterations
// ---------------------------------------------------------------------------

describe('createLogger factory produces named loggers (75 iterations)', () => {
  for (let i = 0; i < 75; i++) {
    it(`iteration ${i}: createLogger produces logger with correct name and logs correctly`, () => {
      const name = `service-${i}`;
      const logger = createLogger(name, { level: LogLevel.TRACE });
      logger.warn(`warning-${i}`, { severity: i });
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].name).toBe(name);
      expect(logs[0].level).toBe(LogLevel.WARN);
      expect(logs[0].message).toBe(`warning-${i}`);
      expect(logs[0].meta?.severity).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// LOOP 14: isValidLogLevel for all valid and invalid strings — 50 iterations
// ---------------------------------------------------------------------------

describe('isValidLogLevel validation (50 iterations)', () => {
  const validLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
  const invalidLevels = ['verbose', 'critical', 'log', 'silly', 'http', 'notice'];

  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: isValidLogLevel correctly validates level string`, () => {
      const valid = validLevels[i % validLevels.length];
      const invalid = invalidLevels[i % invalidLevels.length];
      expect(isValidLogLevel(valid)).toBe(true);
      expect(isValidLogLevel(valid.toUpperCase())).toBe(true);
      expect(isValidLogLevel(invalid)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// LOOP 15: redact with custom replacement — 50 iterations
// ---------------------------------------------------------------------------

describe('redact with custom replacement strings (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: redact uses custom replacement string`, () => {
      const replacement = `[HIDDEN-${i}]`;
      const entry = makeEntry({
        meta: { secret: `value-${i}`, safe: `visible-${i}` },
        context: { token: `tok-${i}`, env: 'prod' },
      });
      const result = redact(entry, { fields: ['secret', 'token'], replacement });
      expect(result.meta?.secret).toBe(replacement);
      expect(result.meta?.safe).toBe(`visible-${i}`);
      expect(result.context?.token).toBe(replacement);
      expect(result.context?.env).toBe('prod');
    });
  }
});

// ---------------------------------------------------------------------------
// LOOP 16: formatError for various error types — 50 iterations
// ---------------------------------------------------------------------------

describe('formatError for various error types (50 iterations)', () => {
  const errorTypes = [
    TypeError,
    RangeError,
    ReferenceError,
    SyntaxError,
    URIError,
  ];

  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: formatError correctly formats error object`, () => {
      const ErrorClass = errorTypes[i % errorTypes.length];
      const msg = `error-message-${i}`;
      const err = new ErrorClass(msg);
      const result = formatError(err);
      expect(result.message).toBe(msg);
      expect(result.name).toBe(err.name);
      expect(typeof result.stack).toBe('string');
    });
  }
});

// ---------------------------------------------------------------------------
// LOOP 17: Logger.error and fatal capture error fields — 50 iterations
// ---------------------------------------------------------------------------

describe('Logger error and fatal capture error fields (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: error() and fatal() attach error details to log entry`, () => {
      const logger = new Logger({ level: LogLevel.TRACE });
      const errMsg = `err-${i}`;
      const err = new Error(errMsg);
      logger.error(`error-log-${i}`, err, { code: i });
      logger.fatal(`fatal-log-${i}`, err, { critical: true, index: i });
      const logs = logger.getLogs();
      expect(logs).toHaveLength(2);
      expect(logs[0].error?.message).toBe(errMsg);
      expect(logs[0].error?.name).toBe('Error');
      expect(logs[0].meta?.code).toBe(i);
      expect(logs[1].error?.message).toBe(errMsg);
      expect(logs[1].meta?.critical).toBe(true);
      expect(logs[1].meta?.index).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// LOOP 18: memoryTransport multi-write ordering — 50 iterations
// ---------------------------------------------------------------------------

describe('memoryTransport multi-write preserves order (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: memoryTransport preserves insertion order of ${i + 2} entries`, () => {
      const mt = memoryTransport();
      const count = i + 2;
      for (let j = 0; j < count; j++) {
        mt.write(makeEntry({ message: `msg-${j}` }));
      }
      const entries = mt.getEntries();
      expect(entries).toHaveLength(count);
      for (let j = 0; j < count; j++) {
        expect(entries[j].message).toBe(`msg-${j}`);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// LOOP 19: getLogLevelName for each level — 50 iterations
// ---------------------------------------------------------------------------

describe('getLogLevelName across levels (50 iterations)', () => {
  const expected = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
  const levels = [
    LogLevel.TRACE,
    LogLevel.DEBUG,
    LogLevel.INFO,
    LogLevel.WARN,
    LogLevel.ERROR,
    LogLevel.FATAL,
  ];

  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: getLogLevelName returns correct name for level`, () => {
      const level = levels[i % levels.length];
      expect(getLogLevelName(level)).toBe(expected[i % expected.length]);
    });
  }
});

// ---------------------------------------------------------------------------
// LOOP 20: jsonFormatter with context included — 50 iterations
// ---------------------------------------------------------------------------

describe('jsonFormatter with context field (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: jsonFormatter serializes context field correctly`, () => {
      const entry = makeEntry({
        message: `ctx-msg-${i}`,
        context: { requestId: `req-${i}`, env: 'staging' },
        meta: { value: i },
      });
      const result = jsonFormatter(entry);
      const parsed = JSON.parse(result);
      expect(parsed.context?.requestId).toBe(`req-${i}`);
      expect(parsed.context?.env).toBe('staging');
      expect(parsed.meta?.value).toBe(i);
    });
  }
});
