import { PrismaClient } from '@ims/database/ai';

declare global {
  var aiPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.aiPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.aiPrisma = prisma;
}
