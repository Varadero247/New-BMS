import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-automotive');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// Customer-Specific Requirements (IATF 16949 Clause 8.2.2)
// ============================================

async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `CSR-${yy}${mm}`;
  const count = await prisma.customerReq.count({
    where: { refNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

const createSchema = z.object({
  customer: z.string().trim().min(1),
  requirementTitle: z.string().trim().min(1),
  requirementRef: z.string().optional(),
  category: z.enum(['QUALITY', 'DELIVERY', 'PACKAGING', 'LABELING', 'DOCUMENTATION', 'PROCESS', 'ENVIRONMENTAL', 'SAFETY', 'OTHER']).optional(),
  description: z.string().trim().min(1),
  applicableProducts: z.string().optional(),
  evidenceRef: z.string().optional(),
  reviewedBy: z.string().optional(),
  reviewDate: z.string().optional(),
  nextReviewDate: z.string().optional(),
  notes: z.string().optional(),
});

const updateSchema = createSchema.partial().extend({
  complianceStatus: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'PARTIAL', 'UNDER_REVIEW', 'NOT_APPLICABLE']).optional(),
});

// GET / - List customer requirements
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', customer, category, complianceStatus, search } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (customer) where.customer = { contains: customer as string, mode: 'insensitive' };
    if (category) where.category = category as any;
    if (complianceStatus) where.complianceStatus = complianceStatus as any;
    if (search) {
      where.OR = [
        { requirementTitle: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { customer: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [reqs, total] = await Promise.all([
      prisma.customerReq.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ customer: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.customerReq.count({ where }),
    ]);

    res.json({
      success: true,
      data: reqs,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List customer reqs error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list customer requirements' } });
  }
});

// GET /customers - List distinct customers
router.get('/customers', async (_req: AuthRequest, res: Response) => {
  try {
    const customers = await prisma.customerReq.findMany({
      where: { deletedAt: null } as any,
      select: { customer: true },
      distinct: ['customer'],
      orderBy: { customer: 'asc' },
      take: 1000});

    res.json({ success: true, data: customers.map(c => c.customer) });
  } catch (error) {
    logger.error('List customers error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list customers' } });
  }
});

// GET /compliance-summary - Compliance status summary
router.get('/compliance-summary', async (_req: AuthRequest, res: Response) => {
  try {
    const [total, byStatus, byCustomer, overdue] = await Promise.all([
      prisma.customerReq.count({ where: { deletedAt: null } as any }),
      prisma.customerReq.groupBy({
        by: ['complianceStatus'],
        _count: { id: true },
        where: { deletedAt: null } as any,
      }),
      prisma.customerReq.groupBy({
        by: ['customer'],
        _count: { id: true },
        where: { deletedAt: null } as any,
      }),
      prisma.customerReq.count({
        where: {
          deletedAt: null,
          nextReviewDate: { lt: new Date() } as any,
          complianceStatus: { not: 'NOT_APPLICABLE' },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        overdue,
        byStatus: byStatus.map(s => ({ status: s.complianceStatus, count: s._count.id })),
        byCustomer: byCustomer.sort((a, b) => b._count.id - a._count.id).slice(0, 10).map(c => ({ customer: c.customer, count: c._count.id })),
      },
    });
  } catch (error) {
    logger.error('Compliance summary error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get compliance summary' } });
  }
});

// GET /:id - Get single customer requirement
router.get('/:id', checkOwnership(prisma.customerReq), async (req: AuthRequest, res: Response) => {
  try {
    const req_ = await prisma.customerReq.findUnique({ where: { id: req.params.id } });
    if (!req_ || req_.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Customer requirement not found' } });
    }
    res.json({ success: true, data: req_ });
  } catch (error) {
    logger.error('Get customer req error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get customer requirement' } });
  }
});

// POST / - Create customer requirement
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createSchema.parse(req.body);
    const refNumber = await generateRefNumber();

    const customerReq = await prisma.customerReq.create({
      data: {
        refNumber,
        customer: data.customer,
        requirementTitle: data.requirementTitle,
        requirementRef: data.requirementRef,
        category: data.category || 'QUALITY',
        description: data.description,
        applicableProducts: data.applicableProducts,
        complianceStatus: 'UNDER_REVIEW',
        evidenceRef: data.evidenceRef,
        reviewedBy: data.reviewedBy,
        reviewDate: data.reviewDate ? new Date(data.reviewDate) : null,
        nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : null,
        notes: data.notes,
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: customerReq });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create customer req error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create customer requirement' } });
  }
});

// PUT /:id - Update customer requirement
router.put('/:id', checkOwnership(prisma.customerReq), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.customerReq.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Customer requirement not found' } });
    }

    const data = updateSchema.parse(req.body);
    const updateData: Record<string, unknown> = { ...data };
    if (data.reviewDate) updateData.reviewDate = new Date(data.reviewDate);
    if (data.nextReviewDate) updateData.nextReviewDate = new Date(data.nextReviewDate);

    const customerReq = await prisma.customerReq.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: customerReq });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update customer req error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update customer requirement' } });
  }
});

// DELETE /:id - Soft delete customer requirement
router.delete('/:id', checkOwnership(prisma.customerReq), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.customerReq.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Customer requirement not found' } });
    }

    await prisma.customerReq.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete customer req error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete customer requirement' } });
  }
});

export default router;
