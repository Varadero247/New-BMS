// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Graceful Shutdown Utility
 *
 * Handles SIGTERM / SIGINT signals by:
 *   1. Stopping the HTTP server from accepting new connections
 *   2. Waiting for in-flight requests to complete (draining)
 *   3. Running user-supplied cleanup hooks (DB disconnect, Redis quit, etc.)
 *   4. Exiting with a clean status code
 *
 * Usage:
 *   const shutdown = createGracefulShutdown(httpServer, {
 *     drainTimeoutMs: 10_000,
 *     hooks: [() => prisma.$disconnect(), () => redis.quit()],
 *   });
 *
 *   // Optionally trigger manually in tests:
 *   await shutdown.trigger('SIGTERM');
 */

import type { Server } from 'http';

/* eslint-disable no-console */
const logger = {
  info:  (msg: string, meta?: Record<string, unknown>) => console.log(`[graceful-shutdown] ${msg}`, meta ?? ''),
  warn:  (msg: string, meta?: Record<string, unknown>) => console.warn(`[graceful-shutdown] ${msg}`, meta ?? ''),
  error: (msg: string, meta?: Record<string, unknown>) => console.error(`[graceful-shutdown] ${msg}`, meta ?? ''),
};

// ── Types ──────────────────────────────────────────────────────────────────

export interface GracefulShutdownOptions {
  /**
   * Maximum time in milliseconds to wait for in-flight requests to finish.
   * After this timeout, the process exits regardless.
   * Default: 10 000 ms
   */
  drainTimeoutMs?: number;
  /**
   * Maximum time in milliseconds to wait for each cleanup hook.
   * Default: 5 000 ms
   */
  hookTimeoutMs?: number;
  /**
   * Cleanup hooks to run after draining (e.g. close DB, Redis, etc.).
   * Hooks are run in sequence; a failed hook is logged but does not abort remaining hooks.
   */
  hooks?: Array<() => Promise<void> | void>;
  /**
   * Called just before process.exit(). Useful for final logging / metrics flush.
   */
  onShutdown?: (signal: string) => void;
  /**
   * If true, call process.exit() at the end. Default: true.
   */
  exitAfterShutdown?: boolean;
  /**
   * Exit code to use on clean shutdown. Default: 0.
   */
  exitCode?: number;
  /**
   * Exit code to use when drain timeout is exceeded. Default: 1.
   */
  timeoutExitCode?: number;
}

export interface GracefulShutdownHandle {
  /** Number of requests currently being handled. */
  readonly inFlightRequests: number;
  /** Whether shutdown has been triggered. */
  readonly isShuttingDown: boolean;
  /** Middleware to track in-flight requests. Mount this BEFORE all routes. */
  middleware: (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => void;
  /** Trigger shutdown programmatically (useful for tests / health-check failures). */
  trigger: (signal?: string) => Promise<void>;
  /** Deregister OS signal listeners (useful after tests to prevent handler leak). */
  destroy: () => void;
}

// ── Implementation ─────────────────────────────────────────────────────────

export function createGracefulShutdown(
  server: Server,
  opts: GracefulShutdownOptions = {}
): GracefulShutdownHandle {
  const {
    drainTimeoutMs = 10_000,
    hookTimeoutMs  = 5_000,
    hooks          = [],
    onShutdown,
    exitAfterShutdown = true,
    exitCode          = 0,
    timeoutExitCode   = 1,
  } = opts;

  let inFlightCount = 0;
  let shuttingDown  = false;
  let resolveIdle: (() => void) | null = null;

  // ── In-flight request tracker ────────────────────────────────────────────

  const middleware = (
    req: import('express').Request,
    res: import('express').Response,
    next: import('express').NextFunction
  ): void => {
    if (shuttingDown) {
      res.setHeader('Connection', 'close');
      res.setHeader('Retry-After', Math.ceil(drainTimeoutMs / 1000));
      res.status(503).json({
        success: false,
        error: { code: 'SERVICE_SHUTTING_DOWN', message: 'Service is shutting down. Please retry.' },
      });
      return;
    }

    inFlightCount++;
    res.on('finish', () => {
      inFlightCount--;
      if (shuttingDown && inFlightCount === 0) {
        resolveIdle?.();
      }
    });
    next();
  };

  // ── Core shutdown logic ──────────────────────────────────────────────────

  const trigger = async (signal = 'SIGTERM'): Promise<void> => {
    if (shuttingDown) return; // prevent double-trigger
    shuttingDown = true;

    logger.info(`Received ${signal} — starting graceful shutdown`, {
      inFlightRequests: inFlightCount,
      drainTimeoutMs,
    });

    // 1. Stop accepting new TCP connections
    server.close(() => logger.info('HTTP server closed'));

    // 2. Wait for in-flight requests to drain (with timeout)
    let timedOut = false;
    if (inFlightCount > 0) {
      logger.info(`Draining ${inFlightCount} in-flight requests (max ${drainTimeoutMs}ms)…`);
      await Promise.race([
        new Promise<void>((resolve) => { resolveIdle = resolve; }),
        new Promise<void>((_, reject) =>
          setTimeout(() => {
            timedOut = true;
            reject(new Error(`Drain timeout exceeded (${inFlightCount} requests still in flight)`));
          }, drainTimeoutMs)
        ),
      ]).catch((err) => logger.warn(err.message));
    }

    // 3. Run cleanup hooks in sequence
    for (const hook of hooks) {
      try {
        await Promise.race([
          Promise.resolve(hook()),
          new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error('Hook timed out')), hookTimeoutMs)
          ),
        ]);
      } catch (err) {
        logger.error('Shutdown hook failed', { error: err });
      }
    }

    logger.info('Graceful shutdown complete', { timedOut });
    onShutdown?.(signal);

    if (exitAfterShutdown) {
      process.exit(timedOut ? timeoutExitCode : exitCode);
    }
  };

  // ── OS signal listeners ──────────────────────────────────────────────────

  const sigterm = () => trigger('SIGTERM');
  const sigint  = () => trigger('SIGINT');

  process.on('SIGTERM', sigterm);
  process.on('SIGINT',  sigint);

  const destroy = () => {
    process.off('SIGTERM', sigterm);
    process.off('SIGINT',  sigint);
  };

  return {
    get inFlightRequests() { return inFlightCount; },
    get isShuttingDown()   { return shuttingDown; },
    middleware,
    trigger,
    destroy,
  };
}
