import { PrismaClient, Prisma } from '@ims/database/contracts';
export { Prisma };
declare global {
  var contractsPrisma: InstanceType<typeof PrismaClient> | undefined;
}
export const prisma =
  global.contractsPrisma ||
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] });
if (process.env.NODE_ENV !== 'production') {
  global.contractsPrisma = prisma;
}
