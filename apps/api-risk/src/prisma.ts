import { PrismaClient, Prisma } from '@ims/database/risk';
export { Prisma };
declare global {
  // eslint-disable-next-line no-var
  var riskPrisma: InstanceType<typeof PrismaClient> | undefined;
}
export const prisma =
  global.riskPrisma ||
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] });
if (process.env.NODE_ENV !== 'production') {
  global.riskPrisma = prisma;
}
