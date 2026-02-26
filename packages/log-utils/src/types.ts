// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  name: string;
  message: string;
  meta?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    name: string;
  };
  context?: Record<string, unknown>;
}

export type LogFormatter = (entry: LogEntry) => string;

export interface LogTransport {
  write(entry: LogEntry): void;
}

export interface LoggerOptions {
  name?: string;
  level?: LogLevel;
  transports?: LogTransport[];
  formatters?: LogFormatter[];
  context?: Record<string, unknown>;
}

export interface RedactOptions {
  fields: string[];
  replacement?: string;
}

export interface CorrelationContext {
  requestId: string;
  startTime: number;
  elapsed(): number;
}
