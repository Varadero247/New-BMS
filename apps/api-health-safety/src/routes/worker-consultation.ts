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

const logger = createLogger('api-health-safety');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ISO 45001:2018 Clause 5.4 — Worker Participation and Consultation

const consultationSchema = z.object({
  title: z.string().trim().min(1),
  topic: z.enum(['HAZARD_IDENTIFICATION', 'RISK_ASSESSMENT', 'INCIDENT_INVESTIGATION', 'POLICY_REVIEW', 'OBJECTIVES', 'CONTROLS', 'EMERGENCY_PLANNING', 'TRAINING_NEEDS', 'OTHER']),
  description: z.string().trim().min(1),
  consultationDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  workerRepresentatives: z.array(z.string()).min(1),
  method: z.enum(['MEETING', 'SURVEY', 'TOOLBOX_TALK', 'COMMITTEE', 'SUGGESTION_BOX', 'DIGITAL', 'OTHER']),
  facilitatedBy: z.string().trim().min(1),
  participantCount: z.number().int().min(1),
  location: z.string().trim().optional(),
  agendaItems: z.array(z.string()).optional(),
  outcomeSummary: z.string().trim().optional(),
  actionsTaken: z.string().trim().optional(),
  feedbackProvidedBack: z.boolean().optional(),
});

const barrierSchema = z.object({
  consultationId: z.string().uuid(),
  barrierType: z.enum(['LANGUAGE', 'SHIFT_PATTERN', 'REMOTE_WORK', 'LITERACY', 'FEAR_OF_REPRISAL', 'DISABILITY', 'CULTURAL', 'OTHER']),
  description: z.string().trim().min(1),
  mitigationAction: z.string().trim().optional(),
  mitigatedBy: z.string().trim().optional(),
});

// GET / - list consultation records
router.get('/', async (req: Request, res: Response) => {
  try {
    const { topic, method } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (topic) where.topic = topic;
    if (method) where.method = method;
    const [consultations, total] = await Promise.all([
      prisma.hSWorkerConsultation.findMany({ where, skip, take: limit, orderBy: { consultationDate: 'desc' } }),
      prisma.hSWorkerConsultation.count({ where }),
    ]);
    res.json({ success: true, data: consultations, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list consultations', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list consultations' } });
  }
});

// POST / - record consultation
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = consultationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const consultation = await prisma.hSWorkerConsultation.create({
      data: {
        id: uuidv4(), ...parsed.data,
        consultationDate: new Date(parsed.data.consultationDate),
      },
    });
    logger.info('Worker consultation recorded', { title: parsed.data.title, participantCount: parsed.data.participantCount });
    res.status(201).json({ success: true, data: consultation });
  } catch (error: unknown) {
    logger.error('Failed to record consultation', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to record consultation' } });
  }
});

// GET /dashboard
router.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const [totalThisYear, byTopic, totalParticipantsResult, barrierCount] = await Promise.all([
      prisma.hSWorkerConsultation.count({ where: { deletedAt: null, consultationDate: { gte: yearStart } } }),
      prisma.hSWorkerConsultation.groupBy({ by: ['topic'], where: { deletedAt: null }, _count: { id: true } }),
      prisma.hSWorkerConsultation.aggregate({ where: { deletedAt: null }, _sum: { participantCount: true } }),
      prisma.hSParticipationBarrier.count({ where: { deletedAt: null } }),
    ]);
    res.json({
      success: true,
      data: {
        consultationsThisYear: totalThisYear,
        totalParticipants: totalParticipantsResult._sum.participantCount ?? 0,
        byTopic: Object.fromEntries(byTopic.map((b) => [b.topic, b._count.id])),
        activeBarriers: barrierCount,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get dashboard' } });
  }
});

// GET /barriers - list participation barriers
router.get('/barriers', async (req: Request, res: Response) => {
  try {
    const { skip, limit, page } = parsePagination(req.query);
    const [barriers, total] = await Promise.all([
      prisma.hSParticipationBarrier.findMany({ where: { deletedAt: null }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.hSParticipationBarrier.count({ where: { deletedAt: null } }),
    ]);
    res.json({ success: true, data: barriers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list barriers' } });
  }
});

// POST /barriers - record participation barrier
router.post('/barriers', async (req: Request, res: Response) => {
  try {
    const parsed = barrierSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    // Verify parent consultation exists
    const consultation = await prisma.hSWorkerConsultation.findUnique({ where: { id: parsed.data.consultationId } });
    if (!consultation) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Consultation not found' } });
    }
    const barrier = await prisma.hSParticipationBarrier.create({
      data: { id: uuidv4(), ...parsed.data },
    });
    res.status(201).json({ success: true, data: barrier });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to record barrier' } });
  }
});

// GET /:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const consultation = await prisma.hSWorkerConsultation.findUnique({ where: { id: req.params.id } });
    if (!consultation || consultation.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Consultation not found' } });
    }
    res.json({ success: true, data: consultation });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get consultation' } });
  }
});

// PUT /:id - update consultation
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.hSWorkerConsultation.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Consultation not found' } });
    }
    const updateSchema = consultationSchema.partial();
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const { consultationDate, ...rest } = parsed.data;
    const updated = await prisma.hSWorkerConsultation.update({
      where: { id: req.params.id },
      data: { ...rest, ...(consultationDate ? { consultationDate: new Date(consultationDate) } : {}) },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update consultation' } });
  }
});

export default router;
