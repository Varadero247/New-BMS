import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { prisma } from '../prisma';

const router = Router();
router.param('id', validateIdParam());
const logger = createLogger('emergency-equipment');

const createEquipmentSchema = z.object({
  equipmentType: z.string().trim().min(1, 'equipment type is required'),
  description: z.string().trim().optional(),
  location: z.string().trim().min(1, 'location is required'),
  serialNumber: z.string().trim().optional(),
  manufacturer: z.string().trim().optional(),
  extinguisherClass: z.string().trim().optional(),
  capacityKg: z.number().nonnegative().optional(),
  installDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  lastServiceDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  nextServiceDue: z
    .string()
    .trim()
    .min(1)
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  serviceProvider: z.string().trim().optional(),
});

const updateEquipmentSchema = createEquipmentSchema.partial();

// GET /api/equipment/service-due — upcoming service due (before /:id)
router.get('/service-due', authenticate, async (_req: Request, res: Response) => {
  try {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const data = await prisma.femEmergencyEquipment.findMany({
      where: { nextServiceDue: { lt: thirtyDaysFromNow } },
      include: { premises: { select: { name: true } } },
      orderBy: { nextServiceDue: 'asc' },
      take: 1000,
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to fetch service-due equipment', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch service-due equipment' },
    });
  }
});

// GET /api/equipment/premises/:id — all equipment for premises
router.get('/premises/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const data = await prisma.femEmergencyEquipment.findMany({
      where: { premisesId: req.params.id },
      orderBy: { location: 'asc' },
      take: 1000,
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to fetch equipment', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch equipment' },
    });
  }
});

// POST /api/equipment/premises/:id — add equipment
router.post('/premises/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createEquipmentSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const { nextServiceDue, installDate, lastServiceDate, ...rest } = parsed.data;
    const data = await prisma.femEmergencyEquipment.create({
      data: {
        ...rest,
        premisesId: req.params.id,
        nextServiceDue: new Date(nextServiceDue),
        installDate: installDate ? new Date(installDate) : undefined,
        lastServiceDate: lastServiceDate ? new Date(lastServiceDate) : undefined,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create equipment', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create equipment' },
    });
  }
});

// PUT /api/equipment/:id — update
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateEquipmentSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.femEmergencyEquipment.findFirst({
      where: { id: req.params.id, premises: { organisationId: orgId } },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Equipment not found' } });
    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.nextServiceDue)
      updateData.nextServiceDue = new Date(parsed.data.nextServiceDue);
    if (parsed.data.installDate) updateData.installDate = new Date(parsed.data.installDate);
    if (parsed.data.lastServiceDate)
      updateData.lastServiceDate = new Date(parsed.data.lastServiceDate);
    const data = await prisma.femEmergencyEquipment.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update equipment', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update equipment' },
    });
  }
});

// POST /api/equipment/:id/inspect — record inspection
router.post('/:id/inspect', authenticate, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      inspectionResult: z.string().trim().min(1).max(200),
      defects: z.string().trim().optional(),
      isOperational: z.boolean().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.femEmergencyEquipment.findFirst({
      where: { id: req.params.id, premises: { organisationId: orgId } },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Equipment not found' } });
    const data = await prisma.femEmergencyEquipment.update({
      where: { id: req.params.id },
      data: {
        lastInspectedAt: new Date(),
        inspectedBy: (req as AuthRequest).user?.id,
        inspectionResult: parsed.data.inspectionResult,
        defects: parsed.data.defects || null,
        isOperational:
          parsed.data.isOperational !== undefined
            ? parsed.data.isOperational
            : existing.isOperational,
      },
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to record inspection', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INSPECT_ERROR', message: 'Failed to record inspection' },
    });
  }
});

export default router;
