import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-aerospace');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// AS9100D Clause Reference Data
// ============================================

const AS9100D_CLAUSES = [
  { clause: '4.1', title: 'Understanding the organization and its context' },
  { clause: '4.2', title: 'Understanding the needs and expectations of interested parties' },
  { clause: '4.3', title: 'Determining the scope of the QMS' },
  { clause: '4.4', title: 'QMS and its processes' },
  { clause: '5.1', title: 'Leadership and commitment' },
  { clause: '5.2', title: 'Quality policy' },
  { clause: '5.3', title: 'Organizational roles, responsibilities and authorities' },
  { clause: '6.1', title: 'Actions to address risks and opportunities' },
  { clause: '6.2', title: 'Quality objectives and planning' },
  { clause: '6.3', title: 'Planning of changes' },
  { clause: '7.1', title: 'Resources' },
  { clause: '7.2', title: 'Competence' },
  { clause: '7.3', title: 'Awareness' },
  { clause: '7.4', title: 'Communication' },
  { clause: '7.5', title: 'Documented information' },
  { clause: '8.1', title: 'Operational planning and control' },
  { clause: '8.1.1', title: 'Operational risk management' },
  { clause: '8.1.2', title: 'Configuration management' },
  { clause: '8.1.3', title: 'Product and service requirements' },
  { clause: '8.2', title: 'Requirements for products and services' },
  { clause: '8.3', title: 'Design and development' },
  { clause: '8.4', title: 'Control of externally provided processes, products and services' },
  { clause: '8.4.3', title: 'Information for external providers' },
  { clause: '8.5', title: 'Production and service provision' },
  { clause: '8.5.1', title: 'Control of production and service provision' },
  { clause: '8.5.2', title: 'Identification and traceability' },
  { clause: '8.6', title: 'Release of products and services' },
  { clause: '8.7', title: 'Control of nonconforming outputs' },
  { clause: '9.1', title: 'Monitoring, measurement, analysis and evaluation' },
  { clause: '9.2', title: 'Internal audit' },
  { clause: '9.3', title: 'Management review' },
  { clause: '10.1', title: 'General (improvement)' },
  { clause: '10.2', title: 'Nonconformity and corrective action' },
  { clause: '10.3', title: 'Continual improvement' },
];

// ============================================
// Reference Number Generator
// ============================================

async function generateComplianceItemRefNumber(): Promise<string> {
  const now = new Date();
  const yyyy = now.getFullYear();
  const count = await prisma.aeroComplianceItem.count({
    where: { refNumber: { startsWith: `AERO-COMP-${yyyy}` } },
  });
  return `AERO-COMP-${yyyy}-${String(count + 1).padStart(3, '0')}`;
}

// ============================================
// Zod Schemas
// ============================================

const createComplianceItemSchema = z.object({
  clause: z.string().trim().min(1, 'Clause reference is required'),
  title: z.string().trim().optional(),
  description: z.string().trim().optional(),
  standard: z.string().trim().optional().default('AS9100D'),
  evidenceDocuments: z.array(z.string().trim()).optional().default([]),
  responsiblePerson: z.string().trim().optional(),
  targetDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  notes: z.string().trim().optional(),
});

const updateComplianceItemSchema = z.object({
  clause: z.string().trim().optional(),
  title: z.string().trim().optional(),
  description: z.string().trim().optional(),
  standard: z.string().trim().optional(),
  complianceStatus: z
    .enum(['COMPLIANT', 'PARTIALLY_COMPLIANT', 'NON_COMPLIANT', 'NOT_APPLICABLE', 'UNDER_REVIEW'])
    .optional(),
  evidenceDocuments: z.array(z.string().trim()).optional(),
  responsiblePerson: z.string().trim().optional(),
  targetDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  lastReviewDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  nextReviewDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  notes: z.string().trim().optional(),
});

// ============================================
// COMPLIANCE TRACKER — CRUD
// ============================================

// GET /clauses - List AS9100D clause reference data
router.get('/clauses', async (_req: AuthRequest, res: Response) => {
  try {
    res.json({ success: true, data: AS9100D_CLAUSES });
  } catch (error) {
    logger.error('List clauses error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list clauses' },
    });
  }
});

