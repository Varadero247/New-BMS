import { Router, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-quality');

const router = Router();

router.use(authenticate);
router.param('id', validateIdParam());

// Generate reference number
async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'QMS-PRO';
  const count = await prisma.qualProcess.count({
    where: { referenceNumber: { startsWith: `${prefix}-${year}` } },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
}

// GET / - List processes
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', processType, status, search } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.QualProcessWhereInput = {};
    if (processType) where.processType = processType;
    if (status) where.status = status;
    if (search) {
      where.processName = { contains: search as string, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      prisma.qualProcess.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.qualProcess.count({ where }),
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
    logger.error('List processes error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list processes' } });
  }
});

// GET /:id - Get single process
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const process = await prisma.qualProcess.findUnique({
      where: { id: req.params.id },
    });

    if (!process) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Process not found' } });
    }

    res.json({ success: true, data: process });
  } catch (error) {
    logger.error('Get process error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get process' } });
  }
});

// POST / - Create process
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      processName: z.string().min(1),
      processType: z.enum(['MANAGEMENT', 'CORE', 'SUPPORT']),
      isoClause: z.string().optional(),
      department: z.string().min(1),
      processOwner: z.string().min(1),
      version: z.string().default('1.0'),
      status: z.enum(['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'RETIRED']).default('DRAFT'),
      // Turtle Diagram
      purposeScope: z.string().min(1),
      inputs: z.string().min(1),
      outputs: z.string().min(1),
      customerOfOutput: z.string().optional(),
      resourcesRequired: z.string().optional(),
      competenceNeeded: z.string().optional(),
      keyActivities: z.string().optional(),
      controlsMethods: z.string().optional(),
      // Performance KPIs
      kpi1Description: z.string().optional(),
      kpi1Target: z.string().optional(),
      kpi2Description: z.string().optional(),
      kpi2Target: z.string().optional(),
      kpi3Description: z.string().optional(),
      kpi3Target: z.string().optional(),
      monitoringMethod: z.string().optional(),
      measurementFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY']).optional(),
      // Linkage
      precedingProcesses: z.string().optional(),
      followingProcesses: z.string().optional(),
      relatedDocuments: z.string().optional(),
      relatedRiskRef: z.string().optional(),
      relatedLegalRef: z.string().optional(),
      // Review
      reviewFrequency: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY', 'BI_ANNUALLY', 'ON_CHANGE']).default('ANNUALLY'),
      lastReviewed: z.string().optional(),
      nextReviewDate: z.string().optional(),
      reviewNotes: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateRefNumber();

    const qualProcess = await prisma.qualProcess.create({
      data: {
        referenceNumber,
        processName: data.processName,
        processType: data.processType,
        isoClause: data.isoClause,
        department: data.department,
        processOwner: data.processOwner,
        version: data.version,
        status: data.status,
        purposeScope: data.purposeScope,
        inputs: data.inputs,
        outputs: data.outputs,
        customerOfOutput: data.customerOfOutput,
        resourcesRequired: data.resourcesRequired,
        competenceNeeded: data.competenceNeeded,
        keyActivities: data.keyActivities,
        controlsMethods: data.controlsMethods,
        kpi1Description: data.kpi1Description,
        kpi1Target: data.kpi1Target,
        kpi2Description: data.kpi2Description,
        kpi2Target: data.kpi2Target,
        kpi3Description: data.kpi3Description,
        kpi3Target: data.kpi3Target,
        monitoringMethod: data.monitoringMethod,
        measurementFrequency: data.measurementFrequency,
        precedingProcesses: data.precedingProcesses,
        followingProcesses: data.followingProcesses,
        relatedDocuments: data.relatedDocuments,
        relatedRiskRef: data.relatedRiskRef,
        relatedLegalRef: data.relatedLegalRef,
        reviewFrequency: data.reviewFrequency,
        lastReviewed: data.lastReviewed ? new Date(data.lastReviewed) : undefined,
        nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : undefined,
        reviewNotes: data.reviewNotes,
      },
    });

    res.status(201).json({ success: true, data: qualProcess });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create process error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create process' } });
  }
});

// PUT /:id - Update process
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualProcess.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Process not found' } });
    }

    const schema = z.object({
      processName: z.string().min(1).optional(),
      processType: z.enum(['MANAGEMENT', 'CORE', 'SUPPORT']).optional(),
      isoClause: z.string().nullable().optional(),
      department: z.string().min(1).optional(),
      processOwner: z.string().min(1).optional(),
      version: z.string().optional(),
      status: z.enum(['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'RETIRED']).optional(),
      // Turtle Diagram
      purposeScope: z.string().min(1).optional(),
      inputs: z.string().min(1).optional(),
      outputs: z.string().min(1).optional(),
      customerOfOutput: z.string().nullable().optional(),
      resourcesRequired: z.string().nullable().optional(),
      competenceNeeded: z.string().nullable().optional(),
      keyActivities: z.string().nullable().optional(),
      controlsMethods: z.string().nullable().optional(),
      // Performance KPIs
      kpi1Description: z.string().nullable().optional(),
      kpi1Target: z.string().nullable().optional(),
      kpi2Description: z.string().nullable().optional(),
      kpi2Target: z.string().nullable().optional(),
      kpi3Description: z.string().nullable().optional(),
      kpi3Target: z.string().nullable().optional(),
      monitoringMethod: z.string().nullable().optional(),
      measurementFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY']).nullable().optional(),
      // Linkage
      precedingProcesses: z.string().nullable().optional(),
      followingProcesses: z.string().nullable().optional(),
      relatedDocuments: z.string().nullable().optional(),
      relatedRiskRef: z.string().nullable().optional(),
      relatedLegalRef: z.string().nullable().optional(),
      // Review
      reviewFrequency: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY', 'BI_ANNUALLY', 'ON_CHANGE']).optional(),
      lastReviewed: z.string().nullable().optional(),
      nextReviewDate: z.string().nullable().optional(),
      reviewNotes: z.string().nullable().optional(),
      // AI fields
      aiAnalysis: z.string().nullable().optional(),
      aiProcessGaps: z.string().nullable().optional(),
      aiRiskPoints: z.string().nullable().optional(),
      aiKpiSuggestions: z.string().nullable().optional(),
      aiIsoAlignment: z.string().nullable().optional(),
      aiGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    const qualProcess = await prisma.qualProcess.update({
      where: { id: req.params.id },
      data: {
        ...data,
        lastReviewed: data.lastReviewed === null ? null : data.lastReviewed ? new Date(data.lastReviewed) : undefined,
        nextReviewDate: data.nextReviewDate === null ? null : data.nextReviewDate ? new Date(data.nextReviewDate) : undefined,
      },
    });

    res.json({ success: true, data: qualProcess });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update process error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update process' } });
  }
});

// DELETE /:id - Delete process
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualProcess.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Process not found' } });
    }

    await prisma.qualProcess.delete({ where: { id: req.params.id } });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete process error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete process' } });
  }
});

export default router;
