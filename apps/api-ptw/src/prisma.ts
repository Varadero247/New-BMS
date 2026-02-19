import { PrismaClient, Prisma } from '@ims/database/ptw';
export { Prisma };
declare global {
  // eslint-disable-next-line no-var
  var ptwPrisma: InstanceType<typeof PrismaClient> | undefined;
}
export const prisma =
  global.ptwPrisma ||
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] });
if (process.env.NODE_ENV !== 'production') {
  global.ptwPrisma = prisma;
}
