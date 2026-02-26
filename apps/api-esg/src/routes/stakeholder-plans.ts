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

// GRI 2-29 — Approach to Stakeholder Engagement (Plans)

const planSchema = z.object({
  stakeholderGroup: z.string().trim().min(1),
  engagementPurpose: z.string().trim().min(1),
  frequency: z.enum(['ONGOING', 'ANNUAL', 'QUARTERLY', 'MONTHLY', 'AD_HOC', 'EVENT_BASED']),
  methods: z.array(z.string()).min(1),
  responsibleTeam: z.string().trim().min(1),
  keyTopics: z.array(z.string()).optional(),
  feedbackMechanism: z.string().trim().optional(),
  lastEngagementDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  nextEngagementDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  outcomes: z.string().trim().optional(),
  reportingYear: z.number().int().min(2000).max(2100),
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { reportingYear } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (reportingYear) where.reportingYear = Number(reportingYear);
    const [plans, total] = await Promise.all([
      prisma.esgStakeholderPlan.findMany({ where, skip, take: limit, orderBy: { stakeholderGroup: 'asc' } }),
      prisma.esgStakeholderPlan.count({ where }),
    ]);
    res.json({ success: true, data: plans, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list stakeholder plans', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list stakeholder plans' } });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = planSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const plan = await prisma.esgStakeholderPlan.create({
      data: {
        id: uuidv4(), ...parsed.data,
        lastEngagementDate: parsed.data.lastEngagementDate ? new Date(parsed.data.lastEngagementDate) : undefined,
        nextEngagementDate: parsed.data.nextEngagementDate ? new Date(parsed.data.nextEngagementDate) : undefined,
      },
    });
    logger.info('Stakeholder plan created', { stakeholderGroup: parsed.data.stakeholderGroup, year: parsed.data.reportingYear });
    res.status(201).json({ success: true, data: plan });
  } catch (error: unknown) {
    logger.error('Failed to create stakeholder plan', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create stakeholder plan' } });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const plan = await prisma.esgStakeholderPlan.findUnique({ where: { id: req.params.id } });
    if (!plan || plan.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Stakeholder plan not found' } });
    res.json({ success: true, data: plan });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get stakeholder plan' } });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.esgStakeholderPlan.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Stakeholder plan not found' } });
    const updateSchema = planSchema.partial();
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    const { lastEngagementDate, nextEngagementDate, ...rest } = parsed.data;
    const updated = await prisma.esgStakeholderPlan.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(lastEngagementDate ? { lastEngagementDate: new Date(lastEngagementDate) } : {}),
        ...(nextEngagementDate ? { nextEngagementDate: new Date(nextEngagementDate) } : {}),
      },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update stakeholder plan' } });
  }
});

export default router;
