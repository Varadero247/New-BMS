import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('emergency-equipment');

const createEquipmentSchema = z.object({
  equipmentType: z.string().min(1, 'equipment type is required'),
  description: z.string().optional(),
  location: z.string().min(1, 'location is required'),
  serialNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  extinguisherClass: z.string().optional(),
  capacityKg: z.number().optional(),
  installDate: z.string().optional(),
  lastServiceDate: z.string().optional(),
  nextServiceDue: z.string(),
  serviceProvider: z.string().optional(),
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
    });
    res.json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to fetch service-due equipment', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch service-due equipment' } }); }
});

// GET /api/equipment/premises/:id — all equipment for premises
router.get('/premises/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const data = await prisma.femEmergencyEquipment.findMany({
      where: { premisesId: req.params.id },
      orderBy: { location: 'asc' },
    });
    res.json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to fetch equipment', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch equipment' } }); }
});

// POST /api/equipment/premises/:id — add equipment
router.post('/premises/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createEquipmentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
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
  } catch (error: unknown) { logger.error('Failed to create equipment', { error: (error as Error).message }); res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: (error as Error).message } }); }
});

// PUT /api/equipment/:id — update
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateEquipmentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const existing = await prisma.femEmergencyEquipment.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Equipment not found' } });
    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.nextServiceDue) updateData.nextServiceDue = new Date(parsed.data.nextServiceDue);
    if (parsed.data.installDate) updateData.installDate = new Date(parsed.data.installDate);
    if (parsed.data.lastServiceDate) updateData.lastServiceDate = new Date(parsed.data.lastServiceDate);
    const data = await prisma.femEmergencyEquipment.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to update equipment', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: (error as Error).message } }); }
});

// POST /api/equipment/:id/inspect — record inspection
router.post('/:id/inspect', authenticate, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      inspectionResult: z.string().min(1),
      defects: z.string().optional(),
      isOperational: z.boolean().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const existing = await prisma.femEmergencyEquipment.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Equipment not found' } });
    const data = await prisma.femEmergencyEquipment.update({
      where: { id: req.params.id },
      data: {
        lastInspectedAt: new Date(),
        inspectedBy: (req as AuthRequest).user?.id,
        inspectionResult: parsed.data.inspectionResult,
        defects: parsed.data.defects || null,
        isOperational: parsed.data.isOperational !== undefined ? parsed.data.isOperational : existing.isOperational,
      },
    });
    res.json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to record inspection', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INSPECT_ERROR', message: (error as Error).message } }); }
});

export default router;
