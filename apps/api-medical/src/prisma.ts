import { PrismaClient, Prisma } from '@ims/database/medical';
export { Prisma };

declare global {
  var medicalPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.medicalPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.medicalPrisma = prisma;
}
