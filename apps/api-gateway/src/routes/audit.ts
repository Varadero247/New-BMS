import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import {
  createSignature,
  verifySignature,
  isValidMeaning,
  type ElectronicSignature,
} from '@ims/esig';
import {
  createEnhancedAuditService,
} from '@ims/audit';

const logger = createLogger('api-gateway-audit');
const router = Router();
const auditService = createEnhancedAuditService(prisma);

router.use(authenticate);

// GET /api/audit/trail - Query enhanced audit trail
router.get('/trail', async (req: AuthRequest, res: Response) => {
  try {
    const {
      userId, resourceType, resourceId, action,
      startDate, endDate, page = '1', limit = '50',
    } = req.query;

    const result = await auditService.query({
      userId: userId as string,
      resourceType: resourceType as string,
      resourceId: resourceId as string,
      action: action as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: Math.max(1, parseInt(page as string, 10) || 1),
      limit: Math.min(parseInt(limit as string, 10) || 50, 100),
    });

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Failed to query audit trail', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to query audit trail' } });
  }
});

// GET /api/audit/trail/:resourceId - All events for a specific record
router.get('/trail/:resourceType/:resourceId', async (req: AuthRequest, res: Response) => {
  try {
    const { resourceType, resourceId } = req.params;
    const { page = '1', limit = '50' } = req.query;

    const result = await auditService.getResourceHistory(
      resourceType,
      resourceId,
      {
        page: Math.max(1, parseInt(page as string, 10) || 1),
        limit: Math.min(parseInt(limit as string, 10) || 50, 100),
      }
    );

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Failed to get resource history', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get resource history' } });
  }
});

// GET /api/audit/trail/verify/:entryId - Verify audit entry integrity
router.get('/trail/verify/:entryId', async (req: AuthRequest, res: Response) => {
  try {
    const result = await auditService.verifyEntry(req.params.entryId);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Failed to verify audit entry', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to verify audit entry' } });
  }
});

// POST /api/audit/esignature - Create electronic signature (requires password re-auth)
router.post('/esignature', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      password: z.string().min(1),
      meaning: z.string().min(1),
      reason: z.string().min(1),
      resourceType: z.string().min(1),
      resourceId: z.string().min(1),
      resourceRef: z.string().min(1),
    });

    const data = schema.parse(req.body);

    if (!isValidMeaning(data.meaning)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: `Invalid signature meaning: ${data.meaning}` },
      });
    }

    // Get user's password hash from DB for re-authentication
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, firstName: true, lastName: true, password: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    const result = await createSignature(
      {
        userId: user.id,
        userEmail: user.email,
        userFullName: `${user.firstName} ${user.lastName}`,
        password: data.password,
        meaning: data.meaning as any,
        reason: data.reason,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        resourceRef: data.resourceRef,
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      },
      user.password
    );

    if (!result.signature) {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_FAILED', message: result.error || 'Signature creation failed' },
      });
    }

    // Persist the e-signature to the database
    await prisma.eSignature.create({
      data: {
        id: result.signature.id,
        userId: result.signature.userId,
        userEmail: result.signature.userEmail,
        userFullName: result.signature.userFullName,
        meaning: result.signature.meaning,
        reason: result.signature.reason,
        resourceType: result.signature.resourceType,
        resourceId: result.signature.resourceId,
        resourceRef: result.signature.resourceRef,
        ipAddress: result.signature.ipAddress,
        userAgent: result.signature.userAgent,
        checksum: result.signature.checksum,
        valid: true,
      },
    });

    // Log the e-signature event to enhanced audit trail
    await auditService.createEntry({
      userId: user.id,
      userEmail: user.email,
      userFullName: `${user.firstName} ${user.lastName}`,
      action: 'SIGN',
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      resourceRef: data.resourceRef,
      changes: [{ field: 'signature', oldValue: null, newValue: data.meaning }],
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      esignatureId: result.signature.id,
    });

    // Return signature without sensitive data
    const { checksum: _c, ...safeSignature } = result.signature;

    res.status(201).json({ success: true, data: safeSignature });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Failed to create e-signature', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create electronic signature' } });
  }
});

// GET /api/audit/esignature/:id - Verify a specific signature
router.get('/esignature/:id', async (req: AuthRequest, res: Response) => {
  try {
    const signature = await prisma.eSignature.findUnique({
      where: { id: req.params.id },
    });

    if (!signature) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Signature not found' },
      });
    }

    const verification = verifySignature({
      id: signature.id,
      userId: signature.userId,
      userEmail: signature.userEmail,
      userFullName: signature.userFullName,
      meaning: signature.meaning as any,
      reason: signature.reason,
      timestamp: signature.createdAt,
      ipAddress: signature.ipAddress,
      userAgent: signature.userAgent,
      resourceType: signature.resourceType,
      resourceId: signature.resourceId,
      resourceRef: signature.resourceRef,
      checksum: signature.checksum,
      valid: signature.valid,
    });

    res.json({ success: true, data: verification });
  } catch (error) {
    logger.error('Failed to verify e-signature', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to verify signature' } });
  }
});

export default router;
