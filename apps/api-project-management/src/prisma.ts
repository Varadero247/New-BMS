import { PrismaClient, Prisma } from '@ims/database/project-management';
export { Prisma };

declare global {
  var pmPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma: InstanceType<typeof PrismaClient> =
  global.pmPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.pmPrisma = prisma;
}
