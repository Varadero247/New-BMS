import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { z } from 'zod';

const logger = createLogger('api-infosec');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

async function generateAssetRef(): Promise<string> {
  const count = await prisma.isAsset.count();
  const seq = (count + 1).toString().padStart(4, '0');
  return `IA-${seq}`;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const assetCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  type: z.enum(['HARDWARE', 'SOFTWARE', 'DATA', 'PERSONNEL', 'SERVICE', 'FACILITY', 'NETWORK', 'OTHER']),
  classification: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']),
  description: z.string().max(2000).optional(),
  owner: z.string().max(200).optional(),
  custodian: z.string().max(200).optional(),
  location: z.string().max(500).optional(),
  value: z.number().optional(),
  riskLevel: z.enum(['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

const assetUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  type: z.enum(['HARDWARE', 'SOFTWARE', 'DATA', 'PERSONNEL', 'SERVICE', 'FACILITY', 'NETWORK', 'OTHER']).optional(),
  classification: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']).optional(),
  description: z.string().max(2000).optional(),
  owner: z.string().max(200).optional(),
  custodian: z.string().max(200).optional(),
  location: z.string().max(500).optional(),
  value: z.number().optional(),
  riskLevel: z.enum(['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISPOSED', 'UNDER_REVIEW']).optional(),
});

// ---------------------------------------------------------------------------
// POST / — Create information asset
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = assetCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }

    const authReq = req as AuthRequest;
    const refNumber = await generateAssetRef();

    const asset = await prisma.isAsset.create({
      data: {
        refNumber,
        name: parsed.data.name,
        type: parsed.data.type as any,
        classification: parsed.data.classification as any,
        description: parsed.data.description || null,
        owner: parsed.data.owner || null,
        custodian: parsed.data.custodian || null,
        location: parsed.data.location || null,
        value: parsed.data.value || null,
        riskLevel: parsed.data.riskLevel || null,
        status: 'ACTIVE',
        createdBy: authReq.user?.id || 'system',
      } as any,
    });

    logger.info('Information asset created', { assetId: asset.id, refNumber });
    res.status(201).json({ success: true, data: asset });
  } catch (error: unknown) {
    logger.error('Failed to create information asset', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create information asset' } });
  }
});

// ---------------------------------------------------------------------------
// GET / — List assets with filters
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, classification, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (type && typeof type === 'string') {
      where.type = type;
    }
    if (classification && typeof classification === 'string') {
      where.classification = classification;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { refNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [assets, total] = await Promise.all([
      prisma.isAsset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.isAsset.count({ where }),
    ]);

    res.json({
      success: true,
      data: assets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list information assets', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list information assets' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Asset detail
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const asset = await prisma.isAsset.findFirst({
      where: { id, deletedAt: null } as any,
    });

    if (!asset) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Information asset not found' } });
    }

    res.json({ success: true, data: asset });
  } catch (error: unknown) {
    logger.error('Failed to get information asset', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get information asset' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update asset
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = assetUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }

    const existing = await prisma.isAsset.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Information asset not found' } });
    }

    const authReq = req as AuthRequest;
    const asset = await prisma.isAsset.update({
      where: { id },
      data: {
        ...parsed.data,
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      } as any,
    });

    logger.info('Information asset updated', { assetId: id });
    res.json({ success: true, data: asset });
  } catch (error: unknown) {
    logger.error('Failed to update information asset', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update information asset' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.isAsset.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Information asset not found' } });
    }

    const authReq = req as AuthRequest;
    await prisma.isAsset.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: authReq.user?.id || 'system',
      } as any,
    });

    logger.info('Information asset soft-deleted', { assetId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete information asset', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete information asset' } });
  }
});

export default router;
