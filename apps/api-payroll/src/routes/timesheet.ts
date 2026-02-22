import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination } from '@ims/shared';
import { scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-payroll');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// GET /api/timesheet - List timesheet entries (derived from payslip items of type EARNING)
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { page: _p, limit: _l, skip } = parsePagination(req.query);
    const { employeeId, status } = req.query;
    const { page, limit } = parsePagination(req.query);

    const where: Record<string, unknown> = { deletedAt: null };
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const [entries, total] = await Promise.all([
      prisma.payrollRun.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.payrollRun.count({ where }),
    ]);

    res.json({ success: true, data: entries, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    logger.error('Error fetching timesheets', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch timesheets' } });
  }
});

// GET /api/timesheet/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const entry = await prisma.payrollRun.findUnique({ where: { id: req.params.id } });
    if (!entry) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Timesheet not found' } });
    res.json({ success: true, data: entry });
  } catch (error) {
    logger.error('Error fetching timesheet', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch timesheet' } });
  }
});

// POST /api/timesheet
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      employeeId: z.string().trim().uuid(),
      periodStart: z.string().trim().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
      periodEnd: z.string().trim().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
      regularHours: z.number().nonnegative(),
      overtimeHours: z.number().nonnegative().default(0),
      notes: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    const count = await prisma.payrollRun.count();
    const entry = await prisma.payrollRun.create({
      data: {
        runNumber: 'TS-' + String(count + 1).padStart(4, '0'),
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        payDate: new Date(data.periodEnd),
        status: 'DRAFT',
        payFrequency: 'MONTHLY',
      } as any,
    });

    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating timesheet', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create timesheet' } });
  }
});

// PUT /api/timesheet/:id/submit
router.put('/:id/submit', async (req: Request, res: Response) => {
  try {
    const entry = await prisma.payrollRun.update({
      where: { id: req.params.id },
      data: { status: 'CALCULATED' } as any,
    });
    res.json({ success: true, data: entry });
  } catch (error) {
    logger.error('Error submitting timesheet', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to submit timesheet' } });
  }
});

// PUT /api/timesheet/:id/approve
router.put('/:id/approve', async (req: Request, res: Response) => {
  try {
    const entry = await prisma.payrollRun.update({
      where: { id: req.params.id },
      data: { status: 'APPROVED' } as any,
    });
    res.json({ success: true, data: entry });
  } catch (error) {
    logger.error('Error approving timesheet', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to approve timesheet' } });
  }
});

export default router;
