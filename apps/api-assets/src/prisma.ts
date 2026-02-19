import { PrismaClient, Prisma } from '@ims/database/assets';
export { Prisma };
declare global {
  // eslint-disable-next-line no-var
  var assetsPrisma: InstanceType<typeof PrismaClient> | undefined;
}
export const prisma =
  global.assetsPrisma ||
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] });
if (process.env.NODE_ENV !== 'production') {
  global.assetsPrisma = prisma;
}
