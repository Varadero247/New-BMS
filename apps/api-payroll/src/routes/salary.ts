// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
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

// GET /api/salary/component-types - Get salary component types
router.get('/component-types', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { type, category } = req.query;

    const where: Record<string, unknown> = { isActive: true };
    if (type) where.type = type;
    if (category) where.category = category;

    const componentTypes = await prisma.salaryComponentType.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      take: 100,
    });

    res.json({ success: true, data: componentTypes });
  } catch (error) {
    logger.error('Error fetching component types', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch component types' },
    });
  }
});

// POST /api/salary/component-types - Create component type
router.post('/component-types', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      code: z.string().trim().min(1).max(200),
      name: z.string().trim().min(1).max(200),
      description: z.string().trim().optional(),
      category: z.enum(['EARNING', 'DEDUCTION', 'EMPLOYER_CONTRIBUTION', 'REIMBURSEMENT']),
      type: z.enum([
        'BASIC_SALARY',
        'ALLOWANCE',
        'BONUS',
        'COMMISSION',
        'OVERTIME',
        'STATUTORY_DEDUCTION',
        'VOLUNTARY_DEDUCTION',
        'LOAN_REPAYMENT',
        'BENEFIT_CONTRIBUTION',
        'TAX',
        'OTHER',
      ]),
      calculationType: z
        .enum([
          'FIXED',
          'PERCENTAGE_OF_BASIC',
          'PERCENTAGE_OF_GROSS',
          'HOURLY',
          'DAILY',
          'FORMULA',
          'SLAB',
        ])
        .default('FIXED'),
      defaultAmount: z.number().nonnegative().optional(),
      defaultPercentage: z.number().nonnegative().optional(),
      isTaxable: z.boolean().default(true),
      taxCode: z.string().trim().optional(),
      showInPayslip: z.boolean().default(true),
      sortOrder: z.number().int().default(0),
    });

    const data = schema.parse(req.body);

    const componentType = await prisma.salaryComponentType.create({ data });

    res.status(201).json({ success: true, data: componentType });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating component type', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create component type' },
    });
  }
});

// GET /api/salary/employees/:employeeId - Get employee salary
router.get('/employees/:employeeId', async (req: Request, res: Response) => {
  try {
    const salaries = await prisma.employeeSalary.findMany({
      where: { employeeId: req.params.employeeId, deletedAt: null },
      include: {
        components: {
          include: { componentType: true },
        },
      },
      orderBy: { effectiveFrom: 'desc' },
      take: 100,
    });

    res.json({ success: true, data: salaries });
  } catch (error) {
    logger.error('Error fetching salary', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch salary' },
    });
  }
});

// POST /api/salary/employees/:employeeId - Set employee salary
router.post('/employees/:employeeId', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      baseSalary: z.number().positive(),
      currency: z.string().trim().length(3).default('USD'),
      payFrequency: z
        .enum(['WEEKLY', 'BI_WEEKLY', 'SEMI_MONTHLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'])
        .default('MONTHLY'),
      effectiveFrom: z.string().trim(),
      changeReason: z.string().trim().optional(),
      changeType: z
        .enum([
          'PROMOTION',
          'ANNUAL_INCREMENT',
          'ADJUSTMENT',
          'DEMOTION',
          'TRANSFER',
          'CORRECTION',
          'INITIAL',
        ])
        .optional(),
      components: z
        .array(
          z.object({
            componentTypeId: z.string().trim().uuid(),
            amount: z.number().nonnegative(),
            percentage: z.number().nonnegative().optional(),
            calculationType: z
              .enum([
                'FIXED',
                'PERCENTAGE_OF_BASIC',
                'PERCENTAGE_OF_GROSS',
                'HOURLY',
                'DAILY',
                'FORMULA',
                'SLAB',
              ])
              .default('FIXED'),
          })
        )
        .default([]),
    });

    const data = schema.parse(req.body);

    // Deactivate current salary
    await prisma.employeeSalary.updateMany({
      where: { employeeId: req.params.employeeId, isActive: true },
      data: { isActive: false, effectiveTo: new Date(data.effectiveFrom) },
    });

    // Get previous salary for history
    const prevSalary = await prisma.employeeSalary.findFirst({
      where: { employeeId: req.params.employeeId, deletedAt: null },
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
          create: data.components.map((c) => ({
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
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error setting salary', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to set salary' } });
  }
});

// PUT /api/salary/:id/components - Update salary components
router.put(
  '/:id/components',
  checkOwnership(prisma.employeeSalary),
  async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        components: z.array(
          z.object({
            id: z.string().trim().uuid().optional(),
            componentTypeId: z.string().trim().uuid(),
            amount: z.number().nonnegative(),
            percentage: z.number().nonnegative().optional(),
            calculationType: z
              .enum([
                'FIXED',
                'PERCENTAGE_OF_BASIC',
                'PERCENTAGE_OF_GROSS',
                'HOURLY',
                'DAILY',
                'FORMULA',
                'SLAB',
              ])
              .default('FIXED'),
            isActive: z.boolean().default(true),
          })
        ),
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
            create: data.components.map((c) => ({
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
        return res
          .status(400)
          .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
      }
      logger.error('Error updating components', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update components' },
      });
    }
  }
);

export default router;
