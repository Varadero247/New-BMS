import { Router, Request, Response } from 'express';
import { prisma } from '@ims/database';
import { z } from 'zod';

const router: Router = Router();

// GET /api/payroll/runs - Get payroll runs
router.get('/runs', async (req: Request, res: Response) => {
  try {
    const { status, year, page = '1', limit = '20' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    if (status) where.status = status;
    if (year) {
      const startOfYear = new Date(parseInt(year as string), 0, 1);
      const endOfYear = new Date(parseInt(year as string), 11, 31);
      where.periodStart = { gte: startOfYear, lte: endOfYear };
    }

    const [runs, total] = await Promise.all([
      prisma.payrollRun.findMany({
        where,
        include: {
          _count: { select: { payslips: true } },
        },
        skip,
        take,
        orderBy: { periodStart: 'desc' },
      }),
      prisma.payrollRun.count({ where }),
    ]);

    res.json({
      success: true,
      data: runs,
      meta: { page: parseInt(page as string), limit: take, total, totalPages: Math.ceil(total / take) },
    });
  } catch (error) {
    console.error('Error fetching payroll runs:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch payroll runs' } });
  }
});

// GET /api/payroll/runs/:id - Get single payroll run
router.get('/runs/:id', async (req: Request, res: Response) => {
  try {
    const run = await prisma.payrollRun.findUnique({
      where: { id: req.params.id },
      include: {
        payslips: {
          include: {
            employee: { select: { firstName: true, lastName: true, employeeNumber: true } },
          },
        },
        taxFilings: true,
      },
    });

    if (!run) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Payroll run not found' } });
    }

    res.json({ success: true, data: run });
  } catch (error) {
    console.error('Error fetching payroll run:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch payroll run' } });
  }
});

// POST /api/payroll/runs - Create payroll run
router.post('/runs', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      periodStart: z.string(),
      periodEnd: z.string(),
      payDate: z.string(),
      payFrequency: z.enum(['WEEKLY', 'BIWEEKLY', 'SEMI_MONTHLY', 'MONTHLY']),
    });

    const data = schema.parse(req.body);

    // Generate run number
    const year = new Date(data.periodStart).getFullYear();
    const count = await prisma.payrollRun.count({
      where: {
        periodStart: {
          gte: new Date(year, 0, 1),
          lte: new Date(year, 11, 31),
        },
      },
    });
    const runNumber = `PAY-${year}-${String(count + 1).padStart(4, '0')}`;

    const run = await prisma.payrollRun.create({
      data: {
        runNumber,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        payDate: new Date(data.payDate),
        payFrequency: data.payFrequency,
        status: 'DRAFT',
      },
    });

    res.status(201).json({ success: true, data: run });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Error creating payroll run:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create payroll run' } });
  }
});

// POST /api/payroll/runs/:id/calculate - Calculate payroll
router.post('/runs/:id/calculate', async (req: Request, res: Response) => {
  try {
    const run = await prisma.payrollRun.findUnique({
      where: { id: req.params.id },
    });

    if (!run) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Payroll run not found' } });
    }

    // Update status to calculating
    await prisma.payrollRun.update({
      where: { id: req.params.id },
      data: { status: 'CALCULATING' },
    });

    // Get all active employees with salary
    const employees = await prisma.employee.findMany({
      where: { employmentStatus: 'ACTIVE' },
      include: {
        salaryRecords: {
          where: { isActive: true },
          include: { components: { include: { componentType: true } } },
        },
        benefits: {
          where: { status: 'ACTIVE' },
          include: { benefitPlan: true },
        },
        loans: {
          where: { status: 'ACTIVE' },
          include: { repayments: { where: { status: 'PENDING' }, take: 1 } },
        },
      },
    });

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;
    let processedCount = 0;

    for (const employee of employees) {
      const salary = employee.salaryRecords[0];
      if (!salary) continue;

      // Calculate gross earnings
      let grossEarnings = salary.baseSalary;
      const earningItems: any[] = [
        { category: 'BASIC', type: 'EARNING', name: 'Basic Salary', amount: salary.baseSalary },
      ];

      // Add salary components
      for (const comp of salary.components) {
        if (comp.componentType.type === 'EARNING') {
          grossEarnings += comp.amount;
          earningItems.push({
            category: comp.componentType.category,
            type: 'EARNING',
            name: comp.componentType.name,
            amount: comp.amount,
            componentTypeId: comp.componentTypeId,
          });
        }
      }

      // Calculate deductions
      let totalDeductionsForEmployee = 0;
      const deductionItems: any[] = [];

      // Tax calculation (simplified - 20% flat rate for demo)
      const taxableIncome = grossEarnings;
      const incomeTax = taxableIncome * 0.2;
      totalDeductionsForEmployee += incomeTax;
      deductionItems.push({
        category: 'STATUTORY',
        type: 'DEDUCTION',
        name: 'Income Tax',
        amount: incomeTax,
        isTaxable: false,
      });

      // Add salary component deductions
      for (const comp of salary.components) {
        if (comp.componentType.type === 'DEDUCTION') {
          totalDeductionsForEmployee += comp.amount;
          deductionItems.push({
            category: comp.componentType.category,
            type: 'DEDUCTION',
            name: comp.componentType.name,
            amount: comp.amount,
            componentTypeId: comp.componentTypeId,
          });
        }
      }

      // Benefits deductions
      for (const benefit of employee.benefits) {
        if (benefit.employeeContribution > 0) {
          totalDeductionsForEmployee += benefit.employeeContribution;
          deductionItems.push({
            category: 'DEDUCTION',
            type: 'DEDUCTION',
            name: benefit.benefitPlan.name,
            amount: benefit.employeeContribution,
          });
        }
      }

      // Loan repayments
      for (const loan of employee.loans) {
        if (loan.repayments[0]) {
          totalDeductionsForEmployee += loan.repayments[0].amount;
          deductionItems.push({
            category: 'DEDUCTION',
            type: 'DEDUCTION',
            name: `Loan: ${loan.loanNumber}`,
            amount: loan.repayments[0].amount,
          });
        }
      }

      const netPay = grossEarnings - totalDeductionsForEmployee;

      // Generate payslip number
      const payslipNumber = `PS-${run.runNumber.replace('PAY-', '')}-${String(processedCount + 1).padStart(4, '0')}`;

      // Create payslip
      await prisma.payslip.create({
        data: {
          payslipNumber,
          payrollRunId: run.id,
          employeeId: employee.id,
          periodStart: run.periodStart,
          periodEnd: run.periodEnd,
          payDate: run.payDate,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          employeeNumber: employee.employeeNumber,
          department: '',
          position: employee.jobTitle,
          workingDays: 22, // Simplified
          paidDays: 22,
          leaveDays: 0,
          unpaidLeaveDays: 0,
          basicSalary: salary.baseSalary,
          grossEarnings,
          totalDeductions: totalDeductionsForEmployee,
          statutoryDeductions: incomeTax,
          netPay,
          currency: salary.currency,
          taxableIncome,
          incomeTax,
          status: 'GENERATED',
          items: {
            create: [...earningItems, ...deductionItems],
          },
        },
      });

      totalGross += grossEarnings;
      totalDeductions += totalDeductionsForEmployee;
      totalNet += netPay;
      processedCount++;
    }

    // Update run with totals
    const updatedRun = await prisma.payrollRun.update({
      where: { id: req.params.id },
      data: {
        status: 'CALCULATED',
        totalEmployees: employees.length,
        processedEmployees: processedCount,
        totalGross,
        totalDeductions,
        totalNet,
      },
      include: {
        _count: { select: { payslips: true } },
      },
    });

    res.json({ success: true, data: updatedRun });
  } catch (error) {
    console.error('Error calculating payroll:', error);
    // Reset status on error
    await prisma.payrollRun.update({
      where: { id: req.params.id },
      data: { status: 'ERROR' },
    });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to calculate payroll' } });
  }
});

