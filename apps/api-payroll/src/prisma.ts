import { PrismaClient } from '@ims/database/payroll';

declare global {
  var payrollPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.payrollPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.payrollPrisma = prisma;
}
