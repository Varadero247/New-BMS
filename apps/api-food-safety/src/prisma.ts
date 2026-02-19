import { PrismaClient, Prisma } from '@ims/database/food-safety';
export { Prisma };

declare global {
  // eslint-disable-next-line no-var
  var foodSafetyPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.foodSafetyPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.foodSafetyPrisma = prisma;
}
