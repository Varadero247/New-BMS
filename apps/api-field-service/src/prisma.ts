import { PrismaClient, Prisma } from '@ims/database/field-service';
export { Prisma };

declare global {
  // eslint-disable-next-line no-var
  var fieldServicePrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.fieldServicePrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.fieldServicePrisma = prisma;
}
