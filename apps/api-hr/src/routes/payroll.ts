import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-hr');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

const createSalarySchema = z.object({
  employeeId: z.string().uuid(),
  baseSalary: z.number().positive(),
  currency: z.string().trim().default('USD'),
  effectiveDate: z.string(),
  notes: z.string().trim().optional(),
});
const updateSalarySchema = createSalarySchema.partial();

// GET /api/payroll
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const where: any = { isActive: true };
    if (req.query.employeeId) where.employeeId = req.query.employeeId as string;
    const [salaries, total] = await Promise.all([
      prisma.employeeSalary.findMany({ where, skip, take: limit, orderBy: { effectiveDate: 'desc' }, include: { employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } } } }),
      prisma.employeeSalary.count({ where }),
    ]);
    res.json({ success: true, data: salaries, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    logger.error('Error fetching salaries', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch salaries' } });
  }
});

// GET /api/payroll/:id
router.get('/:id', checkOwnership(prisma.employeeSalary), async (req: Request, res: Response) => {
  try {
    const salary = await prisma.employeeSalary.findUnique({ where: { id: req.params.id }, include: { employee: true } });
    if (!salary) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Salary record not found' } });
    res.json({ success: true, data: salary });
  } catch (error) {
    logger.error('Error fetching salary', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch salary' } });
  }
});

// POST /api/payroll
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createSalarySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
    const { effectiveDate, ...rest } = parsed.data;
    const salary = await prisma.employeeSalary.create({ data: { ...rest, effectiveDate: new Date(effectiveDate) } as any, include: { employee: { select: { id: true, firstName: true, lastName: true } } } });
    res.status(201).json({ success: true, data: salary });
  } catch (error) {
    logger.error('Error creating salary', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create salary' } });
  }
});

// PUT /api/payroll/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = updateSalarySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
    const { effectiveDate, ...rest } = parsed.data as any;
    const data: any = { ...rest };
    if (effectiveDate) data.effectiveDate = new Date(effectiveDate);
    const salary = await prisma.employeeSalary.update({ where: { id: req.params.id }, data, include: { employee: { select: { id: true, firstName: true, lastName: true } } } });
    res.json({ success: true, data: salary });
  } catch (error) {
    logger.error('Error updating salary', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update salary' } });
  }
});

export default router;
