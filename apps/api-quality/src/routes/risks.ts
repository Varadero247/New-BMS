import { Router, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-quality');

const router = Router();

router.use(authenticate);
router.param('id', validateIdParam());

// Generate reference number
async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'QMS-RSK';
  const count = await prisma.qualRisk.count({
    where: { referenceNumber: { startsWith: `${prefix}-${year}` } },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
}

// Calculate risk level from risk factor
function calculateRiskLevel(riskFactor: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (riskFactor <= 6) return 'LOW';
  if (riskFactor <= 14) return 'MEDIUM';
  if (riskFactor <= 24) return 'HIGH';
  return 'CRITICAL';
}

// Calculate derived risk fields
function calculateRiskFields(data: {
  likelihood: number;
  lossOfContracts: number;
  harmToUser: number;
  unableToMeetTerms: number;
  violationOfRegulations: number;
  reputationImpact: number;
  costOfCorrection: number;
}) {
  const probabilityRating = data.likelihood;
  const consequenceRating = Math.max(
    data.lossOfContracts,
    data.harmToUser,
    data.unableToMeetTerms,
    data.violationOfRegulations,
    data.reputationImpact,
    data.costOfCorrection,
  );
  const riskFactor = probabilityRating * consequenceRating;
  const riskLevel = calculateRiskLevel(riskFactor);

  return { probabilityRating, consequenceRating, riskFactor, riskLevel };
}

// GET / - List risks
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', riskLevel, status, process, search } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.QualRiskWhereInput = { deletedAt: null };
    if (riskLevel) where.riskLevel = riskLevel;
    if (status) where.status = status;
    if (process) where.process = process;
    if (search) {
      where.riskDescription = { contains: search as string, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      prisma.qualRisk.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { riskFactor: 'desc' },
      }),
      prisma.qualRisk.count({ where }),
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
    logger.error('List risks error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list risks' } });
  }
});

// GET /:id - Get single risk
router.get('/:id', checkOwnership(prisma.qualRisk), async (req: AuthRequest, res: Response) => {
  try {
    const risk = await prisma.qualRisk.findUnique({
      where: { id: req.params.id },
    });

    if (!risk) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Risk not found' } });
    }

    res.json({ success: true, data: risk });
  } catch (error) {
    logger.error('Get risk error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get risk' } });
  }
});

// POST / - Create risk
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      process: z.enum(['STRATEGIC', 'FINANCE', 'HR', 'OPERATIONS', 'MARKETING_SALES', 'IT', 'COMPLIANCE_LEGAL', 'ALL_PROCESSES']),
      riskDescription: z.string().min(1),
      reportedBy: z.string().optional(),
      likelihood: z.number().int().min(1).max(6).default(1),
      previousOccurrences: z.string().optional(),
      lossOfContracts: z.number().int().min(0).max(5).default(0),
      harmToUser: z.number().int().min(0).max(5).default(0),
      unableToMeetTerms: z.number().int().min(0).max(5).default(0),
      violationOfRegulations: z.number().int().min(0).max(5).default(0),
      reputationImpact: z.number().int().min(0).max(5).default(0),
      costOfCorrection: z.number().int().min(0).max(5).default(0),
      treatmentOption: z.enum(['ACCEPT', 'REDUCE', 'TRANSFER', 'AVOID', 'CONTINGENCY']).default('ACCEPT'),
      treatmentActions: z.string().optional(),
      responsiblePerson: z.string().optional(),
      dueDate: z.string().optional(),
      reviewDate: z.string().optional(),
      status: z.enum(['OPEN', 'BEING_TREATED', 'MONITORED', 'CLOSED', 'ACCEPTED']).default('OPEN'),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateRefNumber();
    const calculated = calculateRiskFields(data);

    const risk = await prisma.qualRisk.create({
      data: {
        referenceNumber,
        process: data.process,
        riskDescription: data.riskDescription,
        reportedBy: data.reportedBy,
        likelihood: data.likelihood,
        previousOccurrences: data.previousOccurrences,
        lossOfContracts: data.lossOfContracts,
        harmToUser: data.harmToUser,
        unableToMeetTerms: data.unableToMeetTerms,
        violationOfRegulations: data.violationOfRegulations,
        reputationImpact: data.reputationImpact,
        costOfCorrection: data.costOfCorrection,
        probabilityRating: calculated.probabilityRating,
        consequenceRating: calculated.consequenceRating,
        riskFactor: calculated.riskFactor,
        riskLevel: calculated.riskLevel,
        treatmentOption: data.treatmentOption,
        treatmentActions: data.treatmentActions,
        responsiblePerson: data.responsiblePerson,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        reviewDate: data.reviewDate ? new Date(data.reviewDate) : undefined,
        status: data.status,
      },
    });

    res.status(201).json({ success: true, data: risk });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create risk error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create risk' } });
  }
});

