import { PrismaClient } from '../generated/core';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

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
