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


const wasteCreateSchema = z.object({
  wasteType: z.enum(['HAZARDOUS', 'NON_HAZARDOUS', 'RECYCLABLE', 'ORGANIC', 'ELECTRONIC']),
  quantity: z.number().positive(),
  unit: z.string().trim().min(1).max(50),
  disposalMethod: z.enum(['LANDFILL', 'RECYCLED', 'INCINERATED', 'COMPOSTED', 'REUSED']),
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
  facility: z.string().trim().max(200).optional().nullable(),
});

const wasteUpdateSchema = z.object({
  wasteType: z
    .enum(['HAZARDOUS', 'NON_HAZARDOUS', 'RECYCLABLE', 'ORGANIC', 'ELECTRONIC'])
    .optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().trim().min(1).max(50).optional(),
  disposalMethod: z.enum(['LANDFILL', 'RECYCLED', 'INCINERATED', 'COMPOSTED', 'REUSED']).optional(),
  periodStart: z.string().trim().optional(),
  periodEnd: z.string().trim().optional(),
  facility: z.string().trim().max(200).optional().nullable(),
});

// GET /api/waste
router.get('/', async (req: Request, res: Response) => {
  try {
    const { wasteType, disposalMethod, page = '1', limit = '20' } = req.query;
    const skip =
      (Math.max(1, parseInt(page as string, 10) || 1) - 1) *
      Math.max(1, parseInt(limit as string, 10) || 20);
    const take = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);

    const where: Record<string, any> = { deletedAt: null };
    if (wasteType) where.wasteType = wasteType as string;
    if (disposalMethod) where.disposalMethod = disposalMethod as string;

    const [data, total] = await Promise.all([
      prisma.esgWaste.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.esgWaste.count({ where }),
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
    logger.error('Error listing waste', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list waste records' },
    });
  }
});

// POST /api/waste
router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = wasteCreateSchema.safeParse(req.body);
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
    const waste = await prisma.esgWaste.create({
      data: {
        wasteType: data.wasteType,
        quantity: new Prisma.Decimal(data.quantity),
        unit: data.unit,
        disposalMethod: data.disposalMethod,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        facility: data.facility || null,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: waste });
  } catch (error: unknown) {
    logger.error('Error creating waste record', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create waste record' },
    });
  }
});

// GET /api/waste/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const waste = await prisma.esgWaste.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!waste) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Waste record not found' } });
    }
    res.json({ success: true, data: waste });
  } catch (error: unknown) {
    logger.error('Error fetching waste record', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch waste record' },
    });
  }
});

// PUT /api/waste/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = wasteUpdateSchema.safeParse(req.body);
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

    const existing = await prisma.esgWaste.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Waste record not found' } });
    }

    const updateData: Record<string, any> = { ...parsed.data };
    if (updateData.quantity !== undefined)
      updateData.quantity = new Prisma.Decimal(updateData.quantity);
    if (updateData.periodStart) updateData.periodStart = new Date(updateData.periodStart);
    if (updateData.periodEnd) updateData.periodEnd = new Date(updateData.periodEnd);

    const waste = await prisma.esgWaste.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data: waste });
  } catch (error: unknown) {
    logger.error('Error updating waste record', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update waste record' },
    });
  }
});

// DELETE /api/waste/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.esgWaste.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Waste record not found' } });
    }

    await prisma.esgWaste.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Waste record deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Error deleting waste record', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete waste record' },
    });
  }
});

export default router;
