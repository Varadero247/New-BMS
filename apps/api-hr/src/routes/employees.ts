import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-hr');

const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// Validation schemas
const createEmployeeSchema = z.object({
  employeeNumber: z.string().min(1),
  firstName: z.string().min(1),
  middleName: z.string().optional(),
  lastName: z.string().min(1),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  personalEmail: z.string().email().optional(),
  workEmail: z.string().email(),
  phone: z.string().optional(),
  mobilePhone: z.string().optional(),
  departmentId: z.string().uuid(),
  positionId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERN', 'CONSULTANT', 'FREELANCE']).default('FULL_TIME'),
  hireDate: z.string(),
  jobTitle: z.string(),
  jobGrade: z.string().optional(),
  workLocation: z.string().optional(),
  currency: z.string().default('USD'),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
});

const updateEmployeeSchema = createEmployeeSchema.partial();

// GET /api/employees - List all employees
router.get('/', async (req: Request, res: Response) => {
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

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.EmployeeWhereInput = {};

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
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch employees' } });
  }
});

// GET /api/employees/org-chart - Get organization chart
router.get('/org-chart', async (_req: Request, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { employmentStatus: 'ACTIVE' },
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
    });

    // Build hierarchical structure
    const buildTree = (managerId: string | null): any[] => {
      return employees
        .filter(e => e.managerId === managerId)
        .map(e => ({
          ...e,
          children: buildTree(e.id),
        }));
    };

    const orgChart = buildTree(null);

    res.json({ success: true, data: orgChart });
  } catch (error) {
    logger.error('Error fetching org chart', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch org chart' } });
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
      }),
      // Get salary data from EmployeeSalary table
      prisma.employeeSalary.aggregate({
        _avg: { baseSalary: true },
        _sum: { baseSalary: true },
        where: { isActive: true },
      }),
    ]);

    // Map department IDs to names
    const departmentMap = new Map(departments.map((d: { id: string; name: string }) => [d.id, d.name]));
    const byDepartment = byDepartmentRaw.map((d: { departmentId: string; _count: { id: number } }) => ({
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
        byEmploymentType: byEmploymentType.map((e: { employmentType: string; _count: { id: number } }) => ({
          employmentType: e.employmentType,
          count: e._count.id,
        })),
        recentHires,
        avgSalary: Math.round(salaryData._avg.baseSalary || 0),
        totalSalaryExpense: Math.round(salaryData._sum.baseSalary || 0),
      },
    });
  } catch (error) {
    logger.error('Error fetching employee stats', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats' } });
  }
});

// GET /api/employees/:id - Get single employee
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.id },
      include: {
        department: true,
        position: true,
        manager: {
          select: { id: true, firstName: true, lastName: true, employeeNumber: true, jobTitle: true },
        },
        subordinates: {
          select: { id: true, firstName: true, lastName: true, employeeNumber: true, jobTitle: true },
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
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Employee not found' } });
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    logger.error('Error fetching employee', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch employee' } });
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
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating employee', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create employee' } });
  }
});

// PUT /api/employees/:id - Update employee
router.put('/:id', async (req: Request, res: Response) => {
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
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error updating employee', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update employee' } });
  }
});

// DELETE /api/employees/:id - Delete (soft) employee
router.delete('/:id', async (req: Request, res: Response) => {
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
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete employee' } });
  }
});

// GET /api/employees/:id/subordinates - Get direct reports
router.get('/:id/subordinates', async (req: Request, res: Response) => {
  try {
    const subordinates = await prisma.employee.findMany({
      where: { managerId: req.params.id, employmentStatus: 'ACTIVE' },
      include: {
        department: true,
        position: true,
        _count: { select: { subordinates: true } },
      },
    });

    res.json({ success: true, data: subordinates });
  } catch (error) {
    logger.error('Error fetching subordinates', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch subordinates' } });
  }
});

export default router;
