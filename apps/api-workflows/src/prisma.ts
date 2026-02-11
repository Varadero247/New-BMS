import { PrismaClient, Prisma } from '@ims/database/workflows';
export { Prisma };

declare global {
  var workflowsPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.workflowsPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.workflowsPrisma = prisma;
}
