import { Router, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-quality');

const router: Router = Router();

router.use(authenticate);
router.param('id', validateIdParam());

// Generate reference number
async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'QMS-NC';
  const count = await prisma.qualNonConformance.count({
    where: { referenceNumber: { startsWith: `${prefix}-${year}` } },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
}

// GET / - List non-conformances
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', ncType, status, severity, search } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (ncType) where.ncType = ncType as any;
    if (status) where.status = status as any;
    if (severity) where.severity = severity as any;
    if (search) {
      where.title = { contains: search as string, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      prisma.qualNonConformance.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.qualNonConformance.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        items,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('List non-conformances error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list non-conformances' } });
  }
});

// GET /stats - Non-conformance statistics
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const [byStatus, bySeverity, total] = await Promise.all([
      prisma.qualNonConformance.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.qualNonConformance.groupBy({
        by: ['severity'],
        _count: { id: true },
      }),
      prisma.qualNonConformance.count(),
    ]);

    res.json({
      success: true,
      data: {
        total,
        byStatus: byStatus.reduce((acc: Record<string, unknown>, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {}),
        bySeverity: bySeverity.reduce((acc: Record<string, unknown>, item) => {
          acc[item.severity] = item._count.id;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    logger.error('NC stats error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get non-conformance statistics' } });
  }
});

// GET /:id - Get single non-conformance
router.get('/:id', checkOwnership(prisma.qualNonConformance), async (req: AuthRequest, res: Response) => {
  try {
    const nc = await prisma.qualNonConformance.findUnique({
      where: { id: req.params.id },
    });

    if (!nc) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Non-conformance not found' } });
    }

    res.json({ success: true, data: nc });
  } catch (error) {
    logger.error('Get NC error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get non-conformance' } });
  }
});

// POST / - Create non-conformance
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      ncType: z.enum(['INTERNAL', 'CUSTOMER_COMPLAINT', 'SUPPLIER', 'REGULATORY', 'AUDIT_FINDING', 'PROCESS_FAILURE', 'PRODUCT_DEFECT', 'SERVICE_FAILURE']),
      source: z.enum(['INTERNAL_AUDIT', 'CUSTOMER_FEEDBACK', 'SUPPLIER_AUDIT', 'PROCESS_MONITORING', 'MANAGEMENT_REVIEW', 'THIRD_PARTY_AUDIT', 'INSPECTION', 'OBSERVATION']),
      severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL']).default('MINOR'),
      isoClause: z.string().optional(),
      dateReported: z.string().optional(),
      reportedBy: z.string().trim().min(1).max(200),
      department: z.string().trim().min(1).max(200),
      title: z.string().trim().min(1).max(200),
      description: z.string().trim().min(1).max(2000),
      evidenceRef: z.string().optional(),
      whereDetected: z.string().optional(),
      quantityAffected: z.number().optional(),
      quantityUnit: z.string().optional(),
      customerImpact: z.boolean().default(false),
      customerImpactDesc: z.string().optional(),
      containmentRequired: z.boolean().default(false),
      containmentActions: z.string().optional(),
      productsQuarantined: z.boolean().default(false),
      customersNotified: z.boolean().default(false),
      containmentEffectiveBy: z.string().optional(),
      containmentDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      rcaMethod: z.enum(['FIVE_WHY', 'FISHBONE', 'IS_IS_NOT', 'EIGHT_D', 'FAULT_TREE', 'OTHER']).optional(),
      why1: z.string().optional(),
      why2: z.string().optional(),
      why3: z.string().optional(),
      why4: z.string().optional(),
      why5: z.string().optional(),
      rootCause: z.string().optional(),
      rootCauseCategory: z.enum(['HUMAN_ERROR', 'PROCESS_FAILURE', 'EQUIPMENT', 'MATERIAL', 'MEASUREMENT', 'ENVIRONMENT', 'MANAGEMENT_SYSTEM', 'SUPPLIER']).optional(),
      capaRequired: z.boolean().default(false),
      capaReference: z.string().optional(),
      correctiveActions: z.string().optional(),
      preventiveActions: z.string().optional(),
      recurrencePrevention: z.string().optional(),
      linkedProcess: z.string().optional(),
      linkedFmea: z.string().optional(),
      linkedHsIncident: z.string().optional(),
      linkedEnvEvent: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateRefNumber();

    const nc = await prisma.qualNonConformance.create({
      data: {
        ...data,
        referenceNumber,
        dateReported: data.dateReported ? new Date(data.dateReported) : new Date(),
        containmentDate: data.containmentDate ? new Date(data.containmentDate) : undefined,
        status: 'REPORTED',
      },
    });

    res.status(201).json({ success: true, data: nc });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create NC error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create non-conformance' } });
  }
});

