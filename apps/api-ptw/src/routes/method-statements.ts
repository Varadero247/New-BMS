// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { prisma } from '../prisma';

const router = Router();
router.param('id', validateIdParam());
const logger = createLogger('ptw-method-statements');

const createSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  permitId: z.string().trim().optional(),
  steps: z.string().trim().optional(),
  hazards: z.string().trim().optional(),
  controls: z.string().trim().optional(),
  ppe: z.string().trim().optional(),
  approvedBy: z.string().trim().optional(),
  approvedAt: z.string().trim().optional(),
  version: z.number().int().optional(),
});

const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const y = new Date().getFullYear();
  const c = await prisma.ptwMethodStatement.count({
    where: { orgId, referenceNumber: { startsWith: `PMS-${y}` } },
  });
  return `PMS-${y}-${String(c + 1).padStart(4, '0')}`;
}

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId, deletedAt: null };
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: 'insensitive' };
    const skip =
      (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20);
    const [data, total] = await Promise.all([
      prisma.ptwMethodStatement.findMany({
        where,
        skip,
        take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.ptwMethodStatement.count({ where }),
    ]);
    res.json({
      success: true,
      data,
      pagination: {
        page: Math.max(1, parseInt(page, 10) || 1),
        limit: Math.max(1, parseInt(limit, 10) || 20),
        total,
        totalPages: Math.ceil(total / Math.max(1, parseInt(limit, 10) || 20)),
      },
    });
  } catch (error: unknown) {
    logger.error('Fetch failed', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch method statements' },
    });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const item = await prisma.ptwMethodStatement.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null },
    });
    if (!item)
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'method statement not found' },
      });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch method statement' },
    });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const referenceNumber = await generateRef(orgId);
    const { title, permitId, steps, hazards, controls, ppe, approvedBy, approvedAt, version } =
      parsed.data;
    const data = await prisma.ptwMethodStatement.create({
      data: {
        title,
        permitId,
        steps,
        hazards,
        controls,
        ppe,
        approvedBy,
        approvedAt: approvedAt ? new Date(approvedAt) : undefined,
        version,
        orgId,
        referenceNumber,
        createdBy: (req as AuthRequest).user?.id,
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' },
    });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.ptwMethodStatement.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null },
    });
    if (!existing)
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'method statement not found' },
      });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const { title, permitId, steps, hazards, controls, ppe, approvedBy, approvedAt, version } =
      parsed.data;
    const updateData: Record<string, unknown> = { updatedBy: (req as AuthRequest).user?.id };
    if (title !== undefined) updateData.title = title;
    if (permitId !== undefined) updateData.permitId = permitId;
    if (steps !== undefined) updateData.steps = steps;
    if (hazards !== undefined) updateData.hazards = hazards;
    if (controls !== undefined) updateData.controls = controls;
    if (ppe !== undefined) updateData.ppe = ppe;
    if (approvedBy !== undefined) updateData.approvedBy = approvedBy;
    if (approvedAt !== undefined) updateData.approvedAt = new Date(approvedAt);
    if (version !== undefined) updateData.version = version;
    const data = await prisma.ptwMethodStatement.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' },
    });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.ptwMethodStatement.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null },
    });
    if (!existing)
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'method statement not found' },
      });
    await prisma.ptwMethodStatement.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id },
    });
    res.json({ success: true, data: { message: 'method statement deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete resource' },
    });
  }
});

export default router;
