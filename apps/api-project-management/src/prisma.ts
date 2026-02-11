import { PrismaClient } from '@ims/database/project-management';

declare global {
  var pmPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.pmPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.pmPrisma = prisma;
}
