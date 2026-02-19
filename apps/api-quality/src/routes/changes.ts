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
  const count = await prisma.qualChange.count({
    where: { referenceNumber: { startsWith: `QMS-CHG-${year}` } },
  });
  return `QMS-CHG-${year}-${String(count + 1).padStart(3, '0')}`;
}

// ============================================
// CHANGE MANAGEMENT CRUD
// ============================================

// GET / — List changes (paginated)
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', changeType, status, priority, search } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (changeType) where.changeType = changeType as any;
    if (status) where.status = status as any;
    if (priority) where.priority = priority as any;
    if (search) where.title = { contains: search as string, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      prisma.qualChange.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.qualChange.count({ where }),
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
    logger.error('List changes error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list changes' },
    });
  }
});

// GET /:id — Get single change
router.get('/:id', checkOwnership(prisma.qualChange), async (req: AuthRequest, res: Response) => {
  try {
    const change = await prisma.qualChange.findUnique({
      where: { id: req.params.id },
    });

    if (!change) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Change not found' } });
    }

    res.json({ success: true, data: change });
  } catch (error) {
    logger.error('Get change error', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get change' } });
  }
});

// POST / — Create change
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      changeType: z.enum([
        'DOCUMENT_UPDATE',
        'PROCESS_CHANGE',
        'PRODUCT_CHANGE',
        'SYSTEM_CHANGE',
        'REGULATORY_RESPONSE',
        'CUSTOMER_REQUIREMENT',
        'CORRECTIVE_ACTION',
        'IMPROVEMENT',
        'EMERGENCY_CHANGE',
      ]),
      priority: z.enum(['ROUTINE', 'URGENT', 'EMERGENCY']).optional(),
      isoClause: z.string().trim().optional(),
      requestedBy: z.string().trim().min(1).max(200),
      department: z.string().trim().min(1).max(200),
      dateRequested: z.string().trim().optional(),
      // Description
      currentState: z.string().trim().min(1).max(200),
      proposedChange: z.string().trim().min(1).max(200),
      reasonForChange: z.string().trim().min(1).max(2000),
      linkedDocument: z.string().trim().optional(),
      linkedProcess: z.string().trim().optional(),
      linkedNcCapa: z.string().trim().optional(),
      // Impact Assessment
      qualityImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      customerImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      processImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      hsImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      envImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      regulatoryImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      financialImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      estimatedCost: z.number().nonnegative().optional(),
      affectedProcesses: z.string().trim().optional(),
      affectedDocuments: z.string().trim().optional(),
      stakeholdersToNotify: z.string().trim().optional(),
      trainingRequired: z.boolean().optional(),
      trainingDescription: z.string().trim().optional(),
      validationRequired: z.boolean().optional(),
      validationDescription: z.string().trim().optional(),
      // Approval
      status: z
        .enum([
          'REQUESTED',
          'IMPACT_ASSESSED',
          'APPROVED',
          'REJECTED',
          'IMPLEMENTATION',
          'VERIFICATION',
          'CLOSED',
          'CANCELLED',
        ])
        .optional(),
      reviewedBy: z.string().trim().optional(),
      approvalAuthority: z.string().trim().optional(),
      approvedBy: z.string().trim().optional(),
      approvalDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      approvalNotes: z.string().trim().optional(),
      rejectionReason: z.string().trim().optional(),
      // Implementation
      implementationPlan: z.string().trim().optional(),
      targetDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      actualDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      implementedBy: z.string().trim().optional(),
      docVersionUpdated: z.string().trim().optional(),
      communicationSent: z.boolean().optional(),
      trainingCompleted: z.boolean().optional(),
      // Verification
      verificationMethod: z.string().trim().optional(),
      verificationDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      verifiedBy: z.string().trim().optional(),
      effective: z.enum(['YES', 'NO', 'PENDING']).optional(),
      lessonsLearned: z.string().trim().optional(),
      // AI
      aiAnalysis: z.string().trim().optional(),
      aiHiddenRisks: z.string().trim().optional(),
      aiAffectedProcesses: z.string().trim().optional(),
      aiImplementationSteps: z.string().trim().optional(),
      aiGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateRefNumber();

    const change = await prisma.qualChange.create({
      data: {
        referenceNumber,
        title: data.title,
        changeType: data.changeType,
        priority: data.priority || 'ROUTINE',
        isoClause: data.isoClause,
        requestedBy: data.requestedBy,
        department: data.department,
        dateRequested: data.dateRequested ? new Date(data.dateRequested) : new Date(),
        currentState: data.currentState,
        proposedChange: data.proposedChange,
        reasonForChange: data.reasonForChange,
        linkedDocument: data.linkedDocument,
        linkedProcess: data.linkedProcess,
        linkedNcCapa: data.linkedNcCapa,
        qualityImpact: data.qualityImpact,
        customerImpact: data.customerImpact,
        processImpact: data.processImpact,
        hsImpact: data.hsImpact,
        envImpact: data.envImpact,
        regulatoryImpact: data.regulatoryImpact,
        financialImpact: data.financialImpact,
        estimatedCost: data.estimatedCost,
        affectedProcesses: data.affectedProcesses,
        affectedDocuments: data.affectedDocuments,
        stakeholdersToNotify: data.stakeholdersToNotify,
        trainingRequired: data.trainingRequired,
        trainingDescription: data.trainingDescription,
        validationRequired: data.validationRequired,
        validationDescription: data.validationDescription,
        status: data.status || 'REQUESTED',
        reviewedBy: data.reviewedBy,
        approvalAuthority: data.approvalAuthority,
        approvedBy: data.approvedBy,
        approvalDate: data.approvalDate ? new Date(data.approvalDate) : undefined,
        approvalNotes: data.approvalNotes,
        rejectionReason: data.rejectionReason,
        implementationPlan: data.implementationPlan,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
        actualDate: data.actualDate ? new Date(data.actualDate) : undefined,
        implementedBy: data.implementedBy,
        docVersionUpdated: data.docVersionUpdated,
        communicationSent: data.communicationSent,
        trainingCompleted: data.trainingCompleted,
        verificationMethod: data.verificationMethod,
        verificationDate: data.verificationDate ? new Date(data.verificationDate) : undefined,
        verifiedBy: data.verifiedBy,
        effective: data.effective,
        lessonsLearned: data.lessonsLearned,
        aiAnalysis: data.aiAnalysis,
        aiHiddenRisks: data.aiHiddenRisks,
        aiAffectedProcesses: data.aiAffectedProcesses,
        aiImplementationSteps: data.aiImplementationSteps,
        aiGenerated: data.aiGenerated,
      },
    });

    res.status(201).json({ success: true, data: change });
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
    logger.error('Create change error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create change' },
    });
  }
});

