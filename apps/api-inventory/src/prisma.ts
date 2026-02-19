import { PrismaClient, Prisma } from '@ims/database/inventory';
export { Prisma };

declare global {
  // eslint-disable-next-line no-var
  var inventoryPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma: InstanceType<typeof PrismaClient> =
  global.inventoryPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.inventoryPrisma = prisma;
}
