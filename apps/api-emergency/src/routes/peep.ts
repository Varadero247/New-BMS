import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('emergency-peep');

const mobilityLevelEnum = z.enum(['INDEPENDENT', 'ASSISTED', 'DEPENDENT', 'WHEELCHAIR_USER', 'VISUAL_IMPAIRMENT', 'HEARING_IMPAIRMENT', 'COGNITIVE_IMPAIRMENT']);

const createPeepSchema = z.object({
  personName: z.string().min(1, 'person name is required'),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  normalLocation: z.string().optional(),
  mobilityLevel: mobilityLevelEnum,
  mobilityNotes: z.string().optional(),
  requiresAssistance: z.boolean().optional(),
  evacuationMethod: z.string().optional(),
  assistantsRequired: z.number().int().optional(),
  namedAssistants: z.array(z.string()).optional().default([]),
  refugeAreaRequired: z.boolean().optional(),
  refugeLocation: z.string().optional(),
  specialEquipment: z.string().optional(),
  communicationNeeds: z.string().optional(),
  medicalConditionSummary: z.string().optional(),
  medicationOnPerson: z.boolean().optional(),
  reviewDate: z.string(),
});

const updatePeepSchema = createPeepSchema.partial();

// GET /api/peep/due-review — PEEPs needing review (before /:id)
router.get('/due-review', authenticate, async (_req: Request, res: Response) => {
  try {
    const data = await (prisma as any).femPeep.findMany({
      where: { isActive: true, reviewDate: { lt: new Date() } },
      include: { premises: { select: { name: true } } },
      orderBy: { reviewDate: 'asc' },
    });
    res.json({ success: true, data });
  } catch (error: any) { logger.error('Failed to fetch PEEPs due review', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch PEEPs due review' } }); }
});

// GET /api/peep/premises/:id — all PEEPs for premises
router.get('/premises/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).femPeep.findMany({
      where: { premisesId: req.params.id },
      orderBy: { personName: 'asc' },
    });
    res.json({ success: true, data });
  } catch (error: any) { logger.error('Failed to fetch PEEPs', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch PEEPs' } }); }
});

// POST /api/peep/premises/:id — create PEEP
router.post('/premises/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createPeepSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const { reviewDate, ...rest } = parsed.data;
    const data = await (prisma as any).femPeep.create({
      data: { ...rest, premisesId: req.params.id, reviewDate: new Date(reviewDate), createdBy: (req as any).user?.id },
    });
    res.status(201).json({ success: true, data });
  } catch (error: any) { logger.error('Failed to create PEEP', { error: error.message }); res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } }); }
});

// PUT /api/peep/:id — update PEEP
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updatePeepSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const existing = await (prisma as any).femPeep.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'PEEP not found' } });
    const updateData: any = { ...parsed.data };
    if (parsed.data.reviewDate) updateData.reviewDate = new Date(parsed.data.reviewDate);
    const data = await (prisma as any).femPeep.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data });
  } catch (error: any) { logger.error('Failed to update PEEP', { error: error.message }); res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } }); }
});

export default router;