// GET / - List compliance items
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', status, standard, search } = req.query;
    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 50), 200);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.complianceStatus = status as any;
    if (standard) where.standard = standard as any;
    if (search) {
      where.OR = [
        { clause: { contains: search as string, mode: 'insensitive' } },
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.aeroComplianceItem.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { clause: 'asc' },
      }),
      prisma.aeroComplianceItem.count({ where }),
    ]);

    res.json({
      success: true,
      data: items,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List compliance items error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list compliance items' },
    });
  }
});

// GET /:id - Get compliance item
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.aeroComplianceItem.findUnique({
      where: { id: req.params.id },
    });

    if (!item || item.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Compliance item not found' },
      });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    logger.error('Get compliance item error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get compliance item' },
    });
  }
});

// POST / - Create compliance item
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createComplianceItemSchema.parse(req.body);
    const refNumber = await generateComplianceItemRefNumber();

    // Look up clause title if not provided
    const clauseData = AS9100D_CLAUSES.find((c) => c.clause === data.clause);
    const title = data.title || clauseData?.title || data.clause;

    const item = await prisma.aeroComplianceItem.create({
      data: {
        refNumber,
        clause: data.clause,
        title,
        description: data.description,
        standard: data.standard,
        complianceStatus: 'UNDER_REVIEW',
        evidenceDocuments: data.evidenceDocuments,
        responsiblePerson: data.responsiblePerson,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        notes: data.notes,
        createdBy: req.user?.id,
      } as any,
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Create compliance item error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create compliance item' },
    });
  }
});

// PUT /:id - Update compliance item
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.aeroComplianceItem.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Compliance item not found' },
      });
    }

    const data = updateComplianceItemSchema.parse(req.body);

    const item = await prisma.aeroComplianceItem.update({
      where: { id: req.params.id },
      data: {
        ...data,
        targetDate: data.targetDate ? new Date(data.targetDate) : existing.targetDate,
        lastReviewDate: data.lastReviewDate
          ? new Date(data.lastReviewDate)
          : existing.lastReviewDate,
        nextReviewDate: data.nextReviewDate
          ? new Date(data.nextReviewDate)
          : existing.nextReviewDate,
      } as any,
    });

    res.json({ success: true, data: item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Update compliance item error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update compliance item' },
    });
  }
});

// DELETE /:id - Soft delete compliance item
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.aeroComplianceItem.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Compliance item not found' },
      });
    }

    await prisma.aeroComplianceItem.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete compliance item error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete compliance item' },
    });
  }
});

// GET /dashboard/summary - Compliance summary dashboard
router.get('/dashboard/summary', async (_req: AuthRequest, res: Response) => {
  try {
    const [total, compliant, partiallyCompliant, nonCompliant, notApplicable, underReview] =
      await Promise.all([
        prisma.aeroComplianceItem.count({ where: { deletedAt: null } as any }),
        prisma.aeroComplianceItem.count({
          where: { deletedAt: null, complianceStatus: 'COMPLIANT' } as any,
        }),
        prisma.aeroComplianceItem.count({
          where: { deletedAt: null, complianceStatus: 'PARTIALLY_COMPLIANT' } as any,
        }),
        prisma.aeroComplianceItem.count({
          where: { deletedAt: null, complianceStatus: 'NON_COMPLIANT' } as any,
        }),
        prisma.aeroComplianceItem.count({
          where: { deletedAt: null, complianceStatus: 'NOT_APPLICABLE' } as any,
        }),
        prisma.aeroComplianceItem.count({
          where: { deletedAt: null, complianceStatus: 'UNDER_REVIEW' } as any,
        }),
      ]);

    const applicable = total - notApplicable;
    const complianceScore =
      applicable > 0 ? Math.round(((compliant + partiallyCompliant * 0.5) / applicable) * 100) : 0;

    res.json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        standard: 'AS9100D',
        totalClauses: AS9100D_CLAUSES.length,
        trackedItems: total,
        complianceScore,
        byStatus: {
          compliant,
          partiallyCompliant,
          nonCompliant,
          notApplicable,
          underReview,
        },
        gaps: nonCompliant + partiallyCompliant,
      },
    });
  } catch (error) {
    logger.error('Compliance summary error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get compliance summary' },
    });
  }
});

export default router;
