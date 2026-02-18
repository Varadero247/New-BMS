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
// Reference Number Generators
// ============================================

async function generateSpecialProcessRefNumber(): Promise<string> {
  const now = new Date();
  const yyyy = now.getFullYear();
  const count = await prisma.aeroSpecialProcess.count({
    where: { refNumber: { startsWith: `AERO-SP-${yyyy}` } },
  });
  return `AERO-SP-${yyyy}-${String(count + 1).padStart(3, '0')}`;
}

async function generateNadcapApprovalRefNumber(): Promise<string> {
  const now = new Date();
  const yyyy = now.getFullYear();
  const count = await prisma.aeroNadcapApproval.count({
    where: { refNumber: { startsWith: `AERO-NADCAP-${yyyy}` } },
  });
  return `AERO-NADCAP-${yyyy}-${String(count + 1).padStart(3, '0')}`;
}

// ============================================
// Zod Schemas
// ============================================

const createSpecialProcessSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  processType: z.enum([
    'CHEMICAL_PROCESSING',
    'COATINGS',
    'COMPOSITES',
    'ELASTOMERS',
    'HEAT_TREATING',
    'MATERIALS_TESTING',
    'NONDESTRUCTIVE_TESTING',
    'SHOT_PEENING',
    'WELDING',
    'BRAZING',
    'OTHER',
  ]),
  specification: z.string().optional(),
  approvalBody: z.enum(['NADCAP', 'CUSTOMER', 'INTERNAL', 'OTHER']).optional().default('NADCAP'),
  applicableParts: z.array(z.string()).optional().default([]),
  qualityRequirements: z.array(z.string()).optional().default([]),
  equipmentRequired: z.array(z.string()).optional().default([]),
  personnelQualifications: z.array(z.string()).optional().default([]),
  controlPlan: z.string().optional(),
  responsibleEngineer: z.string().optional(),
  notes: z.string().optional(),
});

const updateSpecialProcessSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  processType: z.enum([
    'CHEMICAL_PROCESSING',
    'COATINGS',
    'COMPOSITES',
    'ELASTOMERS',
    'HEAT_TREATING',
    'MATERIALS_TESTING',
    'NONDESTRUCTIVE_TESTING',
    'SHOT_PEENING',
    'WELDING',
    'BRAZING',
    'OTHER',
  ]).optional(),
  specification: z.string().optional(),
  approvalBody: z.enum(['NADCAP', 'CUSTOMER', 'INTERNAL', 'OTHER']).optional(),
  applicableParts: z.array(z.string()).optional(),
  qualityRequirements: z.array(z.string()).optional(),
  equipmentRequired: z.array(z.string()).optional(),
  personnelQualifications: z.array(z.string()).optional(),
  controlPlan: z.string().optional(),
  responsibleEngineer: z.string().optional(),
  status: z.enum(['ACTIVE', 'UNDER_REVIEW', 'SUSPENDED', 'OBSOLETE']).optional(),
  notes: z.string().optional(),
});

const createNadcapApprovalSchema = z.object({
  specialProcessId: z.string().min(1, 'Special process ID is required'),
  supplier: z.string().min(1, 'Supplier is required'),
  commodity: z.string().min(1, 'Commodity is required'),
  accreditationBody: z.string().optional().default('PRI - Performance Review Institute'),
  certificateNumber: z.string().optional(),
  auditDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
  approvalDate: z.string().min(1, 'Approval date is required').refine(s => !isNaN(Date.parse(s)), 'Invalid date format'),
  expiryDate: z.string().min(1, 'Expiry date is required').refine(s => !isNaN(Date.parse(s)), 'Invalid date format'),
  scope: z.string().optional(),
  limitations: z.string().optional(),
  notes: z.string().optional(),
});

const updateNadcapApprovalSchema = z.object({
  certificateNumber: z.string().optional(),
  auditDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
  approvalDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
  expiryDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
  scope: z.string().optional(),
  limitations: z.string().optional(),
  approvalStatus: z.enum(['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'SUSPENDED', 'REVOKED']).optional(),
  notes: z.string().optional(),
});

// ============================================
// SPECIAL PROCESSES — CRUD
// ============================================

// GET / - List special processes
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', processType, status, approvalBody, search } = req.query;
    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };
    if (processType) where.processType = processType as any;
    if (status) where.status = status as any;
    if (approvalBody) where.approvalBody = approvalBody as any;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { specification: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [processes, total] = await Promise.all([
      prisma.aeroSpecialProcess.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { processType: 'asc' },
        include: {
          nadcapApprovals: {
            select: { id: true, supplier: true, approvalStatus: true, expiryDate: true },
          },
        },
      }),
      prisma.aeroSpecialProcess.count({ where }),
    ]);

    res.json({
      success: true,
      data: processes,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List special processes error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list special processes' } });
  }
});

