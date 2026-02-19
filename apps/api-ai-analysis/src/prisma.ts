import { PrismaClient, Prisma } from '@ims/database/ai';
export { Prisma };

declare global {
  // eslint-disable-next-line no-var
  var aiPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma: InstanceType<typeof PrismaClient> =
  global.aiPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.aiPrisma = prisma;
}
