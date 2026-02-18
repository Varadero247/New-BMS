import { Router, Response } from 'express';
import { authenticate, requireRole, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { z } from 'zod';
import {
  createRequest,
  listRequests,
  getRequest,
  processExportRequest,
  processErasureRequest,
} from '@ims/dsar';

const logger = createLogger('api-gateway:dsar');
const router = Router();
router.param('id', validateIdParam());

// All routes require authentication + admin role
router.use(authenticate);

// ─── Validation Schemas ─────────────────────────────────────────────────────

const createSchema = z.object({
  type: z.enum(['EXPORT', 'ERASURE']),
  subjectEmail: z.string().trim().email('Valid email is required'),
  notes: z.string().trim().optional(),
});

// ─── Routes ─────────────────────────────────────────────────────────────────

// GET /api/admin/privacy/dsar — List DSAR requests
router.get('/', requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  try {
    const orgId = (req.user as any)?.orgId || 'default';
    const requests = listRequests(orgId);

    res.json({
      success: true,
      data: requests,
      meta: { total: requests.length },
    });
  } catch (error: unknown) {
    logger.error('Failed to list DSAR requests', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list DSAR requests' },
    });
  }
});

// POST /api/admin/privacy/dsar — Create DSAR request
router.post('/', requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const orgId = (req.user as any)?.orgId || 'default';
    const request = createRequest({
      orgId,
      type: parsed.data.type,
      subjectEmail: parsed.data.subjectEmail,
      requestedById: req.user!.id,
      notes: parsed.data.notes,
    });

    logger.info('DSAR request created', {
      id: request.id,
      type: request.type,
      subjectEmail: request.subjectEmail,
      userId: req.user?.id,
    });

    res.status(201).json({ success: true, data: request });
  } catch (error: unknown) {
    logger.error('Failed to create DSAR request', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create DSAR request' },
    });
  }
});

// GET /api/admin/privacy/dsar/:id — Get DSAR request by ID
router.get('/:id', requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  try {
    const request = getRequest(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'DSAR request not found' },
      });
    }

    res.json({ success: true, data: request });
  } catch (error: unknown) {
    logger.error('Failed to get DSAR request', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get DSAR request' },
    });
  }
});

// POST /api/admin/privacy/dsar/:id/process — Process (execute) a DSAR request
router.post('/:id/process', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const request = getRequest(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'DSAR request not found' },
      });
    }

    if (request.status === 'COMPLETE') {
      return res.status(409).json({
        success: false,
        error: { code: 'ALREADY_COMPLETE', message: 'This request has already been processed' },
      });
    }

    if (request.status === 'IN_PROGRESS') {
      return res.status(409).json({
        success: false,
        error: { code: 'IN_PROGRESS', message: 'This request is already being processed' },
      });
    }

    logger.info('Processing DSAR request', {
      id: request.id,
      type: request.type,
      userId: req.user?.id,
    });

    let result;
    if (request.type === 'EXPORT') {
      result = await processExportRequest(request.id);
    } else {
      result = await processErasureRequest(request.id);
    }

    if (!result) {
      return res.status(500).json({
        success: false,
        error: { code: 'PROCESSING_FAILED', message: 'Failed to process DSAR request' },
      });
    }

    logger.info('DSAR request processed', {
      id: result.id,
      type: result.type,
      status: result.status,
    });

    res.json({ success: true, data: result });
  } catch (error: unknown) {
    logger.error('Failed to process DSAR request', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to process DSAR request' },
    });
  }
});

export default router;
