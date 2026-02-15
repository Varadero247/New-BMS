import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('cashflow-routes');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// GET / — List cash flow forecasts ordered by weekStart
// ---------------------------------------------------------------------------
router.get('/', async (_req: Request, res: Response) => {
  try {
    const forecasts = await prisma.cashFlowForecast.findMany({
      orderBy: { weekStart: 'asc' },
    });

    res.json({
      success: true,
      data: { forecasts, total: forecasts.length },
    });
  } catch (err) {
    logger.error('Failed to list cash flow forecasts', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list cash flow forecasts' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /position — Latest company cash position
// ---------------------------------------------------------------------------
router.get('/position', async (_req: Request, res: Response) => {
  try {
    const position = await prisma.companyCashPosition.findFirst({
      orderBy: { date: 'desc' },
    });

    if (!position) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'No cash position data available' },
      });
    }

    res.json({ success: true, data: { position } });
  } catch (err) {
    logger.error('Failed to fetch cash position', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch cash position' },
    });
  }
});

export default router;
