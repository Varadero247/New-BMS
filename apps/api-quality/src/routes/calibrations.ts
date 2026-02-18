import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-quality');
const router: Router = Router();
router.use(authenticate);

async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'QMS-CAL';
  const count = await prisma.qualCalibration.count({
    where: { referenceNumber: { startsWith: `${prefix}-${year}` } },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
}

const createSchema = z.object({
  equipmentName: z.string().min(1).max(300),
  equipmentId: z.string().max(100).optional().nullable(),
  manufacturer: z.string().max(200).optional().nullable(),
  modelNumber: z.string().max(200).optional().nullable(),
  serialNumber: z.string().max(200).optional().nullable(),
  location: z.string().max(300).optional().nullable(),
  calibrationMethod: z.string().max(2000).optional().nullable(),
  standardUsed: z.string().max(500).optional().nullable(),
  acceptanceCriteria: z.string().max(2000).optional().nullable(),
  calibrationFrequency: z.string().max(100).optional().nullable(),
  lastCalibrationDate: z.string().optional().nullable(),
  nextCalibrationDate: z.string().optional().nullable(),
  calibratedBy: z.string().max(200).optional().nullable(),
  certificateNumber: z.string().max(200).optional().nullable(),
  results: z.string().max(5000).optional().nullable(),
  deviation: z.string().max(2000).optional().nullable(),
  adjustments: z.string().max(2000).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

const updateSchema = createSchema.partial();

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// GET / — List calibrations
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status && typeof status === 'string') where.status = status;
    if (search && typeof search === 'string') {
      where.OR = [
        { equipmentName: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.qualCalibration.findMany({ where, skip, take: limit, orderBy: { nextCalibrationDate: 'asc' } }),
      prisma.qualCalibration.count({ where }),
    ]);

    res.json({ success: true, data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list calibrations', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list calibrations' } });
  }
});

// POST / — Create calibration record
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const authReq = req as AuthRequest;
    const referenceNumber = await generateRefNumber();

    const item = await prisma.qualCalibration.create({
      data: {
        referenceNumber,
        ...parsed.data,
        lastCalibrationDate: parsed.data.lastCalibrationDate ? new Date(parsed.data.lastCalibrationDate) : null,
        nextCalibrationDate: parsed.data.nextCalibrationDate ? new Date(parsed.data.nextCalibrationDate) : null,
        status: 'CURRENT',
        organisationId: (authReq.user as any)?.organisationId || 'default',
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to create calibration', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create calibration' } });
  }
});

// GET /:id — Get calibration by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.qualCalibration.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Calibration not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to get calibration', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get calibration' } });
  }
});

// PUT /:id — Update calibration
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const existing = await prisma.qualCalibration.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Calibration not found' } });

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.lastCalibrationDate) data.lastCalibrationDate = new Date(parsed.data.lastCalibrationDate);
    if (parsed.data.nextCalibrationDate) data.nextCalibrationDate = new Date(parsed.data.nextCalibrationDate);

    const item = await prisma.qualCalibration.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to update calibration', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update calibration' } });
  }
});

// DELETE /:id — Soft delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.qualCalibration.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Calibration not found' } });

    await prisma.qualCalibration.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { id: req.params.id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete calibration', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete calibration' } });
  }
});

export default router;
