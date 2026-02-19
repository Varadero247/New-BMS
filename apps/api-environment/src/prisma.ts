import { PrismaClient, Prisma } from '@ims/database/environment';
export { Prisma };

declare global {
  // eslint-disable-next-line no-var
  var envPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma: InstanceType<typeof PrismaClient> =
  global.envPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.envPrisma = prisma;
}
