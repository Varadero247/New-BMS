import { PrismaClient, Prisma } from '@ims/database/wizard';
export { Prisma };

declare global {
  // eslint-disable-next-line no-var
  var wizardPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.wizardPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.wizardPrisma = prisma;
}
