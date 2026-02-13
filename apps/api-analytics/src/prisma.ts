import { PrismaClient, Prisma } from '@ims/database/analytics';
export { Prisma };

declare global {
  var analyticsPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.analyticsPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.analyticsPrisma = prisma;
}
