import { PrismaClient, Prisma } from '@ims/database/hr';
export { Prisma };

declare global {
  var hrPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.hrPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.hrPrisma = prisma;
}
