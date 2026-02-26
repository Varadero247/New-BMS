// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch {
    // Ignore if can't create
  }
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Human-readable format for development — colorized, compact single-line output.
const devConsoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf((info) => {
    const { timestamp, level, message, service, correlationId, ...meta } = info;
    let msg = `${timestamp} [${service || 'app'}] ${level}: ${message}`;
    if (correlationId && typeof correlationId === 'string') {
      msg += ` [${correlationId.slice(0, 8)}]`;
    }
    if (Object.keys(meta).length > 0 && !meta.stack) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Pure JSON format for production — no ANSI colour codes, no printf.
// Container log aggregators (Loki, Datadog, CloudWatch) parse this directly.
const prodConsoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const isProduction = process.env.NODE_ENV === 'production';

export const createLogger = (serviceName: string) => {
  const transports: winston.transport[] = [
    new winston.transports.Console({
      // Production: pure JSON (machine-parseable, no ANSI codes).
      // Development: colourised human-readable text.
      format: isProduction ? prodConsoleFormat : devConsoleFormat,
    }),
  ];

  // Only add file transports in non-production (containers should use stdout/stderr only).
  // Rotation: 10 MB per file, 5 files retained — prevents unbounded disk growth.
  if (!isProduction && fs.existsSync(logsDir)) {
    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, `${serviceName}-error.log`),
        level: 'error',
        format: logFormat,
        maxsize: 10 * 1024 * 1024, // 10 MB
        maxFiles: 5,
        tailable: true,
      }),
      new winston.transports.File({
        filename: path.join(logsDir, `${serviceName}-combined.log`),
        format: logFormat,
        maxsize: 10 * 1024 * 1024, // 10 MB
        maxFiles: 5,
        tailable: true,
      })
    );
  }

  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: serviceName },
    transports,
  });
};

export type Logger = ReturnType<typeof createLogger>;

/**
 * Create a child logger that automatically includes the correlation ID from the request.
 * Usage in route handlers:
 *   const log = createRequestLogger(logger, req);
 *   log.info('Processing request');  // correlation ID is included automatically
 */
export const createRequestLogger = (
  parentLogger: Logger,
  req: { correlationId?: string; headers?: Record<string, any> }
) => {
  const correlationId = req?.correlationId || req?.headers?.['x-correlation-id'] || 'unknown';
  return parentLogger.child({ correlationId });
};
