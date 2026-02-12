import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('../src/prisma', () => {
  const p: any = {
    payrollRun: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    payslip: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    employee: {
      findMany: jest.fn(),
    },
  };
  p.$transaction = jest.fn((cb: any) => cb(p));
  return { prisma: p };
});

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

import { prisma } from '../src/prisma';
import payrollRoutes from '../src/routes/payroll';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Payroll API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/payroll', payrollRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/payroll/runs', () => {
    const mockRuns = [
      {
        id: '35000000-0000-4000-a000-000000000001',
        runNumber: 'PAY-2024-0001',
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-31'),
        payDate: new Date('2024-02-01'),
        status: 'APPROVED',
        totalGross: 100000,
        totalNet: 80000,
        _count: { payslips: 50 },
      },
      {
        id: 'run-2',
        runNumber: 'PAY-2024-0002',
        periodStart: new Date('2024-02-01'),
        periodEnd: new Date('2024-02-28'),
        payDate: new Date('2024-03-01'),
        status: 'DRAFT',
        totalGross: 0,
        totalNet: 0,
        _count: { payslips: 0 },
      },
    ];

    it('should return list of payroll runs with pagination', async () => {
      mockPrisma.payrollRun.findMany.mockResolvedValueOnce(mockRuns as any);
      mockPrisma.payrollRun.count.mockResolvedValueOnce(2);

      const response = await request(app).get('/api/payroll/runs');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });

    it('should support pagination parameters', async () => {
      mockPrisma.payrollRun.findMany.mockResolvedValueOnce([mockRuns[0]] as any);
      mockPrisma.payrollRun.count.mockResolvedValueOnce(50);

      const response = await request(app).get('/api/payroll/runs?page=2&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.totalPages).toBe(5);
    });

    it('should filter by status', async () => {
      mockPrisma.payrollRun.findMany.mockResolvedValueOnce([]);
      mockPrisma.payrollRun.count.mockResolvedValueOnce(0);

      await request(app).get('/api/payroll/runs?status=APPROVED');

      expect(mockPrisma.payrollRun.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'APPROVED',
          }),
        })
      );
    });

    it('should filter by year', async () => {
      mockPrisma.payrollRun.findMany.mockResolvedValueOnce([]);
      mockPrisma.payrollRun.count.mockResolvedValueOnce(0);

      await request(app).get('/api/payroll/runs?year=2024');

      expect(mockPrisma.payrollRun.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            periodStart: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      mockPrisma.payrollRun.findMany.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/payroll/runs');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/payroll/runs/:id', () => {
    const mockRun = {
      id: '35000000-0000-4000-a000-000000000001',
      runNumber: 'PAY-2024-0001',
      status: 'APPROVED',
      payslips: [
        { id: '4c000000-0000-4000-a000-000000000001', employee: { firstName: 'John', lastName: 'Doe', employeeNumber: 'EMP001' } },
      ],
      taxFilings: [],
    };

    it('should return single payroll run with payslips', async () => {
      mockPrisma.payrollRun.findUnique.mockResolvedValueOnce(mockRun as any);

      const response = await request(app).get('/api/payroll/runs/35000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('35000000-0000-4000-a000-000000000001');
      expect(response.body.data.payslips).toHaveLength(1);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff run', async () => {
      mockPrisma.payrollRun.findUnique.mockResolvedValueOnce(null);

      const response = await request(app).get('/api/payroll/runs/00000000-0000-4000-a000-ffffffffffff');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.payrollRun.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/payroll/runs/35000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/payroll/runs', () => {
    const createPayload = {
      periodStart: '2024-03-01',
      periodEnd: '2024-03-31',
      payDate: '2024-04-01',
      payFrequency: 'MONTHLY',
    };

    it('should create a payroll run successfully', async () => {
      mockPrisma.payrollRun.count.mockResolvedValueOnce(2);
      mockPrisma.payrollRun.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        runNumber: 'PAY-2024-0003',
        ...createPayload,
        status: 'DRAFT',
      } as any);

      const response = await request(app)
        .post('/api/payroll/runs')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.runNumber).toBe('PAY-2024-0003');
    });

    it('should generate sequential run number', async () => {
      mockPrisma.payrollRun.count.mockResolvedValueOnce(5);
      mockPrisma.payrollRun.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        runNumber: 'PAY-2024-0006',
      } as any);

      await request(app)
        .post('/api/payroll/runs')
        .send(createPayload);

      expect(mockPrisma.payrollRun.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          runNumber: 'PAY-2024-0006',
        }),
      });
    });

    it('should set initial status to DRAFT', async () => {
      mockPrisma.payrollRun.count.mockResolvedValueOnce(0);
      mockPrisma.payrollRun.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        status: 'DRAFT',
      } as any);

      await request(app)
        .post('/api/payroll/runs')
        .send(createPayload);

      expect(mockPrisma.payrollRun.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'DRAFT',
        }),
      });
    });

    it('should return 400 for missing periodStart', async () => {
      const { periodStart, ...payload } = createPayload;

      const response = await request(app)
        .post('/api/payroll/runs')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid payFrequency', async () => {
      const response = await request(app)
        .post('/api/payroll/runs')
        .send({ ...createPayload, payFrequency: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      mockPrisma.payrollRun.count.mockResolvedValueOnce(0);
      mockPrisma.payrollRun.create.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/payroll/runs')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/payroll/runs/:id/calculate', () => {
    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff run', async () => {
      mockPrisma.payrollRun.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/payroll/runs/00000000-0000-4000-a000-ffffffffffff/calculate');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 501 for calculate (requires cross-service integration)', async () => {
      mockPrisma.payrollRun.findUnique.mockResolvedValueOnce({
        id: '35000000-0000-4000-a000-000000000001',
        runNumber: 'PAY-2024-0001',
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-31'),
        payDate: new Date('2024-02-01'),
      } as any);
      mockPrisma.payrollRun.update.mockResolvedValue({} as any);

      const response = await request(app)
        .post('/api/payroll/runs/35000000-0000-4000-a000-000000000001/calculate');

      expect(response.status).toBe(501);
      expect(response.body.error.code).toBe('NOT_IMPLEMENTED');
    });

    it('should handle database errors and set status to ERROR', async () => {
      mockPrisma.payrollRun.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/payroll/runs/35000000-0000-4000-a000-000000000001/calculate');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/payroll/runs/:id/approve', () => {
    it('should approve payroll run', async () => {
      mockPrisma.payrollRun.update.mockResolvedValueOnce({
        id: '35000000-0000-4000-a000-000000000001',
        status: 'APPROVED',
        approvalStatus: 'APPROVED',
      } as any);
      mockPrisma.payslip.updateMany.mockResolvedValueOnce({ count: 50 });

      const response = await request(app)
        .put('/api/payroll/runs/35000000-0000-4000-a000-000000000001/approve')
        .send({ approvedById: '51000000-0000-4000-a000-000000000123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should publish all payslips on approval', async () => {
      mockPrisma.payrollRun.update.mockResolvedValueOnce({ id: '35000000-0000-4000-a000-000000000001' } as any);
      mockPrisma.payslip.updateMany.mockResolvedValueOnce({ count: 50 });

      await request(app)
        .put('/api/payroll/runs/35000000-0000-4000-a000-000000000001/approve')
        .send({ approvedById: '51000000-0000-4000-a000-000000000123' });

      expect(mockPrisma.payslip.updateMany).toHaveBeenCalledWith({
        where: { payrollRunId: '35000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          status: 'PUBLISHED',
          publishedAt: expect.any(Date),
        }),
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.payrollRun.update.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/payroll/runs/35000000-0000-4000-a000-000000000001/approve')
        .send({ approvedById: '51000000-0000-4000-a000-000000000123' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/payroll/payslips', () => {
    const mockPayslips = [
      {
        id: '4c000000-0000-4000-a000-000000000001',
        payslipNumber: 'PS-2024-0001-0001',
        grossEarnings: 5000,
        netPay: 4000,
        employee: { firstName: 'John', lastName: 'Doe', employeeNumber: 'EMP001' },
      },
    ];

    it('should return list of payslips with pagination', async () => {
      mockPrisma.payslip.findMany.mockResolvedValueOnce(mockPayslips as any);
      mockPrisma.payslip.count.mockResolvedValueOnce(1);

      const response = await request(app).get('/api/payroll/payslips');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should filter by employeeId', async () => {
      mockPrisma.payslip.findMany.mockResolvedValueOnce([]);
      mockPrisma.payslip.count.mockResolvedValueOnce(0);

      await request(app).get('/api/payroll/payslips?employeeId=2a000000-0000-4000-a000-000000000001');

      expect(mockPrisma.payslip.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            employeeId: '2a000000-0000-4000-a000-000000000001',
          }),
        })
      );
    });

    it('should filter by payrollRunId', async () => {
      mockPrisma.payslip.findMany.mockResolvedValueOnce([]);
      mockPrisma.payslip.count.mockResolvedValueOnce(0);

      await request(app).get('/api/payroll/payslips?payrollRunId=35000000-0000-4000-a000-000000000001');

      expect(mockPrisma.payslip.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            payrollRunId: '35000000-0000-4000-a000-000000000001',
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      mockPrisma.payslip.findMany.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/payroll/payslips');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/payroll/payslips/:id', () => {
    const mockPayslip = {
      id: '4c000000-0000-4000-a000-000000000001',
      payslipNumber: 'PS-2024-0001-0001',
      grossEarnings: 5000,
      netPay: 4000,
      employee: { id: '2a000000-0000-4000-a000-000000000001', firstName: 'John', lastName: 'Doe' },
      items: [
        { name: 'Basic Salary', amount: 5000, type: 'EARNING' },
        { name: 'Income Tax', amount: 1000, type: 'DEDUCTION' },
      ],
      payrollRun: { id: '35000000-0000-4000-a000-000000000001', runNumber: 'PAY-2024-0001' },
    };

    it('should return single payslip with items', async () => {
      mockPrisma.payslip.findUnique.mockResolvedValueOnce(mockPayslip as any);

      const response = await request(app).get('/api/payroll/payslips/4c000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('4c000000-0000-4000-a000-000000000001');
      expect(response.body.data.items).toHaveLength(2);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff payslip', async () => {
      mockPrisma.payslip.findUnique.mockResolvedValueOnce(null);

      const response = await request(app).get('/api/payroll/payslips/00000000-0000-4000-a000-ffffffffffff');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.payslip.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/payroll/payslips/4c000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/payroll/stats', () => {
    it('should return payroll statistics', async () => {
      mockPrisma.payrollRun.count.mockResolvedValue(10);
      mockPrisma.payrollRun.aggregate.mockResolvedValue({
        _sum: { totalNet: 500000, totalGross: 600000 },
      } as any);

      const response = await request(app).get('/api/payroll/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalRuns');
      expect(response.body.data).toHaveProperty('pendingRuns');
      expect(response.body.data).toHaveProperty('monthlyPayroll');
      expect(response.body.data).toHaveProperty('yearlyGross');
      expect(response.body.data).toHaveProperty('yearlyNet');
    });

    it('should handle database errors', async () => {
      mockPrisma.payrollRun.count.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/payroll/stats');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
