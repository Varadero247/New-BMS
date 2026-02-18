import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-hr');

const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

const createDepartmentSchema = z.object({
  code: z.string().trim().min(1).max(200),
  name: z.string().trim().min(1).max(200),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  headId: z.string().uuid().optional(),
  costCenter: z.string().optional(),
  budget: z.number().optional(),
  budgetCurrency: z.string().default('USD'),
});

const updateDepartmentSchema = createDepartmentSchema.partial();

// GET /api/departments - List all departments
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { includeInactive, tree } = req.query;

    const where = includeInactive === 'true' ? { deletedAt: null } : { isActive: true, deletedAt: null };

    const departments = await prisma.hRDepartment.findMany({
      where,
      include: {
        parent: { select: { id: true, name: true, code: true } },
        _count: {
          select: { employees: true, children: true, positions: true },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      take: 100,
    });

    if (tree === 'true') {
      // Build tree structure
      const buildTree = (parentId: string | null): unknown[] => {
        return departments
          .filter(d => d.parentId === parentId)
          .map(d => ({
            ...d,
            children: buildTree(d.id),
          }));
      };
      const treeData = buildTree(null);
      return res.json({ success: true, data: treeData });
    }

    res.json({ success: true, data: departments });
  } catch (error) {
    logger.error('Error fetching departments', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch departments' } });
  }
});

// GET /api/departments/:id - Get single department
router.get('/:id', checkOwnership(prisma.hRDepartment), async (req: Request, res: Response) => {
  try {
    const department = await prisma.hRDepartment.findUnique({
      where: { id: req.params.id },
      include: {
        parent: true,
        children: true,
        employees: {
          where: { employmentStatus: 'ACTIVE' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            employeeNumber: true,
          },
        },
        positions: true,
        _count: {
          select: { employees: true, children: true, positions: true },
        },
      },
    });

    if (!department) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Department not found' } });
    }

    res.json({ success: true, data: department });
  } catch (error) {
    logger.error('Error fetching department', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch department' } });
  }
});

// POST /api/departments - Create department
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createDepartmentSchema.parse(req.body);

    const department = await prisma.hRDepartment.create({
      data,
      include: { parent: true },
    });

    res.status(201).json({ success: true, data: department });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating department', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create department' } });
  }
});

// PUT /api/departments/:id - Update department
router.put('/:id', checkOwnership(prisma.hRDepartment), async (req: Request, res: Response) => {
  try {
    const data = updateDepartmentSchema.parse(req.body);

    const department = await prisma.hRDepartment.update({
      where: { id: req.params.id },
      data,
      include: { parent: true },
    });

    res.json({ success: true, data: department });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error updating department', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update department' } });
  }
});

// DELETE /api/departments/:id - Soft delete department
router.delete('/:id', checkOwnership(prisma.hRDepartment), async (req: Request, res: Response) => {
  try {
    // Check for employees
    const employeeCount = await prisma.employee.count({
      where: { departmentId: req.params.id, employmentStatus: 'ACTIVE' },
    });

    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'HAS_EMPLOYEES', message: `Cannot delete department with ${employeeCount} active employees` },
      });
    }

    await prisma.hRDepartment.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting department', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete department' } });
  }
});

// Positions routes
// GET /api/departments/positions - List all positions
router.get('/positions/all', async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.query;

    const where: any = { isActive: true, deletedAt: null };
    if (departmentId) where.departmentId = departmentId as string;

    const positions = await prisma.position.findMany({
      where,
      include: {
        department: { select: { id: true, name: true } },
        _count: { select: { employees: true } },
      },
      take: 100,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: positions });
  } catch (error) {
    logger.error('Error fetching positions', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch positions' } });
  }
});

// POST /api/departments/positions - Create position
router.post('/positions', async (req: Request, res: Response) => {
  try {
    const positionSchema = z.object({
      code: z.string().trim().min(1).max(200),
      title: z.string().trim().min(1).max(200),
      description: z.string().optional(),
      departmentId: z.string().uuid(),
      jobGrade: z.string().optional(),
      minSalary: z.number().optional(),
      maxSalary: z.number().optional(),
      headcount: z.number().default(1),
      requirements: z.string().optional(),
      responsibilities: z.string().optional(),
    });

    const data = positionSchema.parse(req.body);

    const position = await prisma.position.create({
      data,
      include: { department: true },
    });

    res.status(201).json({ success: true, data: position });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating position', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create position' } });
  }
});

export default router;
