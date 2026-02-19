import { PrismaClient, Prisma } from '@ims/database/analytics';
export { Prisma };

declare global {
  // eslint-disable-next-line no-var
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
