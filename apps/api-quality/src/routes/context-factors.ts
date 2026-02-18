import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { requirePermission } from '@ims/rbac';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-quality');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// Context factors are stored as QualIssue records with bias = MIXED and a special prefix.
// This provides a dedicated endpoint for the Context of the Organisation (ISO 9001 Clause 4.1).

async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yymm = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prefix = `QMS-CTX-${yymm}`;
  const count = await prisma.qualIssue.count({
    where: { referenceNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(3, '0')}`;
}

const createSchema = z.object({
  factorName: z.string().trim().min(1).max(500),
  factorType: z.enum(['INTERNAL', 'EXTERNAL']),
  category: z.string().trim().max(200).optional().nullable(),
  description: z.string().trim().max(5000).optional().nullable(),
  impact: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().default('MEDIUM'),
  status: z
    .enum(['OPEN', 'UNDER_REVIEW', 'TREATED', 'MONITORED', 'CLOSED'])
    .optional()
    .default('OPEN'),
  notes: z.string().trim().max(5000).optional().nullable(),
});

const updateSchema = createSchema.partial();

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// GET / — List context factors
router.get(
  '/',
  requirePermission('quality', 'read' as any),
  async (req: Request, res: Response) => {
    try {
      const { factorType, status, search } = req.query;
      const page = parseIntParam(req.query.page, 1);
      const limit = parseIntParam(req.query.limit, 25, 100);
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {
        deletedAt: null,
        referenceNumber: { startsWith: 'QMS-CTX' },
      };
      if (factorType && typeof factorType === 'string') {
        where.bias = factorType === 'INTERNAL' ? 'RISK' : 'OPPORTUNITY';
      }
      if (status && typeof status === 'string') where.status = status;
      if (search && typeof search === 'string') {
        where.issueOfConcern = { contains: search, mode: 'insensitive' };
      }

      const [items, total] = await Promise.all([
        prisma.qualIssue.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
        prisma.qualIssue.count({ where }),
      ]);

      // Map QualIssue fields to context factor shape for frontend consumption
      const data = items.map((item: Record<string, unknown>) => ({
        id: item.id,
        referenceNumber: item.referenceNumber,
        factorName: item.issueOfConcern,
        factorType:
          item.bias === 'RISK' ? 'INTERNAL' : item.bias === 'OPPORTUNITY' ? 'EXTERNAL' : 'INTERNAL',
        category: item.processesAffected,
        description: item.treatmentMethod,
        impact: item.priority,
        status: item.status,
        notes: item.notes,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      res.json({
        success: true,
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error: unknown) {
      logger.error('Failed to list context factors', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to list context factors' },
      });
    }
  }
);

// POST / — Create context factor
router.post(
  '/',
  requirePermission('quality', 'write' as any),
  async (req: Request, res: Response) => {
    try {
      const parsed = createSchema.safeParse(req.body);
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
      const referenceNumber = await generateRefNumber();

      const item = await prisma.qualIssue.create({
        data: {
          referenceNumber,
          issueOfConcern: parsed.data.factorName,
          bias: parsed.data.factorType === 'INTERNAL' ? 'RISK' : 'OPPORTUNITY',
          processesAffected: parsed.data.category || null,
          treatmentMethod: parsed.data.description || 'Context factor',
          priority: parsed.data.impact || 'MEDIUM',
          status: parsed.data.status || 'OPEN',
          notes: parsed.data.notes || null,
          createdBy: authReq.user?.id || 'system',
        },
      });

      res.status(201).json({
        success: true,
        data: {
          id: item.id,
          referenceNumber: item.referenceNumber,
          factorName: item.issueOfConcern,
          factorType: parsed.data.factorType,
          category: item.processesAffected,
          description: item.treatmentMethod,
          impact: item.priority,
          status: item.status,
          notes: item.notes,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        },
      });
    } catch (error: unknown) {
      logger.error('Failed to create context factor', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create context factor' },
      });
    }
  }
);

// GET /:id — Get context factor by ID
router.get(
  '/:id',
  requirePermission('quality', 'read' as any),
  async (req: Request, res: Response) => {
    try {
      const item = await prisma.qualIssue.findFirst({
        where: {
          id: req.params.id,
          deletedAt: null,
          referenceNumber: { startsWith: 'QMS-CTX' } as any,
        },
      });
      if (!item)
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Context factor not found' },
        });

      res.json({
        success: true,
        data: {
          id: item.id,
          referenceNumber: item.referenceNumber,
          factorName: item.issueOfConcern,
          factorType: item.bias === 'RISK' ? 'INTERNAL' : 'EXTERNAL',
          category: item.processesAffected,
          description: item.treatmentMethod,
          impact: item.priority,
          status: item.status,
          notes: item.notes,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        },
      });
    } catch (error: unknown) {
      logger.error('Failed to get context factor', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get context factor' },
      });
    }
  }
);

// PUT /:id — Update context factor
router.put(
  '/:id',
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

      const existing = await prisma.qualIssue.findFirst({
        where: {
          id: req.params.id,
          deletedAt: null,
          referenceNumber: { startsWith: 'QMS-CTX' } as any,
        },
      });
      if (!existing)
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Context factor not found' },
        });

      const data: Record<string, unknown> = {};
      if (parsed.data.factorName !== undefined) data.issueOfConcern = parsed.data.factorName;
      if (parsed.data.factorType !== undefined)
        data.bias = parsed.data.factorType === 'INTERNAL' ? 'RISK' : 'OPPORTUNITY';
      if (parsed.data.category !== undefined) data.processesAffected = parsed.data.category;
      if (parsed.data.description !== undefined) data.treatmentMethod = parsed.data.description;
      if (parsed.data.impact !== undefined) data.priority = parsed.data.impact;
      if (parsed.data.status !== undefined) data.status = parsed.data.status;
      if (parsed.data.notes !== undefined) data.notes = parsed.data.notes;

      const item = await prisma.qualIssue.update({ where: { id: req.params.id }, data });

      res.json({
        success: true,
        data: {
          id: item.id,
          referenceNumber: item.referenceNumber,
          factorName: item.issueOfConcern,
          factorType: item.bias === 'RISK' ? 'INTERNAL' : 'EXTERNAL',
          category: item.processesAffected,
          description: item.treatmentMethod,
          impact: item.priority,
          status: item.status,
          notes: item.notes,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        },
      });
    } catch (error: unknown) {
      logger.error('Failed to update context factor', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update context factor' },
      });
    }
  }
);

// DELETE /:id — Soft delete context factor
router.delete(
  '/:id',
  requirePermission('quality', 'delete' as any),
  async (req: Request, res: Response) => {
    try {
      const existing = await prisma.qualIssue.findFirst({
        where: {
          id: req.params.id,
          deletedAt: null,
          referenceNumber: { startsWith: 'QMS-CTX' } as any,
        },
      });
      if (!existing)
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Context factor not found' },
        });

      await prisma.qualIssue.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date() },
      });
      res.json({ success: true, data: { id: req.params.id, deleted: true } });
    } catch (error: unknown) {
      logger.error('Failed to delete context factor', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete context factor' },
      });
    }
  }
);

export default router;
