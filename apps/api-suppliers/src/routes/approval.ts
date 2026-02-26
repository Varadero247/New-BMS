// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
const router = Router();
router.param('id', validateIdParam());
const logger = createLogger('suppliers-approval');
router.post('/:id/approve', authenticate, async (req: Request, res: Response) => {
  try {
    const data = await prisma.suppSupplier.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        approvedDate: new Date(),
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Operation failed', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' },
    });
  }
});
router.post('/:id/suspend', authenticate, async (req: Request, res: Response) => {
  try {
    const data = await prisma.suppSupplier.update({
      where: { id: req.params.id },
      data: { status: 'SUSPENDED', updatedBy: (req as AuthRequest).user?.id },
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Operation failed', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' },
    });
  }
});
export default router;