// PUT /:id - Update non-conformance
router.put('/:id', checkOwnership(prisma.qualNonConformance), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualNonConformance.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Non-conformance not found' } });
    }

    const schema = z.object({
      ncType: z.enum(['INTERNAL', 'CUSTOMER_COMPLAINT', 'SUPPLIER', 'REGULATORY', 'AUDIT_FINDING', 'PROCESS_FAILURE', 'PRODUCT_DEFECT', 'SERVICE_FAILURE']).optional(),
      source: z.enum(['INTERNAL_AUDIT', 'CUSTOMER_FEEDBACK', 'SUPPLIER_AUDIT', 'PROCESS_MONITORING', 'MANAGEMENT_REVIEW', 'THIRD_PARTY_AUDIT', 'INSPECTION', 'OBSERVATION']).optional(),
      severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL']).optional(),
      isoClause: z.string().nullable().optional(),
      reportedBy: z.string().optional(),
      department: z.string().optional(),
      title: z.string().trim().min(1).max(200).optional(),
      description: z.string().optional(),
      evidenceRef: z.string().nullable().optional(),
      whereDetected: z.string().nullable().optional(),
      quantityAffected: z.number().nullable().optional(),
      quantityUnit: z.string().nullable().optional(),
      customerImpact: z.boolean().optional(),
      customerImpactDesc: z.string().nullable().optional(),
      containmentRequired: z.boolean().optional(),
      containmentActions: z.string().nullable().optional(),
      productsQuarantined: z.boolean().optional(),
      customersNotified: z.boolean().optional(),
      containmentEffectiveBy: z.string().nullable().optional(),
      containmentDate: z.string().nullable().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      rcaMethod: z.enum(['FIVE_WHY', 'FISHBONE', 'IS_IS_NOT', 'EIGHT_D', 'FAULT_TREE', 'OTHER']).nullable().optional(),
      why1: z.string().nullable().optional(),
      why2: z.string().nullable().optional(),
      why3: z.string().nullable().optional(),
      why4: z.string().nullable().optional(),
      why5: z.string().nullable().optional(),
      rootCause: z.string().nullable().optional(),
      rootCauseCategory: z.enum(['HUMAN_ERROR', 'PROCESS_FAILURE', 'EQUIPMENT', 'MATERIAL', 'MEASUREMENT', 'ENVIRONMENT', 'MANAGEMENT_SYSTEM', 'SUPPLIER']).nullable().optional(),
      capaRequired: z.boolean().optional(),
      capaReference: z.string().nullable().optional(),
      correctiveActions: z.string().nullable().optional(),
      preventiveActions: z.string().nullable().optional(),
      recurrencePrevention: z.string().nullable().optional(),
      status: z.enum(['REPORTED', 'UNDER_REVIEW', 'CONTAINED', 'ROOT_CAUSE', 'CAPA_RAISED', 'VERIFICATION', 'CLOSED']).optional(),
      closedBy: z.string().nullable().optional(),
      closureDate: z.string().nullable().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      effectivenessVerified: z.enum(['YES', 'NO', 'PENDING']).optional(),
      lessonsLearned: z.string().nullable().optional(),
      linkedProcess: z.string().nullable().optional(),
      linkedFmea: z.string().nullable().optional(),
      linkedHsIncident: z.string().nullable().optional(),
      linkedEnvEvent: z.string().nullable().optional(),
      // AI fields
      aiAnalysis: z.string().nullable().optional(),
      aiRootCauseSuggestions: z.string().nullable().optional(),
      aiContainmentAdequacy: z.string().nullable().optional(),
      aiCapaRecommendations: z.string().nullable().optional(),
      aiIsoClause: z.string().nullable().optional(),
      aiGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    // Auto-set closure fields when status changes to CLOSED
    const updateData = {
      ...data,
      containmentDate: data.containmentDate ? new Date(data.containmentDate) : data.containmentDate === null ? null : undefined,
      closureDate: data.closureDate
        ? new Date(data.closureDate)
        : data.status === 'CLOSED' && !existing.closureDate
          ? new Date()
          : undefined,
    };

    const nc = await prisma.qualNonConformance.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: nc });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update NC error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update non-conformance' } });
  }
});

// DELETE /:id - Delete non-conformance
router.delete('/:id', checkOwnership(prisma.qualNonConformance), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualNonConformance.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Non-conformance not found' } });
    }

    await prisma.qualNonConformance.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete NC error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete non-conformance' } });
  }
});

export default router;
