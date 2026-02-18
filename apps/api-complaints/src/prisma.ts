import { PrismaClient, Prisma } from '@ims/database/complaints';
export { Prisma };
declare global {
  var complaintsPrisma: InstanceType<typeof PrismaClient> | undefined;
}
export const prisma =
  global.complaintsPrisma ||
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] });
if (process.env.NODE_ENV !== 'production') {
  global.complaintsPrisma = prisma;
}
