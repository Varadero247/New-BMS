import { PrismaClient, Prisma } from '@ims/database/partner-portal';
export { Prisma };

declare global {
  // eslint-disable-next-line no-var
  var partnerPortalPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const portalPrisma =
  global.partnerPortalPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.partnerPortalPrisma = portalPrisma;
}
