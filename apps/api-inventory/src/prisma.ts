import { PrismaClient, Prisma } from '@ims/database/inventory';
export { Prisma };

declare global {
  var inventoryPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.inventoryPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.inventoryPrisma = prisma;
}
