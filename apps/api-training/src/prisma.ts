import { PrismaClient, Prisma } from '@ims/database/training';
export { Prisma };
declare global {
  // eslint-disable-next-line no-var
  var trainingPrisma: InstanceType<typeof PrismaClient> | undefined;
}
export const prisma =
  global.trainingPrisma ||
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] });
if (process.env.NODE_ENV !== 'production') {
  global.trainingPrisma = prisma;
}
