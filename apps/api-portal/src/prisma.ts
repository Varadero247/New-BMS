import { PrismaClient, Prisma } from '@ims/database/portal';
export { Prisma };

declare global {
  var portalPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.portalPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.portalPrisma = prisma;
}
