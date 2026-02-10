import { PrismaClient } from '@ims/database/health-safety';

declare global {
  var hsPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.hsPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.hsPrisma = prisma;
}
