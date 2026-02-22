import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('../src/prisma', () => ({
  prisma: {
    employeeLoan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    loanRepayment: {
      createMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));
jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => '30000000-0000-4000-a000-000000000123'),
}));

import { prisma } from '../src/prisma';
import loansRoutes from '../src/routes/loans';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Payroll Loans API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/loans', loansRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/loans', () => {
    const mockLoans = [
      {
        id: '39000000-0000-4000-a000-000000000001',
        loanNumber: 'LN-2024-00001',
        loanType: 'PERSONAL_LOAN',
        principalAmount: 5000,
        totalAmount: 5250,
        status: 'ACTIVE',
        employee: { firstName: 'John', lastName: 'Doe', employeeNumber: 'EMP001' },
        repayments: [],
      },
      {
        id: 'loan-2',
        loanNumber: 'LN-2024-00002',
        loanType: 'SALARY_ADVANCE',
        principalAmount: 2000,
        totalAmount: 2000,
        status: 'PENDING',
        employee: { firstName: 'Alice', lastName: 'Smith', employeeNumber: 'EMP002' },
        repayments: [],
      },
    ];

    it('should return list of loans', async () => {
      (mockPrisma.employeeLoan.findMany as jest.Mock).mockResolvedValueOnce(mockLoans);

      const response = await request(app).get('/api/loans').set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter by employeeId', async () => {
      (mockPrisma.employeeLoan.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/loans?employeeId=2a000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.employeeLoan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            employeeId: '2a000000-0000-4000-a000-000000000001',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.employeeLoan.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/loans?status=ACTIVE').set('Authorization', 'Bearer token');

      expect(mockPrisma.employeeLoan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
          }),
        })
      );
    });

    it('should filter by loanType', async () => {
      (mockPrisma.employeeLoan.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/loans?loanType=PERSONAL_LOAN')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.employeeLoan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            loanType: 'PERSONAL_LOAN',
          }),
        })
      );
    });

    it('should order by createdAt descending', async () => {
      (mockPrisma.employeeLoan.findMany as jest.Mock).mockResolvedValueOnce(mockLoans);

      await request(app).get('/api/loans').set('Authorization', 'Bearer token');

      expect(mockPrisma.employeeLoan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeLoan.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/loans').set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/loans/:id', () => {
    const mockLoan = {
      id: '39000000-0000-4000-a000-000000000001',
      loanNumber: 'LN-2024-00001',
      loanType: 'PERSONAL_LOAN',
      principalAmount: 5000,
      totalAmount: 5250,
      status: 'ACTIVE',
      employee: { firstName: 'John', lastName: 'Doe', employeeNumber: 'EMP001' },
      repayments: [
        {
          id: '4a000000-0000-4000-a000-000000000001',
          installmentNumber: 1,
          amount: 437.5,
          status: 'PAID',
        },
      ],
    };

    it('should return single loan with repayments', async () => {
      (mockPrisma.employeeLoan.findUnique as jest.Mock).mockResolvedValueOnce(mockLoan);

      const response = await request(app)
        .get('/api/loans/39000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('39000000-0000-4000-a000-000000000001');
      expect(response.body.data.repayments).toHaveLength(1);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff loan', async () => {
      (mockPrisma.employeeLoan.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/loans/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeLoan.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/loans/39000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/loans', () => {
    const createPayload = {
      employeeId: '11111111-1111-1111-1111-111111111111',
      loanType: 'PERSONAL_LOAN',
      principalAmount: 5000,
      interestRate: 5,
      termMonths: 12,
      startDate: '2024-01-01',
    };

    it('should create a loan successfully', async () => {
      (mockPrisma.employeeLoan.count as jest.Mock).mockResolvedValueOnce(3);
      (mockPrisma.employeeLoan.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        loanNumber: 'LN-2024-00004',
        ...createPayload,
        totalAmount: 5250,
        installmentAmount: 437.5,
        remainingBalance: 5250,
        status: 'PENDING',
        employee: { firstName: 'John', lastName: 'Doe' },
      });

      const response = await request(app)
        .post('/api/loans')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should calculate total amount with interest', async () => {
      (mockPrisma.employeeLoan.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.employeeLoan.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        totalAmount: 5250,
        installmentAmount: 437.5,
        status: 'PENDING',
        employee: {},
      });

      await request(app)
        .post('/api/loans')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.employeeLoan.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalAmount: 5250,
            status: 'PENDING',
          }),
        })
      );
    });

    it('should set initial status to PENDING', async () => {
      (mockPrisma.employeeLoan.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.employeeLoan.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        status: 'PENDING',
        employee: {},
      });

      await request(app)
        .post('/api/loans')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.employeeLoan.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PENDING',
          }),
        })
      );
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/loans')
        .set('Authorization', 'Bearer token')
        .send({ employeeId: '11111111-1111-1111-1111-111111111111' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid loanType', async () => {
      const response = await request(app)
        .post('/api/loans')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, loanType: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for non-positive principalAmount', async () => {
      const response = await request(app)
        .post('/api/loans')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, principalAmount: -100 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeLoan.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.employeeLoan.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/loans')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/loans/:id/approve', () => {
    it('should approve loan and generate repayment schedule', async () => {
      (mockPrisma.employeeLoan.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '39000000-0000-4000-a000-000000000001',
        principalAmount: 5000,
        interestRate: 5,
        totalAmount: 5250,
        installmentAmount: 437.5,
        termMonths: 12,
        startDate: new Date('2024-01-01'),
      });
      (mockPrisma.loanRepayment.createMany as jest.Mock).mockResolvedValueOnce({ count: 12 });
      (mockPrisma.employeeLoan.update as jest.Mock).mockResolvedValueOnce({
        id: '39000000-0000-4000-a000-000000000001',
        status: 'APPROVED',
        repayments: [],
      });

      const response = await request(app)
        .put('/api/loans/39000000-0000-4000-a000-000000000001/approve')
        .set('Authorization', 'Bearer token')
        .send({ approvedById: 'admin-1' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.loanRepayment.createMany).toHaveBeenCalled();
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff loan', async () => {
      (mockPrisma.employeeLoan.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/loans/00000000-0000-4000-a000-ffffffffffff/approve')
        .set('Authorization', 'Bearer token')
        .send({ approvedById: 'admin-1' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should set status to APPROVED', async () => {
      (mockPrisma.employeeLoan.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '39000000-0000-4000-a000-000000000001',
        principalAmount: 1000,
        interestRate: 0,
        totalAmount: 1000,
        installmentAmount: 500,
        termMonths: 2,
        startDate: new Date('2024-01-01'),
      });
      (mockPrisma.loanRepayment.createMany as jest.Mock).mockResolvedValueOnce({ count: 2 });
      (mockPrisma.employeeLoan.update as jest.Mock).mockResolvedValueOnce({
        id: '39000000-0000-4000-a000-000000000001',
        status: 'APPROVED',
        repayments: [],
      });

      await request(app)
        .put('/api/loans/39000000-0000-4000-a000-000000000001/approve')
        .set('Authorization', 'Bearer token')
        .send({ approvedById: 'admin-1' });

      expect(mockPrisma.employeeLoan.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'APPROVED',
            approvedById: 'admin-1',
            approvedAt: expect.any(Date),
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeLoan.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .put('/api/loans/39000000-0000-4000-a000-000000000001/approve')
        .set('Authorization', 'Bearer token')
        .send({ approvedById: 'admin-1' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/loans/:id/disburse', () => {
    it('should disburse loan successfully', async () => {
      (mockPrisma.employeeLoan.findUnique as jest.Mock).mockResolvedValueOnce({
        principalAmount: 5000,
      });
      (mockPrisma.employeeLoan.update as jest.Mock).mockResolvedValueOnce({
        id: '39000000-0000-4000-a000-000000000001',
        status: 'ACTIVE',
        disbursedAmount: 5000,
      });

      const response = await request(app)
        .put('/api/loans/39000000-0000-4000-a000-000000000001/disburse')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should set status to ACTIVE', async () => {
      (mockPrisma.employeeLoan.findUnique as jest.Mock).mockResolvedValueOnce({
        principalAmount: 5000,
      });
      (mockPrisma.employeeLoan.update as jest.Mock).mockResolvedValueOnce({
        id: '39000000-0000-4000-a000-000000000001',
        status: 'ACTIVE',
      });

      await request(app)
        .put('/api/loans/39000000-0000-4000-a000-000000000001/disburse')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.employeeLoan.update).toHaveBeenCalledWith({
        where: { id: '39000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          status: 'ACTIVE',
          disbursedAt: expect.any(Date),
        }),
      });
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeLoan.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/loans/39000000-0000-4000-a000-000000000001/disburse')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/loans/:id/repayments/:repaymentId/pay', () => {
    it('should record repayment successfully', async () => {
      (mockPrisma.loanRepayment.update as jest.Mock).mockResolvedValueOnce({
        id: '4a000000-0000-4000-a000-000000000001',
        paidAmount: 437.5,
        status: 'PAID',
      });
      (mockPrisma.employeeLoan.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '39000000-0000-4000-a000-000000000001',
        remainingBalance: 4812.5,
        repaidAmount: 437.5,
      });
      (mockPrisma.employeeLoan.update as jest.Mock).mockResolvedValueOnce({
        id: '39000000-0000-4000-a000-000000000001',
        remainingBalance: 4375,
        repaidAmount: 875,
      });

      const response = await request(app)
        .post(
          '/api/loans/39000000-0000-4000-a000-000000000001/repayments/4a000000-0000-4000-a000-000000000001/pay'
        )
        .set('Authorization', 'Bearer token')
        .send({ paidAmount: 437.5, paymentMethod: 'PAYROLL_DEDUCTION' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should update loan remaining balance', async () => {
      (mockPrisma.loanRepayment.update as jest.Mock).mockResolvedValueOnce({
        id: '4a000000-0000-4000-a000-000000000001',
        status: 'PAID',
      });
      (mockPrisma.employeeLoan.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '39000000-0000-4000-a000-000000000001',
        remainingBalance: 1000,
        repaidAmount: 4250,
      });
      (mockPrisma.employeeLoan.update as jest.Mock).mockResolvedValueOnce({
        id: '39000000-0000-4000-a000-000000000001',
        remainingBalance: 562.5,
      });

      await request(app)
        .post(
          '/api/loans/39000000-0000-4000-a000-000000000001/repayments/4a000000-0000-4000-a000-000000000001/pay'
        )
        .set('Authorization', 'Bearer token')
        .send({ paidAmount: 437.5, paymentMethod: 'PAYROLL_DEDUCTION' });

      expect(mockPrisma.employeeLoan.update).toHaveBeenCalledWith({
        where: { id: '39000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          remainingBalance: expect.any(Number),
          repaidAmount: expect.any(Number),
        }),
      });
    });

    it('should handle database errors', async () => {
      (mockPrisma.loanRepayment.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post(
          '/api/loans/39000000-0000-4000-a000-000000000001/repayments/4a000000-0000-4000-a000-000000000001/pay'
        )
        .set('Authorization', 'Bearer token')
        .send({ paidAmount: 437.5, paymentMethod: 'PAYROLL_DEDUCTION' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('Additional coverage: response shape, 500 paths, and validation', () => {
    it('GET /api/loans: response contains success and data array', async () => {
      (mockPrisma.employeeLoan.findMany as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app)
        .get('/api/loans')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('POST /api/loans: returns 400 for non-positive termMonths', async () => {
      const response = await request(app)
        .post('/api/loans')
        .set('Authorization', 'Bearer token')
        .send({
          employeeId: '11111111-1111-1111-1111-111111111111',
          loanType: 'PERSONAL_LOAN',
          principalAmount: 5000,
          interestRate: 5,
          termMonths: 0,
          startDate: '2024-01-01',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('PUT /api/loans/:id/disburse: returns 500 when update throws', async () => {
      (mockPrisma.employeeLoan.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('Prisma error')
      );
      (mockPrisma.employeeLoan.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/loans/39000000-0000-4000-a000-000000000001/disburse')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('GET /api/loans: returns 500 on unexpected error shape', async () => {
      (mockPrisma.employeeLoan.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('Unexpected DB failure')
      );

      const response = await request(app)
        .get('/api/loans')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});
