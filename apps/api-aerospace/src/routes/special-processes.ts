// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination} from '@ims/shared';
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
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().optional(),
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
  specification: z.string().trim().optional(),
  approvalBody: z.enum(['NADCAP', 'CUSTOMER', 'INTERNAL', 'OTHER']).optional().default('NADCAP'),
  applicableParts: z.array(z.string().trim()).optional().default([]),
  qualityRequirements: z.array(z.string().trim()).optional().default([]),
  equipmentRequired: z.array(z.string().trim()).optional().default([]),
  personnelQualifications: z.array(z.string().trim()).optional().default([]),
  controlPlan: z.string().trim().optional(),
  responsibleEngineer: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const updateSpecialProcessSchema = z.object({
  title: z.string().trim().optional(),
  description: z.string().trim().optional(),
  processType: z
    .enum([
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
    ])
    .optional(),
  specification: z.string().trim().optional(),
  approvalBody: z.enum(['NADCAP', 'CUSTOMER', 'INTERNAL', 'OTHER']).optional(),
  applicableParts: z.array(z.string().trim()).optional(),
  qualityRequirements: z.array(z.string().trim()).optional(),
  equipmentRequired: z.array(z.string().trim()).optional(),
  personnelQualifications: z.array(z.string().trim()).optional(),
  controlPlan: z.string().trim().optional(),
  responsibleEngineer: z.string().trim().optional(),
  status: z.enum(['ACTIVE', 'UNDER_REVIEW', 'SUSPENDED', 'OBSOLETE']).optional(),
  notes: z.string().trim().optional(),
});

const createNadcapApprovalSchema = z.object({
  specialProcessId: z.string().trim().min(1, 'Special process ID is required'),
  supplier: z.string().trim().min(1, 'Supplier is required'),
  commodity: z.string().trim().min(1, 'Commodity is required'),
  accreditationBody: z.string().trim().optional().default('PRI - Performance Review Institute'),
  certificateNumber: z.string().trim().optional(),
  auditDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  approvalDate: z
    .string()
    .min(1, 'Approval date is required')
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  expiryDate: z
    .string()
    .min(1, 'Expiry date is required')
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  scope: z.string().trim().optional(),
  limitations: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const updateNadcapApprovalSchema = z.object({
  certificateNumber: z.string().trim().optional(),
  auditDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  approvalDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  expiryDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  scope: z.string().trim().optional(),
  limitations: z.string().trim().optional(),
  approvalStatus: z.enum(['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'SUSPENDED', 'REVOKED']).optional(),
  notes: z.string().trim().optional(),
});

// ============================================
// SPECIAL PROCESSES — CRUD
// ============================================

// GET / - List special processes
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', processType, status, approvalBody, search } = req.query;
    const { page: pageNum, limit: limitNum, skip } = parsePagination(req.query);

    const where: Record<string, unknown> = { deletedAt: null };
    if (processType) where.processType = processType;
    if (status) where.status = status;
    if (approvalBody) where.approvalBody = approvalBody;
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
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list special processes' },
    });
  }
});

// GET /nadcap - List Nadcap approvals
router.get('/nadcap', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', approvalStatus, search } = req.query;
    const { page: pageNum, limit: limitNum, skip } = parsePagination(req.query);

    const where: Record<string, unknown> = { deletedAt: null };
    if (approvalStatus) where.approvalStatus = approvalStatus;
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

    const enriched = approvals.map((approval) => ({
      ...approval,
      expiringSoon:
        approval.expiryDate &&
        new Date(approval.expiryDate) <= ninetyDays &&
        new Date(approval.expiryDate) > now,
      expired: approval.expiryDate && new Date(approval.expiryDate) <= now,
    }));

    res.json({
      success: true,
      data: enriched,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List Nadcap approvals error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list Nadcap approvals' },
    });
  }
});

