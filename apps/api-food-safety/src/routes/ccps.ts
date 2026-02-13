import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-food-safety');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const ccpCreateSchema = z.object({
  name: z.string().min(1).max(200),
  processStep: z.string().min(1).max(200),
  hazardId: z.string().uuid().optional().nullable(),
  criticalLimit: z.string().min(1).max(500),
  monitoringMethod: z.string().min(1).max(500),
  monitoringFrequency: z.enum(['CONTINUOUS', 'HOURLY', 'PER_BATCH', 'DAILY', 'WEEKLY']),
  correctiveAction: z.string().max(2000).optional().nullable(),
  verificationMethod: z.string().max(500).optional().nullable(),
  recordKeeping: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

const ccpUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  processStep: z.string().min(1).max(200).optional(),
  hazardId: z.string().uuid().optional().nullable(),
  criticalLimit: z.string().min(1).max(500).optional(),
  monitoringMethod: z.string().min(1).max(500).optional(),
  monitoringFrequency: z.enum(['CONTINUOUS', 'HOURLY', 'PER_BATCH', 'DAILY', 'WEEKLY']).optional(),
  correctiveAction: z.string().max(2000).optional().nullable(),
  verificationMethod: z.string().max(500).optional().nullable(),
  recordKeeping: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

const monitoringRecordCreateSchema = z.object({
  monitoredBy: z.string().max(200).optional().nullable(),
  monitoredAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  value: z.string().min(1).max(200),
  unit: z.string().max(50).optional().nullable(),
  withinLimits: z.boolean(),
  deviation: z.string().max(2000).optional().nullable(),
  correctiveActionTaken: z.string().max(2000).optional().nullable(),
  verifiedBy: z.string().max(200).optional().nullable(),
  verifiedAt: z.string().datetime({ offset: true }).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

async function generateCcpNumber(): Promise<string> {
  const count = await prisma.fsCcp.count();
  return `CCP-${String(count + 1).padStart(3, '0')}`;
}

// ---------------------------------------------------------------------------
// GET /api/ccps
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { isActive } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [data, total] = await Promise.all([
      prisma.fsCcp.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { hazard: true } }),
      prisma.fsCcp.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    logger.error('Error listing CCPs', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list CCPs' } });
  }
});

// ---------------------------------------------------------------------------
// POST /api/ccps
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = ccpCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const body = parsed.data;
    const number = await generateCcpNumber();
    const user = (req as AuthRequest).user;

    const ccp = await prisma.fsCcp.create({
      data: {
        ...body,
        number,
        createdBy: user?.id || 'system',
      },
    });

    logger.info('CCP created', { id: ccp.id, number });
    res.status(201).json({ success: true, data: ccp });
  } catch (error: any) {
    logger.error('Error creating CCP', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create CCP' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/ccps/:id
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const RESERVED = new Set(['monitoring-records']);
    if (RESERVED.has(req.params.id)) return (undefined as any);

    const ccp = await prisma.fsCcp.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { hazard: true, monitoringRecords: { where: { deletedAt: null }, orderBy: { monitoredAt: 'desc' }, take: 20 } },
    });

    if (!ccp) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CCP not found' } });
    }

    res.json({ success: true, data: ccp });
  } catch (error: any) {
    logger.error('Error fetching CCP', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch CCP' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/ccps/:id
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsCcp.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CCP not found' } });
    }

    const parsed = ccpUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const ccp = await prisma.fsCcp.update({
      where: { id: req.params.id },
      data: parsed.data,
    });

    logger.info('CCP updated', { id: ccp.id });
    res.json({ success: true, data: ccp });
  } catch (error: any) {
    logger.error('Error updating CCP', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update CCP' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/ccps/:id
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsCcp.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CCP not found' } });
    }

    await prisma.fsCcp.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    logger.info('CCP deleted', { id: req.params.id });
    res.json({ success: true, data: { message: 'CCP deleted successfully' } });
  } catch (error: any) {
    logger.error('Error deleting CCP', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete CCP' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/ccps/:id/monitoring-records
// ---------------------------------------------------------------------------
router.get('/:id/monitoring-records', async (req: Request, res: Response) => {
  try {
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const ccp = await prisma.fsCcp.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!ccp) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CCP not found' } });
    }

    const where: any = { ccpId: req.params.id, deletedAt: null };

    const [data, total] = await Promise.all([
      prisma.fsMonitoringRecord.findMany({ where, skip, take: limit, orderBy: { monitoredAt: 'desc' } }),
      prisma.fsMonitoringRecord.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    logger.error('Error fetching monitoring records', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch monitoring records' } });
  }
});

// ---------------------------------------------------------------------------
// POST /api/ccps/:id/monitoring-records
// ---------------------------------------------------------------------------
router.post('/:id/monitoring-records', async (req: Request, res: Response) => {
  try {
    const ccp = await prisma.fsCcp.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!ccp) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CCP not found' } });
    }

    const parsed = monitoringRecordCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const body = parsed.data;
    const user = (req as AuthRequest).user;

    const record = await prisma.fsMonitoringRecord.create({
      data: {
        ...body,
        monitoredAt: new Date(body.monitoredAt),
        verifiedAt: body.verifiedAt ? new Date(body.verifiedAt) : null,
        ccpId: req.params.id,
        createdBy: user?.id || 'system',
      },
    });

    logger.info('Monitoring record created for CCP', { id: record.id, ccpId: req.params.id });
    res.status(201).json({ success: true, data: record });
  } catch (error: any) {
    logger.error('Error creating monitoring record', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create monitoring record' } });
  }
});

export default router;
