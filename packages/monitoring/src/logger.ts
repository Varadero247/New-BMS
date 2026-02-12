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

const consoleFormat = winston.format.combine(
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

export const createLogger = (serviceName: string) => {
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ];

  // Only add file transports if logs directory exists
  if (fs.existsSync(logsDir)) {
    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, `${serviceName}-error.log`),
        level: 'error',
        format: logFormat,
      }),
      new winston.transports.File({
        filename: path.join(logsDir, `${serviceName}-combined.log`),
        format: logFormat,
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
export const createRequestLogger = (parentLogger: Logger, req: { correlationId?: string; headers?: Record<string, any> }) => {
  const correlationId = req?.correlationId || req?.headers?.['x-correlation-id'] || 'unknown';
  return parentLogger.child({ correlationId });
};
