import { PrismaClient, Prisma } from '@ims/database/crm';
export { Prisma };

declare global {
  var crmPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.crmPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.crmPrisma = prisma;
}
