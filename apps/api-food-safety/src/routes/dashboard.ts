import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-food-safety');

const router = Router();
router.use(authenticate);

// GET /api/dashboard — food safety KPI summary
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [hazards, ccps, audits, ncrs, recalls, products] = await Promise.all([
      prisma.fsHazard.count({ where: { deletedAt: null } }),
      prisma.fsCcp.count({ where: { isActive: true, deletedAt: null } }),
      prisma.fsAudit.count({ where: { deletedAt: null } }),
      prisma.fsNcr.count({ where: { deletedAt: null } }),
      prisma.fsRecall.count({ where: { deletedAt: null } }),
      prisma.fsProduct.count({ where: { deletedAt: null } }),
    ]);

    const openNcrs = await prisma.fsNcr.count({ where: { status: { in: ['OPEN', 'INVESTIGATING', 'CORRECTIVE_ACTION'] }, deletedAt: null } });
    const activeRecalls = await prisma.fsRecall.count({ where: { status: { not: 'CLOSED' }, deletedAt: null } });

    const recentAudits = await prisma.fsAudit.findMany({
      where: { deletedAt: null },
      orderBy: { scheduledDate: 'desc' },
      take: 5,
      select: { id: true, title: true, type: true, status: true, scheduledDate: true },
    });

    const recentNcrs = await prisma.fsNcr.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, severity: true, status: true, createdAt: true },
    });

    res.json({
      success: true,
      data: {
        summary: { hazards, ccps, audits, ncrs, openNcrs, recalls, activeRecalls, products },
        recentAudits,
        recentNcrs,
      },
    });
  } catch (error) {
    logger.error('Dashboard error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch dashboard data' } });
  }
});

export default router;
