import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    employeeSalary: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

import { prisma } from '../src/prisma';
import payrollRoutes from '../src/routes/payroll';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('HR Payroll API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/payroll', payrollRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/payroll', () => {
    const mockSalaries = [
      {
        id: '50000000-0000-4000-a000-000000000001',
        employeeId: '2a000000-0000-4000-a000-000000000001',
        baseSalary: 75000,
        currency: 'USD',
        effectiveDate: new Date('2024-01-01'),
        isActive: true,
        employee: {
          id: '2a000000-0000-4000-a000-000000000001',
          firstName: 'John',
          lastName: 'Doe',
          employeeNumber: 'EMP001',
        },
      },
      {
        id: '50000000-0000-4000-a000-000000000002',
        employeeId: '2a000000-0000-4000-a000-000000000002',
        baseSalary: 60000,
        currency: 'USD',
        effectiveDate: new Date('2024-01-01'),
        isActive: true,
        employee: {
          id: '2a000000-0000-4000-a000-000000000002',
          firstName: 'Alice',
          lastName: 'Smith',
          employeeNumber: 'EMP002',
        },
      },
    ];

    it('should return list of salary records with pagination', async () => {
      (mockPrisma.employeeSalary.findMany as jest.Mock).mockResolvedValueOnce(mockSalaries);
      (mockPrisma.employeeSalary.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app).get('/api/payroll');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toMatchObject({ page: 1, limit: 20, total: 2, totalPages: 1 });
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.employeeSalary.findMany as jest.Mock).mockResolvedValueOnce([mockSalaries[0]]);
      (mockPrisma.employeeSalary.count as jest.Mock).mockResolvedValueOnce(100);

      const response = await request(app).get('/api/payroll?page=3&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(3);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.totalPages).toBe(10);
    });

    it('should filter by employeeId', async () => {
      (mockPrisma.employeeSalary.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.employeeSalary.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/payroll?employeeId=2a000000-0000-4000-a000-000000000001');

      expect(mockPrisma.employeeSalary.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ employeeId: '2a000000-0000-4000-a000-000000000001' }),
        })
      );
    });

    it('should return empty list when no records exist', async () => {
      (mockPrisma.employeeSalary.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.employeeSalary.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app).get('/api/payroll');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.meta.total).toBe(0);
    });

    it('should include employee details', async () => {
      (mockPrisma.employeeSalary.findMany as jest.Mock).mockResolvedValueOnce(mockSalaries);
      (mockPrisma.employeeSalary.count as jest.Mock).mockResolvedValueOnce(2);

      await request(app).get('/api/payroll');

      expect(mockPrisma.employeeSalary.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({ employee: expect.any(Object) }),
        })
      );
    });

    it('should order by effectiveDate descending', async () => {
      (mockPrisma.employeeSalary.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.employeeSalary.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/payroll');

      expect(mockPrisma.employeeSalary.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { effectiveDate: 'desc' } })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeSalary.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/payroll');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('should return JSON content-type', async () => {
      (mockPrisma.employeeSalary.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.employeeSalary.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app).get('/api/payroll');

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('GET /api/payroll/:id', () => {
    const mockSalary = {
      id: '50000000-0000-4000-a000-000000000001',
      employeeId: '2a000000-0000-4000-a000-000000000001',
      baseSalary: 75000,
      currency: 'USD',
      isActive: true,
      employee: {
        id: '2a000000-0000-4000-a000-000000000001',
        firstName: 'John',
        lastName: 'Doe',
      },
    };

    it('should return single salary record', async () => {
      (mockPrisma.employeeSalary.findUnique as jest.Mock).mockResolvedValueOnce(mockSalary);

      const response = await request(app).get('/api/payroll/50000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('50000000-0000-4000-a000-000000000001');
    });

    it('should return 404 for non-existent salary record', async () => {
      (mockPrisma.employeeSalary.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app).get('/api/payroll/00000000-0000-4000-a000-ffffffffffff');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should include employee data', async () => {
      (mockPrisma.employeeSalary.findUnique as jest.Mock).mockResolvedValueOnce(mockSalary);

      await request(app).get('/api/payroll/50000000-0000-4000-a000-000000000001');

      expect(mockPrisma.employeeSalary.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({ employee: true }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeSalary.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/payroll/50000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/payroll', () => {
    const createPayload = {
      employeeId: '11111111-1111-1111-1111-111111111111',
      baseSalary: 65000,
      currency: 'USD',
      effectiveDate: '2024-06-01',
    };

    it('should create salary record successfully', async () => {
      (mockPrisma.employeeSalary.create as jest.Mock).mockResolvedValueOnce({
        id: '50000000-0000-4000-a000-000000000003',
        ...createPayload,
        effectiveDate: new Date('2024-06-01'),
        isActive: true,
        employee: { id: createPayload.employeeId, firstName: 'Jane', lastName: 'Doe' },
      });

      const response = await request(app).post('/api/payroll').send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for missing employeeId', async () => {
      const response = await request(app)
        .post('/api/payroll')
        .send({ baseSalary: 65000, currency: 'USD', effectiveDate: '2024-06-01' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing baseSalary', async () => {
      const response = await request(app)
        .post('/api/payroll')
        .send({ employeeId: '11111111-1111-1111-1111-111111111111', currency: 'USD', effectiveDate: '2024-06-01' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid employeeId format', async () => {
      const response = await request(app)
        .post('/api/payroll')
        .send({ ...createPayload, employeeId: 'not-a-uuid' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for negative baseSalary', async () => {
      const response = await request(app)
        .post('/api/payroll')
        .send({ ...createPayload, baseSalary: -1000 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeSalary.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).post('/api/payroll').send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('should return 201 status on success', async () => {
      (mockPrisma.employeeSalary.create as jest.Mock).mockResolvedValueOnce({
        id: '50000000-0000-4000-a000-000000000004',
        ...createPayload,
        employee: { id: createPayload.employeeId, firstName: 'Bob', lastName: 'Jones' },
      });

      const response = await request(app).post('/api/payroll').send(createPayload);

      expect(response.status).toBe(201);
    });
  });

  describe('PUT /api/payroll/:id', () => {
    it('should update salary record successfully', async () => {
      (mockPrisma.employeeSalary.update as jest.Mock).mockResolvedValueOnce({
        id: '50000000-0000-4000-a000-000000000001',
        baseSalary: 80000,
        employee: { id: '2a000000-0000-4000-a000-000000000001', firstName: 'John', lastName: 'Doe' },
      });

      const response = await request(app)
        .put('/api/payroll/50000000-0000-4000-a000-000000000001')
        .send({ baseSalary: 80000 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid employeeId in update', async () => {
      const response = await request(app)
        .put('/api/payroll/50000000-0000-4000-a000-000000000001')
        .send({ employeeId: 'bad-uuid' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeSalary.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/payroll/50000000-0000-4000-a000-000000000001')
        .send({ baseSalary: 85000 });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('should update notes field', async () => {
      (mockPrisma.employeeSalary.update as jest.Mock).mockResolvedValueOnce({
        id: '50000000-0000-4000-a000-000000000001',
        notes: 'Annual raise',
        employee: { id: '2a000000-0000-4000-a000-000000000001', firstName: 'John', lastName: 'Doe' },
      });

      const response = await request(app)
        .put('/api/payroll/50000000-0000-4000-a000-000000000001')
        .send({ notes: 'Annual raise' });

      expect(response.status).toBe(200);
    });

    it('should return data with id field in response', async () => {
      (mockPrisma.employeeSalary.update as jest.Mock).mockResolvedValueOnce({
        id: '50000000-0000-4000-a000-000000000001',
        baseSalary: 90000,
        employee: { id: '2a000000-0000-4000-a000-000000000001', firstName: 'John', lastName: 'Doe' },
      });

      const response = await request(app)
        .put('/api/payroll/50000000-0000-4000-a000-000000000001')
        .send({ baseSalary: 90000 });

      expect(response.body.data).toHaveProperty('id');
    });
  });
});

describe('HR Payroll API — phase28 coverage', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/payroll', payrollRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/payroll response data is an array', async () => {
    (mockPrisma.employeeSalary.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.employeeSalary.count as jest.Mock).mockResolvedValueOnce(0);
    const response = await request(app).get('/api/payroll');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('GET /api/payroll findMany called once per request', async () => {
    (mockPrisma.employeeSalary.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.employeeSalary.count as jest.Mock).mockResolvedValueOnce(0);
    await request(app).get('/api/payroll');
    expect(mockPrisma.employeeSalary.findMany).toHaveBeenCalledTimes(1);
  });

  it('GET /api/payroll/:id findUnique called with correct id', async () => {
    (mockPrisma.employeeSalary.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '50000000-0000-4000-a000-000000000001',
      baseSalary: 75000,
      employee: { id: '2a000000-0000-4000-a000-000000000001', firstName: 'John', lastName: 'Doe' },
    });
    await request(app).get('/api/payroll/50000000-0000-4000-a000-000000000001');
    expect(mockPrisma.employeeSalary.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '50000000-0000-4000-a000-000000000001' } })
    );
  });

  it('POST /api/payroll returns 400 for empty body', async () => {
    const response = await request(app).post('/api/payroll').send({});
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /api/payroll/:id update called with correct where id', async () => {
    (mockPrisma.employeeSalary.update as jest.Mock).mockResolvedValueOnce({
      id: '50000000-0000-4000-a000-000000000002',
      baseSalary: 70000,
      employee: { id: '2a000000-0000-4000-a000-000000000002', firstName: 'Alice', lastName: 'Smith' },
    });
    await request(app)
      .put('/api/payroll/50000000-0000-4000-a000-000000000002')
      .send({ baseSalary: 70000 });
    const updateCall = (mockPrisma.employeeSalary.update as jest.Mock).mock.calls[0][0];
    expect(updateCall.where.id).toBe('50000000-0000-4000-a000-000000000002');
  });

  it('GET /api/payroll meta has page key', async () => {
    (mockPrisma.employeeSalary.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.employeeSalary.count as jest.Mock).mockResolvedValueOnce(0);
    const response = await request(app).get('/api/payroll');
    expect(response.body.meta).toHaveProperty('page', 1);
  });

  it('GET /api/payroll meta has limit key', async () => {
    (mockPrisma.employeeSalary.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.employeeSalary.count as jest.Mock).mockResolvedValueOnce(0);
    const response = await request(app).get('/api/payroll');
    expect(response.body.meta).toHaveProperty('limit', 20);
  });

  it('GET /api/payroll/:id returns 500 with INTERNAL_ERROR on DB failure', async () => {
    (mockPrisma.employeeSalary.findUnique as jest.Mock).mockRejectedValueOnce(new Error('Connection lost'));
    const response = await request(app).get('/api/payroll/50000000-0000-4000-a000-000000000001');
    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/payroll/:id NOT_FOUND error code on 404', async () => {
    (mockPrisma.employeeSalary.findUnique as jest.Mock).mockResolvedValueOnce(null);
    const response = await request(app).get('/api/payroll/00000000-0000-4000-a000-ffffffffffff');
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('GET /api/payroll totalPages is 0 when no records', async () => {
    (mockPrisma.employeeSalary.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.employeeSalary.count as jest.Mock).mockResolvedValueOnce(0);
    const response = await request(app).get('/api/payroll');
    expect(response.body.meta.totalPages).toBe(0);
  });
});

describe('HR Payroll API — extended coverage', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/payroll', payrollRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/payroll with page=2&limit=5 returns correct meta', async () => {
    (mockPrisma.employeeSalary.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.employeeSalary.count as jest.Mock).mockResolvedValueOnce(50);
    const response = await request(app).get('/api/payroll?page=2&limit=5');
    expect(response.status).toBe(200);
    expect(response.body.meta.totalPages).toBe(10);
    expect(response.body.meta.page).toBe(2);
  });

  it('POST /api/payroll create is called once on success', async () => {
    (mockPrisma.employeeSalary.create as jest.Mock).mockResolvedValueOnce({
      id: '50000000-0000-4000-a000-000000000010',
      employeeId: '11111111-1111-1111-1111-111111111111',
      baseSalary: 70000,
      employee: { id: '11111111-1111-1111-1111-111111111111', firstName: 'Test', lastName: 'User' },
    });
    await request(app).post('/api/payroll').send({
      employeeId: '11111111-1111-1111-1111-111111111111',
      baseSalary: 70000,
      currency: 'USD',
      effectiveDate: '2024-01-01',
    });
    expect(mockPrisma.employeeSalary.create).toHaveBeenCalledTimes(1);
  });

  it('GET /api/payroll/:id data has id field', async () => {
    (mockPrisma.employeeSalary.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '50000000-0000-4000-a000-000000000001',
      baseSalary: 75000,
      employee: { id: 'e1', firstName: 'John', lastName: 'Doe' },
    });
    const response = await request(app).get('/api/payroll/50000000-0000-4000-a000-000000000001');
    expect(response.body.data).toHaveProperty('id');
  });

  it('PUT /api/payroll/:id with currency update succeeds', async () => {
    (mockPrisma.employeeSalary.update as jest.Mock).mockResolvedValueOnce({
      id: '50000000-0000-4000-a000-000000000001',
      currency: 'GBP',
      employee: { id: 'e1', firstName: 'John', lastName: 'Doe' },
    });
    const response = await request(app)
      .put('/api/payroll/50000000-0000-4000-a000-000000000001')
      .send({ currency: 'GBP' });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('GET /api/payroll response body has data key', async () => {
    (mockPrisma.employeeSalary.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.employeeSalary.count as jest.Mock).mockResolvedValueOnce(0);
    const response = await request(app).get('/api/payroll');
    expect(response.body).toHaveProperty('data');
  });

  it('GET /api/payroll count and findMany are both called', async () => {
    (mockPrisma.employeeSalary.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.employeeSalary.count as jest.Mock).mockResolvedValueOnce(0);
    await request(app).get('/api/payroll');
    expect(mockPrisma.employeeSalary.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.employeeSalary.findMany).toHaveBeenCalledTimes(1);
  });

  it('POST /api/payroll data has correct baseSalary in created record', async () => {
    (mockPrisma.employeeSalary.create as jest.Mock).mockResolvedValueOnce({
      id: '50000000-0000-4000-a000-000000000020',
      employeeId: '11111111-1111-1111-1111-111111111111',
      baseSalary: 95000,
      employee: { id: '11111111-1111-1111-1111-111111111111', firstName: 'Test', lastName: 'User' },
    });
    const response = await request(app).post('/api/payroll').send({
      employeeId: '11111111-1111-1111-1111-111111111111',
      baseSalary: 95000,
      currency: 'USD',
      effectiveDate: '2024-03-01',
    });
    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('baseSalary', 95000);
  });

  it('GET /api/payroll response success is boolean true', async () => {
    (mockPrisma.employeeSalary.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.employeeSalary.count as jest.Mock).mockResolvedValueOnce(0);
    const response = await request(app).get('/api/payroll');
    expect(typeof response.body.success).toBe('boolean');
    expect(response.body.success).toBe(true);
  });

  it('PUT /api/payroll/:id 500 has INTERNAL_ERROR code', async () => {
    (mockPrisma.employeeSalary.update as jest.Mock).mockRejectedValueOnce(new Error('Fatal DB error'));
    const response = await request(app)
      .put('/api/payroll/50000000-0000-4000-a000-000000000001')
      .send({ baseSalary: 100000 });
    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/payroll response content-type contains json', async () => {
    (mockPrisma.employeeSalary.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.employeeSalary.count as jest.Mock).mockResolvedValueOnce(0);
    const response = await request(app).get('/api/payroll');
    expect(response.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/payroll response meta has total key', async () => {
    (mockPrisma.employeeSalary.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.employeeSalary.count as jest.Mock).mockResolvedValueOnce(0);
    const response = await request(app).get('/api/payroll');
    expect(response.body.meta).toHaveProperty('total', 0);
  });

  it('POST /api/payroll returns 400 for missing effectiveDate', async () => {
    const response = await request(app).post('/api/payroll').send({
      employeeId: '11111111-1111-1111-1111-111111111111',
      baseSalary: 65000,
      currency: 'USD',
    });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
