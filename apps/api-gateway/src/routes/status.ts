import { Router, Request, Response } from 'express';
import { createLogger } from '@ims/monitoring';
import { getPlatformStatus } from '@ims/status';

const logger = createLogger('api-gateway:status');
const router = Router();

// GET /api/health/status — Public endpoint, no auth required
router.get('/', (_req: Request, res: Response) => {
  try {
    const status = getPlatformStatus();

    return res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    logger.error('Failed to get platform status', { error });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get platform status' },
    });
  }
});

export default router;
