import { PrismaClient, Prisma } from '@ims/database/finance';
export { Prisma };

declare global {
  var financePrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.financePrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.financePrisma = prisma;
}
