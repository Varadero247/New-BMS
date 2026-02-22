import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { z } from 'zod';
const uuidv4 = () => crypto.randomUUID();
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination } from '@ims/shared';

const logger = createLogger('api-chemicals');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// COSHH 2002 Regulation 18 — Fumigations
// Fumigations require: written plan, notification of HSE before fumigation,
// gas-free certificate after fumigation, neighbour notification, competent persons only

const fumigationSchema = z.object({
  location: z.string().trim().min(1),
  purpose: z.string().trim().min(1),
  fumigantName: z.string().trim().min(1),
  fumigantCasNumber: z.string().trim().optional(),
  estimatedQuantityKg: z.number().positive().optional(),
  plannedStartDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  plannedEndDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  competentPersonName: z.string().trim().min(1),
  competentPersonCertRef: z.string().trim().optional(),
  contractorCompany: z.string().trim().optional(),
  hseNotificationRef: z.string().trim().optional(),
  hseNotificationDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  neighboursNotified: z.boolean().optional(),
  neighbourNotificationDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  gasClearanceConcentrationPpm: z.number().min(0).optional(),
  gasFreeDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  gasFreeIssuedBy: z.string().trim().optional(),
  gasFreeRefNumber: z.string().trim().optional(),
  emergencyProceduresDocRef: z.string().trim().optional(),
  ppeRequired: z.array(z.string()).optional(),
  preEntryChecksComplete: z.boolean().optional(),
  notes: z.string().trim().optional(),
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    const [fumigations, total] = await Promise.all([
      prisma.chemFumigation.findMany({ where, skip, take: limit, orderBy: { plannedStartDate: 'desc' } }),
      prisma.chemFumigation.count({ where }),
    ]);
    res.json({ success: true, data: fumigations, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list fumigations', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list fumigations' } });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = fumigationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const fumigation = await prisma.chemFumigation.create({
      data: {
        id: uuidv4(), ...parsed.data,
        plannedStartDate: new Date(parsed.data.plannedStartDate),
        plannedEndDate: parsed.data.plannedEndDate ? new Date(parsed.data.plannedEndDate) : undefined,
        hseNotificationDate: parsed.data.hseNotificationDate ? new Date(parsed.data.hseNotificationDate) : undefined,
        neighbourNotificationDate: parsed.data.neighbourNotificationDate ? new Date(parsed.data.neighbourNotificationDate) : undefined,
        gasFreeDate: parsed.data.gasFreeDate ? new Date(parsed.data.gasFreeDate) : undefined,
        status: 'PLANNED',
      },
    });
    logger.info('Fumigation planned', { location: parsed.data.location, fumigant: parsed.data.fumigantName });
    res.status(201).json({ success: true, data: fumigation });
  } catch (error: unknown) {
    logger.error('Failed to create fumigation', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create fumigation' } });
  }
});

// PUT /:id/notify-hse — record HSE notification (required BEFORE fumigation starts)
router.put('/:id/notify-hse', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.chemFumigation.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Fumigation not found' } });
    const schema = z.object({
      hseNotificationRef: z.string().trim().min(1),
      hseNotificationDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'hseNotificationRef and date required' } });
    const updated = await prisma.chemFumigation.update({
      where: { id: req.params.id },
      data: {
        hseNotificationRef: parsed.data.hseNotificationRef,
        hseNotificationDate: new Date(parsed.data.hseNotificationDate),
        status: 'HSE_NOTIFIED',
      },
    });
    logger.info('HSE notified for fumigation', { id: req.params.id, ref: parsed.data.hseNotificationRef });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to record HSE notification' } });
  }
});

// PUT /:id/gas-free — issue gas-free certificate (required BEFORE re-entry)
router.put('/:id/gas-free', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.chemFumigation.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Fumigation not found' } });
    const schema = z.object({
      gasFreeDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
      gasFreeIssuedBy: z.string().trim().min(1),
      gasFreeRefNumber: z.string().trim().optional(),
      gasClearanceConcentrationPpm: z.number().min(0).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Gas-free date and issuer required' } });
    const updated = await prisma.chemFumigation.update({
      where: { id: req.params.id },
      data: {
        ...parsed.data,
        gasFreeDate: new Date(parsed.data.gasFreeDate),
        status: 'GAS_FREE_CERTIFIED',
      },
    });
    logger.info('Gas-free certificate issued', { id: req.params.id, issuedBy: parsed.data.gasFreeIssuedBy });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to issue gas-free certificate' } });
  }
});

// PUT /:id — general update
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.chemFumigation.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Fumigation not found' } });
    const updateSchema = fumigationSchema.partial().extend({
      status: z.enum(['PLANNED', 'HSE_NOTIFIED', 'IN_PROGRESS', 'GAS_FREE_CERTIFIED', 'COMPLETED', 'CANCELLED']).optional(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    const { plannedStartDate, plannedEndDate, hseNotificationDate, neighbourNotificationDate, gasFreeDate, ...rest } = parsed.data;
    const updated = await prisma.chemFumigation.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(plannedStartDate ? { plannedStartDate: new Date(plannedStartDate) } : {}),
        ...(plannedEndDate ? { plannedEndDate: new Date(plannedEndDate) } : {}),
        ...(hseNotificationDate ? { hseNotificationDate: new Date(hseNotificationDate) } : {}),
        ...(neighbourNotificationDate ? { neighbourNotificationDate: new Date(neighbourNotificationDate) } : {}),
        ...(gasFreeDate ? { gasFreeDate: new Date(gasFreeDate) } : {}),
      },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update fumigation' } });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const fumigation = await prisma.chemFumigation.findUnique({ where: { id: req.params.id } });
    if (!fumigation || fumigation.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Fumigation not found' } });
    res.json({ success: true, data: fumigation });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get fumigation' } });
  }
});

export default router;
