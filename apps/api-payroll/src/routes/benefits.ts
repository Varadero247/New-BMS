import { Router, Request, Response } from 'express';
import { prisma } from '@ims/database';
import { z } from 'zod';

const router: Router = Router();

// GET /api/benefits/plans - Get benefit plans
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const where: any = { isActive: true };
    if (category) where.category = category;

    const plans = await prisma.benefitPlan.findMany({
      where,
      include: {
        _count: { select: { employeeBenefits: true } },
      },
    });

    res.json({ success: true, data: plans });
  } catch (error) {
    console.error('Error fetching benefit plans:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch plans' } });
  }
});

// POST /api/benefits/plans - Create benefit plan
router.post('/plans', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      code: z.string().min(1),
      name: z.string().min(1),
      description: z.string().optional(),
      category: z.enum(['HEALTH_INSURANCE', 'LIFE_INSURANCE', 'DENTAL', 'VISION', 'RETIREMENT', 'PENSION', 'HSA', 'FSA', 'TRANSPORTATION', 'WELLNESS', 'OTHER']),
      provider: z.string().optional(),
      coverageLevels: z.array(z.enum(['EMPLOYEE_ONLY', 'EMPLOYEE_SPOUSE', 'EMPLOYEE_CHILDREN', 'FAMILY'])),
      dependentsCoverage: z.boolean().default(false),
      employeeContribution: z.number().optional(),
      employerContribution: z.number().optional(),
      waitingPeriodDays: z.number().default(0),
      effectiveFrom: z.string(),
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
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Error creating plan:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create plan' } });
  }
});

// GET /api/benefits/employees/:employeeId - Get employee benefits
router.get('/employees/:employeeId', async (req: Request, res: Response) => {
  try {
    const benefits = await prisma.employeeBenefit.findMany({
      where: { employeeId: req.params.employeeId },
      include: {
        benefitPlan: true,
      },
    });

    res.json({ success: true, data: benefits });
  } catch (error) {
    console.error('Error fetching employee benefits:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch benefits' } });
  }
});

// POST /api/benefits/employees/:employeeId - Enroll employee in benefit
router.post('/employees/:employeeId', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      benefitPlanId: z.string().uuid(),
      coverageLevel: z.enum(['EMPLOYEE_ONLY', 'EMPLOYEE_SPOUSE', 'EMPLOYEE_CHILDREN', 'FAMILY']),
      dependents: z.any().optional(),
      employeeContribution: z.number().default(0),
      employerContribution: z.number().default(0),
      effectiveFrom: z.string(),
    });

    const data = schema.parse(req.body);

    const benefit = await prisma.employeeBenefit.create({
      data: {
        employeeId: req.params.employeeId,
        benefitPlanId: data.benefitPlanId,
        enrollmentDate: new Date(),
        status: 'ACTIVE',
        coverageLevel: data.coverageLevel,
        dependents: data.dependents,
        employeeContribution: data.employeeContribution,
        employerContribution: data.employerContribution,
        effectiveFrom: new Date(data.effectiveFrom),
      },
      include: { benefitPlan: true },
    });

    res.status(201).json({ success: true, data: benefit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Error enrolling employee:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to enroll employee' } });
  }
});

// PUT /api/benefits/:id/terminate - Terminate benefit
router.put('/:id/terminate', async (req: Request, res: Response) => {
  try {
    const { terminationDate } = req.body;

    const benefit = await prisma.employeeBenefit.update({
      where: { id: req.params.id },
      data: {
        status: 'TERMINATED',
        terminationDate: new Date(terminationDate),
        effectiveTo: new Date(terminationDate),
      },
    });

    res.json({ success: true, data: benefit });
  } catch (error) {
    console.error('Error terminating benefit:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to terminate benefit' } });
  }
});

export default router;
