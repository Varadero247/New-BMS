// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { PrismaClient, Prisma } from '@ims/database/aerospace';
export { Prisma };

declare global {
  // eslint-disable-next-line no-var
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
