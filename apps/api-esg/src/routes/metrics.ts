// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-esg');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

const dataPointCreateSchema = z.object({
  periodStart: z
    .string()
    .trim()
    .min(1)
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  periodEnd: z
    .string()
    .trim()
    .min(1)
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  value: z.number(),
  unit: z.string().trim().min(1).max(50),
  source: z.string().trim().max(200).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED']).optional(),
});

// GET /api/metrics/:id/data-points
router.get('/:id/data-points', async (req: Request, res: Response) => {
  try {
    const metric = await prisma.esgMetric.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!metric) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Metric not found' } });
    }

    const { page = '1', limit = '20' } = req.query;
    const skip =
      (Math.max(1, parseInt(page as string, 10) || 1) - 1) *
      Math.max(1, parseInt(limit as string, 10) || 20);
    const take = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);

    const where: Record<string, any> = { metricId: req.params.id, deletedAt: null };

    const [data, total] = await Promise.all([
      prisma.esgDataPoint.findMany({ where, skip, take, orderBy: { periodStart: 'desc' } }),
      prisma.esgDataPoint.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: {
        page: Math.max(1, parseInt(page as string, 10) || 1),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error: unknown) {
    logger.error('Error fetching data points', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch data points' },
    });
  }
});

// POST /api/metrics/:id/data-points
router.post('/:id/data-points', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const metric = await prisma.esgMetric.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!metric) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Metric not found' } });
    }

    const parsed = dataPointCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.issues,
        },
      });
    }

    const data = parsed.data;
    const dataPoint = await prisma.esgDataPoint.create({
      data: {
        metricId: req.params.id,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        value: new Prisma.Decimal(data.value),
        unit: data.unit,
        source: data.source || null,
        notes: data.notes || null,
        status: data.status || 'DRAFT',
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: dataPoint });
  } catch (error: unknown) {
    logger.error('Error creating data point', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create data point' },
    });
  }
});

export default router;
