import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { requirePermission } from '@ims/rbac';

const logger = createLogger('api-quality');
const router: Router = Router();
router.use(authenticate);

// Quality Policy is stored as a QualDocument with documentType = POLICY and title = 'Quality Policy'.
// Only one active policy document exists at a time; updates create a new version.

const POLICY_TITLE = 'Quality Policy';

async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yymm = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prefix = `QMS-POL-${yymm}`;
  const count = await prisma.qualDocument.count({
    where: { referenceNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(3, '0')}`;
}

const updateSchema = z.object({
  policyStatement: z.string().trim().min(1).max(20000),
  purpose: z.string().max(5000).optional().nullable(),
  commitments: z.string().max(10000).optional().nullable(),
  objectives: z.string().max(10000).optional().nullable(),
  applicability: z.string().max(5000).optional().nullable(),
  version: z.string().max(50).optional(),
  status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'ISSUED', 'OBSOLETE']).optional(),
  approvedBy: z.string().max(200).optional().nullable(),
  effectiveDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional().nullable(),
  nextReviewDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional().nullable(),
});

// GET / — Get current Quality Policy
router.get('/', requirePermission('quality', 'read' as any), async (req: Request, res: Response) => {
  try {
    const doc = await prisma.qualDocument.findFirst({
      where: {
        title: POLICY_TITLE,
        documentType: 'POLICY',
        deletedAt: null,
      } as any,
      orderBy: { createdAt: 'desc' },
    });

    if (!doc) {
      return res.json({
        success: true,
        data: {
          id: null,
          policyStatement: '',
          purpose: '',
          commitments: '',
          objectives: '',
          applicability: '',
          version: '1.0',
          status: 'DRAFT',
          approvedBy: null,
          effectiveDate: null,
          nextReviewDate: null,
          updatedAt: null,
        },
      });
    }

    // Parse keyChanges as JSON for structured policy fields
    let extra: Record<string, string> = {};
    try {
      if (doc.keyChanges) extra = JSON.parse(doc.keyChanges);
    } catch { /* ignore parse errors */ }

    res.json({
      success: true,
      data: {
        id: doc.id,
        referenceNumber: doc.referenceNumber,
        policyStatement: doc.scope || '',
        purpose: doc.purpose || '',
        commitments: extra.commitments || '',
        objectives: extra.objectives || '',
        applicability: extra.applicability || '',
        version: doc.version,
        status: doc.status,
        author: doc.author,
        approvedBy: doc.approvedBy,
        effectiveDate: doc.effectiveDate,
        nextReviewDate: doc.nextReviewDate,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get Quality Policy', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get Quality Policy' } });
  }
});

// PUT / — Create or update Quality Policy
router.put('/', requirePermission('quality', 'write' as any), async (req: Request, res: Response) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const authReq = req as AuthRequest;

    // Store extra fields as JSON in keyChanges
    const keyChanges = JSON.stringify({
      commitments: parsed.data.commitments || '',
      objectives: parsed.data.objectives || '',
      applicability: parsed.data.applicability || '',
    });

    // Find existing policy document
    const existing = await prisma.qualDocument.findFirst({
      where: {
        title: POLICY_TITLE,
        documentType: 'POLICY',
        deletedAt: null,
      } as any,
      orderBy: { createdAt: 'desc' },
    });

    let doc;
    if (existing) {
      // Update existing
      doc = await prisma.qualDocument.update({
        where: { id: existing.id },
        data: {
          scope: parsed.data.policyStatement,
          purpose: parsed.data.purpose || null,
          keyChanges,
          version: parsed.data.version || existing.version,
          status: parsed.data.status || existing.status,
          approvedBy: parsed.data.approvedBy || existing.approvedBy,
          effectiveDate: parsed.data.effectiveDate ? new Date(parsed.data.effectiveDate) : existing.effectiveDate,
          nextReviewDate: parsed.data.nextReviewDate ? new Date(parsed.data.nextReviewDate) : existing.nextReviewDate,
          updatedBy: authReq.user?.id || 'system',
        },
      });
    } else {
      // Create new
      const referenceNumber = await generateRefNumber();
      doc = await prisma.qualDocument.create({
        data: {
          referenceNumber,
          title: POLICY_TITLE,
          documentType: 'POLICY',
          scope: parsed.data.policyStatement,
          purpose: parsed.data.purpose || null,
          keyChanges,
          version: parsed.data.version || '1.0',
          status: parsed.data.status || 'DRAFT',
          author: authReq.user?.id || 'system',
          ownerCustodian: authReq.user?.id || 'system',
          approvedBy: parsed.data.approvedBy || null,
          effectiveDate: parsed.data.effectiveDate ? new Date(parsed.data.effectiveDate) : null,
          nextReviewDate: parsed.data.nextReviewDate ? new Date(parsed.data.nextReviewDate) : null,
          createdBy: authReq.user?.id || 'system',
        },
      });
    }

    let extra: Record<string, string> = {};
    try {
      if (doc.keyChanges) extra = JSON.parse(doc.keyChanges);
    } catch { /* ignore */ }

    res.json({
      success: true,
      data: {
        id: doc.id,
        referenceNumber: doc.referenceNumber,
        policyStatement: doc.scope || '',
        purpose: doc.purpose || '',
        commitments: extra.commitments || '',
        objectives: extra.objectives || '',
        applicability: extra.applicability || '',
        version: doc.version,
        status: doc.status,
        author: doc.author,
        approvedBy: doc.approvedBy,
        effectiveDate: doc.effectiveDate,
        nextReviewDate: doc.nextReviewDate,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to update Quality Policy', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update Quality Policy' } });
  }
});

export default router;
