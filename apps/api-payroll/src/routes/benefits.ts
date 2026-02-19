import { Router, Request, Response } from 'express';
import { prisma} from '../prisma';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-payroll');

const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());
router.param('employeeId', validateIdParam('employeeId'));

// GET /api/benefits/plans - Get benefit plans
router.get('/plans', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const where: Record<string, unknown> = { isActive: true, deletedAt: null };
    if (category) where.category = category;

    const plans = await prisma.benefitPlan.findMany({
      where,
      include: {
        _count: { select: { employeeBenefits: true } },
      },
      take: 100,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: plans });
  } catch (error) {
    logger.error('Error fetching benefit plans', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch plans' },
    });
  }
});

// POST /api/benefits/plans - Create benefit plan
router.post('/plans', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      code: z.string().trim().min(1).max(200),
      name: z.string().trim().min(1).max(200),
      description: z.string().trim().optional(),
      category: z.enum([
        'HEALTH_INSURANCE',
        'LIFE_INSURANCE',
        'DENTAL',
        'VISION',
        'RETIREMENT',
        'PENSION',
        'HSA',
        'FSA',
        'TRANSPORTATION',
        'WELLNESS',
        'OTHER',
      ]),
      provider: z.string().trim().optional(),
      coverageLevels: z.array(
        z.enum(['EMPLOYEE_ONLY', 'EMPLOYEE_SPOUSE', 'EMPLOYEE_CHILDREN', 'FAMILY'])
      ),
      dependentsCoverage: z.boolean().default(false),
      employeeContribution: z.number().optional(),
      employerContribution: z.number().optional(),
      waitingPeriodDays: z.number().default(0),
      effectiveFrom: z.string().trim(),
    });

    const data = schema.parse(req.body);

    const plan = await prisma.benefitPlan.create({
      data: {
        ...data,
        effectiveFrom: new Date(data.effectiveFrom),
      },
    });

    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating plan', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create plan' },
    });
  }
});

// GET /api/benefits/employees/:employeeId - Get employee benefits
router.get('/employees/:employeeId', async (req: Request, res: Response) => {
  try {
    const benefits = await prisma.employeeBenefit.findMany({
      where: { employeeId: req.params.employeeId, deletedAt: null },
      include: {
        benefitPlan: true,
      },
      take: 100,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: benefits });
  } catch (error) {
    logger.error('Error fetching employee benefits', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch benefits' },
    });
  }
});

// POST /api/benefits/employees/:employeeId - Enroll employee in benefit
router.post('/employees/:employeeId', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      benefitPlanId: z.string().trim().uuid(),
      coverageLevel: z.enum(['EMPLOYEE_ONLY', 'EMPLOYEE_SPOUSE', 'EMPLOYEE_CHILDREN', 'FAMILY']),
      dependents: z.array(z.record(z.unknown())).optional(),
      employeeContribution: z.number().default(0),
      employerContribution: z.number().default(0),
      effectiveFrom: z.string().trim(),
    });

    const data = schema.parse(req.body);

    const benefit = await prisma.employeeBenefit.create({
      data: {
        employeeId: req.params.employeeId,
        benefitPlanId: data.benefitPlanId,
        enrollmentDate: new Date(),
        status: 'ACTIVE',
        coverageLevel: data.coverageLevel,
        dependents: data.dependents as any,
        employeeContribution: data.employeeContribution,
        employerContribution: data.employerContribution,
        effectiveFrom: new Date(data.effectiveFrom),
      },
      include: { benefitPlan: true },
    });

    res.status(201).json({ success: true, data: benefit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error enrolling employee', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to enroll employee' },
    });
  }
});

// PUT /api/benefits/:id/terminate - Terminate benefit
router.put(
  '/:id/terminate',
  checkOwnership(prisma.employeeBenefit),
  async (req: Request, res: Response) => {
    try {
      const _schema = z.object({ terminationDate: z.string().trim().optional() });
      const _parsed = _schema.safeParse(req.body);
      if (!_parsed.success)
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: _parsed.error.errors[0].message },
        });
      const { terminationDate } = _parsed.data;

      const benefit = await prisma.employeeBenefit.update({
        where: { id: req.params.id },
        data: {
          status: 'TERMINATED',
          terminationDate: terminationDate ? new Date(terminationDate) : new Date(),
          effectiveTo: terminationDate ? new Date(terminationDate) : new Date(),
        },
      });

      res.json({ success: true, data: benefit });
    } catch (error) {
      logger.error('Error terminating benefit', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to terminate benefit' },
      });
    }
  }
);

export default router;
