import { PrismaClient, Prisma } from '@ims/database/documents';
export { Prisma };
declare global {
  // eslint-disable-next-line no-var
  var documentsPrisma: InstanceType<typeof PrismaClient> | undefined;
}
export const prisma =
  global.documentsPrisma ||
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] });
if (process.env.NODE_ENV !== 'production') {
  global.documentsPrisma = prisma;
}
