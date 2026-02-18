import { PrismaClient, Prisma } from '@ims/database/chemicals';
export { Prisma };
declare global {
  var chemicalsPrisma: InstanceType<typeof PrismaClient> | undefined;
}
export const prisma =
  global.chemicalsPrisma ||
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] });
if (process.env.NODE_ENV !== 'production') {
  global.chemicalsPrisma = prisma;
}
