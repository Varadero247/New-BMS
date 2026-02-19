import { PrismaClient, Prisma } from '@ims/database/medical';
export { Prisma };

declare global {
  // eslint-disable-next-line no-var
  var medicalPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma: InstanceType<typeof PrismaClient> =
  global.medicalPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.medicalPrisma = prisma;
}
