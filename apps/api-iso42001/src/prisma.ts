import { PrismaClient, Prisma } from '@ims/database/iso42001';
export { Prisma };

declare global {
  var iso42001Prisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.iso42001Prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.iso42001Prisma = prisma;
}