// PUT /:id - Update risk
router.put('/:id', checkOwnership(prisma.qualRisk), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualRisk.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Risk not found' } });
    }

    const schema = z.object({
      process: z.enum(['STRATEGIC', 'FINANCE', 'HR', 'OPERATIONS', 'MARKETING_SALES', 'IT', 'COMPLIANCE_LEGAL', 'ALL_PROCESSES']).optional(),
      riskDescription: z.string().min(1).optional(),
      reportedBy: z.string().nullable().optional(),
      likelihood: z.number().int().min(1).max(6).optional(),
      previousOccurrences: z.string().nullable().optional(),
      lossOfContracts: z.number().int().min(0).max(5).optional(),
      harmToUser: z.number().int().min(0).max(5).optional(),
      unableToMeetTerms: z.number().int().min(0).max(5).optional(),
      violationOfRegulations: z.number().int().min(0).max(5).optional(),
      reputationImpact: z.number().int().min(0).max(5).optional(),
      costOfCorrection: z.number().int().min(0).max(5).optional(),
      treatmentOption: z.enum(['ACCEPT', 'REDUCE', 'TRANSFER', 'AVOID', 'CONTINGENCY']).optional(),
      treatmentActions: z.string().nullable().optional(),
      responsiblePerson: z.string().nullable().optional(),
      dueDate: z.string().nullable().optional(),
      reviewDate: z.string().nullable().optional(),
      status: z.enum(['OPEN', 'BEING_TREATED', 'MONITORED', 'CLOSED', 'ACCEPTED']).optional(),
    });

    const data = schema.parse(req.body);

    // Recalculate risk fields using merged values
    const mergedForCalc = {
      likelihood: data.likelihood ?? existing.likelihood,
      lossOfContracts: data.lossOfContracts ?? existing.lossOfContracts,
      harmToUser: data.harmToUser ?? existing.harmToUser,
      unableToMeetTerms: data.unableToMeetTerms ?? existing.unableToMeetTerms,
      violationOfRegulations: data.violationOfRegulations ?? existing.violationOfRegulations,
      reputationImpact: data.reputationImpact ?? existing.reputationImpact,
      costOfCorrection: data.costOfCorrection ?? existing.costOfCorrection,
    };
    const calculated = calculateRiskFields(mergedForCalc);

    const risk = await prisma.qualRisk.update({
      where: { id: req.params.id },
      data: {
        ...data,
        probabilityRating: calculated.probabilityRating,
        consequenceRating: calculated.consequenceRating,
        riskFactor: calculated.riskFactor,
        riskLevel: calculated.riskLevel,
        dueDate: data.dueDate === null ? null : data.dueDate ? new Date(data.dueDate) : undefined,
        reviewDate: data.reviewDate === null ? null : data.reviewDate ? new Date(data.reviewDate) : undefined,
      },
    });

    res.json({ success: true, data: risk });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update risk error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update risk' } });
  }
});

// DELETE /:id - Delete risk
router.delete('/:id', checkOwnership(prisma.qualRisk), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualRisk.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Risk not found' } });
    }

    await prisma.qualRisk.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete risk error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete risk' } });
  }
});

export default router;
