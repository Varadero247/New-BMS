// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { PrismaClient } from '@prisma/client';
import { createLogger } from '@ims/monitoring';

const defaultLogger = createLogger('session-cleanup');

export interface CleanupResult {
  deletedCount: number;
  timestamp: Date;
}

/**
 * Clean up expired sessions from the database
 *
 * @param prisma - Prisma client instance
 * @returns Number of deleted sessions
 */
export async function cleanupExpiredSessions(prisma: PrismaClient): Promise<CleanupResult> {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });

  return {
    deletedCount: result.count,
    timestamp: new Date(),
  };
}

/**
 * Clean up sessions that have been inactive for a specified period
 *
 * @param prisma - Prisma client instance
 * @param inactiveHours - Number of hours of inactivity before cleanup (default: 24)
 * @returns Number of deleted sessions
 */
export async function cleanupInactiveSessions(
  prisma: PrismaClient,
  inactiveHours: number = 24
): Promise<CleanupResult> {
  const cutoff = new Date(Date.now() - inactiveHours * 60 * 60 * 1000);

  const result = await prisma.session.deleteMany({
    where: {
      lastActivityAt: { lt: cutoff },
    },
  });

  return {
    deletedCount: result.count,
    timestamp: new Date(),
  };
}

/**
 * Session cleanup job runner
 *
 * Runs periodic cleanup of expired and inactive sessions
 */
export class SessionCleanupJob {
  private prisma: PrismaClient;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private logger: {
    info: (msg: string, meta?: object) => void;
    error: (msg: string, meta?: object) => void;
  };

  constructor(
    prisma: PrismaClient,
    logger?: {
      info: (msg: string, meta?: object) => void;
      error: (msg: string, meta?: object) => void;
    }
  ) {
    this.prisma = prisma;
    this.logger = logger || {
      info: (msg: string, meta?: object) => defaultLogger.info(msg, meta),
      error: (msg: string, meta?: object) => defaultLogger.error(msg, meta),
    };
  }

  /**
   * Start the cleanup job
   *
   * @param intervalMs - Interval between cleanups in milliseconds (default: 1 hour)
   */
  start(intervalMs: number = 60 * 60 * 1000): void {
    if (this.intervalId) {
      this.logger.info('Cleanup job already running');
      return;
    }

    this.logger.info('Starting session cleanup job', { intervalMs });

    // Run immediately on start
    this.runCleanup();

    // Then run periodically
    this.intervalId = setInterval(() => this.runCleanup(), intervalMs);
    if (this.intervalId && typeof this.intervalId === 'object' && 'unref' in this.intervalId) {
      (this.intervalId as NodeJS.Timeout).unref();
    }
  }

  /**
   * Stop the cleanup job
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.logger.info('Session cleanup job stopped');
    }
  }

  /**
   * Run a single cleanup cycle
   */
  async runCleanup(): Promise<void> {
    if (this.isRunning) {
      this.logger.info('Cleanup already in progress, skipping');
      return;
    }

    this.isRunning = true;

    try {
      // Clean up expired sessions
      const expiredResult = await cleanupExpiredSessions(this.prisma);
      if (expiredResult.deletedCount > 0) {
        this.logger.info('Cleaned up expired sessions', { count: expiredResult.deletedCount });
      }

      // Clean up inactive sessions (optional - uncomment if needed)
      // const inactiveResult = await cleanupInactiveSessions(this.prisma, 72);
      // if (inactiveResult.deletedCount > 0) {
      //   this.logger.info('Cleaned up inactive sessions', { count: inactiveResult.deletedCount });
      // }
    } catch (error) {
      this.logger.error('Session cleanup failed', { error });
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Check if the job is currently running
   */
  isJobRunning(): boolean {
    return this.intervalId !== null;
  }
}

// Factory function to create a cleanup job with the default prisma instance
export function createSessionCleanupJob(
  prisma: PrismaClient,
  logger?: {
    info: (msg: string, meta?: object) => void;
    error: (msg: string, meta?: object) => void;
  }
): SessionCleanupJob {
  return new SessionCleanupJob(prisma, logger);
}
