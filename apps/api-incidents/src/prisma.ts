import { PrismaClient, Prisma } from '@ims/database/incidents';
export { Prisma };
declare global {
  var incidentsPrisma: InstanceType<typeof PrismaClient> | undefined;
}
export const prisma =
  global.incidentsPrisma ||
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] });
if (process.env.NODE_ENV !== 'production') {
  global.incidentsPrisma = prisma;
}
