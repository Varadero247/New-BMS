// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('complaints-dashboard');
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const where: Record<string, unknown> = { orgId, deletedAt: null };
    const [totalComplaints, totalActions] = await Promise.all([
      prisma.compComplaint.count({ where }),
      prisma.compAction.count({ where }),
    ]);
    res.json({ success: true, data: { totalComplaints, totalActions } });
  } catch (error: unknown) {
    logger.error('Stats error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats' },
    });
  }
});
export default router;
