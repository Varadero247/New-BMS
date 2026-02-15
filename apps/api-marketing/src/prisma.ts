import { PrismaClient, Prisma } from '@ims/database/marketing';
export { Prisma };

declare global {
  var marketingPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.marketingPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.marketingPrisma = prisma;
}