// PUT /:id — Update change
router.put('/:id', checkOwnership(prisma.qualChange), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualChange.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Change not found' } });
    }

    const schema = z.object({
      title: z.string().trim().min(1).max(200).optional(),
      changeType: z
        .enum([
          'DOCUMENT_UPDATE',
          'PROCESS_CHANGE',
          'PRODUCT_CHANGE',
          'SYSTEM_CHANGE',
          'REGULATORY_RESPONSE',
          'CUSTOMER_REQUIREMENT',
          'CORRECTIVE_ACTION',
          'IMPROVEMENT',
          'EMERGENCY_CHANGE',
        ])
        .optional(),
      priority: z.enum(['ROUTINE', 'URGENT', 'EMERGENCY']).optional(),
      isoClause: z.string().trim().optional(),
      requestedBy: z.string().trim().optional(),
      department: z.string().trim().optional(),
      currentState: z.string().trim().optional(),
      proposedChange: z.string().trim().optional(),
      reasonForChange: z.string().trim().optional(),
      linkedDocument: z.string().trim().optional(),
      linkedProcess: z.string().trim().optional(),
      linkedNcCapa: z.string().trim().optional(),
      qualityImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      customerImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      processImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      hsImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      envImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      regulatoryImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      financialImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      estimatedCost: z.number().nonnegative().optional(),
      affectedProcesses: z.string().trim().optional(),
      affectedDocuments: z.string().trim().optional(),
      stakeholdersToNotify: z.string().trim().optional(),
      trainingRequired: z.boolean().optional(),
      trainingDescription: z.string().trim().optional(),
      validationRequired: z.boolean().optional(),
      validationDescription: z.string().trim().optional(),
      status: z
        .enum([
          'REQUESTED',
          'IMPACT_ASSESSED',
          'APPROVED',
          'REJECTED',
          'IMPLEMENTATION',
          'VERIFICATION',
          'CLOSED',
          'CANCELLED',
        ])
        .optional(),
      reviewedBy: z.string().trim().optional(),
      approvalAuthority: z.string().trim().optional(),
      approvedBy: z.string().trim().optional(),
      approvalDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      approvalNotes: z.string().trim().optional(),
      rejectionReason: z.string().trim().optional(),
      implementationPlan: z.string().trim().optional(),
      targetDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      actualDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      implementedBy: z.string().trim().optional(),
      docVersionUpdated: z.string().trim().optional(),
      communicationSent: z.boolean().optional(),
      trainingCompleted: z.boolean().optional(),
      verificationMethod: z.string().trim().optional(),
      verificationDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      verifiedBy: z.string().trim().optional(),
      effective: z.enum(['YES', 'NO', 'PENDING']).optional(),
      lessonsLearned: z.string().trim().optional(),
      aiAnalysis: z.string().trim().optional(),
      aiHiddenRisks: z.string().trim().optional(),
      aiAffectedProcesses: z.string().trim().optional(),
      aiImplementationSteps: z.string().trim().optional(),
      aiGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    const change = await prisma.qualChange.update({
      where: { id: req.params.id },
      data: {
        ...data,
        approvalDate: data.approvalDate ? new Date(data.approvalDate) : undefined,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
        actualDate: data.actualDate ? new Date(data.actualDate) : undefined,
        verificationDate: data.verificationDate ? new Date(data.verificationDate) : undefined,
      },
    });

    res.json({ success: true, data: change });
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
    logger.error('Update change error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update change' },
    });
  }
});

// DELETE /:id — Delete change
router.delete(
  '/:id',
  checkOwnership(prisma.qualChange),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.qualChange.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Change not found' } });
      }

      await prisma.qualChange.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date() },
      });

      res.status(204).send();
    } catch (error) {
      logger.error('Delete change error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete change' },
      });
    }
  }
);

export default router;
