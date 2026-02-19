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
router.param('repaymentId', validateIdParam('repaymentId'));

// GET /api/loans - Get all loans
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { employeeId, status, loanType } = req.query;

    const where: any = { deletedAt: null };
    if (employeeId) where.employeeId = employeeId as any;
    if (status) where.status = status as any;
    if (loanType) where.loanType = loanType as any;

    const loans = await prisma.employeeLoan.findMany({
      where,
      include: {
        repayments: {
          orderBy: { dueDate: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json({ success: true, data: loans });
  } catch (error) {
    logger.error('Error fetching loans', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch loans' },
    });
  }
});

// GET /api/loans/:id - Get single loan
router.get('/:id', checkOwnership(prisma.employeeLoan), async (req: Request, res: Response) => {
  try {
    const loan = await prisma.employeeLoan.findUnique({
      where: { id: req.params.id },
      include: {
        repayments: {
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!loan) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Loan not found' } });
    }

    res.json({ success: true, data: loan });
  } catch (error) {
    logger.error('Error fetching loan', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch loan' } });
  }
});

// POST /api/loans - Create loan
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      employeeId: z.string().trim().uuid(),
      loanType: z.enum([
        'SALARY_ADVANCE',
        'PERSONAL_LOAN',
        'EMERGENCY_LOAN',
        'HOUSING_LOAN',
        'VEHICLE_LOAN',
        'EDUCATION_LOAN',
        'OTHER',
      ]),
      principalAmount: z.number().positive(),
      interestRate: z.number().min(0).default(0),
      termMonths: z.number().positive(),
      startDate: z
        .string()
        .trim()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
      paymentFrequency: z
        .enum(['WEEKLY', 'BI_WEEKLY', 'SEMI_MONTHLY', 'MONTHLY'])
        .default('MONTHLY'),
      purpose: z.string().trim().optional(),
      notes: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    // Calculate total amount and installment
    const totalInterest = data.principalAmount * (data.interestRate / 100) * (data.termMonths / 12);
    const totalAmount = data.principalAmount + totalInterest;
    const installmentAmount = totalAmount / data.termMonths;

    // Generate loan number
    const count = await prisma.employeeLoan.count();
    const loanNumber = `LN-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    // Calculate end date
    const startDate = new Date(data.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + data.termMonths);

    const loan = await prisma.employeeLoan.create({
      data: {
        loanNumber,
        employeeId: data.employeeId,
        loanType: data.loanType,
        principalAmount: data.principalAmount,
        interestRate: data.interestRate,
        totalAmount,
        termMonths: data.termMonths,
        startDate,
        endDate,
        installmentAmount,
        paymentFrequency: data.paymentFrequency,
        remainingBalance: totalAmount,
        status: 'PENDING',
        purpose: data.purpose,
        notes: data.notes,
      } as any,
    });

    res.status(201).json({ success: true, data: loan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating loan', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create loan' },
    });
  }
});

// PUT /api/loans/:id/approve - Approve loan
router.put(
  '/:id/approve',
  checkOwnership(prisma.employeeLoan),
  async (req: Request, res: Response) => {
    try {
      const _schema = z.object({ approvedById: z.string().trim().optional() });
      const _parsed = _schema.safeParse(req.body);
      if (!_parsed.success)
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: _parsed.error.errors[0].message },
        });
      const { approvedById } = _parsed.data;

      const loanData = await prisma.employeeLoan.findUnique({ where: { id: req.params.id } });
      if (!loanData) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Loan not found' } });
      }

      // Generate repayment schedule
      const repayments = [];
      const startDate = new Date(loanData.startDate);
      const monthlyInterest =
        (Number(loanData.principalAmount) * (Number(loanData.interestRate) / 100)) /
        loanData.termMonths;
      const monthlyPrincipal = Number(loanData.principalAmount) / loanData.termMonths;

      for (let i = 1; i <= loanData.termMonths; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        repayments.push({
          loanId: req.params.id,
          installmentNumber: i,
          dueDate,
          amount: loanData.installmentAmount,
          principal: monthlyPrincipal,
          interest: monthlyInterest,
          status: 'PENDING' as const,
        });
      }

      // Create repayments
      await prisma.loanRepayment.createMany({
        data: repayments,
      });

      // Update loan status
      const loan = await prisma.employeeLoan.update({
        where: { id: req.params.id },
        data: {
          status: 'APPROVED',
          approvedById,
          approvedAt: new Date(),
        },
        include: {
          repayments: true,
        },
      });

      res.json({ success: true, data: loan });
    } catch (error) {
      logger.error('Error approving loan', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to approve loan' },
      });
    }
  }
);

// PUT /api/loans/:id/disburse - Disburse loan
router.put(
  '/:id/disburse',
  checkOwnership(prisma.employeeLoan),
  async (req: Request, res: Response) => {
    try {
      const loan = await prisma.employeeLoan.update({
        where: { id: req.params.id },
        data: {
          status: 'ACTIVE',
          disbursedAmount: (await prisma.employeeLoan.findUnique({ where: { id: req.params.id } }))
            ?.principalAmount,
          disbursedAt: new Date(),
        },
      });

      res.json({ success: true, data: loan });
    } catch (error) {
      logger.error('Error disbursing loan', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to disburse loan' },
      });
    }
  }
);

// POST /api/loans/:id/repayments/:repaymentId/pay - Record repayment
router.post(
  '/:id/repayments/:repaymentId/pay',
  checkOwnership(prisma.employeeLoan),
  async (req: Request, res: Response) => {
    try {
      const _schema = z.object({
        paidAmount: z.number().positive(),
        paymentMethod: z.string().trim().optional(),
      });
      const _parsed = _schema.safeParse(req.body);
      if (!_parsed.success)
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: _parsed.error.errors[0].message },
        });
      const { paidAmount, paymentMethod } = _parsed.data;
      if (typeof paidAmount !== 'number' || paidAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'paidAmount must be a positive number' },
        });
      }

      const repayment = await prisma.loanRepayment.update({
        where: { id: req.params.repaymentId },
        data: {
          paidAmount,
          paidDate: new Date(),
          paymentMethod,
          status: 'PAID',
        },
      });

      // Update loan balance
      const loan = await prisma.employeeLoan.findUnique({ where: { id: req.params.id } });
      if (loan) {
        const newBalance = Number(loan.remainingBalance) - paidAmount;
        const newRepaid = Number(loan.repaidAmount) + paidAmount;

        await prisma.employeeLoan.update({
          where: { id: req.params.id },
          data: {
            remainingBalance: newBalance,
            repaidAmount: newRepaid,
            status: newBalance <= 0 ? 'COMPLETED' : 'ACTIVE',
          },
        });
      }

      res.json({ success: true, data: repayment });
    } catch (error) {
      logger.error('Error recording repayment', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to record repayment' },
      });
    }
  }
);

export default router;
