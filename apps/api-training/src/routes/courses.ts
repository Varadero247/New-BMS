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
const logger = createLogger('training-courses');

const createSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().optional(),
  type: z.enum(['MANDATORY', 'OPTIONAL', 'REFRESHER', 'INDUCTION', 'CERTIFICATION', 'COMPETENCY']),
  delivery: z
    .enum(['CLASSROOM', 'ONLINE', 'ON_THE_JOB', 'BLENDED', 'SELF_PACED', 'WORKSHOP'])
    .optional(),
  duration: z.number().int().optional(),
  validityMonths: z.number().int().optional(),
  provider: z.string().trim().optional(),
  cost: z.number().nonnegative().optional(),
  maxParticipants: z.number().int().optional(),
  prerequisites: z.string().trim().optional(),
  objectives: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});
const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const y = new Date().getFullYear();
  const c = await prisma.trainCourse.count({
    where: { orgId, referenceNumber: { startsWith: `CRS-${y}` } },
  });
  return `CRS-${y}-${String(c + 1).padStart(4, '0')}`;
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
      prisma.trainCourse.findMany({
        where,
        skip,
        take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.trainCourse.count({ where }),
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
    logger.error('Failed to fetch', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch courses' },
    });
  }
});
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const item = await prisma.trainCourse.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null },
    });
    if (!item)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'course not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to process request', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch course' },
    });
  }
});
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const referenceNumber = await generateRef(orgId);
    const code = referenceNumber;
    const {
      title,
      description,
      type,
      delivery,
      duration,
      validityMonths,
      provider,
      cost,
      maxParticipants,
      prerequisites,
      objectives,
      isActive,
    } = parsed.data;
    const data = await prisma.trainCourse.create({
      data: {
        title,
        description,
        type,
        delivery,
        duration,
        validityMonths,
        provider,
        cost,
        maxParticipants,
        prerequisites,
        objectives,
        isActive,
        orgId,
        referenceNumber,
        code,
        createdBy: (req as AuthRequest).user?.id,
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' },
    });
  }
});
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.trainCourse.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'course not found' } });
    const {
      title,
      description,
      type,
      delivery,
      duration,
      validityMonths,
      provider,
      cost,
      maxParticipants,
      prerequisites,
      objectives,
      isActive,
    } = parsed.data;
    const data = await prisma.trainCourse.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        type,
        delivery,
        duration,
        validityMonths,
        provider,
        cost,
        maxParticipants,
        prerequisites,
        objectives,
        isActive,
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to process request', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.trainCourse.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'course not found' } });
    await prisma.trainCourse.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id },
    });
    res.json({ success: true, data: { message: 'course deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to process request', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});
export default router;
