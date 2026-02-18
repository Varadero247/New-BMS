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
  const prefix = 'QMS-OPP';
  const count = await prisma.qualOpportunity.count({
    where: { referenceNumber: { startsWith: `${prefix}-${year}` } },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
}

// Calculate priority level from opportunity score
function calculatePriorityLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score <= 6) return 'LOW';
  if (score <= 14) return 'MEDIUM';
  if (score <= 24) return 'HIGH';
  return 'CRITICAL';
}

// Calculate derived opportunity fields
function calculateOpportunityFields(data: {
  likelihood: number;
  newBusiness: number;
  expansionOfCurrent: number;
  satisfyingRegs: number;
  internalQmsImprovement: number;
  reputationImprovement: number;
}) {
  const probabilityRating = data.likelihood;
  const benefitRating = Math.max(
    data.newBusiness,
    data.expansionOfCurrent,
    data.satisfyingRegs,
    data.internalQmsImprovement,
    data.reputationImprovement,
  );
  const opportunityScore = probabilityRating * benefitRating;
  const priorityLevel = calculatePriorityLevel(opportunityScore);

  return { probabilityRating, benefitRating, opportunityScore, priorityLevel };
}

// GET / - List opportunities
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', priorityLevel, status, process, search } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (priorityLevel) where.priorityLevel = priorityLevel as any;
    if (status) where.status = status as any;
    if (process) where.process = process as any;
    if (search) {
      where.opportunityDescription = { contains: search as string, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      prisma.qualOpportunity.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { opportunityScore: 'desc' },
      }),
      prisma.qualOpportunity.count({ where }),
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
    logger.error('List opportunities error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list opportunities' } });
  }
});

// GET /:id - Get single opportunity
router.get('/:id', checkOwnership(prisma.qualOpportunity), async (req: AuthRequest, res: Response) => {
  try {
    const opportunity = await prisma.qualOpportunity.findUnique({
      where: { id: req.params.id },
    });

    if (!opportunity) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Opportunity not found' } });
    }

    res.json({ success: true, data: opportunity });
  } catch (error) {
    logger.error('Get opportunity error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get opportunity' } });
  }
});

// POST / - Create opportunity
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      process: z.enum(['STRATEGIC', 'FINANCE', 'HR', 'OPERATIONS', 'MARKETING_SALES', 'IT', 'COMPLIANCE_LEGAL', 'ALL_PROCESSES']),
      interestedParties: z.string().optional(),
      opportunityDescription: z.string().trim().min(1).max(2000),
      reportedBy: z.string().optional(),
      likelihood: z.number().int().min(1).max(6).default(1),
      previousOccurrences: z.string().optional(),
      newBusiness: z.number().int().min(0).max(4).default(0),
      expansionOfCurrent: z.number().int().min(0).max(4).default(0),
      satisfyingRegs: z.number().int().min(0).max(4).default(0),
      internalQmsImprovement: z.number().int().min(0).max(4).default(0),
      reputationImprovement: z.number().int().min(0).max(4).default(0),
      costOfImplementation: z.number().int().min(0).default(0),
      actionToExploit: z.string().optional(),
      responsiblePerson: z.string().optional(),
      targetDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      status: z.enum(['IDENTIFIED', 'BEING_EXPLOITED', 'ACHIEVED', 'MISSED', 'DEFERRED']).default('IDENTIFIED'),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateRefNumber();
    const calculated = calculateOpportunityFields(data);

    const opportunity = await prisma.qualOpportunity.create({
      data: {
        referenceNumber,
        process: data.process,
        interestedParties: data.interestedParties,
        opportunityDescription: data.opportunityDescription,
        reportedBy: data.reportedBy,
        likelihood: data.likelihood,
        previousOccurrences: data.previousOccurrences,
        newBusiness: data.newBusiness,
        expansionOfCurrent: data.expansionOfCurrent,
        satisfyingRegs: data.satisfyingRegs,
        internalQmsImprovement: data.internalQmsImprovement,
        reputationImprovement: data.reputationImprovement,
        costOfImplementation: data.costOfImplementation,
        probabilityRating: calculated.probabilityRating,
        benefitRating: calculated.benefitRating,
        opportunityScore: calculated.opportunityScore,
        priorityLevel: calculated.priorityLevel,
        actionToExploit: data.actionToExploit,
        responsiblePerson: data.responsiblePerson,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
        status: data.status,
      },
    });

    res.status(201).json({ success: true, data: opportunity });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create opportunity error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create opportunity' } });
  }
});

// PUT /:id - Update opportunity
router.put('/:id', checkOwnership(prisma.qualOpportunity), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualOpportunity.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Opportunity not found' } });
    }

    const schema = z.object({
      process: z.enum(['STRATEGIC', 'FINANCE', 'HR', 'OPERATIONS', 'MARKETING_SALES', 'IT', 'COMPLIANCE_LEGAL', 'ALL_PROCESSES']).optional(),
      interestedParties: z.string().nullable().optional(),
      opportunityDescription: z.string().trim().min(1).max(2000).optional(),
      reportedBy: z.string().nullable().optional(),
      likelihood: z.number().int().min(1).max(6).optional(),
      previousOccurrences: z.string().nullable().optional(),
      newBusiness: z.number().int().min(0).max(4).optional(),
      expansionOfCurrent: z.number().int().min(0).max(4).optional(),
      satisfyingRegs: z.number().int().min(0).max(4).optional(),
      internalQmsImprovement: z.number().int().min(0).max(4).optional(),
      reputationImprovement: z.number().int().min(0).max(4).optional(),
      costOfImplementation: z.number().int().min(0).optional(),
      actionToExploit: z.string().nullable().optional(),
      responsiblePerson: z.string().nullable().optional(),
      targetDate: z.string().nullable().refine(s => s === null || !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      status: z.enum(['IDENTIFIED', 'BEING_EXPLOITED', 'ACHIEVED', 'MISSED', 'DEFERRED']).optional(),
    });

    const data = schema.parse(req.body);

    // Recalculate opportunity fields using merged values
    const mergedForCalc = {
      likelihood: data.likelihood ?? existing.likelihood,
      newBusiness: data.newBusiness ?? existing.newBusiness,
      expansionOfCurrent: data.expansionOfCurrent ?? existing.expansionOfCurrent,
      satisfyingRegs: data.satisfyingRegs ?? existing.satisfyingRegs,
      internalQmsImprovement: data.internalQmsImprovement ?? existing.internalQmsImprovement,
      reputationImprovement: data.reputationImprovement ?? existing.reputationImprovement,
    };
    const calculated = calculateOpportunityFields(mergedForCalc);

    const opportunity = await prisma.qualOpportunity.update({
      where: { id: req.params.id },
      data: {
        ...data,
        probabilityRating: calculated.probabilityRating,
        benefitRating: calculated.benefitRating,
        opportunityScore: calculated.opportunityScore,
        priorityLevel: calculated.priorityLevel,
        targetDate: data.targetDate === null ? null : data.targetDate ? new Date(data.targetDate) : undefined,
      },
    });

    res.json({ success: true, data: opportunity });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update opportunity error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update opportunity' } });
  }
});

// DELETE /:id - Delete opportunity
router.delete('/:id', checkOwnership(prisma.qualOpportunity), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualOpportunity.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Opportunity not found' } });
    }

    await prisma.qualOpportunity.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete opportunity error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete opportunity' } });
  }
});

export default router;
