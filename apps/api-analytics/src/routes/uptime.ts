import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('uptime');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// GET / — list all uptime checks with current status
// ---------------------------------------------------------------------------
router.get('/', async (_req: Request, res: Response) => {
  try {
    const checks = await prisma.uptimeCheck.findMany({
      orderBy: { serviceName: 'asc' },
      take: 500,
    });

    res.json({ success: true, data: { checks } });
  } catch (err) {
    logger.error('Failed to list uptime checks', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list uptime checks' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /:id/history — list incidents for a check (named route before /:id)
// ---------------------------------------------------------------------------
router.get('/:id/history', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const [incidents, total] = await Promise.all([
      prisma.uptimeIncident.findMany({
        where: { uptimeCheckId: id },
        orderBy: { startedAt: 'desc' as const },
        skip,
        take: limit,
      }),
      prisma.uptimeIncident.count({ where: { uptimeCheckId: id } }),
    ]);

    res.json({
      success: true,
      data: {
        incidents,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    logger.error('Failed to list uptime incidents', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list uptime incidents' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — get single check with recent incidents
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const check = await prisma.uptimeCheck.findUnique({ where: { id } });
    if (!check) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Uptime check not found' } });
    }

    const recentIncidents = await prisma.uptimeIncident.findMany({
      where: { uptimeCheckId: id },
      orderBy: { startedAt: 'desc' as const },
      take: 10,
    });

    res.json({ success: true, data: { check, recentIncidents } });
  } catch (err) {
    logger.error('Failed to get uptime check', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get uptime check' },
    });
  }
});

export default router;
