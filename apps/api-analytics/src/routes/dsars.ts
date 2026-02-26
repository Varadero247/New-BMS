// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const createDataRequestSchema = z.object({
  type: z.enum(['ACCESS', 'RECTIFICATION', 'ERASURE', 'PORTABILITY', 'RESTRICTION', 'OBJECTION'], {
    errorMap: () => ({
      message:
        'type must be one of: ACCESS, RECTIFICATION, ERASURE, PORTABILITY, RESTRICTION, OBJECTION',
    }),
  }),
  requesterEmail: z
    .string()
    .trim()
    .email('Valid email is required')
    .min(1, 'requesterEmail is required'),
  requesterName: z.string().trim().min(1, 'requesterName is required'),
  description: z.string().trim().nullable().optional(),
});

const updateDataRequestStatusSchema = z.object({
  status: z.string().trim().min(1, 'status is required'),
});

const logger = createLogger('dsars');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  RECEIVED: ['VERIFIED', 'REJECTED'],
  VERIFIED: ['PROCESSING', 'REJECTED'],
  PROCESSING: ['COMPLETED', 'REJECTED'],
};

// ---------------------------------------------------------------------------
// GET / — List data requests with pagination, filter by status/type
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [requests, total] = await Promise.all([
      prisma.dataRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.dataRequest.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        requests,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    logger.error('Failed to list data requests', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list data requests' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get single data request
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const dataRequest = await prisma.dataRequest.findUnique({ where: { id: req.params.id } });
    if (!dataRequest) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Data request not found' } });
    }
    res.json({ success: true, data: { request: dataRequest } });
  } catch (err) {
    logger.error('Failed to get data request', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get data request' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create data request (DSAR)
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createDataRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { type, requesterEmail, requesterName, description } = parsed.data;

    const now = new Date();
    const deadlineAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const dataRequest = await prisma.dataRequest.create({
      data: {
        type,
        requesterEmail,
        requesterName,
        description: description || null,
        status: 'RECEIVED',
        deadlineAt,
      },
    });

    logger.info('Data request created', { id: dataRequest.id, type, requesterEmail });
    res.status(201).json({ success: true, data: { request: dataRequest } });
  } catch (err) {
    logger.error('Failed to create data request', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create data request' },
    });
  }
});

// ---------------------------------------------------------------------------
// PATCH /:id/status — Transition data request status
// ---------------------------------------------------------------------------
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.dataRequest.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Data request not found' } });
    }

    const parsed = updateDataRequestStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { status } = parsed.data;

    const allowedTransitions = VALID_STATUS_TRANSITIONS[existing.status];
    if (!allowedTransitions || !allowedTransitions.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TRANSITION',
          message: `Cannot transition from ${existing.status} to ${status}`,
        },
      });
    }

    const data: Record<string, unknown> = { status };
    if (status === 'COMPLETED') {
      data.completedAt = new Date();
    }

    const dataRequest = await prisma.dataRequest.update({
      where: { id: req.params.id },
      data,
    });

    logger.info('Data request status updated', {
      id: dataRequest.id,
      from: existing.status,
      to: status,
    });
    res.json({ success: true, data: { request: dataRequest } });
  } catch (err) {
    logger.error('Failed to update data request status', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update status' },
    });
  }
});

export default router;
