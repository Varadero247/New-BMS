import { PrismaClient, Prisma } from '@ims/database/mgmt-review';
export { Prisma };
declare global {
  var mgmtReviewPrisma: InstanceType<typeof PrismaClient> | undefined;
}
export const prisma =
  global.mgmtReviewPrisma ||
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] });
if (process.env.NODE_ENV !== 'production') {
  global.mgmtReviewPrisma = prisma;
}
