import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('../src/prisma', () => ({
  prisma: {
    taxFiling: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    taxBracket: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => '30000000-0000-4000-a000-000000000123'),
}));

import { prisma } from '../src/prisma';
import taxRoutes from '../src/routes/tax';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Payroll Tax API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/tax', taxRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tax/filings', () => {
    const mockFilings = [
      {
        id: '3a000000-0000-4000-a000-000000000001',
        filingType: 'QUARTERLY',
        taxPeriod: 'Q1-2024',
        taxYear: 2024,
        grossWages: 500000,
        taxableWages: 450000,
        taxWithheld: 90000,
        totalTax: 100000,
        status: 'FILED',
        filingDeadline: new Date('2024-04-30'),
        payrollRun: { runNumber: 'PAY-2024-0001', periodStart: new Date(), periodEnd: new Date() },
      },
      {
        id: 'filing-2',
        filingType: 'QUARTERLY',
        taxPeriod: 'Q2-2024',
        taxYear: 2024,
        grossWages: 520000,
        taxableWages: 460000,
        taxWithheld: 92000,
        totalTax: 102000,
        status: 'PENDING',
        filingDeadline: new Date('2024-07-31'),
        payrollRun: null,
      },
    ];

    it('should return list of tax filings', async () => {
      (mockPrisma.taxFiling.findMany as jest.Mock).mockResolvedValueOnce(mockFilings);

      const response = await request(app)
        .get('/api/tax/filings')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter by taxYear', async () => {
      (mockPrisma.taxFiling.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/tax/filings?taxYear=2024')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.taxFiling.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            taxYear: 2024,
          }),
        })
      );
    });

    it('should filter by filingType', async () => {
      (mockPrisma.taxFiling.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/tax/filings?filingType=QUARTERLY')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.taxFiling.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            filingType: 'QUARTERLY',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.taxFiling.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/tax/filings?status=PENDING')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.taxFiling.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PENDING',
          }),
        })
      );
    });

    it('should order by filingDeadline descending', async () => {
      (mockPrisma.taxFiling.findMany as jest.Mock).mockResolvedValueOnce(mockFilings);

      await request(app)
        .get('/api/tax/filings')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.taxFiling.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { filingDeadline: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.taxFiling.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/tax/filings')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/tax/filings', () => {
    const createPayload = {
      filingType: 'QUARTERLY',
      taxPeriod: 'Q1-2024',
      taxYear: 2024,
      grossWages: 500000,
      taxableWages: 450000,
      taxWithheld: 90000,
      employerTax: 10000,
      filingDeadline: '2024-04-30',
    };

    it('should create a tax filing successfully', async () => {
      (mockPrisma.taxFiling.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        ...createPayload,
        totalTax: 100000,
        paymentDue: 100000,
        status: 'PENDING',
        filingDeadline: new Date('2024-04-30'),
      });

      const response = await request(app)
        .post('/api/tax/filings')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should calculate totalTax from taxWithheld + employerTax', async () => {
      (mockPrisma.taxFiling.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        totalTax: 100000,
        paymentDue: 100000,
        status: 'PENDING',
      });

      await request(app)
        .post('/api/tax/filings')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.taxFiling.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalTax: 100000,
            paymentDue: 100000,
          }),
        })
      );
    });

    it('should set initial status to PENDING', async () => {
      (mockPrisma.taxFiling.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        status: 'PENDING',
      });

      await request(app)
        .post('/api/tax/filings')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.taxFiling.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PENDING',
          }),
        })
      );
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/tax/filings')
        .set('Authorization', 'Bearer token')
        .send({ filingType: 'QUARTERLY' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid filingType', async () => {
      const response = await request(app)
        .post('/api/tax/filings')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, filingType: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.taxFiling.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/tax/filings')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/tax/filings/:id/file', () => {
    it('should submit tax filing successfully', async () => {
      (mockPrisma.taxFiling.update as jest.Mock).mockResolvedValueOnce({
        id: '3a000000-0000-4000-a000-000000000001',
        status: 'FILED',
        confirmationNumber: 'CONF-12345',
      });

      const response = await request(app)
        .put('/api/tax/filings/3a000000-0000-4000-a000-000000000001/file')
        .set('Authorization', 'Bearer token')
        .send({
          filedById: 'admin-1',
          confirmationNumber: 'CONF-12345',
          filingDocumentUrl: 'https://example.com/doc.pdf',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should set status to FILED', async () => {
      (mockPrisma.taxFiling.update as jest.Mock).mockResolvedValueOnce({
        id: '3a000000-0000-4000-a000-000000000001',
        status: 'FILED',
      });

      await request(app)
        .put('/api/tax/filings/3a000000-0000-4000-a000-000000000001/file')
        .set('Authorization', 'Bearer token')
        .send({ filedById: 'admin-1', confirmationNumber: 'CONF-12345' });

      expect(mockPrisma.taxFiling.update).toHaveBeenCalledWith({
        where: { id: '3a000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          status: 'FILED',
          filedAt: expect.any(Date),
          filedById: 'admin-1',
          confirmationNumber: 'CONF-12345',
        }),
      });
    });

    it('should handle database errors', async () => {
      (mockPrisma.taxFiling.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/tax/filings/3a000000-0000-4000-a000-000000000001/file')
        .set('Authorization', 'Bearer token')
        .send({ filedById: 'admin-1', confirmationNumber: 'CONF-12345' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/tax/filings/:id/pay', () => {
    it('should record tax payment successfully', async () => {
      (mockPrisma.taxFiling.update as jest.Mock).mockResolvedValueOnce({
        id: '3a000000-0000-4000-a000-000000000001',
        paymentStatus: 'COMPLETED',
        paymentReference: 'PAY-REF-12345',
      });

      const response = await request(app)
        .put('/api/tax/filings/3a000000-0000-4000-a000-000000000001/pay')
        .set('Authorization', 'Bearer token')
        .send({ paymentReference: 'PAY-REF-12345' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should set paymentStatus to COMPLETED', async () => {
      (mockPrisma.taxFiling.update as jest.Mock).mockResolvedValueOnce({
        id: '3a000000-0000-4000-a000-000000000001',
        paymentStatus: 'COMPLETED',
      });

      await request(app)
        .put('/api/tax/filings/3a000000-0000-4000-a000-000000000001/pay')
        .set('Authorization', 'Bearer token')
        .send({ paymentReference: 'PAY-REF-12345' });

      expect(mockPrisma.taxFiling.update).toHaveBeenCalledWith({
        where: { id: '3a000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          paymentStatus: 'COMPLETED',
          paymentDate: expect.any(Date),
          paymentReference: 'PAY-REF-12345',
        }),
      });
    });

    it('should handle database errors', async () => {
      (mockPrisma.taxFiling.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/tax/filings/3a000000-0000-4000-a000-000000000001/pay')
        .set('Authorization', 'Bearer token')
        .send({ paymentReference: 'PAY-REF-12345' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/tax/brackets', () => {
    const mockBrackets = [
      {
        id: 'bracket-1',
        taxYear: 2024,
        country: 'US',
        minIncome: 0,
        maxIncome: 11000,
        rate: 10,
        isActive: true,
      },
      {
        id: 'bracket-2',
        taxYear: 2024,
        country: 'US',
        minIncome: 11001,
        maxIncome: 44725,
        rate: 12,
        isActive: true,
      },
    ];

    it('should return list of tax brackets', async () => {
      (mockPrisma.taxBracket.findMany as jest.Mock).mockResolvedValueOnce(mockBrackets);

      const response = await request(app)
        .get('/api/tax/brackets')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter by taxYear', async () => {
      (mockPrisma.taxBracket.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/tax/brackets?taxYear=2024')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.taxBracket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            taxYear: 2024,
          }),
        })
      );
    });

    it('should filter by country', async () => {
      (mockPrisma.taxBracket.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/tax/brackets?country=US')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.taxBracket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            country: 'US',
          }),
        })
      );
    });

    it('should only return active brackets by default', async () => {
      (mockPrisma.taxBracket.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/tax/brackets')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.taxBracket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });

    it('should order by minIncome ascending', async () => {
      (mockPrisma.taxBracket.findMany as jest.Mock).mockResolvedValueOnce(mockBrackets);

      await request(app)
        .get('/api/tax/brackets')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.taxBracket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { minIncome: 'asc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.taxBracket.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/tax/brackets')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/tax/brackets', () => {
    const createPayload = {
      taxYear: 2024,
      country: 'US',
      minIncome: 0,
      rate: 10,
    };

    it('should create a tax bracket successfully', async () => {
      (mockPrisma.taxBracket.create as jest.Mock).mockResolvedValueOnce({
        id: 'new-bracket-123',
        ...createPayload,
        maxIncome: null,
        fixedAmount: 0,
        isActive: true,
      });

      const response = await request(app)
        .post('/api/tax/brackets')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/tax/brackets')
        .set('Authorization', 'Bearer token')
        .send({ taxYear: 2024 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.taxBracket.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/tax/brackets')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/tax/summary', () => {
    it('should return tax summary', async () => {
      (mockPrisma.taxFiling.groupBy as jest.Mock).mockResolvedValueOnce([
        { status: 'FILED', _count: 5 },
        { status: 'PENDING', _count: 2 },
      ]);
      (mockPrisma.taxFiling.aggregate as jest.Mock).mockResolvedValueOnce({
        _sum: { totalTax: 500000, paymentDue: 200000 },
      });
      (mockPrisma.taxFiling.findMany as jest.Mock).mockResolvedValueOnce([
        { id: 'filing-2', filingDeadline: new Date('2024-07-31'), status: 'PENDING' },
      ]);

      const response = await request(app)
        .get('/api/tax/summary')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('byStatus');
      expect(response.body.data).toHaveProperty('totalTax');
      expect(response.body.data).toHaveProperty('totalDue');
      expect(response.body.data).toHaveProperty('upcomingDeadlines');
    });

    it('should accept year parameter', async () => {
      (mockPrisma.taxFiling.groupBy as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.taxFiling.aggregate as jest.Mock).mockResolvedValueOnce({
        _sum: { totalTax: 0, paymentDue: 0 },
      });
      (mockPrisma.taxFiling.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/tax/summary?year=2024')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.taxFiling.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { taxYear: 2024 },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.taxFiling.groupBy as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/tax/summary')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