// GET /nadcap - List Nadcap approvals
router.get('/nadcap', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', approvalStatus, search } = req.query;
    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };
    if (approvalStatus) where.approvalStatus = approvalStatus as any;
    if (search) {
      where.OR = [
        { supplier: { contains: search as string, mode: 'insensitive' } },
        { commodity: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { certificateNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [approvals, total] = await Promise.all([
      prisma.aeroNadcapApproval.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { expiryDate: 'asc' },
      }),
      prisma.aeroNadcapApproval.count({ where }),
    ]);

    // Flag approvals expiring within 90 days
    const now = new Date();
    const ninetyDays = new Date();
    ninetyDays.setDate(ninetyDays.getDate() + 90);

    const enriched = approvals.map((approval: any) => ({
      ...approval,
      expiringSoon: approval.expiryDate && new Date(approval.expiryDate) <= ninetyDays && new Date(approval.expiryDate) > now,
      expired: approval.expiryDate && new Date(approval.expiryDate) <= now,
    }));

    res.json({
      success: true,
      data: enriched,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List Nadcap approvals error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list Nadcap approvals' } });
  }
});

// GET /:id - Get special process
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const process = await prisma.aeroSpecialProcess.findUnique({
      where: { id: req.params.id },
      include: { nadcapApprovals: true },
    });

    if (!process || process.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Special process not found' } });
    }

    res.json({ success: true, data: process });
  } catch (error) {
    logger.error('Get special process error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get special process' } });
  }
});

// POST / - Create special process
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createSpecialProcessSchema.parse(req.body);
    const refNumber = await generateSpecialProcessRefNumber();

    const process = await prisma.aeroSpecialProcess.create({
      data: {
        refNumber,
        title: data.title,
        description: data.description,
        processType: data.processType,
        specification: data.specification,
        approvalBody: data.approvalBody,
        applicableParts: data.applicableParts,
        qualityRequirements: data.qualityRequirements,
        equipmentRequired: data.equipmentRequired,
        personnelQualifications: data.personnelQualifications,
        controlPlan: data.controlPlan,
        responsibleEngineer: data.responsibleEngineer,
        status: 'ACTIVE',
        notes: data.notes,
        createdBy: req.user?.id,
      } as any,
    });

    res.status(201).json({ success: true, data: process });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create special process error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create special process' } });
  }
});

// PUT /:id - Update special process
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.aeroSpecialProcess.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Special process not found' } });
    }

    const data = updateSpecialProcessSchema.parse(req.body);

    const process = await prisma.aeroSpecialProcess.update({
      where: { id: req.params.id },
      data: data as any,
    });

    res.json({ success: true, data: process });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Update special process error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update special process' } });
  }
});

// DELETE /:id - Soft delete special process
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.aeroSpecialProcess.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Special process not found' } });
    }

    await prisma.aeroSpecialProcess.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete special process error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete special process' } });
  }
});

// ============================================
// NADCAP APPROVALS
// ============================================

// POST /nadcap - Record Nadcap approval
router.post('/nadcap', async (req: AuthRequest, res: Response) => {
  try {
    const data = createNadcapApprovalSchema.parse(req.body);
    const refNumber = await generateNadcapApprovalRefNumber();

    const process = await prisma.aeroSpecialProcess.findUnique({ where: { id: data.specialProcessId } });
    if (!process || process.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Special process not found' } });
    }

    const approval = await prisma.aeroNadcapApproval.create({
      data: {
        refNumber,
        specialProcessId: data.specialProcessId,
        supplier: data.supplier,
        commodity: data.commodity,
        accreditationBody: data.accreditationBody,
        certificateNumber: data.certificateNumber,
        auditDate: data.auditDate ? new Date(data.auditDate) : null,
        approvalDate: new Date(data.approvalDate),
        expiryDate: new Date(data.expiryDate),
        scope: data.scope,
        limitations: data.limitations,
        approvalStatus: 'ACTIVE',
        notes: data.notes,
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: approval });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create Nadcap approval error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to record Nadcap approval' } });
  }
});

// PUT /nadcap/:id - Update Nadcap approval
router.put('/nadcap/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.aeroNadcapApproval.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Nadcap approval not found' } });
    }

    const data = updateNadcapApprovalSchema.parse(req.body);

    const approval = await prisma.aeroNadcapApproval.update({
      where: { id: req.params.id },
      data: {
        ...data,
        auditDate: data.auditDate ? new Date(data.auditDate) : existing.auditDate,
        approvalDate: data.approvalDate ? new Date(data.approvalDate) : existing.approvalDate,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : existing.expiryDate,
      },
    });

    res.json({ success: true, data: approval });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Update Nadcap approval error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update Nadcap approval' } });
  }
});

export default router;
