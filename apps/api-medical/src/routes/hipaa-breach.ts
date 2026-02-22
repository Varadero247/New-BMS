import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination } from '@ims/shared';

const logger = createLogger('api-medical');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

async function generateBreachRef(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.hipaaBreachNotification.count();
  return `BREACH-${year}-${String(count + 1).padStart(3, '0')}`;
}

const breachSchema = z.object({
  discoveredDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  breachDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  description: z.string().trim().min(1),
  phiInvolved: z.array(z.string()).min(1),
  individualsAffected: z.number().int().min(0),
  breachType: z.enum(['HACKING_IT_INCIDENT', 'UNAUTHORIZED_ACCESS', 'THEFT', 'LOSS', 'IMPROPER_DISPOSAL', 'UNAUTHORIZED_DISCLOSURE', 'OTHER']),
  discoveredBy: z.string().trim().min(1),
  riskAssessment: z.string().trim().optional(),
  lowProbabilityOfPhi: z.boolean().optional(),
  mediaNotificationRequired: z.boolean().optional(),
  containmentActions: z.string().trim().optional(),
});

// GET / - list breaches
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    const [breaches, total] = await Promise.all([
      prisma.hipaaBreachNotification.findMany({ where, skip, take: limit, orderBy: { discoveredDate: 'desc' } }),
      prisma.hipaaBreachNotification.count({ where }),
    ]);
    res.json({ success: true, data: breaches, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list breaches', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list breaches' } });
  }
});

// POST / - report breach (auto-calculate 60-day deadlines)
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = breachSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const referenceNumber = await generateBreachRef();
    const discoveredDate = new Date(parsed.data.discoveredDate);
    const notificationDue = new Date(discoveredDate);
    notificationDue.setDate(notificationDue.getDate() + 60); // HIPAA 60-day deadline
    const breach = await prisma.hipaaBreachNotification.create({
      data: {
        id: uuidv4(), referenceNumber, ...parsed.data,
        discoveredDate, breachDate: parsed.data.breachDate ? new Date(parsed.data.breachDate) : undefined,
        individualNotificationDue: notificationDue,
        hhsNotificationDue: notificationDue,
        status: 'INVESTIGATING',
      },
    });
    logger.info('Breach reported', { referenceNumber, individualsAffected: parsed.data.individualsAffected });
    res.status(201).json({ success: true, data: breach });
  } catch (error: unknown) {
    logger.error('Failed to report breach', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to report breach' } });
  }
});

// GET /dashboard
router.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const [total, open, notified] = await Promise.all([
      prisma.hipaaBreachNotification.count({ where: { deletedAt: null } }),
      prisma.hipaaBreachNotification.count({ where: { deletedAt: null, status: { in: ['INVESTIGATING', 'CONFIRMED', 'NOTIFICATION_PENDING'] } } }),
      prisma.hipaaBreachNotification.count({ where: { deletedAt: null, status: 'NOTIFICATION_COMPLETE' } }),
    ]);
    res.json({ success: true, data: { total, open, notified, closed: total - open - notified } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get dashboard' } });
  }
});

// GET /:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const breach = await prisma.hipaaBreachNotification.findUnique({ where: { id: req.params.id } });
    if (!breach || breach.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Breach not found' } });
    }
    res.json({ success: true, data: breach });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get breach' } });
  }
});

// PUT /:id - update breach
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.hipaaBreachNotification.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Breach not found' } });
    }
    const updateSchema = breachSchema.partial().extend({
      status: z.enum(['INVESTIGATING', 'CONFIRMED', 'NOTIFICATION_PENDING', 'NOTIFICATION_COMPLETE', 'CLOSED_NOT_BREACH', 'CLOSED']).optional(),
      investigatedBy: z.string().trim().optional(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const updated = await prisma.hipaaBreachNotification.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update breach' } });
  }
});

// PUT /:id/notify-individuals
router.put('/:id/notify-individuals', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.hipaaBreachNotification.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Breach not found' } });
    }
    const updated = await prisma.hipaaBreachNotification.update({
      where: { id: req.params.id },
      data: { individualNotifiedAt: new Date(), status: 'NOTIFICATION_PENDING' },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to record individual notification' } });
  }
});

// PUT /:id/notify-hhs
router.put('/:id/notify-hhs', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.hipaaBreachNotification.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Breach not found' } });
    }
    const updated = await prisma.hipaaBreachNotification.update({
      where: { id: req.params.id },
      data: { hhsNotifiedAt: new Date(), status: 'NOTIFICATION_COMPLETE' },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to record HHS notification' } });
  }
});

// PUT /:id/close
router.put('/:id/close', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.hipaaBreachNotification.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Breach not found' } });
    }
    const schema = z.object({
      status: z.enum(['CLOSED', 'CLOSED_NOT_BREACH']),
      preventiveActions: z.string().trim().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Status required' } });
    }
    const updated = await prisma.hipaaBreachNotification.update({
      where: { id: req.params.id },
      data: { ...parsed.data, closedAt: new Date() },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to close breach' } });
  }
});

export default router;
