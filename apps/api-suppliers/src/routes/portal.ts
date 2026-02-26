// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';
const router = Router();
const logger = createLogger('suppliers-portal');
router.get('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const supplier = await prisma.suppSupplier.findFirst({
      where: {
        orgId: ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default',
        email: (req as AuthRequest).user?.email,
        deletedAt: null,
      },
    });
    if (!supplier)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Profile not found' } });
    res.json({ success: true, data: supplier });
  } catch (error: unknown) {
    logger.error('Operation failed', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch profile' },
    });
  }
});
export default router;
