import { PrismaClient, Prisma } from '@ims/database/emergency';
export { Prisma };
declare global {
  // eslint-disable-next-line no-var
  var emergencyPrisma: InstanceType<typeof PrismaClient> | undefined;
}
export const prisma =
  global.emergencyPrisma ||
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] });
if (process.env.NODE_ENV !== 'production') {
  global.emergencyPrisma = prisma;
}
