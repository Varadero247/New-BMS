import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

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
function calculatePriorityScore(qualityImpact: string, customerImpact: string, processImpact: string): number {
  return (IMPACT_VALUES[qualityImpact] ?? 0) + (IMPACT_VALUES[customerImpact] ?? 0) + (IMPACT_VALUES[processImpact] ?? 0);
}

// ============================================
// IMPROVEMENT CRUD
// ============================================

// GET / — List improvements (paginated)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', category, status, pdcaStage, source, search } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
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
    console.error('List improvements error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list improvements' } });
  }
});

// GET /:id — Get single improvement
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const improvement = await prisma.qualImprovement.findUnique({
      where: { id: req.params.id },
    });

    if (!improvement) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Improvement not found' } });
    }

    res.json({ success: true, data: improvement });
  } catch (error) {
    console.error('Get improvement error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get improvement' } });
  }
});

// POST / — Create improvement
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      category: z.enum([
        'PROCESS_IMPROVEMENT', 'PRODUCT_ENHANCEMENT', 'CUSTOMER_EXPERIENCE',
        'COST_REDUCTION', 'EFFICIENCY', 'QUALITY_IMPROVEMENT', 'SAFETY',
        'ENVIRONMENTAL', 'DIGITAL_TRANSFORMATION', 'INNOVATION', 'OTHER',
      ]),
      source: z.enum([
        'EMPLOYEE_SUGGESTION', 'CUSTOMER_FEEDBACK', 'AUDIT', 'MANAGEMENT_REVIEW',
        'BENCHMARKING', 'NEAR_MISS', 'DATA_ANALYSIS', 'EXTERNAL_RESEARCH', 'OTHER',
      ]),
      submittedBy: z.string().min(1),
      department: z.string().optional(),
      dateSubmitted: z.string().optional(),
      description: z.string().min(1),
      currentState: z.string().optional(),
      proposedSolution: z.string().min(1),
      expectedBenefits: z.string().min(1),
      estimatedCost: z.number().optional(),
      estimatedTime: z.string().optional(),
      estimatedSaving: z.number().optional(),
      qualityImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      customerImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      processImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      environmentalImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      status: z.enum([
        'IDEA_SUBMITTED', 'UNDER_EVALUATION', 'APPROVED', 'REJECTED',
        'IN_PROGRESS', 'IMPLEMENTED', 'BENEFITS_REALISED',
      ]).optional(),
      evaluationNotes: z.string().optional(),
      approvedBy: z.string().optional(),
      approvalDate: z.string().optional(),
      pdcaStage: z.enum(['PLAN', 'DO', 'CHECK', 'ACT']).optional(),
      linkedActions: z.string().optional(),
      pilotRequired: z.boolean().optional(),
      pilotResults: z.string().optional(),
      implementationDate: z.string().optional(),
      implementedBy: z.string().optional(),
      kpiToMeasure: z.string().optional(),
      baselineMetric: z.string().optional(),
      targetMetric: z.string().optional(),
      actualCost: z.number().optional(),
      actualSaving: z.number().optional(),
      qualityImprovement: z.string().optional(),
      lessonsLearned: z.string().optional(),
      shareAcrossIms: z.boolean().optional(),
      aiAnalysis: z.string().optional(),
      aiFeasibility: z.string().optional(),
      aiImplementationPlan: z.string().optional(),
      aiKpiSuggestions: z.string().optional(),
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
        status: data.status || 'IDEA_SUBMITTED',
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
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create improvement error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create improvement' } });
  }
});

// PUT /:id — Update improvement
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualImprovement.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Improvement not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      category: z.enum([
        'PROCESS_IMPROVEMENT', 'PRODUCT_ENHANCEMENT', 'CUSTOMER_EXPERIENCE',
        'COST_REDUCTION', 'EFFICIENCY', 'QUALITY_IMPROVEMENT', 'SAFETY',
        'ENVIRONMENTAL', 'DIGITAL_TRANSFORMATION', 'INNOVATION', 'OTHER',
      ]).optional(),
      source: z.enum([
        'EMPLOYEE_SUGGESTION', 'CUSTOMER_FEEDBACK', 'AUDIT', 'MANAGEMENT_REVIEW',
        'BENCHMARKING', 'NEAR_MISS', 'DATA_ANALYSIS', 'EXTERNAL_RESEARCH', 'OTHER',
      ]).optional(),
      submittedBy: z.string().optional(),
      department: z.string().optional(),
      description: z.string().optional(),
      currentState: z.string().optional(),
      proposedSolution: z.string().optional(),
      expectedBenefits: z.string().optional(),
      estimatedCost: z.number().optional(),
      estimatedTime: z.string().optional(),
      estimatedSaving: z.number().optional(),
      qualityImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      customerImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      processImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      environmentalImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      status: z.enum([
        'IDEA_SUBMITTED', 'UNDER_EVALUATION', 'APPROVED', 'REJECTED',
        'IN_PROGRESS', 'IMPLEMENTED', 'BENEFITS_REALISED',
      ]).optional(),
      evaluationNotes: z.string().optional(),
      approvedBy: z.string().optional(),
      approvalDate: z.string().optional(),
      pdcaStage: z.enum(['PLAN', 'DO', 'CHECK', 'ACT']).optional(),
      linkedActions: z.string().optional(),
      pilotRequired: z.boolean().optional(),
      pilotResults: z.string().optional(),
      implementationDate: z.string().optional(),
      implementedBy: z.string().optional(),
      kpiToMeasure: z.string().optional(),
      baselineMetric: z.string().optional(),
      targetMetric: z.string().optional(),
      actualCost: z.number().optional(),
      actualSaving: z.number().optional(),
      qualityImprovement: z.string().optional(),
      lessonsLearned: z.string().optional(),
      shareAcrossIms: z.boolean().optional(),
      aiAnalysis: z.string().optional(),
      aiFeasibility: z.string().optional(),
      aiImplementationPlan: z.string().optional(),
      aiKpiSuggestions: z.string().optional(),
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
        implementationDate: data.implementationDate ? new Date(data.implementationDate) : undefined,
      },
    });

    res.json({ success: true, data: improvement });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update improvement error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update improvement' } });
  }
});

// DELETE /:id — Delete improvement
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualImprovement.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Improvement not found' } });
    }

    await prisma.qualImprovement.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Improvement deleted successfully' } });
  } catch (error) {
    console.error('Delete improvement error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete improvement' } });
  }
});

export default router;
