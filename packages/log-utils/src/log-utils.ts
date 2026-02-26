// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { randomUUID } from 'crypto';
import {
  LogLevel,
  LogEntry,
  LogFormatter,
  LogTransport,
  LoggerOptions,
  RedactOptions,
  CorrelationContext,
} from './types';

// ---------------------------------------------------------------------------
// Level helpers
// ---------------------------------------------------------------------------

const LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.TRACE]: 'TRACE',
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL',
};

export function getLogLevelName(level: LogLevel): string {
  return LEVEL_NAMES[level] ?? 'UNKNOWN';
}

export function parseLogLevel(str: string): LogLevel {
  const upper = str.toUpperCase().trim();
  switch (upper) {
    case 'TRACE': return LogLevel.TRACE;
    case 'DEBUG': return LogLevel.DEBUG;
    case 'INFO':  return LogLevel.INFO;
    case 'WARN':  return LogLevel.WARN;
    case 'ERROR': return LogLevel.ERROR;
    case 'FATAL': return LogLevel.FATAL;
    default:      return LogLevel.INFO;
  }
}

export function isValidLogLevel(str: string): boolean {
  const upper = str.toUpperCase().trim();
  return ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'].includes(upper);
}

// ---------------------------------------------------------------------------
// Error formatting
// ---------------------------------------------------------------------------

export function formatError(error: Error): { message: string; name: string; stack?: string } {
  return {
    message: error.message,
    name: error.name,
    stack: error.stack,
  };
}

// ---------------------------------------------------------------------------
// Context helpers
// ---------------------------------------------------------------------------

export function mergeContext(...contexts: Record<string, unknown>[]): Record<string, unknown> {
  return Object.assign({}, ...contexts);
}

// ---------------------------------------------------------------------------
// Sanitization (remove circular refs, truncate long strings)
// ---------------------------------------------------------------------------

const MAX_STRING_LENGTH = 10_000;

function sanitizeValue(value: unknown, seen: WeakSet<object>): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    return value.length > MAX_STRING_LENGTH ? value.slice(0, MAX_STRING_LENGTH) + '...[truncated]' : value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'object') {
    if (seen.has(value as object)) return '[Circular]';
    seen.add(value as object);
    if (Array.isArray(value)) {
      return (value as unknown[]).map((v) => sanitizeValue(v, seen));
    }
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = sanitizeValue(v, seen);
    }
    return result;
  }
  return String(value);
}

export function sanitizeLogEntry(entry: LogEntry): LogEntry {
  const seen = new WeakSet<object>();
  const sanitized: LogEntry = {
    timestamp: entry.timestamp,
    level: entry.level,
    levelName: entry.levelName,
    name: entry.name,
    message:
      typeof entry.message === 'string' && entry.message.length > MAX_STRING_LENGTH
        ? entry.message.slice(0, MAX_STRING_LENGTH) + '...[truncated]'
        : entry.message,
  };
  if (entry.meta !== undefined) {
    sanitized.meta = sanitizeValue(entry.meta, seen) as Record<string, unknown>;
  }
  if (entry.context !== undefined) {
    sanitized.context = sanitizeValue(entry.context, seen) as Record<string, unknown>;
  }
  if (entry.error !== undefined) {
    sanitized.error = {
      name: entry.error.name,
      message: entry.error.message,
      stack: entry.error.stack,
    };
  }
  return sanitized;
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

export const jsonFormatter: LogFormatter = (entry: LogEntry): string => {
  return JSON.stringify(entry);
};

export const textFormatter: LogFormatter = (entry: LogEntry): string => {
  const levelPad = entry.levelName.padEnd(5);
  let line = `[${entry.timestamp}] ${levelPad} [${entry.name}] ${entry.message}`;
  if (entry.meta && Object.keys(entry.meta).length > 0) {
    const metaParts = Object.entries(entry.meta)
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
      .join(' ');
    line += ` ${metaParts}`;
  }
  if (entry.error) {
    line += ` error=${entry.error.name}: ${entry.error.message}`;
  }
  return line;
};

// ANSI codes
const ANSI_RESET = '\x1b[0m';
const ANSI_RED = '\x1b[31m';
const ANSI_BRIGHT_RED = '\x1b[91m';
const ANSI_YELLOW = '\x1b[33m';
const ANSI_BLUE = '\x1b[34m';
const ANSI_GRAY = '\x1b[90m';
const ANSI_CYAN = '\x1b[36m';

function levelColor(level: LogLevel): string {
  switch (level) {
    case LogLevel.FATAL: return ANSI_BRIGHT_RED;
    case LogLevel.ERROR: return ANSI_RED;
    case LogLevel.WARN:  return ANSI_YELLOW;
    case LogLevel.INFO:  return ANSI_BLUE;
    case LogLevel.DEBUG: return ANSI_GRAY;
    case LogLevel.TRACE: return ANSI_CYAN;
    default:             return ANSI_RESET;
  }
}

export const prettyFormatter: LogFormatter = (entry: LogEntry): string => {
  const color = levelColor(entry.level);
  const levelPad = entry.levelName.padEnd(5);
  let line = `${color}[${entry.timestamp}] ${levelPad} [${entry.name}] ${entry.message}${ANSI_RESET}`;
  if (entry.meta && Object.keys(entry.meta).length > 0) {
    const metaParts = Object.entries(entry.meta)
      .map(([k, v]) => `${ANSI_GRAY}${k}${ANSI_RESET}=${JSON.stringify(v)}`)
      .join(' ');
    line += ` ${metaParts}`;
  }
  if (entry.error) {
    line += ` ${ANSI_RED}${entry.error.name}: ${entry.error.message}${ANSI_RESET}`;
  }
  return line;
};

// ---------------------------------------------------------------------------
// Transports
// ---------------------------------------------------------------------------

export function consoleTransport(formatter?: LogFormatter): LogTransport {
  const fmt = formatter ?? jsonFormatter;
  return {
    write(entry: LogEntry): void {
      const output = fmt(entry);
      if (entry.level >= LogLevel.ERROR) {
        console.error(output);
      } else if (entry.level === LogLevel.WARN) {
        console.warn(output);
      } else {
        console.log(output);
      }
    },
  };
}

export interface MemoryTransport extends LogTransport {
  getEntries(): LogEntry[];
  clear(): void;
}

export function memoryTransport(): MemoryTransport {
  const entries: LogEntry[] = [];
  return {
    write(entry: LogEntry): void {
      entries.push(entry);
    },
    getEntries(): LogEntry[] {
      return [...entries];
    },
    clear(): void {
      entries.length = 0;
    },
  };
}

export function nullTransport(): LogTransport {
  return {
    write(_entry: LogEntry): void {
      // intentionally discards all logs
    },
  };
}

// ---------------------------------------------------------------------------
// Redaction
// ---------------------------------------------------------------------------

const DEFAULT_REPLACEMENT = '***REDACTED***';

function redactObject(
  obj: Record<string, unknown>,
  fields: string[],
  replacement: string,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...obj };
  for (const field of fields) {
    if (field in result) {
      result[field] = replacement;
    }
  }
  return result;
}