// GET /:id - Get special process
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const process = await prisma.aeroSpecialProcess.findUnique({
      where: { id: req.params.id },
      include: { nadcapApprovals: true },
    });

    if (!process || process.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Special process not found' },
      });
    }

    res.json({ success: true, data: process });
  } catch (error) {
    logger.error('Get special process error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get special process' },
    });
  }
});

// POST / - Create special process
router.post('/', async (req: Request, res: Response) => {
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
        applicableParts: JSON.stringify(data.applicableParts),
        qualityRequirements: JSON.stringify(data.qualityRequirements),
        equipmentRequired: JSON.stringify(data.equipmentRequired),
        personnelQualifications: JSON.stringify(data.personnelQualifications),
        controlPlan: data.controlPlan,
        responsibleEngineer: data.responsibleEngineer,
        status: 'ACTIVE',
        notes: data.notes,
        createdBy: (req as AuthRequest).user?.id,
      },
    });

    res.status(201).json({ success: true, data: process });
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
    logger.error('Create special process error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create special process' },
    });
  }
});

// PUT /:id - Update special process
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.aeroSpecialProcess.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Special process not found' },
      });
    }

    const data = updateSpecialProcessSchema.parse(req.body);

    const process = await prisma.aeroSpecialProcess.update({
      where: { id: req.params.id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.processType !== undefined && { processType: data.processType }),
        ...(data.specification !== undefined && { specification: data.specification }),
        ...(data.approvalBody !== undefined && { approvalBody: data.approvalBody }),
        ...(data.applicableParts !== undefined && { applicableParts: JSON.stringify(data.applicableParts) }),
        ...(data.qualityRequirements !== undefined && { qualityRequirements: JSON.stringify(data.qualityRequirements) }),
        ...(data.equipmentRequired !== undefined && { equipmentRequired: JSON.stringify(data.equipmentRequired) }),
        ...(data.personnelQualifications !== undefined && { personnelQualifications: JSON.stringify(data.personnelQualifications) }),
        ...(data.controlPlan !== undefined && { controlPlan: data.controlPlan }),
        ...(data.responsibleEngineer !== undefined && { responsibleEngineer: data.responsibleEngineer }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    res.json({ success: true, data: process });
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
    logger.error('Update special process error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update special process' },
    });
  }
});

// DELETE /:id - Soft delete special process
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.aeroSpecialProcess.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Special process not found' },
      });
    }

    await prisma.aeroSpecialProcess.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete special process error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete special process' },
    });
  }
});

// ============================================
// NADCAP APPROVALS
// ============================================

// POST /nadcap - Record Nadcap approval
router.post('/nadcap', async (req: Request, res: Response) => {
  try {
    const data = createNadcapApprovalSchema.parse(req.body);
    const refNumber = await generateNadcapApprovalRefNumber();

    const process = await prisma.aeroSpecialProcess.findUnique({
      where: { id: data.specialProcessId },
    });
    if (!process || process.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Special process not found' },
      });
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
        createdBy: (req as AuthRequest).user?.id,
      },
    });

    res.status(201).json({ success: true, data: approval });
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
    logger.error('Create Nadcap approval error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to record Nadcap approval' },
    });
  }
});

// PUT /nadcap/:id - Update Nadcap approval
router.put('/nadcap/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.aeroNadcapApproval.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Nadcap approval not found' },
      });
    }

    const data = updateNadcapApprovalSchema.parse(req.body);

    const approval = await prisma.aeroNadcapApproval.update({
      where: { id: req.params.id },
      data: {
        ...(data.certificateNumber !== undefined && { certificateNumber: data.certificateNumber }),
        ...(data.scope !== undefined && { scope: data.scope }),
        ...(data.limitations !== undefined && { limitations: data.limitations }),
        ...(data.approvalStatus !== undefined && { approvalStatus: data.approvalStatus }),
        ...(data.notes !== undefined && { notes: data.notes }),
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
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Update Nadcap approval error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update Nadcap approval' },
    });
  }
});

export default router;
