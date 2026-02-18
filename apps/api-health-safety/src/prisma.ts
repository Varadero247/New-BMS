import { PrismaClient, Prisma } from '@ims/database/health-safety';
export { Prisma };

declare global {
  var hsPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma: InstanceType<typeof PrismaClient> =
  global.hsPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.hsPrisma = prisma;
}
