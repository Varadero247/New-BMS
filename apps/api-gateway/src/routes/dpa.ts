import { Router, Response } from 'express';
import { authenticate, requireRole, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { z } from 'zod';
import { getActiveDpa, acceptDpa, hasAcceptedDpa, getDpaAcceptance } from '@ims/dpa';

const logger = createLogger('api-gateway:dpa');
const router = Router();

// All routes require authentication
router.use(authenticate);

// ─── Validation Schemas ─────────────────────────────────────────────────────

const acceptSchema = z.object({
  signerName: z.string().trim().min(1, 'Signer name is required'),
  signerTitle: z.string().trim().min(1, 'Signer title is required'),
  signature: z.string().trim().optional(),
});

// ─── Routes ─────────────────────────────────────────────────────────────────

// GET /api/admin/dpa — Get the active DPA document
router.get('/', requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  try {
    const dpa = getActiveDpa();
    if (!dpa) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'No active DPA found' },
      });
    }

    const orgId = (req as AuthRequest & { user?: { orgId?: string } }).user?.orgId || 'default';
    const accepted = hasAcceptedDpa(orgId);

    res.json({
      success: true,
      data: {
        ...dpa,
        accepted,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get DPA', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get DPA' },
    });
  }
});

// POST /api/admin/dpa/accept — Accept the active DPA
router.post('/accept', requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  try {
    const parsed = acceptSchema.safeParse(req.body);
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

    const orgId = (req as AuthRequest & { user?: { orgId?: string } }).user?.orgId || 'default';

    if (hasAcceptedDpa(orgId)) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'ALREADY_ACCEPTED',
          message: 'DPA has already been accepted for this organisation',
        },
      });
    }

    const acceptance = acceptDpa({
      orgId,
      userId: req.user!.id,
      signerName: parsed.data.signerName,
      signerTitle: parsed.data.signerTitle,
      signature: parsed.data.signature,
      ipAddress: req.ip,
    });

    if (!acceptance) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'No active DPA found to accept' },
      });
    }

    logger.info('DPA accepted', { orgId, userId: req.user?.id, dpaVersion: acceptance.dpaVersion });

    res.status(201).json({ success: true, data: acceptance });
  } catch (error: unknown) {
    logger.error('Failed to accept DPA', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to accept DPA' },
    });
  }
});

// GET /api/admin/dpa/acceptance — Get acceptance status for the org
router.get('/acceptance', requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  try {
    const orgId = (req as AuthRequest & { user?: { orgId?: string } }).user?.orgId || 'default';
    const acceptance = getDpaAcceptance(orgId);

    res.json({
      success: true,
      data: {
        accepted: !!acceptance,
        acceptance,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get DPA acceptance', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get DPA acceptance status' },
    });
  }
});

export default router;
