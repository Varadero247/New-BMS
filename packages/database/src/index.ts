// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { PrismaClient } from '../generated/core';
import { prismaMetricsMiddleware } from '@ims/monitoring';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Wire Prisma query-duration metrics (skipped in test env to avoid noise).
// prismaMetricsMiddleware uses the deprecated $use() API (Prisma v5 still supports it;
// it will be replaced by a $extends()-based approach in a future migration).
// Type assertion bridges the generic middleware signature to Prisma's ModelName enum.
if (process.env.NODE_ENV !== 'test') {
  prisma.$use(prismaMetricsMiddleware as Parameters<typeof prisma.$use>[0]);
}

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export * from '../generated/core';
export type { User } from '../generated/core';
export default prisma;

// Session cleanup utilities
export {
  cleanupExpiredSessions,
  cleanupInactiveSessions,
  SessionCleanupJob,
  createSessionCleanupJob,
  type CleanupResult,
} from './jobs/cleanup-sessions';
