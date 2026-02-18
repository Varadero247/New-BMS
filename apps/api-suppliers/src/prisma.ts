import { PrismaClient, Prisma } from '@ims/database/suppliers';
export { Prisma };
declare global {
  var suppliersPrisma: InstanceType<typeof PrismaClient> | undefined;
}
export const prisma =
  global.suppliersPrisma ||
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] });
if (process.env.NODE_ENV !== 'production') {
  global.suppliersPrisma = prisma;
}
