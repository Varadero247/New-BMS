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
// Reference Number Generator
// ============================================

async function generateBaselineRefNumber(): Promise<string> {
  const now = new Date();
  const yyyy = now.getFullYear();
  const count = await prisma.aeroConfigBaseline.count({
    where: { refNumber: { startsWith: `AERO-BL-${yyyy}` } },
  });
  return `AERO-BL-${yyyy}-${String(count + 1).padStart(3, '0')}`;
}

// ============================================
// Zod Schemas
// ============================================

const createBaselineSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().optional(),
  program: z.string().trim().optional(),
  version: z.string().trim().optional().default('1.0'),
  baselineType: z
    .enum(['FUNCTIONAL', 'ALLOCATED', 'PRODUCT', 'DESIGN'])
    .optional()
    .default('FUNCTIONAL'),
  program_phase: z.string().trim().optional(),
  configuration_items: z.array(z.string().trim()).optional().default([]),
  documents: z.array(z.string().trim()).optional().default([]),
  effectiveDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  approvedBy: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const updateBaselineSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().optional(),
  program: z.string().trim().optional(),
  version: z.string().trim().optional(),
  baselineType: z.enum(['FUNCTIONAL', 'ALLOCATED', 'PRODUCT', 'DESIGN']).optional(),
  program_phase: z.string().trim().optional(),
  configuration_items: z.array(z.string().trim()).optional(),
  documents: z.array(z.string().trim()).optional(),
  status: z
    .enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE', 'SUPERSEDED', 'ARCHIVED'])
    .optional(),
  effectiveDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  approvedBy: z.string().trim().optional(),
  approvedDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  notes: z.string().trim().optional(),
});

// ============================================
// CONFIGURATION BASELINES — CRUD
// ============================================

// GET / - List baselines
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', status, baselineType, program, search } = req.query;
    const { page: pageNum, limit: limitNum, skip } = parsePagination(req.query);

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (baselineType) where.baselineType = baselineType;
    if (program) where.program = { contains: program as string, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { program: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [baselines, total] = await Promise.all([
      prisma.aeroConfigBaseline.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.aeroConfigBaseline.count({ where }),
    ]);

    res.json({
      success: true,
      data: baselines,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List baselines error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list baselines' },
    });
  }
});

// GET /:id - Get baseline
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const baseline = await prisma.aeroConfigBaseline.findUnique({
      where: { id: req.params.id },
    });

    if (!baseline || baseline.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Baseline not found' } });
    }

    res.json({ success: true, data: baseline });
  } catch (error) {
    logger.error('Get baseline error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get baseline' },
    });
  }
});

// POST / - Create baseline
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createBaselineSchema.parse(req.body);
    const refNumber = await generateBaselineRefNumber();

    const baseline = await prisma.aeroConfigBaseline.create({
      data: {
        refNumber,
        title: data.title,
        description: data.description,
        program: data.program,
        version: data.version,
        baselineType: data.baselineType,
        program_phase: data.program_phase,
        configuration_items: JSON.stringify(data.configuration_items),
        documents: JSON.stringify(data.documents),
        status: 'DRAFT',
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : null,
        approvedBy: data.approvedBy,
        notes: data.notes,
        createdBy: (req as AuthRequest).user?.id,
      },
    });

    res.status(201).json({ success: true, data: baseline });
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
    logger.error('Create baseline error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create baseline' },
    });
  }
});

// PUT /:id - Update baseline
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.aeroConfigBaseline.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Baseline not found' } });
    }

    const data = updateBaselineSchema.parse(req.body);

    const baseline = await prisma.aeroConfigBaseline.update({
      where: { id: req.params.id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.program !== undefined && { program: data.program }),
        ...(data.version !== undefined && { version: data.version }),
        ...(data.baselineType !== undefined && { baselineType: data.baselineType }),
        ...(data.program_phase !== undefined && { program_phase: data.program_phase }),
        ...(data.configuration_items !== undefined && { configuration_items: JSON.stringify(data.configuration_items) }),
        ...(data.documents !== undefined && { documents: JSON.stringify(data.documents) }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.approvedBy !== undefined && { approvedBy: data.approvedBy }),
        ...(data.notes !== undefined && { notes: data.notes }),
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : existing.effectiveDate,
        approvedDate: data.approvedDate ? new Date(data.approvedDate) : existing.approvedDate,
      },
    });

    res.json({ success: true, data: baseline });
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
    logger.error('Update baseline error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update baseline' },
    });
  }
});

// DELETE /:id - Soft delete baseline
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.aeroConfigBaseline.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Baseline not found' } });
    }

    await prisma.aeroConfigBaseline.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete baseline error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete baseline' },
    });
  }
});

// PUT /:id/approve - Approve baseline
router.put('/:id/approve', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.aeroConfigBaseline.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Baseline not found' } });
    }

    const schema = z.object({
      approvedBy: z.string().trim().min(1, 'Approver is required'),
      approvalNotes: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    const baseline = await prisma.aeroConfigBaseline.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        approvedBy: data.approvedBy,
        approvedDate: new Date(),
        notes: data.approvalNotes
          ? `${existing.notes ? existing.notes + '\n' : ''}Approval: ${data.approvalNotes}`
          : existing.notes,
      },
    });

    res.json({ success: true, data: baseline });
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
    logger.error('Approve baseline error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to approve baseline' },
    });
  }
});

export default router;
