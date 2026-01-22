import { Router } from 'express';
import type { Router as IRouter } from 'express';
import { z } from 'zod';
import { prisma } from '@ims/database';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { v4 as uuidv4 } from 'uuid';

const router: IRouter = Router();

// ===== 5 WHYS =====

const fiveWhySchema = z.object({
  incidentId: z.string(),
  why1: z.string().optional(),
  why2: z.string().optional(),
  why3: z.string().optional(),
  why4: z.string().optional(),
  why5: z.string().optional(),
  rootCause: z.string().optional(),
  conclusion: z.string().optional(),
});

// GET /api/analytics/five-why - List all 5 Why analyses
router.get('/five-why', authenticate, async (req, res, next) => {
  try {
    const { incidentId, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (incidentId) where.incidentId = incidentId;

    const [analyses, total] = await Promise.all([
      prisma.fiveWhyAnalysis.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          incident: { select: { id: true, title: true, referenceNumber: true } },
        },
      }),
      prisma.fiveWhyAnalysis.count({ where }),
    ]);

    res.json({
      success: true,
      data: analyses,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/five-why/:id
router.get('/five-why/:id', authenticate, async (req, res, next) => {
  try {
    const analysis = await prisma.fiveWhyAnalysis.findUnique({
      where: { id: req.params.id },
      include: { incident: true },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '5 Why analysis not found' },
      });
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

// POST /api/analytics/five-why
router.post('/five-why', authenticate, validate(fiveWhySchema), async (req, res, next) => {
  try {
    const analysis = await prisma.fiveWhyAnalysis.create({
      data: req.body,
      include: { incident: { select: { id: true, title: true, referenceNumber: true } } },
    });

    res.status(201).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

// PUT /api/analytics/five-why/:id
router.put('/five-why/:id', authenticate, validate(fiveWhySchema.partial()), async (req, res, next) => {
  try {
    const analysis = await prisma.fiveWhyAnalysis.update({
      where: { id: req.params.id },
      data: req.body,
      include: { incident: { select: { id: true, title: true, referenceNumber: true } } },
    });

    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/analytics/five-why/:id
router.delete('/five-why/:id', authenticate, async (req, res, next) => {
  try {
    await prisma.fiveWhyAnalysis.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Analysis deleted' } });
  } catch (error) {
    next(error);
  }
});

// ===== FISHBONE =====

const fishboneSchema = z.object({
  incidentId: z.string(),
  problemStatement: z.string(),
  manpower: z.string().optional(),
  method: z.string().optional(),
  machine: z.string().optional(),
  material: z.string().optional(),
  measurement: z.string().optional(),
  environment: z.string().optional(),
  conclusion: z.string().optional(),
});

// GET /api/analytics/fishbone
router.get('/fishbone', authenticate, async (req, res, next) => {
  try {
    const { incidentId, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (incidentId) where.incidentId = incidentId;

    const [analyses, total] = await Promise.all([
      prisma.fishboneAnalysis.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          incident: { select: { id: true, title: true, referenceNumber: true } },
        },
      }),
      prisma.fishboneAnalysis.count({ where }),
    ]);

    res.json({
      success: true,
      data: analyses,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/fishbone/:id
router.get('/fishbone/:id', authenticate, async (req, res, next) => {
  try {
    const analysis = await prisma.fishboneAnalysis.findUnique({
      where: { id: req.params.id },
      include: { incident: true },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Fishbone analysis not found' },
      });
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

// POST /api/analytics/fishbone
router.post('/fishbone', authenticate, validate(fishboneSchema), async (req, res, next) => {
  try {
    const analysis = await prisma.fishboneAnalysis.create({
      data: req.body,
      include: { incident: { select: { id: true, title: true, referenceNumber: true } } },
    });

    res.status(201).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

// PUT /api/analytics/fishbone/:id
router.put('/fishbone/:id', authenticate, validate(fishboneSchema.partial()), async (req, res, next) => {
  try {
    const analysis = await prisma.fishboneAnalysis.update({
      where: { id: req.params.id },
      data: req.body,
      include: { incident: { select: { id: true, title: true, referenceNumber: true } } },
    });

    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/analytics/fishbone/:id
router.delete('/fishbone/:id', authenticate, async (req, res, next) => {
  try {
    await prisma.fishboneAnalysis.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Analysis deleted' } });
  } catch (error) {
    next(error);
  }
});

// ===== PARETO =====

const paretoDataItemSchema = z.object({
  category: z.string(),
  count: z.number(),
  percentage: z.number(),
  cumulative: z.number(),
});

const paretoSchema = z.object({
  incidentId: z.string().optional(),
  standard: z.enum(['ISO_45001', 'ISO_14001', 'ISO_9001']).optional(),
  title: z.string(),
  description: z.string().optional(),
  data: z.array(paretoDataItemSchema),
  periodStart: z.string().datetime().optional(),
  periodEnd: z.string().datetime().optional(),
  conclusion: z.string().optional(),
});

// GET /api/analytics/pareto
router.get('/pareto', authenticate, async (req, res, next) => {
  try {
    const { incidentId, standard, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (incidentId) where.incidentId = incidentId;
    if (standard) where.standard = standard;

    const [analyses, total] = await Promise.all([
      prisma.paretoAnalysis.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          incident: { select: { id: true, title: true, referenceNumber: true } },
        },
      }),
      prisma.paretoAnalysis.count({ where }),
    ]);

    res.json({
      success: true,
      data: analyses,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/pareto/auto-generate - Auto-generate Pareto from incident data
router.get('/pareto/auto-generate', authenticate, async (req, res, next) => {
  try {
    const { standard, groupBy = 'type', startDate, endDate } = req.query;

    const where: any = {};
    if (standard) where.standard = standard;
    if (startDate || endDate) {
      where.dateOccurred = {};
      if (startDate) where.dateOccurred.gte = new Date(startDate as string);
      if (endDate) where.dateOccurred.lte = new Date(endDate as string);
    }

    const groupField = groupBy as 'type' | 'category' | 'severity' | 'location';
    const incidents = await prisma.incident.groupBy({
      by: [groupField],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const total = incidents.reduce((sum, i) => sum + i._count.id, 0);
    let cumulative = 0;

    const data = incidents.map((item) => {
      const count = item._count.id;
      const percentage = total > 0 ? (count / total) * 100 : 0;
      cumulative += percentage;
      return {
        category: (item as any)[groupField] || 'Unknown',
        count,
        percentage: Math.round(percentage * 10) / 10,
        cumulative: Math.round(cumulative * 10) / 10,
      };
    });

    res.json({
      success: true,
      data: {
        title: `Incident ${groupField} Analysis`,
        data,
        total,
        periodStart: startDate,
        periodEnd: endDate,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/analytics/pareto
router.post('/pareto', authenticate, validate(paretoSchema), async (req, res, next) => {
  try {
    const analysis = await prisma.paretoAnalysis.create({
      data: {
        ...req.body,
        periodStart: req.body.periodStart ? new Date(req.body.periodStart) : undefined,
        periodEnd: req.body.periodEnd ? new Date(req.body.periodEnd) : undefined,
      },
    });

    res.status(201).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

// PUT /api/analytics/pareto/:id
router.put('/pareto/:id', authenticate, validate(paretoSchema.partial()), async (req, res, next) => {
  try {
    const updateData: any = { ...req.body };
    if (req.body.periodStart) updateData.periodStart = new Date(req.body.periodStart);
    if (req.body.periodEnd) updateData.periodEnd = new Date(req.body.periodEnd);

    const analysis = await prisma.paretoAnalysis.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/analytics/pareto/:id
router.delete('/pareto/:id', authenticate, async (req, res, next) => {
  try {
    await prisma.paretoAnalysis.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Analysis deleted' } });
  } catch (error) {
    next(error);
  }
});

// ===== BOW-TIE =====

const bowTieSchema = z.object({
  riskId: z.string(),
  topEvent: z.string(),
  threats: z.array(z.object({
    id: z.string().optional(),
    description: z.string(),
    likelihood: z.number().min(1).max(5).optional(),
  })),
  consequences: z.array(z.object({
    id: z.string().optional(),
    description: z.string(),
    severity: z.number().min(1).max(5).optional(),
  })),
  preventiveControls: z.array(z.object({
    id: z.string().optional(),
    description: z.string(),
    effectiveness: z.number().min(1).max(5).optional(),
    threatId: z.string().optional(),
  })),
  mitigatingControls: z.array(z.object({
    id: z.string().optional(),
    description: z.string(),
    effectiveness: z.number().min(1).max(5).optional(),
    consequenceId: z.string().optional(),
  })),
  escalationFactors: z.array(z.object({
    id: z.string().optional(),
    description: z.string(),
    controlId: z.string().optional(),
  })).optional(),
  notes: z.string().optional(),
});

// GET /api/analytics/bow-tie
router.get('/bow-tie', authenticate, async (req, res, next) => {
  try {
    const { riskId, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (riskId) where.riskId = riskId;

    const [analyses, total] = await Promise.all([
      prisma.bowTieAnalysis.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          risk: { select: { id: true, title: true, standard: true } },
        },
      }),
      prisma.bowTieAnalysis.count({ where }),
    ]);

    res.json({
      success: true,
      data: analyses,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/bow-tie/:id
router.get('/bow-tie/:id', authenticate, async (req, res, next) => {
  try {
    const analysis = await prisma.bowTieAnalysis.findUnique({
      where: { id: req.params.id },
      include: { risk: true },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Bow-Tie analysis not found' },
      });
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

// POST /api/analytics/bow-tie
router.post('/bow-tie', authenticate, validate(bowTieSchema), async (req, res, next) => {
  try {
    // Add IDs to items if not provided
    const threats = req.body.threats.map((t: any) => ({ ...t, id: t.id || uuidv4() }));
    const consequences = req.body.consequences.map((c: any) => ({ ...c, id: c.id || uuidv4() }));
    const preventiveControls = req.body.preventiveControls.map((c: any) => ({ ...c, id: c.id || uuidv4() }));
    const mitigatingControls = req.body.mitigatingControls.map((c: any) => ({ ...c, id: c.id || uuidv4() }));
    const escalationFactors = req.body.escalationFactors?.map((e: any) => ({ ...e, id: e.id || uuidv4() })) || [];

    const analysis = await prisma.bowTieAnalysis.create({
      data: {
        riskId: req.body.riskId,
        topEvent: req.body.topEvent,
        threats,
        consequences,
        preventiveControls,
        mitigatingControls,
        escalationFactors,
        notes: req.body.notes,
      },
      include: { risk: { select: { id: true, title: true, standard: true } } },
    });

    res.status(201).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

// PUT /api/analytics/bow-tie/:id
router.put('/bow-tie/:id', authenticate, validate(bowTieSchema.partial()), async (req, res, next) => {
  try {
    const updateData: any = { ...req.body };

    // Add IDs to new items
    if (req.body.threats) {
      updateData.threats = req.body.threats.map((t: any) => ({ ...t, id: t.id || uuidv4() }));
    }
    if (req.body.consequences) {
      updateData.consequences = req.body.consequences.map((c: any) => ({ ...c, id: c.id || uuidv4() }));
    }
    if (req.body.preventiveControls) {
      updateData.preventiveControls = req.body.preventiveControls.map((c: any) => ({ ...c, id: c.id || uuidv4() }));
    }
    if (req.body.mitigatingControls) {
      updateData.mitigatingControls = req.body.mitigatingControls.map((c: any) => ({ ...c, id: c.id || uuidv4() }));
    }
    if (req.body.escalationFactors) {
      updateData.escalationFactors = req.body.escalationFactors.map((e: any) => ({ ...e, id: e.id || uuidv4() }));
    }

    const analysis = await prisma.bowTieAnalysis.update({
      where: { id: req.params.id },
      data: updateData,
      include: { risk: { select: { id: true, title: true, standard: true } } },
    });

    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/analytics/bow-tie/:id
router.delete('/bow-tie/:id', authenticate, async (req, res, next) => {
  try {
    await prisma.bowTieAnalysis.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Analysis deleted' } });
  } catch (error) {
    next(error);
  }
});

// ===== LEAN 8 WASTES =====

const wasteItemSchema = z.object({
  identified: z.boolean(),
  description: z.string().optional(),
  estimatedCost: z.number().optional(),
});

const leanWasteSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  defects: wasteItemSchema.optional(),
  overproduction: wasteItemSchema.optional(),
  waiting: wasteItemSchema.optional(),
  nonUtilizedTalent: wasteItemSchema.optional(),
  transportation: wasteItemSchema.optional(),
  inventory: wasteItemSchema.optional(),
  motion: wasteItemSchema.optional(),
  extraProcessing: wasteItemSchema.optional(),
  recommendations: z.string().optional(),
});

// GET /api/analytics/lean-waste
router.get('/lean-waste', authenticate, async (req, res, next) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [analyses, total] = await Promise.all([
      prisma.leanWasteAnalysis.findMany({
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.leanWasteAnalysis.count(),
    ]);

    res.json({
      success: true,
      data: analyses,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/lean-waste/:id
router.get('/lean-waste/:id', authenticate, async (req, res, next) => {
  try {
    const analysis = await prisma.leanWasteAnalysis.findUnique({
      where: { id: req.params.id },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Lean Waste analysis not found' },
      });
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

// POST /api/analytics/lean-waste
router.post('/lean-waste', authenticate, validate(leanWasteSchema), async (req, res, next) => {
  try {
    // Calculate totals
    const wastes = ['defects', 'overproduction', 'waiting', 'nonUtilizedTalent', 'transportation', 'inventory', 'motion', 'extraProcessing'];
    let totalEstimatedCost = 0;
    let totalIdentifiedWastes = 0;

    wastes.forEach((waste) => {
      const item = req.body[waste];
      if (item?.identified) {
        totalIdentifiedWastes++;
        totalEstimatedCost += item.estimatedCost || 0;
      }
    });

    const analysis = await prisma.leanWasteAnalysis.create({
      data: {
        ...req.body,
        totalEstimatedCost,
        totalIdentifiedWastes,
      },
    });

    res.status(201).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

// PUT /api/analytics/lean-waste/:id
router.put('/lean-waste/:id', authenticate, validate(leanWasteSchema.partial()), async (req, res, next) => {
  try {
    const existing = await prisma.leanWasteAnalysis.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Analysis not found' },
      });
    }

    // Merge with existing and recalculate
    const wastes = ['defects', 'overproduction', 'waiting', 'nonUtilizedTalent', 'transportation', 'inventory', 'motion', 'extraProcessing'];
    let totalEstimatedCost = 0;
    let totalIdentifiedWastes = 0;

    wastes.forEach((waste) => {
      const item = req.body[waste] || (existing as any)[waste];
      if (item?.identified) {
        totalIdentifiedWastes++;
        totalEstimatedCost += item.estimatedCost || 0;
      }
    });

    const analysis = await prisma.leanWasteAnalysis.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        totalEstimatedCost,
        totalIdentifiedWastes,
      },
    });

    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/analytics/lean-waste/:id
router.delete('/lean-waste/:id', authenticate, async (req, res, next) => {
  try {
    await prisma.leanWasteAnalysis.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Analysis deleted' } });
  } catch (error) {
    next(error);
  }
});

// ===== MONTHLY TRENDS =====

// GET /api/analytics/trends
router.get('/trends', authenticate, async (req, res, next) => {
  try {
    const { standard, metric, year } = req.query;

    const where: any = {};
    if (standard) where.standard = standard;
    if (metric) where.metric = metric;
    if (year) where.year = parseInt(year as string);

    const trends = await prisma.monthlyTrend.findMany({
      where,
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });

    res.json({ success: true, data: trends });
  } catch (error) {
    next(error);
  }
});

// POST /api/analytics/trends/calculate - Calculate trends from data
router.post('/trends/calculate', authenticate, async (req, res, next) => {
  try {
    const { standard, year } = req.body;
    const targetYear = year || new Date().getFullYear();

    const metrics: { metric: string; value: number; month: number }[] = [];

    // Calculate monthly incident counts
    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(targetYear, month - 1, 1);
      const endDate = new Date(targetYear, month, 0);

      const where: any = {
        dateOccurred: { gte: startDate, lte: endDate },
      };
      if (standard) where.standard = standard;

      const incidentCount = await prisma.incident.count({ where });
      metrics.push({ metric: 'incidents', value: incidentCount, month });

      // Actions closed
      const actionsWhere: any = {
        completedAt: { gte: startDate, lte: endDate },
      };
      if (standard) actionsWhere.standard = standard;

      const actionsClosedCount = await prisma.action.count({ where: actionsWhere });
      metrics.push({ metric: 'actions_closed', value: actionsClosedCount, month });
    }

    // Upsert trends
    for (const m of metrics) {
      await prisma.monthlyTrend.upsert({
        where: {
          standard_metric_year_month: {
            standard: standard || 'ISO_45001',
            metric: m.metric,
            year: targetYear,
            month: m.month,
          },
        },
        create: {
          standard: standard || 'ISO_45001',
          metric: m.metric,
          year: targetYear,
          month: m.month,
          value: m.value,
        },
        update: {
          value: m.value,
        },
      });
    }

    res.json({ success: true, data: { message: 'Trends calculated', count: metrics.length } });
  } catch (error) {
    next(error);
  }
});

export default router;
