import { PrismaClient, Prisma } from '@ims/database/payroll';
export { Prisma };

declare global {
  // eslint-disable-next-line no-var
  var payrollPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma: InstanceType<typeof PrismaClient> =
  global.payrollPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.payrollPrisma = prisma;
}
