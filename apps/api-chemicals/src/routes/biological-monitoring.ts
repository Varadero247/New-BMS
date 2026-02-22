import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination } from '@ims/shared';

const logger = createLogger('api-chemicals');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// COSHH 2002 Regulation 14 — Monitoring Exposure at the Workplace (Biological Monitoring)

const bmSchema = z.object({
  employeeId: z.string().trim().min(1),
  employeeName: z.string().trim().min(1),
  department: z.string().trim().optional(),
  substanceName: z.string().trim().min(1),
  substanceCasNumber: z.string().trim().optional(),
  biomarker: z.string().trim().min(1),
  sampleType: z.enum(['BLOOD', 'URINE', 'EXHALED_AIR', 'SALIVA', 'HAIR', 'OTHER']),
  collectionDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  measuredValue: z.number().min(0),
  unit: z.string().trim().min(1),
  biologicalGuidanceValue: z.number().min(0).optional(),
  bgvSource: z.string().trim().optional(),
  exceedsBGV: z.boolean().optional(),
  laboratoryRef: z.string().trim().optional(),
  collectedBy: z.string().trim().min(1),
  investigationRequired: z.boolean().optional(),
  correctionActions: z.string().trim().optional(),
  nextMonitoringDue: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { substanceName, exceedsBGV } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (substanceName) where.substanceName = substanceName;
    if (exceedsBGV !== undefined) where.exceedsBGV = exceedsBGV === 'true';
    const [records, total] = await Promise.all([
      prisma.chemBiologicalMonitoring.findMany({ where, skip, take: limit, orderBy: { collectionDate: 'desc' } }),
      prisma.chemBiologicalMonitoring.count({ where }),
    ]);
    res.json({ success: true, data: records, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list biological monitoring records', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list records' } });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = bmSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    // Auto-calculate BGV exceedance if BGV provided
    const exceedsBGV = parsed.data.biologicalGuidanceValue !== undefined
      ? parsed.data.measuredValue > parsed.data.biologicalGuidanceValue
      : parsed.data.exceedsBGV;
    const record = await prisma.chemBiologicalMonitoring.create({
      data: {
        id: uuidv4(), ...parsed.data,
        exceedsBGV: exceedsBGV ?? false,
        collectionDate: new Date(parsed.data.collectionDate),
        nextMonitoringDue: parsed.data.nextMonitoringDue ? new Date(parsed.data.nextMonitoringDue) : undefined,
      },
    });
    if (exceedsBGV) {
      logger.warn('Biological monitoring — BGV exceeded', { employeeId: parsed.data.employeeId, substanceName: parsed.data.substanceName, measuredValue: parsed.data.measuredValue });
    }
    res.status(201).json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Failed to create biological monitoring record', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create record' } });
  }
});

router.get('/alerts', async (_req: Request, res: Response) => {
  try {
    const today = new Date();
    const [exceeding, overdueMonitoring] = await Promise.all([
      prisma.chemBiologicalMonitoring.findMany({ where: { deletedAt: null, exceedsBGV: true }, orderBy: { collectionDate: 'desc' }, take: 50 }),
      prisma.chemBiologicalMonitoring.findMany({ where: { deletedAt: null, nextMonitoringDue: { lt: today } }, orderBy: { nextMonitoringDue: 'asc' }, take: 50 }),
    ]);
    res.json({ success: true, data: { exceedingBGV: exceeding, overdueMonitoring } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get alerts' } });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const record = await prisma.chemBiologicalMonitoring.findUnique({ where: { id: req.params.id } });
    if (!record || record.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Record not found' } });
    res.json({ success: true, data: record });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get record' } });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.chemBiologicalMonitoring.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Record not found' } });
    const updateSchema = bmSchema.partial();
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    const { collectionDate, nextMonitoringDue, ...rest } = parsed.data;
    const updated = await prisma.chemBiologicalMonitoring.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(collectionDate ? { collectionDate: new Date(collectionDate) } : {}),
        ...(nextMonitoringDue ? { nextMonitoringDue: new Date(nextMonitoringDue) } : {}),
      },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update record' } });
  }
});

export default router;
