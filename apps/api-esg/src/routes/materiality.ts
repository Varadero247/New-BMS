import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-esg');
const router: Router = Router();
router.use(authenticate);

function generateReference(prefix: string): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `ESG-${prefix}-${yy}${mm}-${rand}`;
}

const materialityCreateSchema = z.object({
  topic: z.string().trim().min(1).max(300),
  category: z.enum(['ENVIRONMENTAL', 'SOCIAL', 'GOVERNANCE']),
  importanceToStakeholders: z.number().min(0).max(10),
  importanceToBusiness: z.number().min(0).max(10),
  isMaterial: z.boolean().optional(),
  description: z.string().max(2000).optional().nullable(),
});

const materialityUpdateSchema = z.object({
  topic: z.string().trim().min(1).max(300).optional(),
  category: z.enum(['ENVIRONMENTAL', 'SOCIAL', 'GOVERNANCE']).optional(),
  importanceToStakeholders: z.number().min(0).max(10).optional(),
  importanceToBusiness: z.number().min(0).max(10).optional(),
  isMaterial: z.boolean().optional(),
  description: z.string().max(2000).optional().nullable(),
});

const RESERVED_PATHS = new Set(['matrix']);

// GET /api/materiality/matrix
router.get('/matrix', async (req: Request, res: Response) => {
  try {
    const topics = await prisma.esgMateriality.findMany({
      where: { deletedAt: null } as any,
      orderBy: { importanceToStakeholders: 'desc' },
      take: 500,
    });

    const matrix = topics.map((t: Record<string, any>) => ({
      id: t.id,
      topic: t.topic,
      category: t.category,
      x: Number(t.importanceToBusiness),
      y: Number(t.importanceToStakeholders),
      isMaterial: t.isMaterial,
    }));

    const materialTopics = matrix.filter((m: Record<string, any>) => m.isMaterial);
    const nonMaterialTopics = matrix.filter((m: Record<string, any>) => !m.isMaterial);

    res.json({
      success: true,
      data: {
        matrix,
        summary: {
          total: matrix.length,
          material: materialTopics.length,
          nonMaterial: nonMaterialTopics.length,
          byCategory: {
            ENVIRONMENTAL: matrix.filter((m: Record<string, any>) => m.category === 'ENVIRONMENTAL')
              .length,
            SOCIAL: matrix.filter((m: Record<string, any>) => m.category === 'SOCIAL').length,
            GOVERNANCE: matrix.filter((m: Record<string, any>) => m.category === 'GOVERNANCE')
              .length,
          },
        },
      },
    });
  } catch (error: unknown) {
    logger.error('Error fetching materiality matrix', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch materiality matrix' },
    });
  }
});

// GET /api/materiality
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, isMaterial, page = '1', limit = '20' } = req.query;
    const skip =
      (Math.max(1, parseInt(page as string, 10) || 1) - 1) *
      Math.max(1, parseInt(limit as string, 10) || 20);
    const take = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);

    const where: Record<string, any> = { deletedAt: null };
    if (category) where.category = category as string;
    if (isMaterial !== undefined) where.isMaterial = isMaterial === 'true';

    const [data, total] = await Promise.all([
      prisma.esgMateriality.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.esgMateriality.count({ where }),
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
    logger.error('Error listing materiality topics', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list materiality topics' },
    });
  }
});

// POST /api/materiality
router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = materialityCreateSchema.safeParse(req.body);
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
    const materiality = await prisma.esgMateriality.create({
      data: {
        topic: data.topic,
        category: data.category,
        importanceToStakeholders: new Prisma.Decimal(data.importanceToStakeholders),
        importanceToBusiness: new Prisma.Decimal(data.importanceToBusiness),
        isMaterial: data.isMaterial || false,
        description: data.description || null,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: materiality });
  } catch (error: unknown) {
    logger.error('Error creating materiality topic', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create materiality topic' },
    });
  }
});

// GET /api/materiality/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (RESERVED_PATHS.has(req.params.id)) return (res as any).next('route');
    const materiality = await prisma.esgMateriality.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!materiality) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Materiality topic not found' },
      });
    }
    res.json({ success: true, data: materiality });
  } catch (error: unknown) {
    logger.error('Error fetching materiality topic', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch materiality topic' },
    });
  }
});

// PUT /api/materiality/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = materialityUpdateSchema.safeParse(req.body);
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

    const existing = await prisma.esgMateriality.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Materiality topic not found' },
      });
    }

    const updateData: Record<string, any> = { ...parsed.data };
    if (updateData.importanceToStakeholders !== undefined)
      updateData.importanceToStakeholders = new Prisma.Decimal(updateData.importanceToStakeholders);
    if (updateData.importanceToBusiness !== undefined)
      updateData.importanceToBusiness = new Prisma.Decimal(updateData.importanceToBusiness);

    const materiality = await prisma.esgMateriality.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json({ success: true, data: materiality });
  } catch (error: unknown) {
    logger.error('Error updating materiality topic', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update materiality topic' },
    });
  }
});

// DELETE /api/materiality/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.esgMateriality.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Materiality topic not found' },
      });
    }

    await prisma.esgMateriality.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, data: { message: 'Materiality topic deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Error deleting materiality topic', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete materiality topic' },
    });
  }
});

export default router;