// PUT /api/payroll/runs/:id/approve - Approve payroll run
router.put('/runs/:id/approve', async (req: Request, res: Response) => {
  try {
    const { approvedById } = req.body;

    const run = await prisma.payrollRun.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        approvalStatus: 'APPROVED',
        approvedById,
        approvedAt: new Date(),
      },
    });

    // Publish all payslips
    await prisma.payslip.updateMany({
      where: { payrollRunId: req.params.id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });

    res.json({ success: true, data: run });
  } catch (error) {
    console.error('Error approving payroll:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to approve payroll' } });
  }
});

// Payslips
// GET /api/payroll/payslips - Get payslips
router.get('/payslips', async (req: Request, res: Response) => {
  try {
    const { employeeId, payrollRunId, page = '1', limit = '20' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (payrollRunId) where.payrollRunId = payrollRunId;

    const [payslips, total] = await Promise.all([
      prisma.payslip.findMany({
        where,
        include: {
          employee: { select: { firstName: true, lastName: true, employeeNumber: true } },
        },
        skip,
        take,
        orderBy: { payDate: 'desc' },
      }),
      prisma.payslip.count({ where }),
    ]);

    res.json({
      success: true,
      data: payslips,
      meta: { page: parseInt(page as string), limit: take, total, totalPages: Math.ceil(total / take) },
    });
  } catch (error) {
    console.error('Error fetching payslips:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch payslips' } });
  }
});

// GET /api/payroll/payslips/:id - Get single payslip
router.get('/payslips/:id', async (req: Request, res: Response) => {
  try {
    const payslip = await prisma.payslip.findUnique({
      where: { id: req.params.id },
      include: {
        employee: true,
        items: { orderBy: { sortOrder: 'asc' } },
        payrollRun: true,
      },
    });

    if (!payslip) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Payslip not found' } });
    }

    res.json({ success: true, data: payslip });
  } catch (error) {
    console.error('Error fetching payslip:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch payslip' } });
  }
});

// Stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const [
      totalRuns,
      pendingRuns,
      monthlyPayroll,
      yearlyTotal,
    ] = await Promise.all([
      prisma.payrollRun.count(),
      prisma.payrollRun.count({ where: { status: { in: ['DRAFT', 'CALCULATED', 'UNDER_REVIEW'] } } }),
      prisma.payrollRun.aggregate({
        where: {
          periodStart: {
            gte: new Date(currentYear, currentMonth, 1),
            lte: new Date(currentYear, currentMonth + 1, 0),
          },
          status: { in: ['APPROVED', 'COMPLETED'] },
        },
        _sum: { totalNet: true },
      }),
      prisma.payrollRun.aggregate({
        where: {
          periodStart: {
            gte: new Date(currentYear, 0, 1),
            lte: new Date(currentYear, 11, 31),
          },
          status: { in: ['APPROVED', 'COMPLETED'] },
        },
        _sum: { totalNet: true, totalGross: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalRuns,
        pendingRuns,
        monthlyPayroll: monthlyPayroll._sum.totalNet || 0,
        yearlyGross: yearlyTotal._sum.totalGross || 0,
        yearlyNet: yearlyTotal._sum.totalNet || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats' } });
  }
});

export default router;