export function redact(entry: LogEntry, options: RedactOptions): LogEntry {
  const replacement = options.replacement ?? DEFAULT_REPLACEMENT;
  const fields = options.fields;

  const redacted: LogEntry = { ...entry };

  if (redacted.meta) {
    redacted.meta = redactObject(redacted.meta, fields, replacement);
  }
  if (redacted.context) {
    redacted.context = redactObject(redacted.context, fields, replacement);
  }
  return redacted;
}

export function createRedactingFormatter(
  fields: string[],
  baseFormatter?: LogFormatter,
): LogFormatter {
  const fmt = baseFormatter ?? jsonFormatter;
  return (entry: LogEntry): string => {
    const redacted = redact(entry, { fields });
    return fmt(redacted);
  };
}

export function redactString(str: string, patterns: RegExp[]): string {
  let result = str;
  for (const pattern of patterns) {
    result = result.replace(pattern, '***');
  }
  return result;
}

// ---------------------------------------------------------------------------
// Correlation
// ---------------------------------------------------------------------------

export function createCorrelationContext(requestId?: string): CorrelationContext {
  const id = requestId ?? randomUUID();
  const startTime = Date.now();
  return {
    requestId: id,
    startTime,
    elapsed(): number {
      return Date.now() - startTime;
    },
  };
}

export function withCorrelation(logger: Logger, context: CorrelationContext): Logger {
  return logger.child({
    requestId: context.requestId,
    startTime: context.startTime,
  });
}

// ---------------------------------------------------------------------------
// Logger class
// ---------------------------------------------------------------------------

export class Logger {
  private _name: string;
  private _level: LogLevel;
  private _transports: LogTransport[];
  private _formatters: LogFormatter[];
  private _context: Record<string, unknown>;
  private _captured: LogEntry[];

  constructor(options?: LoggerOptions) {
    this._name = options?.name ?? 'app';
    this._level = options?.level ?? LogLevel.INFO;
    this._transports = options?.transports ? [...options.transports] : [];
    this._formatters = options?.formatters ? [...options.formatters] : [];
    this._context = options?.context ? { ...options.context } : {};
    this._captured = [];
  }

  private _buildEntry(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
    error?: Error,
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      levelName: getLogLevelName(level),
      name: this._name,
      message,
    };
    if (meta && Object.keys(meta).length > 0) {
      entry.meta = { ...meta };
    }
    if (Object.keys(this._context).length > 0) {
      entry.context = { ...this._context };
    }
    if (error) {
      entry.error = formatError(error);
    }
    return entry;
  }

  private _log(level: LogLevel, message: string, meta?: Record<string, unknown>, error?: Error): void {
    if (level < this._level) return;
    const entry = this._buildEntry(level, message, meta, error);
    this._captured.push(entry);
    for (const transport of this._transports) {
      transport.write(entry);
    }
  }

  trace(message: string, meta?: Record<string, unknown>): void {
    this._log(LogLevel.TRACE, message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this._log(LogLevel.DEBUG, message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this._log(LogLevel.INFO, message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this._log(LogLevel.WARN, message, meta);
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    this._log(LogLevel.ERROR, message, meta, error);
  }

  fatal(message: string, error?: Error, meta?: Record<string, unknown>): void {
    this._log(LogLevel.FATAL, message, meta, error);
  }

  child(context: Record<string, unknown>): Logger {
    return new Logger({
      name: this._name,
      level: this._level,
      transports: [...this._transports],
      formatters: [...this._formatters],
      context: mergeContext(this._context, context),
    });
  }

  setLevel(level: LogLevel): void {
    this._level = level;
  }

  getLevel(): LogLevel {
    return this._level;
  }

  addTransport(transport: LogTransport): void {
    this._transports.push(transport);
  }

  getLogs(): LogEntry[] {
    return [...this._captured];
  }

  clearLogs(): void {
    this._captured = [];
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createLogger(name: string, options?: LoggerOptions): Logger {
  return new Logger({ ...options, name });
}
