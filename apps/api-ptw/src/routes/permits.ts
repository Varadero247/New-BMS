import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { prisma } from '../prisma';

const router = Router();
router.param('id', validateIdParam());
const logger = createLogger('ptw-permits');

const createSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().optional(),
  type: z
    .enum([
      'HOT_WORK',
      'CONFINED_SPACE',
      'WORKING_AT_HEIGHT',
      'ELECTRICAL',
      'EXCAVATION',
      'GENERAL',
    ])
    .optional(),
  status: z
    .enum(['DRAFT', 'REQUESTED', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'CLOSED', 'CANCELLED'])
    .optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  location: z.string().trim().optional(),
  area: z.string().trim().optional(),
  requestedBy: z.string().trim().optional(),
  requestedByName: z.string().trim().optional(),
  approvedBy: z.string().trim().optional(),
  approvedByName: z.string().trim().optional(),
  startDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  endDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  hazards: z.string().trim().optional(),
  precautions: z.string().trim().optional(),
  ppe: z.string().trim().optional(),
  emergencyProcedure: z.string().trim().optional(),
  isolations: z.string().trim().optional(),
  gasTestRequired: z.boolean().optional(),
  gasTestResult: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const y = new Date().getFullYear();
  const c = await prisma.ptwPermit.count({
    where: { orgId, referenceNumber: { startsWith: `PTW-${y}` } },
  });
  return `PTW-${y}-${String(c + 1).padStart(4, '0')}`;
}

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId, deletedAt: null };
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: 'insensitive' };
    const skip =
      (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20);
    const [data, total] = await Promise.all([
      prisma.ptwPermit.findMany({
        where,
        skip,
        take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.ptwPermit.count({ where }),
    ]);
    res.json({
      success: true,
      data,
      pagination: {
        page: Math.max(1, parseInt(page, 10) || 1),
        limit: Math.max(1, parseInt(limit, 10) || 20),
        total,
        totalPages: Math.ceil(total / Math.max(1, parseInt(limit, 10) || 20)),
      },
    });
  } catch (error: unknown) {
    logger.error('Fetch failed', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch permits' },
    });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const item = await prisma.ptwPermit.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null } as any,
    });
    if (!item)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'permit not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch permit' },
    });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const referenceNumber = await generateRef(orgId);
    const {
      title,
      description,
      type,
      status,
      priority,
      location,
      area,
      requestedBy,
      requestedByName,
      approvedBy,
      approvedByName,
      startDate,
      endDate,
      hazards,
      precautions,
      ppe,
      emergencyProcedure,
      isolations,
      gasTestRequired,
      gasTestResult,
      notes,
    } = parsed.data;
    const data = await prisma.ptwPermit.create({
      data: {
        title,
        description,
        type,
        status,
        priority,
        location,
        area,
        requestedBy,
        requestedByName,
        approvedBy,
        approvedByName,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        hazards,
        precautions,
        ppe,
        emergencyProcedure,
        isolations,
        gasTestRequired,
        gasTestResult,
        notes,
        orgId,
        referenceNumber,
        createdBy: (req as AuthRequest).user?.id,
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' },
    });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const existing = await prisma.ptwPermit.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null } as any,
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'permit not found' } });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const {
      title,
      description,
      type,
      status,
      priority,
      location,
      area,
      requestedBy,
      requestedByName,
      approvedBy,
      approvedByName,
      startDate,
      endDate,
      hazards,
      precautions,
      ppe,
      emergencyProcedure,
      isolations,
      gasTestRequired,
      gasTestResult,
      notes,
    } = parsed.data;
    const updateData: Record<string, unknown> = { updatedBy: (req as AuthRequest).user?.id };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (location !== undefined) updateData.location = location;
    if (area !== undefined) updateData.area = area;
    if (requestedBy !== undefined) updateData.requestedBy = requestedBy;
    if (requestedByName !== undefined) updateData.requestedByName = requestedByName;
    if (approvedBy !== undefined) updateData.approvedBy = approvedBy;
    if (approvedByName !== undefined) updateData.approvedByName = approvedByName;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (hazards !== undefined) updateData.hazards = hazards;
    if (precautions !== undefined) updateData.precautions = precautions;
    if (ppe !== undefined) updateData.ppe = ppe;
    if (emergencyProcedure !== undefined) updateData.emergencyProcedure = emergencyProcedure;
    if (isolations !== undefined) updateData.isolations = isolations;
    if (gasTestRequired !== undefined) updateData.gasTestRequired = gasTestRequired;
    if (gasTestResult !== undefined) updateData.gasTestResult = gasTestResult;
    if (notes !== undefined) updateData.notes = notes;
    const data = await prisma.ptwPermit.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' },
    });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const existing = await prisma.ptwPermit.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null } as any,
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'permit not found' } });
    await prisma.ptwPermit.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id },
    });
    res.json({ success: true, data: { message: 'permit deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete resource' },
    });
  }
});

export default router;
