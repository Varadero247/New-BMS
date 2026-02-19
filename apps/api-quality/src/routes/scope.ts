import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { requirePermission } from '@ims/rbac';

const logger = createLogger('api-quality');
const router: Router = Router();
router.use(authenticate);

// QMS Scope is stored as a QualDocument with documentType = POLICY and title = 'QMS Scope'.
// Only one active scope document exists at a time; updates create a new version.

const SCOPE_TITLE = 'QMS Scope';

async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yymm = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prefix = `QMS-SCP-${yymm}`;
  const count = await prisma.qualDocument.count({
    where: { referenceNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(3, '0')}`;
}

const updateSchema = z.object({
  scope: z.string().trim().min(1).max(10000),
  purpose: z.string().trim().max(5000).optional().nullable(),
  exclusions: z.string().trim().max(5000).optional().nullable(),
  boundaries: z.string().trim().max(5000).optional().nullable(),
  applicableStandards: z.string().trim().max(2000).optional().nullable(),
  version: z.string().trim().max(50).optional(),
  status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'ISSUED', 'OBSOLETE']).optional(),
});

// GET / — Get current QMS scope
router.get(
  '/',
  requirePermission('quality', 'read' as any),
  async (req: Request, res: Response) => {
    try {
      const doc = await prisma.qualDocument.findFirst({
        where: {
          title: SCOPE_TITLE,
          documentType: 'POLICY',
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!doc) {
        return res.json({
          success: true,
          data: {
            id: null,
            scope: '',
            purpose: '',
            exclusions: '',
            boundaries: '',
            applicableStandards: '',
            version: '1.0',
            status: 'DRAFT',
            updatedAt: null,
          },
        });
      }

      // Parse keyChanges as JSON for structured scope fields
      let extra: Record<string, string> = {};
      try {
        if (doc.keyChanges) extra = JSON.parse(doc.keyChanges);
      } catch {
        /* ignore parse errors */
      }

      res.json({
        success: true,
        data: {
          id: doc.id,
          referenceNumber: doc.referenceNumber,
          scope: doc.scope || '',
          purpose: doc.purpose || '',
          exclusions: extra.exclusions || '',
          boundaries: extra.boundaries || '',
          applicableStandards: extra.applicableStandards || '',
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
      logger.error('Failed to get QMS scope', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get QMS scope' },
      });
    }
  }
);

// PUT / — Create or update QMS scope
router.put(
  '/',
  requirePermission('quality', 'write' as any),
  async (req: Request, res: Response) => {
    try {
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: parsed.error.flatten(),
          },
        });
      }

      const authReq = req as AuthRequest;

      // Store extra fields as JSON in keyChanges
      const keyChanges = JSON.stringify({
        exclusions: parsed.data.exclusions || '',
        boundaries: parsed.data.boundaries || '',
        applicableStandards: parsed.data.applicableStandards || '',
      });

      // Find existing scope document
      const existing = await prisma.qualDocument.findFirst({
        where: {
          title: SCOPE_TITLE,
          documentType: 'POLICY',
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });

      let doc;
      if (existing) {
        // Update existing
        doc = await prisma.qualDocument.update({
          where: { id: existing.id },
          data: {
            scope: parsed.data.scope,
            purpose: parsed.data.purpose || null,
            keyChanges,
            version: parsed.data.version || existing.version,
            status: parsed.data.status || existing.status,
            updatedBy: authReq.user?.id || 'system',
          },
        });
      } else {
        // Create new
        const referenceNumber = await generateRefNumber();
        doc = await prisma.qualDocument.create({
          data: {
            referenceNumber,
            title: SCOPE_TITLE,
            documentType: 'POLICY',
            scope: parsed.data.scope,
            purpose: parsed.data.purpose || null,
            keyChanges,
            version: parsed.data.version || '1.0',
            status: parsed.data.status || 'DRAFT',
            author: authReq.user?.id || 'system',
            ownerCustodian: authReq.user?.id || 'system',
            createdBy: authReq.user?.id || 'system',
          },
        });
      }

      let extra: Record<string, string> = {};
      try {
        if (doc.keyChanges) extra = JSON.parse(doc.keyChanges);
      } catch {
        /* ignore */
      }

      res.json({
        success: true,
        data: {
          id: doc.id,
          referenceNumber: doc.referenceNumber,
          scope: doc.scope || '',
          purpose: doc.purpose || '',
          exclusions: extra.exclusions || '',
          boundaries: extra.boundaries || '',
          applicableStandards: extra.applicableStandards || '',
          version: doc.version,
          status: doc.status,
          author: doc.author,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        },
      });
    } catch (error: unknown) {
      logger.error('Failed to update QMS scope', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update QMS scope' },
      });
    }
  }
);

export default router;
