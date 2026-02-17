import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('emergency-wardens');

const icsRoleEnum = z.enum(['INCIDENT_COMMANDER', 'DEPUTY_INCIDENT_COMMANDER', 'SAFETY_OFFICER', 'LIAISON_OFFICER', 'PUBLIC_INFORMATION_OFFICER', 'OPERATIONS_SECTION_CHIEF', 'PLANNING_SECTION_CHIEF', 'LOGISTICS_SECTION_CHIEF', 'FINANCE_ADMIN_SECTION_CHIEF', 'FIRE_WARDEN', 'FIRST_AIDER', 'ASSEMBLY_POINT_WARDEN']);

const createWardenSchema = z.object({
  name: z.string().min(1, 'name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  icsRole: icsRoleEnum,
  areaResponsible: z.string().optional(),
  trainingProvider: z.string().optional(),
  trainingDate: z.string().optional(),
  trainingExpiryDate: z.string().optional(),
  certificateRef: z.string().optional(),
  trainingCurrent: z.boolean().optional(),
  deputyName: z.string().optional(),
  deputyPhone: z.string().optional(),
});

const updateWardenSchema = createWardenSchema.partial();

// GET /api/wardens/training-expiring — expiring within 60 days (before /:id)
router.get('/training-expiring', authenticate, async (_req: Request, res: Response) => {
  try {
    const sixtyDaysFromNow = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    const data = await prisma.femFireWarden.findMany({
      where: { isActive: true, trainingExpiryDate: { lt: sixtyDaysFromNow } },
      include: { premises: { select: { name: true } } },
      orderBy: { trainingExpiryDate: 'asc' },
    });
    res.json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to fetch expiring wardens', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch expiring training' } }); }
});

// GET /api/wardens/premises/:id — all wardens for premises
router.get('/premises/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const data = await prisma.femFireWarden.findMany({
      where: { premisesId: req.params.id },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to fetch wardens', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch wardens' } }); }
});

// POST /api/wardens/premises/:id — add warden
router.post('/premises/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createWardenSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const { trainingDate, trainingExpiryDate, ...rest } = parsed.data;
    const data = await prisma.femFireWarden.create({
      data: {
        ...rest,
        premisesId: req.params.id,
        trainingDate: trainingDate ? new Date(trainingDate) : undefined,
        trainingExpiryDate: trainingExpiryDate ? new Date(trainingExpiryDate) : undefined,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to create warden', { error: (error as Error).message }); res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: (error as Error).message } }); }
});

// PUT /api/wardens/:id — update warden
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateWardenSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const existing = await prisma.femFireWarden.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Warden not found' } });
    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.trainingDate) updateData.trainingDate = new Date(parsed.data.trainingDate);
    if (parsed.data.trainingExpiryDate) updateData.trainingExpiryDate = new Date(parsed.data.trainingExpiryDate);
    const data = await prisma.femFireWarden.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to update warden', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: (error as Error).message } }); }
});

export default router;
