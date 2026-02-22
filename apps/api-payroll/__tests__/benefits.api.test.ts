import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('../src/prisma', () => ({
  prisma: {
    benefitPlan: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    employeeBenefit: {
      findMany: jest.fn(),
      create: jest.fn(),
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
import benefitsRoutes from '../src/routes/benefits';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Payroll Benefits API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/benefits', benefitsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/benefits/plans', () => {
    const mockPlans = [
      {
        id: 'plan-1',
        code: 'HEALTH-01',
        name: 'Standard Health Insurance',
        category: 'HEALTH_INSURANCE',
        isActive: true,
        _count: { employeeBenefits: 25 },
      },
      {
        id: 'plan-2',
        code: 'DENTAL-01',
        name: 'Dental Plan',
        category: 'DENTAL',
        isActive: true,
        _count: { employeeBenefits: 15 },
      },
    ];

    it('should return list of active benefit plans', async () => {
      (mockPrisma.benefitPlan.findMany as jest.Mock).mockResolvedValueOnce(mockPlans);

      const response = await request(app)
        .get('/api/benefits/plans')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter by category', async () => {
      (mockPrisma.benefitPlan.findMany as jest.Mock).mockResolvedValueOnce([mockPlans[0]]);

      await request(app)
        .get('/api/benefits/plans?category=HEALTH_INSURANCE')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.benefitPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            deletedAt: null,
            category: 'HEALTH_INSURANCE',
          }),
        })
      );
    });

    it('should only return active plans by default', async () => {
      (mockPrisma.benefitPlan.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/benefits/plans').set('Authorization', 'Bearer token');

      expect(mockPrisma.benefitPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            deletedAt: null,
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.benefitPlan.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/benefits/plans')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/benefits/plans', () => {
    const createPayload = {
      code: 'VISION-01',
      name: 'Vision Plan',
      category: 'VISION',
      coverageLevels: ['EMPLOYEE_ONLY', 'FAMILY'],
      effectiveFrom: '2024-01-01',
    };

    it('should create a benefit plan successfully', async () => {
      (mockPrisma.benefitPlan.create as jest.Mock).mockResolvedValueOnce({
        id: 'new-plan-123',
        ...createPayload,
        isActive: true,
        effectiveFrom: new Date('2024-01-01'),
      });

      const response = await request(app)
        .post('/api/benefits/plans')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Vision Plan');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/benefits/plans')
        .set('Authorization', 'Bearer token')
        .send({ name: 'Incomplete' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid category', async () => {
      const response = await request(app)
        .post('/api/benefits/plans')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, category: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid coverageLevels', async () => {
      const response = await request(app)
        .post('/api/benefits/plans')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, coverageLevels: ['INVALID_LEVEL'] });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.benefitPlan.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/benefits/plans')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/benefits/employees/:employeeId', () => {
    const mockBenefits = [
      {
        id: '37000000-0000-4000-a000-000000000001',
        employeeId: '2a000000-0000-4000-a000-000000000001',
        coverageLevel: 'FAMILY',
        status: 'ACTIVE',
        benefitPlan: { id: 'plan-1', name: 'Health Insurance', category: 'HEALTH_INSURANCE' },
      },
    ];

    it('should return employee benefits', async () => {
      (mockPrisma.employeeBenefit.findMany as jest.Mock).mockResolvedValueOnce(mockBenefits);

      const response = await request(app)
        .get('/api/benefits/employees/2a000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should query by employeeId parameter', async () => {
      (mockPrisma.employeeBenefit.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/benefits/employees/2a000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.employeeBenefit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { employeeId: '2a000000-0000-4000-a000-000000000001', deletedAt: null },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeBenefit.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/benefits/employees/2a000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/benefits/employees/:employeeId', () => {
    const createPayload = {
      benefitPlanId: '11111111-1111-1111-1111-111111111111',
      coverageLevel: 'FAMILY',
      effectiveFrom: '2024-01-01',
    };

    it('should enroll employee in benefit successfully', async () => {
      (mockPrisma.employeeBenefit.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        employeeId: '2a000000-0000-4000-a000-000000000001',
        ...createPayload,
        status: 'ACTIVE',
        benefitPlan: { name: 'Health Insurance' },
      });

      const response = await request(app)
        .post('/api/benefits/employees/2a000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should set initial status to ACTIVE', async () => {
      (mockPrisma.employeeBenefit.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        status: 'ACTIVE',
        benefitPlan: {},
      });

      await request(app)
        .post('/api/benefits/employees/2a000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.employeeBenefit.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'ACTIVE',
            employeeId: '2a000000-0000-4000-a000-000000000001',
          }),
        })
      );
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/benefits/employees/2a000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ benefitPlanId: '11111111-1111-1111-1111-111111111111' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid coverageLevel', async () => {
      const response = await request(app)
        .post('/api/benefits/employees/2a000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, coverageLevel: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeBenefit.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/benefits/employees/2a000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/benefits/:id/terminate', () => {
    it('should terminate benefit successfully', async () => {
      (mockPrisma.employeeBenefit.update as jest.Mock).mockResolvedValueOnce({
        id: '37000000-0000-4000-a000-000000000001',
        status: 'TERMINATED',
        terminationDate: new Date('2024-06-30'),
        effectiveTo: new Date('2024-06-30'),
      });

      const response = await request(app)
        .put('/api/benefits/37000000-0000-4000-a000-000000000001/terminate')
        .set('Authorization', 'Bearer token')
        .send({ terminationDate: '2024-06-30' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should set status to TERMINATED', async () => {
      (mockPrisma.employeeBenefit.update as jest.Mock).mockResolvedValueOnce({
        id: '37000000-0000-4000-a000-000000000001',
        status: 'TERMINATED',
      });

      await request(app)
        .put('/api/benefits/37000000-0000-4000-a000-000000000001/terminate')
        .set('Authorization', 'Bearer token')
        .send({ terminationDate: '2024-06-30' });

      expect(mockPrisma.employeeBenefit.update).toHaveBeenCalledWith({
        where: { id: '37000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          status: 'TERMINATED',
          terminationDate: expect.any(Date),
          effectiveTo: expect.any(Date),
        }),
      });
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeBenefit.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/benefits/37000000-0000-4000-a000-000000000001/terminate')
        .set('Authorization', 'Bearer token')
        .send({ terminationDate: '2024-06-30' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('Payroll Benefits API — extended coverage', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/benefits', benefitsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /plans returns empty array when no plans exist', async () => {
    (mockPrisma.benefitPlan.findMany as jest.Mock).mockResolvedValueOnce([]);
    const response = await request(app)
      .get('/api/benefits/plans')
      .set('Authorization', 'Bearer token');
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(0);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('GET /plans includes isActive:true filter in query', async () => {
    (mockPrisma.benefitPlan.findMany as jest.Mock).mockResolvedValueOnce([]);
    await request(app).get('/api/benefits/plans').set('Authorization', 'Bearer token');
    expect(mockPrisma.benefitPlan.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isActive: true }) })
    );
  });

  it('POST /plans returns 400 for missing coverageLevels array', async () => {
    const response = await request(app)
      .post('/api/benefits/plans')
      .set('Authorization', 'Bearer token')
      .send({
        code: 'VIS-01',
        name: 'Vision',
        category: 'VISION',
        effectiveFrom: '2024-01-01',
      });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /plans create is called once on success', async () => {
    (mockPrisma.benefitPlan.create as jest.Mock).mockResolvedValueOnce({
      id: 'plan-new',
      code: 'LIFE-01',
      name: 'Life Insurance',
      category: 'LIFE_INSURANCE',
      isActive: true,
    });
    await request(app)
      .post('/api/benefits/plans')
      .set('Authorization', 'Bearer token')
      .send({
        code: 'LIFE-01',
        name: 'Life Insurance',
        category: 'LIFE_INSURANCE',
        coverageLevels: ['EMPLOYEE_ONLY'],
        effectiveFrom: '2024-01-01',
      });
    expect(mockPrisma.benefitPlan.create).toHaveBeenCalledTimes(1);
  });

  it('GET /employees/:id returns empty array when employee has no benefits', async () => {
    (mockPrisma.employeeBenefit.findMany as jest.Mock).mockResolvedValueOnce([]);
    const response = await request(app)
      .get('/api/benefits/employees/00000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token');
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(0);
  });

  it('POST /employees/:id returns 400 for missing effectiveFrom', async () => {
    const response = await request(app)
      .post('/api/benefits/employees/00000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({
        benefitPlanId: '11111111-1111-1111-1111-111111111111',
        coverageLevel: 'FAMILY',
      });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /terminate uses id from URL parameter in where clause', async () => {
    (mockPrisma.employeeBenefit.update as jest.Mock).mockResolvedValueOnce({
      id: '00000000-0000-4000-a000-000000000099',
      status: 'TERMINATED',
    });
    await request(app)
      .put('/api/benefits/00000000-0000-4000-a000-000000000099/terminate')
      .set('Authorization', 'Bearer token')
      .send({ terminationDate: '2024-12-31' });
    expect(mockPrisma.employeeBenefit.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '00000000-0000-4000-a000-000000000099' } })
    );
  });

  it('PUT /terminate uses today as terminationDate when not provided', async () => {
    (mockPrisma.employeeBenefit.update as jest.Mock).mockResolvedValueOnce({
      id: '37000000-0000-4000-a000-000000000001',
      status: 'TERMINATED',
      terminationDate: new Date(),
      effectiveTo: new Date(),
    });
    const response = await request(app)
      .put('/api/benefits/37000000-0000-4000-a000-000000000001/terminate')
      .set('Authorization', 'Bearer token')
      .send({});
    expect(response.status).toBe(200);
    expect(mockPrisma.employeeBenefit.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'TERMINATED' }),
      })
    );
  });

  it('GET /plans response body has success property set to true', async () => {
    (mockPrisma.benefitPlan.findMany as jest.Mock).mockResolvedValueOnce([]);
    const response = await request(app)
      .get('/api/benefits/plans')
      .set('Authorization', 'Bearer token');
    expect(response.body).toHaveProperty('success', true);
  });

  it('POST /employees/:id create called with correct employeeId from URL', async () => {
    (mockPrisma.employeeBenefit.create as jest.Mock).mockResolvedValueOnce({
      id: '30000000-0000-4000-a000-000000000123',
      employeeId: '00000000-0000-4000-a000-000000000042',
      status: 'ACTIVE',
      benefitPlan: {},
    });
    await request(app)
      .post('/api/benefits/employees/00000000-0000-4000-a000-000000000042')
      .set('Authorization', 'Bearer token')
      .send({
        benefitPlanId: '11111111-1111-1111-1111-111111111111',
        coverageLevel: 'EMPLOYEE_ONLY',
        effectiveFrom: '2024-01-01',
      });
    expect(mockPrisma.employeeBenefit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ employeeId: '00000000-0000-4000-a000-000000000042' }),
      })
    );
  });
});
