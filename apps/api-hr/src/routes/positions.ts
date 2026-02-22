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

const createPositionSchema = z.object({
  code: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().optional(),
  departmentId: z.string().uuid().optional(),
  jobGrade: z.string().trim().optional(),
  minSalary: z.number().nonnegative().optional(),
  maxSalary: z.number().nonnegative().optional(),
  headcount: z.number().int().positive().default(1),
  requirements: z.string().trim().optional(),
  responsibilities: z.string().trim().optional(),
  level: z.number().int().positive().default(1),
});
const updatePositionSchema = createPositionSchema.partial();

// GET /api/positions
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null, isActive: true };
    if (req.query.departmentId) where.departmentId = req.query.departmentId as string;
    const [positions, total] = await Promise.all([
      prisma.position.findMany({ where, skip, take: limit, orderBy: { title: 'asc' }, include: { department: true, _count: { select: { employees: true } } } }),
      prisma.position.count({ where }),
    ]);
    res.json({ success: true, data: positions, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    logger.error('Error fetching positions', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch positions' } });
  }
});

// GET /api/positions/:id
router.get('/:id', checkOwnership(prisma.position), async (req: Request, res: Response) => {
  try {
    const position = await prisma.position.findUnique({ where: { id: req.params.id }, include: { department: true, employees: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } }, jobPostings: true } });
    if (!position) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Position not found' } });
    res.json({ success: true, data: position });
  } catch (error) {
    logger.error('Error fetching position', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch position' } });
  }
});

// POST /api/positions
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createPositionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
    const position = await prisma.position.create({ data: parsed.data as any, include: { department: true } });
    res.status(201).json({ success: true, data: position });
  } catch (error) {
    logger.error('Error creating position', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create position' } });
  }
});

// PUT /api/positions/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = updatePositionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
    const position = await prisma.position.update({ where: { id: req.params.id }, data: parsed.data as any, include: { department: true } });
    res.json({ success: true, data: position });
  } catch (error) {
    logger.error('Error updating position', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update position' } });
  }
});

// DELETE /api/positions/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.position.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting position', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete position' } });
  }
});

export default router;
