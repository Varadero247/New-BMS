// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Test helpers for integration tests — real DB + Redis operations.
import { createHash } from 'crypto';
import Redis from 'ioredis';
import { PrismaClient as CoreClient } from '../generated/core';
import type { EventPublisher } from '../../event-bus/src/publisher';
import type { EventPayload } from '../../event-bus/src/types';

let _coreClient: CoreClient | null = null;

/**
 * Returns a fresh Core Prisma client (singleton per process).
 */
export function getTestPrismaClient(): CoreClient {
  if (!_coreClient) {
    _coreClient = new CoreClient();
  }
  return _coreClient;
}

/**
 * Flush all test-related Redis keys.
 * Clears nexara:*, lockout:*, ratelimit:*, and ims:* prefixes so each test
 * file starts with a clean rate-limiter / account-lockout state.
 */
export async function flushTestRedis(): Promise<void> {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const redis = new Redis(redisUrl);
  try {
    const patterns = ['nexara:*', 'lockout:*', 'ratelimit:*', 'ims:*'];
    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  } finally {
    await redis.quit();
  }
}

/**
 * Truncate all integration test tables and re-seed using seed-test.ts.
 * Spawns a child process so it uses its own DB connections cleanly.
 */
export async function resetTestDatabase(): Promise<void> {
  const { execSync } = await import('child_process');
  try {
    execSync('npx tsx packages/database/prisma/seed-test.ts', {
      cwd: process.cwd(),
      stdio: 'pipe',
      env: process.env,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[resetTestDatabase] seed-test warning:', msg.slice(0, 300));
  }
}

/**
 * Query helper — finds a single record in any Prisma model for assertion.
 */
export async function dbFind<T>(
  prisma: { findFirst(args: Record<string, unknown>): Promise<T | null> },
  where: Record<string, unknown>
): Promise<T | null> {
  return prisma.findFirst({ where });
}

/**
 * Hook into a publisher to capture all events published via its `publish()` method.
 * Wraps the publish method to intercept events before they go to Redis/local handlers.
 * Returns the captured array and a cleanup function.
 */
export function captureEvents(publisher: EventPublisher): {
  events: EventPayload[];
  cleanup: () => void;
} {
  const events: EventPayload[] = [];

  const origPublish = (publisher as any).publish.bind(publisher);
  (publisher as any).publish = async (
    eventType: string,
    data: Record<string, unknown>,
    context: { source: string; organisationId: string; userId?: string }
  ): Promise<string> => {
    const id = await origPublish(eventType, data, context);
    // Reconstruct the payload for capture
    events.push({
      id,
      type: eventType,
      source: context.source,
      timestamp: new Date().toISOString(),
      organisationId: context.organisationId,
      userId: context.userId,
      data,
    });
    return id;
  };

  return {
    events,
    cleanup: () => {
      (publisher as any).publish = origPublish;
    },
  };
}
