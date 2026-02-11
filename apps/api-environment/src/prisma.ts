import { PrismaClient, Prisma } from '@ims/database/environment';
export { Prisma };

declare global {
  var envPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.envPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.envPrisma = prisma;
}
