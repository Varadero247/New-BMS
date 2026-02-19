import { PrismaClient, Prisma } from '@ims/database/infosec';
export { Prisma };

declare global {
  // eslint-disable-next-line no-var
  var infosecPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.infosecPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.infosecPrisma = prisma;
}
