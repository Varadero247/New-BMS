import { PrismaClient, Prisma } from '@ims/database/automotive';
export { Prisma };

declare global {
  var automotivePrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.automotivePrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.automotivePrisma = prisma;
}
