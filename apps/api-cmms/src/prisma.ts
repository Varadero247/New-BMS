import { PrismaClient, Prisma } from '@ims/database/cmms';
export { Prisma };

declare global {
  var cmmsPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.cmmsPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.cmmsPrisma = prisma;
}
