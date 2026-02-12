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
  const count = await prisma.qualChange.count({
    where: { referenceNumber: { startsWith: `QMS-CHG-${year}` } },
  });
  return `QMS-CHG-${year}-${String(count + 1).padStart(3, '0')}`;
}

// ============================================
// CHANGE MANAGEMENT CRUD
// ============================================

// GET / — List changes (paginated)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', changeType, status, priority, search } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.QualChangeWhereInput = {};
    if (changeType) where.changeType = changeType;
    if (status) where.status = status;
    if (priority) where.priority = priority;
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
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list changes' } });
  }
});

// GET /:id — Get single change
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const change = await prisma.qualChange.findUnique({
      where: { id: req.params.id },
    });

    if (!change) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Change not found' } });
    }

    res.json({ success: true, data: change });
  } catch (error) {
    logger.error('Get change error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get change' } });
  }
});

// POST / — Create change
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      changeType: z.enum([
        'DOCUMENT_UPDATE', 'PROCESS_CHANGE', 'PRODUCT_CHANGE', 'SYSTEM_CHANGE',
        'REGULATORY_RESPONSE', 'CUSTOMER_REQUIREMENT', 'CORRECTIVE_ACTION',
        'IMPROVEMENT', 'EMERGENCY_CHANGE',
      ]),
      priority: z.enum(['ROUTINE', 'URGENT', 'EMERGENCY']).optional(),
      isoClause: z.string().optional(),
      requestedBy: z.string().min(1),
      department: z.string().min(1),
      dateRequested: z.string().optional(),
      // Description
      currentState: z.string().min(1),
      proposedChange: z.string().min(1),
      reasonForChange: z.string().min(1),
      linkedDocument: z.string().optional(),
      linkedProcess: z.string().optional(),
      linkedNcCapa: z.string().optional(),
      // Impact Assessment
      qualityImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      customerImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      processImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      hsImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      envImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      regulatoryImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      financialImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      estimatedCost: z.number().optional(),
      affectedProcesses: z.string().optional(),
      affectedDocuments: z.string().optional(),
      stakeholdersToNotify: z.string().optional(),
      trainingRequired: z.boolean().optional(),
      trainingDescription: z.string().optional(),
      validationRequired: z.boolean().optional(),
      validationDescription: z.string().optional(),
      // Approval
      status: z.enum([
        'REQUESTED', 'IMPACT_ASSESSED', 'APPROVED', 'REJECTED',
        'IMPLEMENTATION', 'VERIFICATION', 'CLOSED', 'CANCELLED',
      ]).optional(),
      reviewedBy: z.string().optional(),
      approvalAuthority: z.string().optional(),
      approvedBy: z.string().optional(),
      approvalDate: z.string().optional(),
      approvalNotes: z.string().optional(),
      rejectionReason: z.string().optional(),
      // Implementation
      implementationPlan: z.string().optional(),
      targetDate: z.string().optional(),
      actualDate: z.string().optional(),
      implementedBy: z.string().optional(),
      docVersionUpdated: z.string().optional(),
      communicationSent: z.boolean().optional(),
      trainingCompleted: z.boolean().optional(),
      // Verification
      verificationMethod: z.string().optional(),
      verificationDate: z.string().optional(),
      verifiedBy: z.string().optional(),
      effective: z.enum(['YES', 'NO', 'PENDING']).optional(),
      lessonsLearned: z.string().optional(),
      // AI
      aiAnalysis: z.string().optional(),
      aiHiddenRisks: z.string().optional(),
      aiAffectedProcesses: z.string().optional(),
      aiImplementationSteps: z.string().optional(),
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
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create change error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create change' } });
  }
});

// PUT /:id — Update change
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualChange.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Change not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      changeType: z.enum([
        'DOCUMENT_UPDATE', 'PROCESS_CHANGE', 'PRODUCT_CHANGE', 'SYSTEM_CHANGE',
        'REGULATORY_RESPONSE', 'CUSTOMER_REQUIREMENT', 'CORRECTIVE_ACTION',
        'IMPROVEMENT', 'EMERGENCY_CHANGE',
      ]).optional(),
      priority: z.enum(['ROUTINE', 'URGENT', 'EMERGENCY']).optional(),
      isoClause: z.string().optional(),
      requestedBy: z.string().optional(),
      department: z.string().optional(),
      currentState: z.string().optional(),
      proposedChange: z.string().optional(),
      reasonForChange: z.string().optional(),
      linkedDocument: z.string().optional(),
      linkedProcess: z.string().optional(),
      linkedNcCapa: z.string().optional(),
      qualityImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      customerImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      processImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      hsImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      envImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      regulatoryImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      financialImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
      estimatedCost: z.number().optional(),
      affectedProcesses: z.string().optional(),
      affectedDocuments: z.string().optional(),
      stakeholdersToNotify: z.string().optional(),
      trainingRequired: z.boolean().optional(),
      trainingDescription: z.string().optional(),
      validationRequired: z.boolean().optional(),
      validationDescription: z.string().optional(),
      status: z.enum([
        'REQUESTED', 'IMPACT_ASSESSED', 'APPROVED', 'REJECTED',
        'IMPLEMENTATION', 'VERIFICATION', 'CLOSED', 'CANCELLED',
      ]).optional(),
      reviewedBy: z.string().optional(),
      approvalAuthority: z.string().optional(),
      approvedBy: z.string().optional(),
      approvalDate: z.string().optional(),
      approvalNotes: z.string().optional(),
      rejectionReason: z.string().optional(),
      implementationPlan: z.string().optional(),
      targetDate: z.string().optional(),
      actualDate: z.string().optional(),
      implementedBy: z.string().optional(),
      docVersionUpdated: z.string().optional(),
      communicationSent: z.boolean().optional(),
      trainingCompleted: z.boolean().optional(),
      verificationMethod: z.string().optional(),
      verificationDate: z.string().optional(),
      verifiedBy: z.string().optional(),
      effective: z.enum(['YES', 'NO', 'PENDING']).optional(),
      lessonsLearned: z.string().optional(),
      aiAnalysis: z.string().optional(),
      aiHiddenRisks: z.string().optional(),
      aiAffectedProcesses: z.string().optional(),
      aiImplementationSteps: z.string().optional(),
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
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update change error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update change' } });
  }
});

// DELETE /:id — Delete change
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualChange.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Change not found' } });
    }

    await prisma.qualChange.delete({ where: { id: req.params.id } });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete change error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete change' } });
  }
});

export default router;
