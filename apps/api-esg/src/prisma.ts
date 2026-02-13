import { PrismaClient, Prisma } from '@ims/database/esg';
export { Prisma };

declare global {
  var esgPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.esgPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.esgPrisma = prisma;
}
