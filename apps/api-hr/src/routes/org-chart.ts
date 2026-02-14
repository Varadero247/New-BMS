import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-hr');
const router: Router = Router();
router.use(authenticate);

// ============================================
// Organisation Chart
// ============================================

// GET / - Full org chart (hierarchical tree)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { employmentStatus: 'ACTIVE', deletedAt: null },
      select: {
        id: true,
        employeeNumber: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        departmentId: true,
        managerId: true,
        profilePhoto: true,
        department: { select: { id: true, name: true } },
      },
      orderBy: { lastName: 'asc' },
      take: 1000,
    });

    // Build hierarchical tree
    const buildTree = (managerId: string | null): unknown[] => {
      return employees
        .filter(e => e.managerId === managerId)
        .map(e => ({
          ...e,
          fullName: `${e.firstName} ${e.lastName}`,
          children: buildTree(e.id),
        }));
    };

    const orgChart = buildTree(null);

    res.json({
      success: true,
      data: {
        totalEmployees: employees.length,
        chart: orgChart,
      },
    });
  } catch (error) {
    logger.error('Error fetching org chart', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch org chart' } });
  }
});

// GET /flat - Flat list with manager relationships
router.get('/flat', async (_req: Request, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { employmentStatus: 'ACTIVE', deletedAt: null },
      select: {
        id: true,
        employeeNumber: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        departmentId: true,
        managerId: true,
        profilePhoto: true,
        department: { select: { id: true, name: true } },
        manager: { select: { id: true, firstName: true, lastName: true, jobTitle: true } },
        _count: { select: { subordinates: true } },
      },
      orderBy: [{ department: { name: 'asc' } }, { lastName: 'asc' }],
      take: 1000,
    });

    const flat = employees.map(e => ({
      ...e,
      fullName: `${e.firstName} ${e.lastName}`,
      directReports: e._count.subordinates,
    }));

    res.json({ success: true, data: flat });
  } catch (error) {
    logger.error('Error fetching flat org chart', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch flat org chart' } });
  }
});

// GET /by-department - Employees grouped by department
router.get('/by-department', async (_req: Request, res: Response) => {
  try {
    const departments = await prisma.hRDepartment.findMany({
      where: { isActive: true },
      include: {
        employees: {
          where: { employmentStatus: 'ACTIVE', deletedAt: null },
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            managerId: true,
            profilePhoto: true,
          },
          orderBy: { lastName: 'asc' },
        },
        manager: { select: { id: true, firstName: true, lastName: true, jobTitle: true } },
      },
      orderBy: { name: 'asc' },
    });

    const result = departments.map(d => ({
      id: d.id,
      name: d.name,
      code: d.code,
      headCount: d.employees.length,
      manager: d.manager,
      employees: d.employees.map(e => ({
        ...e,
        fullName: `${e.firstName} ${e.lastName}`,
      })),
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error fetching org chart by department', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch org chart by department' } });
  }
});

// GET /reporting-chain/:employeeId - Get reporting chain for an employee
router.get('/reporting-chain/:employeeId', async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    const chain: unknown[] = [];
    let currentId: string | null = employeeId;
    const visited = new Set<string>();

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);

      const employee = await prisma.employee.findUnique({
        where: { id: currentId },
        select: {
          id: true,
          employeeNumber: true,
          firstName: true,
          lastName: true,
          jobTitle: true,
          managerId: true,
          department: { select: { id: true, name: true } },
        },
      });

      if (!employee) break;

      chain.unshift({ ...employee, fullName: `${employee.firstName} ${employee.lastName}` });
      currentId = employee.managerId;
    }

    res.json({ success: true, data: chain });
  } catch (error) {
    logger.error('Error fetching reporting chain', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch reporting chain' } });
  }
});

export default router;
