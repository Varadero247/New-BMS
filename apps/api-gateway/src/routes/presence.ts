import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { z } from 'zod';
import {
  acquireLock,
  releaseLock,
  refreshLock,
  getPresence,
} from '@ims/presence';

const logger = createLogger('api-gateway:presence');
const router = Router();

const lockSchema = z.object({
  recordType: z.string().min(1, 'recordType is required'),
  recordId: z.string().min(1, 'recordId is required'),
  force: z.boolean().optional(),
});

const recordRefSchema = z.object({
  recordType: z.string().min(1, 'recordType is required'),
  recordId: z.string().min(1, 'recordId is required'),
});

// ============================================
// GET /api/presence?recordType&recordId — get current viewers
// ============================================
router.get('/', authenticate, (req: Request, res: Response) => {
  try {
    const { recordType, recordId } = req.query;

    if (!recordType || !recordId || typeof recordType !== 'string' || typeof recordId !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'recordType and recordId query parameters are required' },
      });
    }

    const viewers = getPresence(recordType, recordId);

    res.json({
      success: true,
      data: { viewers },
    });
  } catch (error: unknown) {
    logger.error('Failed to get presence', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get presence' },
    });
  }
});

// ============================================
// POST /api/presence/lock — acquire lock
// ============================================
router.post('/lock', authenticate, (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const parsed = lockSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { recordType, recordId, force } = parsed.data;

    const result = acquireLock(
      recordType,
      recordId,
      user.id,
      user.name || user.email || 'Unknown User',
      user.avatar,
      !!force
    );

    logger.info('Lock acquisition attempt', {
      recordType,
      recordId,
      userId: user.id,
      acquired: result.acquired,
      force: !!force,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    logger.error('Failed to acquire lock', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to acquire lock' },
    });
  }
});

// ============================================
// DELETE /api/presence/lock — release lock
// ============================================
router.delete('/lock', authenticate, (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const parsed = recordRefSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { recordType, recordId } = parsed.data;
    releaseLock(recordType, recordId, user.id);

    logger.info('Lock released', { recordType, recordId, userId: user.id });

    res.json({
      success: true,
      data: { released: true },
    });
  } catch (error: unknown) {
    logger.error('Failed to release lock', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to release lock' },
    });
  }
});

// ============================================
// PUT /api/presence/refresh — refresh lock
// ============================================
router.put('/refresh', authenticate, (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const parsed = recordRefSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { recordType, recordId } = parsed.data;
    refreshLock(recordType, recordId, user.id);

    res.json({
      success: true,
      data: { refreshed: true },
    });
  } catch (error: unknown) {
    logger.error('Failed to refresh lock', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to refresh lock' },
    });
  }
});

export default router;
