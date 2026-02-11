import { PrismaClient, Prisma } from '@ims/database/quality';
export { Prisma };

declare global {
  var qualPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.qualPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.qualPrisma = prisma;
}
