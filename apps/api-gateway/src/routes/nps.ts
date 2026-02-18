import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { submitResponse, getAnalytics, listResponses } from '@ims/nps';
import { z } from 'zod';

const logger = createLogger('api-gateway:nps');
const router = Router();

// ============================================
// Validation schemas
// ============================================

const submitSchema = z.object({
  score: z.number().int().min(0).max(10),
  comment: z.string().max(2000).optional(),
});

const listSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// ============================================
// POST /api/nps — submit an NPS response
// ============================================
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const parsed = submitSchema.safeParse(req.body);

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

    const { score, comment } = parsed.data;
    const orgId = (user as any).organisationId || 'default';
    const response = submitResponse(user!.id, orgId, score, comment);

    logger.info('NPS response submitted', { responseId: response.id, score, userId: user!.id });

    res.status(201).json({
      success: true,
      data: response,
    });
  } catch (error: unknown) {
    logger.error('Failed to submit NPS response', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to submit NPS response' },
    });
  }
});

// ============================================
// GET /api/nps/analytics — get NPS analytics (admin)
// ============================================
router.get('/analytics', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const orgId = (user as any).organisationId || 'default';
    const analytics = getAnalytics(orgId);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error: unknown) {
    logger.error('Failed to get NPS analytics', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get NPS analytics' },
    });
  }
});

// ============================================
// GET /api/nps/responses — list NPS responses (admin)
// ============================================
router.get('/responses', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const parsed = listSchema.safeParse(req.query);

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

    const { limit, offset } = parsed.data;
    const orgId = (user as any).organisationId || 'default';
    const result = listResponses(orgId, limit, offset);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    logger.error('Failed to list NPS responses', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list NPS responses' },
    });
  }
});

export default router;
