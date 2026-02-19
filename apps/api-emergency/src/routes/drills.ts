import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { prisma } from '../prisma';

const router = Router();
router.param('id', validateIdParam());
const logger = createLogger('emergency-drills');

const evacuationTypeEnum = z.enum([
  'FULL_EVACUATION',
  'PARTIAL_EVACUATION',
  'HORIZONTAL_EVACUATION',
  'PHASED_EVACUATION',
  'STAY_PUT',
  'SHELTER_IN_PLACE',
]);

const createDrillSchema = z.object({
  drillDate: z
    .string()
    .trim()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  drillType: z.string().trim().min(1).max(200),
  evacuationType: evacuationTypeEnum,
  alarmedOrSilent: z.string().trim().min(1).max(200),
  totalPersonsEvacuated: z.number().int().optional(),
  evacuationTimeMinutes: z.number().nonnegative().optional(),
  targetTimeMinutes: z.number().nonnegative().optional(),
  targetAchieved: z.boolean().optional(),
  issuesIdentified: z.array(z.string().trim()).optional().default([]),
  assemblyPointReached: z.boolean().optional(),
  rollCallCompleted: z.boolean().optional(),
  rollCallTimeMinutes: z.number().nonnegative().optional(),
  peepEvacuationTested: z.boolean().optional(),
  peepIssues: z.string().trim().optional(),
  correctiveActions: z.string().trim().optional(),
  completedBy: z.string().trim().optional(),
  witnesses: z.array(z.string().trim()).optional().default([]),
});

const updateDrillSchema = createDrillSchema.partial();

// GET /api/drills/analytics — drill performance trends (before /:id)
router.get('/analytics', authenticate, async (_req: Request, res: Response) => {
  try {
    const drills = await prisma.femEvacuationDrill.findMany({
      orderBy: { drillDate: 'desc' },
      take: 50,
      include: { premises: { select: { name: true } } },
    });
    const premisesStats: Record<string, any> = {};
    for (const drill of drills) {
      const name = drill.premises?.name || 'Unknown';
      if (!premisesStats[name])
        premisesStats[name] = {
          drillCount: 0,
          avgEvacTime: 0,
          targetMetRate: 0,
          times: [],
          targetsMet: 0,
        };
      premisesStats[name].drillCount++;
      if (drill.evacuationTimeMinutes) premisesStats[name].times.push(drill.evacuationTimeMinutes);
      if (drill.targetAchieved) premisesStats[name].targetsMet++;
    }
    for (const key of Object.keys(premisesStats)) {
      const s = premisesStats[key];
      s.avgEvacTime =
        s.times.length > 0
          ? s.times.reduce((a: number, b: number) => a + b, 0) / s.times.length
          : 0;
      s.targetMetRate = s.drillCount > 0 ? (s.targetsMet / s.drillCount) * 100 : 0;
      delete s.times;
      delete s.targetsMet;
    }
    res.json({
      success: true,
      data: { totalDrills: drills.length, recentDrills: drills.slice(0, 10), premisesStats },
    });
  } catch (error: unknown) {
    logger.error('Failed to fetch drill analytics', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch drill analytics' },
    });
  }
});

// GET /api/drills/premises/:id — drill history for premises
router.get('/premises/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const data = await prisma.femEvacuationDrill.findMany({
      where: { premisesId: req.params.id },
      orderBy: { drillDate: 'desc' },
      take: 1000,
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to fetch drills', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch drills' },
    });
  }
});

// POST /api/drills/premises/:id — record new drill
router.post('/premises/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createDrillSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const { drillDate, ...rest } = parsed.data;
    const data = await prisma.femEvacuationDrill.create({
      data: {
        ...rest,
        premisesId: req.params.id,
        drillDate: new Date(drillDate),
        createdBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create drill', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create drill' },
    });
  }
});

// PUT /api/drills/:id — update drill
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateDrillSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.femEvacuationDrill.findFirst({
      where: { id: req.params.id, premises: { organisationId: orgId } },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Drill not found' } });
    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.drillDate) updateData.drillDate = new Date(parsed.data.drillDate);
    const data = await prisma.femEvacuationDrill.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update drill', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update drill' },
    });
  }
});

export default router;
