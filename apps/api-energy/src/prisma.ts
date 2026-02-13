import { PrismaClient, Prisma } from '@ims/database/energy';
export { Prisma };

declare global {
  var energyPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.energyPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.energyPrisma = prisma;
}
