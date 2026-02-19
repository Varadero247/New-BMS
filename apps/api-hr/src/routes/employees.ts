import { Router, Request, Response } from 'express';
import { prisma} from '../prisma';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-hr');

const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// Validation schemas
const createEmployeeSchema = z.object({
  employeeNumber: z.string().trim().min(1).max(200),
  firstName: z.string().trim().min(1).max(200),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1).max(200),
  dateOfBirth: z.string().trim().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  personalEmail: z.string().trim().email().optional(),
  workEmail: z.string().trim().email(),
  phone: z.string().trim().optional(),
  mobilePhone: z.string().trim().optional(),
  departmentId: z.string().trim().uuid(),
  positionId: z.string().trim().uuid().optional(),
  managerId: z.string().trim().uuid().optional(),
  employmentType: z
    .enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERN', 'CONSULTANT', 'FREELANCE'])
    .default('FULL_TIME'),
  hireDate: z
    .string()
    .trim()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  jobTitle: z.string().trim().min(1).max(200),
  jobGrade: z.string().trim().optional(),
  workLocation: z.string().trim().optional(),
  currency: z.string().trim().length(3).default('USD'),
  bankName: z.string().trim().optional(),
  accountNumber: z.string().trim().optional(),
});

const updateEmployeeSchema = createEmployeeSchema.partial();

// GET /api/employees - List all employees
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      department,
      status,
      search,
      managerId,
      employmentType,
    } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };

    if (department) where.departmentId = department;
    if (status) where.employmentStatus = status;
    if (managerId) where.managerId = managerId;
    if (employmentType) where.employmentType = employmentType;
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { workEmail: { contains: search as string, mode: 'insensitive' } },
        { employeeNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          department: true,
          position: true,
          manager: {
            select: { id: true, firstName: true, lastName: true, employeeNumber: true },
          },
          _count: {
            select: { subordinates: true },
          },
        },
        skip,
        take: limitNum,
        orderBy: { lastName: 'asc' },
      }),
      prisma.employee.count({ where }),
    ]);

    res.json({
      success: true,
      data: employees,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Error fetching employees', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch employees' },
    });
  }
});

// GET /api/employees/org-chart - Get organization chart
router.get('/org-chart', async (_req: Request, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { employmentStatus: 'ACTIVE', deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        departmentId: true,
        managerId: true,
        profilePhoto: true,
        department: { select: { name: true } },
      },
      take: 500,
      orderBy: { createdAt: 'desc' },
    });

    // Build hierarchical structure
    const buildTree = (managerId: string | null): unknown[] => {
      return employees
        .filter((e) => e.managerId === managerId)
        .map((e) => ({
          ...e,
          children: buildTree(e.id),
        }));
    };

    const orgChart = buildTree(null);

    res.json({ success: true, data: orgChart });
  } catch (error) {
    logger.error('Error fetching org chart', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch org chart' },
    });
  }
});

// GET /api/employees/stats - Get employee statistics
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    // Get counts by status
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      total,
      active,
      onLeave,
      suspended,
      probation,
      terminated,
      byDepartmentRaw,
      byEmploymentType,
      recentHires,
      departments,
      salaryData,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { employmentStatus: 'ACTIVE' } }),
      prisma.employee.count({ where: { employmentStatus: 'ON_LEAVE' } }),
      prisma.employee.count({ where: { employmentStatus: 'SUSPENDED' } }),
      prisma.employee.count({ where: { employmentStatus: 'PROBATION' } }),
      prisma.employee.count({ where: { employmentStatus: 'TERMINATED' } }),
      prisma.employee.groupBy({
        by: ['departmentId'],
        _count: { id: true },
        where: { employmentStatus: 'ACTIVE' },
      }),
      prisma.employee.groupBy({
        by: ['employmentType'],
        _count: { id: true },
        where: { employmentStatus: 'ACTIVE' },
      }),
      prisma.employee.count({
        where: {
          hireDate: { gte: thirtyDaysAgo },
        },
      }),
      prisma.hRDepartment.findMany({
        select: { id: true, name: true },
        take: 1000,
      }),
      // Get salary data from EmployeeSalary table
      prisma.employeeSalary.aggregate({
        _avg: { baseSalary: true },
        _sum: { baseSalary: true },
        where: { isActive: true },
      }),
    ]);

    // Map department IDs to names
    const departmentMap = new Map(
      departments.map((d: { id: string; name: string }) => [d.id, d.name])
    );
    const byDepartment = byDepartmentRaw.map((d: any) => ({
      department: departmentMap.get(d.departmentId) || 'Unknown',
      departmentId: d.departmentId,
      count: d._count.id,
    }));

    res.json({
      success: true,
      data: {
        total,
        active,
        onLeave,
        suspended,
        probation,
        terminated,
        inactive: suspended + terminated, // Combined for backwards compatibility
        byDepartment,
        byEmploymentType: byEmploymentType.map(
          (e: { employmentType: string; _count: { id: number } }) => ({
            employmentType: e.employmentType,
            count: e._count.id,
          })
        ),
        recentHires,
        avgSalary: Math.round(((salaryData._avg?.baseSalary || 0) as any) || 0),
        totalSalaryExpense: Math.round(((salaryData._sum?.baseSalary || 0) as any) || 0),
      },
    });
  } catch (error) {
    logger.error('Error fetching employee stats', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats' },
    });
  }
});

// GET /api/employees/:id - Get single employee
router.get('/:id', checkOwnership(prisma.employee), async (req: Request, res: Response) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.id },
      include: {
        department: true,
        position: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
            jobTitle: true,
          },
        },
        subordinates: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
            jobTitle: true,
          },
        },
        leaveBalances: {
          include: { leaveType: true },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        qualifications: true,
        certifications: true,
        assets: true,
      },
    });

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Employee not found' } });
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    logger.error('Error fetching employee', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch employee' },
    });
  }
});

// POST /api/employees - Create new employee
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createEmployeeSchema.parse(req.body);

    const employee = await prisma.employee.create({
      data: {
        ...data,
        hireDate: new Date(data.hireDate),
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      },
      include: {
        department: true,
        position: true,
      },
    });

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating employee', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create employee' },
    });
  }
});

// PUT /api/employees/:id - Update employee
router.put('/:id', checkOwnership(prisma.employee), async (req: Request, res: Response) => {
  try {
    const data = updateEmployeeSchema.parse(req.body);

    const employee = await prisma.employee.update({
      where: { id: req.params.id },
      data: {
        ...data,
        hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      },
      include: {
        department: true,
        position: true,
      },
    });

    res.json({ success: true, data: employee });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error updating employee', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update employee' },
    });
  }
});

// DELETE /api/employees/:id - Delete (soft) employee
router.delete('/:id', checkOwnership(prisma.employee), async (req: Request, res: Response) => {
  try {
    await prisma.employee.update({
      where: { id: req.params.id },
      data: {
        employmentStatus: 'TERMINATED',
        terminationDate: new Date(),
      },
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting employee', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete employee' },
    });
  }
});

// GET /api/employees/:id/subordinates - Get direct reports
router.get('/:id/subordinates', async (req: Request, res: Response) => {
  try {
    const subordinates = await prisma.employee.findMany({
      where: { managerId: req.params.id, employmentStatus: 'ACTIVE', deletedAt: null },
      include: {
        department: true,
        position: true,
        _count: { select: { subordinates: true } },
      },
      take: 100,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: subordinates });
  } catch (error) {
    logger.error('Error fetching subordinates', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch subordinates' },
    });
  }
});

export default router;
