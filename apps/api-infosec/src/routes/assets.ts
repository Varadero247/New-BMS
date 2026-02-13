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

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

async function generateAssetRef(): Promise<string> {
  const count = await prisma.infoAsset.count();
  const seq = (count + 1).toString().padStart(4, '0');
  return `IA-${seq}`;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const assetCreateSchema = z.object({
  name: z.string().min(1).max(200),
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
  name: z.string().min(1).max(200).optional(),
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
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const authReq = req as AuthRequest;
    const refNumber = await generateAssetRef();

    const asset = await prisma.infoAsset.create({
      data: {
        refNumber,
        name: parsed.data.name,
        type: parsed.data.type,
        classification: parsed.data.classification,
        description: parsed.data.description || null,
        owner: parsed.data.owner || null,
        custodian: parsed.data.custodian || null,
        location: parsed.data.location || null,
        value: parsed.data.value || null,
        riskLevel: parsed.data.riskLevel || null,
        status: 'ACTIVE',
        createdBy: authReq.user?.id || 'system',
      },
    });

    logger.info('Information asset created', { assetId: asset.id, refNumber });
    res.status(201).json({ success: true, data: asset });
  } catch (error: any) {
    logger.error('Failed to create information asset', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to create information asset' });
  }
});

// ---------------------------------------------------------------------------
// GET / — List assets with filters
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, classification, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

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
      prisma.infoAsset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.infoAsset.count({ where }),
    ]);

    res.json({
      success: true,
      data: assets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    logger.error('Failed to list information assets', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to list information assets' });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Asset detail
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const asset = await prisma.infoAsset.findFirst({
      where: { id, deletedAt: null },
    });

    if (!asset) {
      return res.status(404).json({ success: false, error: 'Information asset not found' });
    }

    res.json({ success: true, data: asset });
  } catch (error: any) {
    logger.error('Failed to get information asset', { error: error.message, id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to get information asset' });
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
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const existing = await prisma.infoAsset.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Information asset not found' });
    }

    const authReq = req as AuthRequest;
    const asset = await prisma.infoAsset.update({
      where: { id },
      data: {
        ...parsed.data,
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      },
    });

    logger.info('Information asset updated', { assetId: id });
    res.json({ success: true, data: asset });
  } catch (error: any) {
    logger.error('Failed to update information asset', { error: error.message, id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to update information asset' });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.infoAsset.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Information asset not found' });
    }

    const authReq = req as AuthRequest;
    await prisma.infoAsset.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: authReq.user?.id || 'system',
      },
    });

    logger.info('Information asset soft-deleted', { assetId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: any) {
    logger.error('Failed to delete information asset', { error: error.message, id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to delete information asset' });
  }
});

export default router;
