// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { PrismaClient, Prisma } from '@ims/database/ai';
export { Prisma };

declare global {
  // eslint-disable-next-line no-var
  var aiPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma: InstanceType<typeof PrismaClient> =
  global.aiPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.aiPrisma = prisma;
}
