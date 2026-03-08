// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
// NOTE: Once `npx prisma generate --schema=packages/database/prisma/schemas/billing.prisma`
// has been run, replace the import below with:
//   import { PrismaClient } from '@ims/database/billing';
// Until then, we use the base PrismaClient as a placeholder.
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
