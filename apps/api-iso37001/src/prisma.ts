import { PrismaClient, Prisma } from '@ims/database/iso37001';
export { Prisma };

declare global {
  var iso37001Prisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.iso37001Prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.iso37001Prisma = prisma;
}
