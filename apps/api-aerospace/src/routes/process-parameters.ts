import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination } from '@ims/shared';

const logger = createLogger('api-aerospace');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// AS9100D 8.5.1.2 — Special Process Parameter Records & Requalification Triggers
// Documents critical process parameters, limits, and records requalification trigger events

const processParamSchema = z.object({
  processName: z.string().trim().min(1),
  processNumber: z.string().trim().optional(),
  partNumber: z.string().trim().optional(),
  workOrderRef: z.string().trim().optional(),
  specialProcessRef: z.string().trim().optional(),
  operatorId: z.string().trim().min(1),
  operatorName: z.string().trim().min(1),
  processDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  parameters: z.array(z.object({
    name: z.string().trim().min(1),
    value: z.number(),
    unit: z.string().trim().optional(),
    minLimit: z.number().optional(),
    maxLimit: z.number().optional(),
    withinLimits: z.boolean().optional(),
  })).min(1),
  equipmentId: z.string().trim().optional(),
  equipmentLastCalibrated: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  processConforms: z.boolean().optional(),
  nonConformanceRef: z.string().trim().optional(),
  verifiedBy: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const requalificationSchema = z.object({
  processRef: z.string().trim().min(1),
  triggerType: z.enum([
    'EQUIPMENT_CHANGE', 'OPERATOR_CHANGE', 'MATERIAL_CHANGE', 'PROCESS_DEVIATION',
    'CUSTOMER_COMPLAINT', 'AUDIT_FINDING', 'PERIODIC_REQUALIFICATION', 'NADCAP_REQUIREMENT', 'OTHER',
  ]),
  triggerDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  description: z.string().trim().min(1),
  requiredByDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  assignedTo: z.string().trim().optional(),
  requalificationCompletedDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  requalificationResult: z.enum(['PASS', 'FAIL', 'CONDITIONAL_PASS', 'PENDING']).optional(),
  approvedBy: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

// ── Process Parameter Records ─────────────────────────────────────────────

router.get('/records', async (req: Request, res: Response) => {
  try {
    const { processName, processConforms } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (processName) where.processName = processName;
    if (processConforms !== undefined) where.processConforms = processConforms === 'true';
    const [records, total] = await Promise.all([
      prisma.aeroProcessParameterRecord.findMany({ where, skip, take: limit, orderBy: { processDate: 'desc' } }),
      prisma.aeroProcessParameterRecord.count({ where }),
    ]);
    res.json({ success: true, data: records, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list process parameter records', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list records' } });
  }
});

router.post('/records', async (req: Request, res: Response) => {
  try {
    const parsed = processParamSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    // Auto-calculate within-limits for each parameter
    const params = parsed.data.parameters.map((p) => ({
      ...p,
      withinLimits: p.withinLimits ?? (
        (p.minLimit === undefined || p.value >= p.minLimit) &&
        (p.maxLimit === undefined || p.value <= p.maxLimit)
      ),
    }));
    const allConform = params.every((p) => p.withinLimits !== false);
    const record = await prisma.aeroProcessParameterRecord.create({
      data: {
        id: uuidv4(), ...parsed.data,
        parameters: params as any,
        processConforms: parsed.data.processConforms ?? allConform,
        processDate: new Date(parsed.data.processDate),
        equipmentLastCalibrated: parsed.data.equipmentLastCalibrated ? new Date(parsed.data.equipmentLastCalibrated) : undefined,
      },
    });
    if (!allConform) {
      logger.warn('Process parameter out of limits', { processName: parsed.data.processName, workOrderRef: parsed.data.workOrderRef });
    }
    res.status(201).json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Failed to create process parameter record', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create record' } });
  }
});

router.get('/records/:id', async (req: Request, res: Response) => {
  try {
    const record = await prisma.aeroProcessParameterRecord.findUnique({ where: { id: req.params.id } });
    if (!record || record.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Record not found' } });
    res.json({ success: true, data: record });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get record' } });
  }
});

// ── Requalification Triggers ──────────────────────────────────────────────

router.get('/requalification', async (req: Request, res: Response) => {
  try {
    const { triggerType, status } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (triggerType) where.triggerType = triggerType;
    if (status) where.status = status;
    const [triggers, total] = await Promise.all([
      prisma.aeroRequalificationTrigger.findMany({ where, skip, take: limit, orderBy: { triggerDate: 'desc' } }),
      prisma.aeroRequalificationTrigger.count({ where }),
    ]);
    res.json({ success: true, data: triggers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list requalification triggers' } });
  }
});

router.post('/requalification', async (req: Request, res: Response) => {
  try {
    const parsed = requalificationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const trigger = await prisma.aeroRequalificationTrigger.create({
      data: {
        id: uuidv4(), ...parsed.data,
        triggerDate: new Date(parsed.data.triggerDate),
        requiredByDate: parsed.data.requiredByDate ? new Date(parsed.data.requiredByDate) : undefined,
        requalificationCompletedDate: parsed.data.requalificationCompletedDate ? new Date(parsed.data.requalificationCompletedDate) : undefined,
        status: 'OPEN',
      },
    });
    logger.info('Requalification trigger created', { processRef: parsed.data.processRef, triggerType: parsed.data.triggerType });
    res.status(201).json({ success: true, data: trigger });
  } catch (error: unknown) {
    logger.error('Failed to create requalification trigger', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create requalification trigger' } });
  }
});

router.put('/requalification/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.aeroRequalificationTrigger.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Trigger not found' } });
    const updateSchema = requalificationSchema.partial().extend({
      status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED', 'WAIVED']).optional(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    const { triggerDate, requiredByDate, requalificationCompletedDate, ...rest } = parsed.data;
    const updated = await prisma.aeroRequalificationTrigger.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(triggerDate ? { triggerDate: new Date(triggerDate) } : {}),
        ...(requiredByDate ? { requiredByDate: new Date(requiredByDate) } : {}),
        ...(requalificationCompletedDate ? { requalificationCompletedDate: new Date(requalificationCompletedDate) } : {}),
      },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update trigger' } });
  }
});

export default router;
