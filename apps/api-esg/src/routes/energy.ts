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


const energyCreateSchema = z.object({
  energyType: z.enum(['ELECTRICITY', 'NATURAL_GAS', 'SOLAR', 'WIND', 'DIESEL', 'OTHER']),
  quantity: z.number().positive(),
  unit: z.string().trim().min(1).max(50),
  renewable: z.boolean().optional(),
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
  cost: z.number().min(0).optional().nullable(),
});

const energyUpdateSchema = z.object({
  energyType: z.enum(['ELECTRICITY', 'NATURAL_GAS', 'SOLAR', 'WIND', 'DIESEL', 'OTHER']).optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().trim().min(1).max(50).optional(),
  renewable: z.boolean().optional(),
  periodStart: z.string().trim().optional(),
  periodEnd: z.string().trim().optional(),
  facility: z.string().trim().max(200).optional().nullable(),
  cost: z.number().min(0).optional().nullable(),
});

// GET /api/energy
router.get('/', async (req: Request, res: Response) => {
  try {
    const { energyType, renewable, page = '1', limit = '20' } = req.query;
    const skip =
      (Math.max(1, parseInt(page as string, 10) || 1) - 1) *
      Math.max(1, parseInt(limit as string, 10) || 20);
    const take = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);

    const where: Record<string, any> = { deletedAt: null };
    if (energyType) where.energyType = energyType as string;
    if (renewable !== undefined) where.renewable = renewable === 'true';

    const [data, total] = await Promise.all([
      prisma.esgEnergy.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.esgEnergy.count({ where }),
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
    logger.error('Error listing energy records', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list energy records' },
    });
  }
});

// POST /api/energy
router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = energyCreateSchema.safeParse(req.body);
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
    const energy = await prisma.esgEnergy.create({
      data: {
        energyType: data.energyType,
        quantity: new Prisma.Decimal(data.quantity),
        unit: data.unit,
        renewable: data.renewable || false,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        facility: data.facility || null,
        cost: data.cost != null ? new Prisma.Decimal(data.cost) : null,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: energy });
  } catch (error: unknown) {
    logger.error('Error creating energy record', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create energy record' },
    });
  }
});

// GET /api/energy/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const energy = await prisma.esgEnergy.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!energy) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Energy record not found' } });
    }
    res.json({ success: true, data: energy });
  } catch (error: unknown) {
    logger.error('Error fetching energy record', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch energy record' },
    });
  }
});

// PUT /api/energy/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = energyUpdateSchema.safeParse(req.body);
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

    const existing = await prisma.esgEnergy.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Energy record not found' } });
    }

    const updateData: Record<string, any> = { ...parsed.data };
    if (updateData.quantity !== undefined)
      updateData.quantity = new Prisma.Decimal(updateData.quantity);
    if (updateData.cost !== undefined)
      updateData.cost = updateData.cost !== null ? new Prisma.Decimal(updateData.cost) : null;
    if (updateData.periodStart) updateData.periodStart = new Date(updateData.periodStart);
    if (updateData.periodEnd) updateData.periodEnd = new Date(updateData.periodEnd);

    const energy = await prisma.esgEnergy.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json({ success: true, data: energy });
  } catch (error: unknown) {
    logger.error('Error updating energy record', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update energy record' },
    });
  }
});

// DELETE /api/energy/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.esgEnergy.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Energy record not found' } });
    }

    await prisma.esgEnergy.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, data: { message: 'Energy record deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Error deleting energy record', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete energy record' },
    });
  }
});

export default router;
