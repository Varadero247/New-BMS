import { Router, Response } from 'express';
import { prisma} from '../prisma';
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
  const count = await prisma.qualImprovement.count({
    where: { referenceNumber: { startsWith: `QMS-CI-${year}` } },
  });
  return `QMS-CI-${year}-${String(count + 1).padStart(3, '0')}`;
}

// Impact level to numeric value for priority score calc
const IMPACT_VALUES: Record<string, number> = {
  NONE: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

// Calculate priority score from impact levels
function calculatePriorityScore(
  qualityImpact: string,
  customerImpact: string,
  processImpact: string
): number {
  return (
    (IMPACT_VALUES[qualityImpact] ?? 0) +
    (IMPACT_VALUES[customerImpact] ?? 0) +
    (IMPACT_VALUES[processImpact] ?? 0)
  );
}

// ============================================
// IMPROVEMENT CRUD
// ============================================

// GET / — List improvements (paginated)
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', category, status, pdcaStage, source, search } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };
    if (category) where.category = category;
    if (status) where.status = status;
    if (pdcaStage) where.pdcaStage = pdcaStage;
    if (source) where.source = source;
    if (search) where.title = { contains: search as string, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      prisma.qualImprovement.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.qualImprovement.count({ where }),
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
    logger.error('List improvements error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list improvements' },
    });
  }
});

// GET /:id — Get single improvement
router.get(
  '/:id',
  checkOwnership(prisma.qualImprovement),
  async (req: AuthRequest, res: Response) => {
    try {
      const improvement = await prisma.qualImprovement.findUnique({
        where: { id: req.params.id },
      });

      if (!improvement) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Improvement not found' } });
      }

      res.json({ success: true, data: improvement });
    } catch (error) {
      logger.error('Get improvement error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get improvement' },
      });
    }
  }
);

// POST / — Create improvement
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      category: z.enum([
        'PROCESS_IMPROVEMENT',
        'PRODUCT_ENHANCEMENT',
        'CUSTOMER_EXPERIENCE',
        'COST_REDUCTION',
        'EFFICIENCY',
        'QUALITY_IMPROVEMENT',
        'SAFETY',
        'ENVIRONMENTAL',
        'DIGITAL_TRANSFORMATION',
        'INNOVATION',
        'OTHER',
      ]),
      source: z.enum([
        'EMPLOYEE_SUGGESTION',
        'CUSTOMER_FEEDBACK',
        'AUDIT',
        'MANAGEMENT_REVIEW',
        'BENCHMARKING',
        'NEAR_MISS',
        'DATA_ANALYSIS',
        'EXTERNAL_RESEARCH',
        'OTHER',
      ]),
      submittedBy: z.string().trim().min(1).max(200),
      department: z.string().trim().optional(),
      dateSubmitted: z.string().trim().optional(),
      description: z.string().trim().min(1).max(2000),
      currentState: z.string().trim().optional(),
      proposedSolution: z.string().trim().min(1).max(200),
      expectedBenefits: z.string().trim().min(1).max(200),
      estimatedCost: z.number().nonnegative().optional(),
      estimatedTime: z.string().trim().optional(),
      estimatedSaving: z.number().optional(),
      qualityImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      customerImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      processImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      environmentalImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      status: z
        .enum([
          'IDEA_SUBMITTED',
          'UNDER_EVALUATION',
          'APPROVED',
          'REJECTED',
          'IN_PROGRESS',
          'IMPLEMENTED',
          'BENEFITS_REALISED',
        ])
        .optional(),
      evaluationNotes: z.string().trim().optional(),
      approvedBy: z.string().trim().optional(),
      approvalDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      pdcaStage: z.enum(['PLAN', 'DO', 'CHECK', 'ACT']).optional(),
      linkedActions: z.string().trim().optional(),
      pilotRequired: z.boolean().optional(),
      pilotResults: z.string().trim().optional(),
      implementationDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      implementedBy: z.string().trim().optional(),
      kpiToMeasure: z.string().trim().optional(),
      baselineMetric: z.string().trim().optional(),
      targetMetric: z.string().trim().optional(),
      actualCost: z.number().nonnegative().optional(),
      actualSaving: z.number().optional(),
      qualityImprovement: z.string().trim().optional(),
      lessonsLearned: z.string().trim().optional(),
      shareAcrossIms: z.boolean().optional(),
      aiAnalysis: z.string().trim().optional(),
      aiFeasibility: z.string().trim().optional(),
      aiImplementationPlan: z.string().trim().optional(),
      aiKpiSuggestions: z.string().trim().optional(),
      aiGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateRefNumber();

    // Auto-calculate priority score
    const qi = data.qualityImpact || 'NONE';
    const ci = data.customerImpact || 'NONE';
    const pi = data.processImpact || 'NONE';
    const priorityScore = calculatePriorityScore(qi, ci, pi);

    const improvement = await prisma.qualImprovement.create({
      data: {
        referenceNumber,
        title: data.title,
        category: data.category,
        source: data.source,
        submittedBy: data.submittedBy,
        department: data.department,
        dateSubmitted: data.dateSubmitted ? new Date(data.dateSubmitted) : new Date(),
        description: data.description,
        currentState: data.currentState,
        proposedSolution: data.proposedSolution,
        expectedBenefits: data.expectedBenefits,
        estimatedCost: data.estimatedCost,
        estimatedTime: data.estimatedTime,
        estimatedSaving: data.estimatedSaving,
        qualityImpact: data.qualityImpact || 'NONE',
        customerImpact: data.customerImpact || 'NONE',
        processImpact: data.processImpact || 'NONE',
        environmentalImpact: data.environmentalImpact || 'NONE',
        priorityScore,
        status: (data.status as any) || 'IDEA_SUBMITTED',
        evaluationNotes: data.evaluationNotes,
        approvedBy: data.approvedBy,
        approvalDate: data.approvalDate ? new Date(data.approvalDate) : undefined,
        pdcaStage: data.pdcaStage || 'PLAN',
        linkedActions: data.linkedActions,
        pilotRequired: data.pilotRequired,
        pilotResults: data.pilotResults,
        implementationDate: data.implementationDate ? new Date(data.implementationDate) : undefined,
        implementedBy: data.implementedBy,
        kpiToMeasure: data.kpiToMeasure,
        baselineMetric: data.baselineMetric,
        targetMetric: data.targetMetric,
        actualCost: data.actualCost,
        actualSaving: data.actualSaving,
        qualityImprovement: data.qualityImprovement,
        lessonsLearned: data.lessonsLearned,
        shareAcrossIms: data.shareAcrossIms,
        aiAnalysis: data.aiAnalysis,
        aiFeasibility: data.aiFeasibility,
        aiImplementationPlan: data.aiImplementationPlan,
        aiKpiSuggestions: data.aiKpiSuggestions,
        aiGenerated: data.aiGenerated,
      },
    });

    res.status(201).json({ success: true, data: improvement });
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
    logger.error('Create improvement error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create improvement' },
    });
  }
});

