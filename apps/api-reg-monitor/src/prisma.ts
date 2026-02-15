import { PrismaClient, Prisma } from '@ims/database/reg-monitor';
export { Prisma };
declare global { var regMonitorPrisma: InstanceType<typeof PrismaClient> | undefined; }
export const prisma = global.regMonitorPrisma || new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] });
if (process.env.NODE_ENV !== 'production') { global.regMonitorPrisma = prisma; }
