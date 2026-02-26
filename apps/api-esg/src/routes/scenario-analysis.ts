// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination } from '@ims/shared';

const logger = createLogger('api-esg');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// TCFD Strategy (b) — Climate Scenario Analysis

const scenarioSchema = z.object({
  title: z.string().trim().min(1),
  scenarioType: z.enum(['TRANSITION_RISK', 'PHYSICAL_RISK', 'COMBINED', 'OPPORTUNITY']),
  baselineScenario: z.enum(['1_5C', '2C', '3C', '4C', 'CURRENT_POLICIES', 'NET_ZERO_2050', 'CUSTOM']),
  timeHorizon: z.enum(['SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM']),
  description: z.string().trim().min(1),
  assumptions: z.string().trim().min(1),
  methodology: z.string().trim().optional(),
  keyVariables: z.array(z.string()).min(1),
  financialImpactLow: z.number().optional(),
  financialImpactHigh: z.number().optional(),
  financialImpactCurrency: z.string().trim().optional(),
  strategicImplications: z.string().trim().optional(),
  resilience: z.string().trim().optional(),
  adaptationMeasures: z.string().trim().optional(),
  analysisDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  conductedBy: z.string().trim().min(1),
  reviewedBy: z.string().trim().optional(),
  reportingYear: z.number().int().min(2000).max(2100),
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { scenarioType, timeHorizon, reportingYear } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (scenarioType) where.scenarioType = scenarioType;
    if (timeHorizon) where.timeHorizon = timeHorizon;
    if (reportingYear) where.reportingYear = Number(reportingYear);
    const [scenarios, total] = await Promise.all([
      prisma.esgScenarioAnalysis.findMany({ where, skip, take: limit, orderBy: { analysisDate: 'desc' } }),
      prisma.esgScenarioAnalysis.count({ where }),
    ]);
    res.json({ success: true, data: scenarios, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list scenario analyses', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list scenario analyses' } });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = scenarioSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const scenario = await prisma.esgScenarioAnalysis.create({
      data: { id: uuidv4(), ...parsed.data, analysisDate: new Date(parsed.data.analysisDate), status: 'DRAFT' },
    });
    logger.info('Climate scenario analysis created', { title: parsed.data.title, type: parsed.data.scenarioType });
    res.status(201).json({ success: true, data: scenario });
  } catch (error: unknown) {
    logger.error('Failed to create scenario analysis', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create scenario analysis' } });
  }
});

router.get('/summary', async (_req: Request, res: Response) => {
  try {
    const [total, byType, byHorizon] = await Promise.all([
      prisma.esgScenarioAnalysis.count({ where: { deletedAt: null } }),
      prisma.esgScenarioAnalysis.groupBy({ by: ['scenarioType'], where: { deletedAt: null }, _count: { id: true } }),
      prisma.esgScenarioAnalysis.groupBy({ by: ['timeHorizon'], where: { deletedAt: null }, _count: { id: true } }),
    ]);
    res.json({
      success: true,
      data: {
        total,
        byScenarioType: Object.fromEntries(byType.map((b) => [b.scenarioType, b._count.id])),
        byTimeHorizon: Object.fromEntries(byHorizon.map((b) => [b.timeHorizon, b._count.id])),
      },
    });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get summary' } });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const scenario = await prisma.esgScenarioAnalysis.findUnique({ where: { id: req.params.id } });
    if (!scenario || scenario.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Scenario analysis not found' } });
    res.json({ success: true, data: scenario });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get scenario analysis' } });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.esgScenarioAnalysis.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Scenario analysis not found' } });
    const updateSchema = scenarioSchema.partial().extend({
      status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']).optional(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    const { analysisDate, ...rest } = parsed.data;
    const updated = await prisma.esgScenarioAnalysis.update({
      where: { id: req.params.id },
      data: { ...rest, ...(analysisDate ? { analysisDate: new Date(analysisDate) } : {}) },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update scenario analysis' } });
  }
});

export default router;