// PUT /:id — Update improvement
router.put(
  '/:id',
  checkOwnership(prisma.qualImprovement),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.qualImprovement.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Improvement not found' } });
      }

      const schema = z.object({
        title: z.string().trim().min(1).max(200).optional(),
        category: z
          .enum([
            'PROCESS_IMPROVEMENT',
            'PRODUCT_ENHANCEMENT',
            'CUSTOMER_EXPERIENCE',
            'COST_REDUCTION',
            'EFFICIENCY',
            'QUALITY_IMPROVEMENT',
            'SAFETY',
            'ENVIRONMENTAL',
            'DIGITAL_TRANSFORMATION',
            'INNOVATION',
            'OTHER',
          ])
          .optional(),
        source: z
          .enum([
            'EMPLOYEE_SUGGESTION',
            'CUSTOMER_FEEDBACK',
            'AUDIT',
            'MANAGEMENT_REVIEW',
            'BENCHMARKING',
            'NEAR_MISS',
            'DATA_ANALYSIS',
            'EXTERNAL_RESEARCH',
            'OTHER',
          ])
          .optional(),
        submittedBy: z.string().trim().optional(),
        department: z.string().trim().optional(),
        description: z.string().trim().optional(),
        currentState: z.string().trim().optional(),
        proposedSolution: z.string().trim().optional(),
        expectedBenefits: z.string().trim().optional(),
        estimatedCost: z.number().nonnegative().optional(),
        estimatedTime: z.string().trim().optional(),
        estimatedSaving: z.number().optional(),
        qualityImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
        customerImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
        processImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
        environmentalImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
        status: z
          .enum([
            'IDEA_SUBMITTED',
            'UNDER_EVALUATION',
            'APPROVED',
            'REJECTED',
            'IN_PROGRESS',
            'IMPLEMENTED',
            'BENEFITS_REALISED',
          ])
          .optional(),
        evaluationNotes: z.string().trim().optional(),
        approvedBy: z.string().trim().optional(),
        approvalDate: z
          .string()
          .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
          .optional(),
        pdcaStage: z.enum(['PLAN', 'DO', 'CHECK', 'ACT']).optional(),
        linkedActions: z.string().trim().optional(),
        pilotRequired: z.boolean().optional(),
        pilotResults: z.string().trim().optional(),
        implementationDate: z
          .string()
          .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
          .optional(),
        implementedBy: z.string().trim().optional(),
        kpiToMeasure: z.string().trim().optional(),
        baselineMetric: z.string().trim().optional(),
        targetMetric: z.string().trim().optional(),
        actualCost: z.number().nonnegative().optional(),
        actualSaving: z.number().optional(),
        qualityImprovement: z.string().trim().optional(),
        lessonsLearned: z.string().trim().optional(),
        shareAcrossIms: z.boolean().optional(),
        aiAnalysis: z.string().trim().optional(),
        aiFeasibility: z.string().trim().optional(),
        aiImplementationPlan: z.string().trim().optional(),
        aiKpiSuggestions: z.string().trim().optional(),
        aiGenerated: z.boolean().optional(),
      });

      const data = schema.parse(req.body);

      // Recalculate priority score if any impact changed
      const qi = data.qualityImpact ?? existing.qualityImpact;
      const ci = data.customerImpact ?? existing.customerImpact;
      const pi = data.processImpact ?? existing.processImpact;
      const priorityScore = calculatePriorityScore(qi, ci, pi);

      const improvement = await prisma.qualImprovement.update({
        where: { id: req.params.id },
        data: {
          ...data,
          priorityScore,
          approvalDate: data.approvalDate ? new Date(data.approvalDate) : undefined,
          implementationDate: data.implementationDate
            ? new Date(data.implementationDate)
            : undefined,
        },
      });

      res.json({ success: true, data: improvement });
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
      logger.error('Update improvement error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update improvement' },
      });
    }
  }
);

// DELETE /:id — Delete improvement
router.delete(
  '/:id',
  checkOwnership(prisma.qualImprovement),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.qualImprovement.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Improvement not found' } });
      }

      await prisma.qualImprovement.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date() },
      });

      res.status(204).send();
    } catch (error) {
      logger.error('Delete improvement error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete improvement' },
      });
    }
  }
);

export default router;
