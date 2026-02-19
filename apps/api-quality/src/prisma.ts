import { PrismaClient, Prisma } from '@ims/database/quality';
export { Prisma };

declare global {
  // eslint-disable-next-line no-var
  var qualPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma: InstanceType<typeof PrismaClient> =
  global.qualPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.qualPrisma = prisma;
}
