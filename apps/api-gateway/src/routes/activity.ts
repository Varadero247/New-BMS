import { Router, Request, Response } from 'express';
import { authenticate , type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { logActivity, getActivity, getRecentActivity } from '@ims/activity';
import { z } from 'zod';

const logger = createLogger('api-gateway:activity');
const router = Router();

// ============================================
// Validation schemas
// ============================================

const getActivitySchema = z.object({
  recordType: z.string().min(1, 'recordType is required'),
  recordId: z.string().min(1, 'recordId is required'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const getRecentSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const VALID_ACTIONS = [
  'created', 'updated', 'status_changed', 'commented',
  'assigned', 'attachment_added', 'ai_analysis_run',
  'review_completed', 'deleted', 'approved', 'rejected',
] as const;

const postActivitySchema = z.object({
  recordType: z.string().min(1),
  recordId: z.string().min(1),
  action: z.enum(VALID_ACTIONS),
  field: z.string().optional(),
  oldValue: z.unknown().optional(),
  newValue: z.unknown().optional(),
  comment: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ============================================
// GET /api/activity — get activity for a specific record
// ============================================
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = getActivitySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: parsed.error.flatten().fieldErrors,
        },
      });
    }

    const { recordType, recordId, limit, offset } = parsed.data;

    const result = await getActivity(recordType, recordId, { limit, offset });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    logger.error('Failed to get activity', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get activity' },
    });
  }
});

// ============================================
// GET /api/activity/recent — get recent activity for current org
// ============================================
router.get('/recent', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const parsed = getRecentSchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: parsed.error.flatten().fieldErrors,
        },
      });
    }

    const { limit } = parsed.data;
    const orgId = (user as any).organisationId || 'default';

    const entries = await getRecentActivity(orgId, limit);

    res.json({
      success: true,
      data: { entries, total: entries.length },
    });
  } catch (error: unknown) {
    logger.error('Failed to get recent activity', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get recent activity' },
    });
  }
});

// ============================================
// POST /api/activity — create an activity entry
// ============================================
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const parsed = postActivitySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request body',
          details: parsed.error.flatten().fieldErrors,
        },
      });
    }

    const { recordType, recordId, action, field, oldValue, newValue, comment, metadata } = parsed.data;

    await logActivity({
      orgId: (user as any).organisationId || 'default',
      recordType,
      recordId,
      userId: user!.id,
      userName: (user as any).name || user!.email || 'Unknown User',
      userAvatar: user!.avatar ?? undefined,
      action,
      field,
      oldValue,
      newValue,
      comment,
      metadata,
    });

    res.status(201).json({
      success: true,
      data: { message: 'Activity logged successfully' },
    });
  } catch (error: unknown) {
    logger.error('Failed to create activity', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create activity' },
    });
  }
});

export default router;
