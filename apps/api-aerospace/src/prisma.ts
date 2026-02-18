import { PrismaClient, Prisma } from '@ims/database/aerospace';
export { Prisma };

declare global {
  var aerospacePrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma: InstanceType<typeof PrismaClient> =
  global.aerospacePrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.aerospacePrisma = prisma;
}
