import { Router, Request, Response } from 'express';
import { prisma } from '@ims/database';
import { z } from 'zod';

const router: Router = Router();

// GET /api/salary/component-types - Get salary component types
router.get('/component-types', async (req: Request, res: Response) => {
  try {
    const { type, category } = req.query;

    const where: any = { isActive: true };
    if (type) where.type = type;
    if (category) where.category = category;

    const componentTypes = await prisma.salaryComponentType.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    res.json({ success: true, data: componentTypes });
  } catch (error) {
    console.error('Error fetching component types:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch component types' } });
  }
});

// POST /api/salary/component-types - Create component type
router.post('/component-types', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      code: z.string().min(1),
      name: z.string().min(1),
      description: z.string().optional(),
      category: z.enum(['BASIC', 'ALLOWANCE', 'BONUS', 'COMMISSION', 'OVERTIME', 'REIMBURSEMENT', 'STATUTORY', 'DEDUCTION', 'OTHER']),
      type: z.enum(['EARNING', 'DEDUCTION']),
      isTaxable: z.boolean().default(true),
      isRecurring: z.boolean().default(true),
      isStatutory: z.boolean().default(false),
      defaultCalculationType: z.enum(['FIXED', 'PERCENTAGE_OF_BASIC', 'PERCENTAGE_OF_GROSS', 'FORMULA', 'ATTENDANCE_BASED']).default('FIXED'),
      defaultPercentage: z.number().optional(),
      showInPayslip: z.boolean().default(true),
    });

    const data = schema.parse(req.body);

    const componentType = await prisma.salaryComponentType.create({ data });

    res.status(201).json({ success: true, data: componentType });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Error creating component type:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create component type' } });
  }
});

// GET /api/salary/employees/:employeeId - Get employee salary
router.get('/employees/:employeeId', async (req: Request, res: Response) => {
  try {
    const salaries = await prisma.employeeSalary.findMany({
      where: { employeeId: req.params.employeeId },
      include: {
        components: {
          include: { componentType: true },
        },
      },
      orderBy: { effectiveFrom: 'desc' },
    });

    res.json({ success: true, data: salaries });
  } catch (error) {
    console.error('Error fetching salary:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch salary' } });
  }
});

// POST /api/salary/employees/:employeeId - Set employee salary
router.post('/employees/:employeeId', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      baseSalary: z.number().positive(),
      currency: z.string().default('USD'),
      payFrequency: z.enum(['WEEKLY', 'BIWEEKLY', 'SEMI_MONTHLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']).default('MONTHLY'),
      effectiveFrom: z.string(),
      changeReason: z.string().optional(),
      changeType: z.enum(['PROMOTION', 'ANNUAL_INCREMENT', 'ADJUSTMENT', 'DEMOTION', 'TRANSFER', 'CORRECTION', 'INITIAL']).optional(),
      components: z.array(z.object({
        componentTypeId: z.string().uuid(),
        amount: z.number(),
        percentage: z.number().optional(),
        calculationType: z.enum(['FIXED', 'PERCENTAGE_OF_BASIC', 'PERCENTAGE_OF_GROSS', 'FORMULA', 'ATTENDANCE_BASED']).default('FIXED'),
      })).default([]),
    });

    const data = schema.parse(req.body);

    // Deactivate current salary
    await prisma.employeeSalary.updateMany({
      where: { employeeId: req.params.employeeId, isActive: true },
      data: { isActive: false, effectiveTo: new Date(data.effectiveFrom) },
    });

    // Get previous salary for history
    const prevSalary = await prisma.employeeSalary.findFirst({
      where: { employeeId: req.params.employeeId },
      orderBy: { effectiveFrom: 'desc' },
    });

    // Create new salary record
    const salary = await prisma.employeeSalary.create({
      data: {
        employeeId: req.params.employeeId,
        baseSalary: data.baseSalary,
        currency: data.currency,
        payFrequency: data.payFrequency,
        effectiveFrom: new Date(data.effectiveFrom),
        isActive: true,
        previousSalary: prevSalary?.baseSalary,
        changeReason: data.changeReason,
        changeType: data.changeType,
        components: {
          create: data.components.map(c => ({
            componentTypeId: c.componentTypeId,
            amount: c.amount,
            percentage: c.percentage,
            calculationType: c.calculationType,
          })),
        },
      },
      include: {
        components: { include: { componentType: true } },
      },
    });

    res.status(201).json({ success: true, data: salary });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Error setting salary:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to set salary' } });
  }
});

// PUT /api/salary/:id/components - Update salary components
router.put('/:id/components', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      components: z.array(z.object({
        id: z.string().uuid().optional(),
        componentTypeId: z.string().uuid(),
        amount: z.number(),
        percentage: z.number().optional(),
        calculationType: z.enum(['FIXED', 'PERCENTAGE_OF_BASIC', 'PERCENTAGE_OF_GROSS', 'FORMULA', 'ATTENDANCE_BASED']).default('FIXED'),
        isActive: z.boolean().default(true),
      })),
    });

    const data = schema.parse(req.body);

    // Delete existing components and create new ones
    await prisma.salaryComponent.deleteMany({
      where: { employeeSalaryId: req.params.id },
    });

    const salary = await prisma.employeeSalary.update({
      where: { id: req.params.id },
      data: {
        components: {
          create: data.components.map(c => ({
            componentTypeId: c.componentTypeId,
            amount: c.amount,
            percentage: c.percentage,
            calculationType: c.calculationType,
            isActive: c.isActive,
          })),
        },
      },
      include: {
        components: { include: { componentType: true } },
      },
    });

    res.json({ success: true, data: salary });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Error updating components:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update components' } });
  }
});

export default router;
