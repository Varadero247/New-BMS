import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('../src/prisma', () => ({
  prisma: {
    salaryComponentType: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    employeeSalary: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    salaryComponent: {
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

import { prisma } from '../src/prisma';
import salaryRoutes from '../src/routes/salary';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Payroll Salary API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/salary', salaryRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/salary/component-types', () => {
    const mockComponentTypes = [
      {
        id: 'ct-1',
        code: 'BASIC',
        name: 'Basic Salary',
        category: 'BASIC',
        type: 'EARNING',
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 'ct-2',
        code: 'HRA',
        name: 'House Rent Allowance',
        category: 'ALLOWANCE',
        type: 'EARNING',
        isActive: true,
        sortOrder: 2,
      },
    ];

    it('should return list of active component types', async () => {
      (mockPrisma.salaryComponentType.findMany as jest.Mock).mockResolvedValueOnce(mockComponentTypes);

      const response = await request(app)
        .get('/api/salary/component-types')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter by type', async () => {
      (mockPrisma.salaryComponentType.findMany as jest.Mock).mockResolvedValueOnce([mockComponentTypes[0]]);

      await request(app)
        .get('/api/salary/component-types?type=EARNING')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.salaryComponentType.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            type: 'EARNING',
          }),
        })
      );
    });

    it('should filter by category', async () => {
      (mockPrisma.salaryComponentType.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/salary/component-types?category=ALLOWANCE')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.salaryComponentType.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            category: 'ALLOWANCE',
          }),
        })
      );
    });

    it('should only return active types by default', async () => {
      (mockPrisma.salaryComponentType.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/salary/component-types')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.salaryComponentType.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });

    it('should order by sortOrder ascending', async () => {
      (mockPrisma.salaryComponentType.findMany as jest.Mock).mockResolvedValueOnce(mockComponentTypes);

      await request(app)
        .get('/api/salary/component-types')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.salaryComponentType.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { sortOrder: 'asc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.salaryComponentType.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/salary/component-types')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/salary/component-types', () => {
    const createPayload = {
      code: 'TRANSPORT',
      name: 'Transport Allowance',
      category: 'ALLOWANCE',
      type: 'EARNING',
    };

    it('should create a component type successfully', async () => {
      (mockPrisma.salaryComponentType.create as jest.Mock).mockResolvedValueOnce({
        id: 'new-ct-123',
        ...createPayload,
        isActive: true,
        isTaxable: true,
        isRecurring: true,
      });

      const response = await request(app)
        .post('/api/salary/component-types')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Transport Allowance');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/salary/component-types')
        .set('Authorization', 'Bearer token')
        .send({ name: 'Incomplete' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid category', async () => {
      const response = await request(app)
        .post('/api/salary/component-types')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, category: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid type', async () => {
      const response = await request(app)
        .post('/api/salary/component-types')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, type: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.salaryComponentType.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/salary/component-types')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/salary/employees/:employeeId', () => {
    const mockSalaries = [
      {
        id: 'sal-1',
        employeeId: 'emp-1',
        baseSalary: 5000,
        currency: 'USD',
        payFrequency: 'MONTHLY',
        isActive: true,
        effectiveFrom: new Date('2024-01-01'),
        components: [
          { id: 'comp-1', amount: 5000, componentType: { name: 'Basic Salary', type: 'EARNING' } },
          { id: 'comp-2', amount: 1000, componentType: { name: 'HRA', type: 'EARNING' } },
        ],
      },
    ];

    it('should return employee salary records', async () => {
      (mockPrisma.employeeSalary.findMany as jest.Mock).mockResolvedValueOnce(mockSalaries);

      const response = await request(app)
        .get('/api/salary/employees/emp-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].components).toHaveLength(2);
    });

    it('should query by employeeId parameter', async () => {
      (mockPrisma.employeeSalary.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/salary/employees/emp-1')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.employeeSalary.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { employeeId: 'emp-1' },
        })
      );
    });

    it('should order by effectiveFrom descending', async () => {
      (mockPrisma.employeeSalary.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/salary/employees/emp-1')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.employeeSalary.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { effectiveFrom: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeSalary.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/salary/employees/emp-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/salary/employees/:employeeId', () => {
    const createPayload = {
      baseSalary: 6000,
      effectiveFrom: '2024-02-01',
      changeReason: 'Annual increment',
      changeType: 'ANNUAL_INCREMENT',
    };

    it('should set employee salary successfully', async () => {
      (mockPrisma.employeeSalary.updateMany as jest.Mock).mockResolvedValueOnce({ count: 1 });
      (mockPrisma.employeeSalary.findFirst as jest.Mock).mockResolvedValueOnce({
        baseSalary: 5000,
      });
      (mockPrisma.employeeSalary.create as jest.Mock).mockResolvedValueOnce({
        id: 'new-sal-123',
        employeeId: 'emp-1',
        baseSalary: 6000,
        isActive: true,
        previousSalary: 5000,
        components: [],
      });

      const response = await request(app)
        .post('/api/salary/employees/emp-1')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should deactivate previous salary records', async () => {
      (mockPrisma.employeeSalary.updateMany as jest.Mock).mockResolvedValueOnce({ count: 1 });
      (mockPrisma.employeeSalary.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.employeeSalary.create as jest.Mock).mockResolvedValueOnce({
        id: 'new-sal-123',
        components: [],
      });

      await request(app)
        .post('/api/salary/employees/emp-1')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.employeeSalary.updateMany).toHaveBeenCalledWith({
        where: { employeeId: 'emp-1', isActive: true },
        data: { isActive: false, effectiveTo: expect.any(Date) },
      });
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/salary/employees/emp-1')
        .set('Authorization', 'Bearer token')
        .send({ changeReason: 'Incomplete' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for non-positive baseSalary', async () => {
      const response = await request(app)
        .post('/api/salary/employees/emp-1')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, baseSalary: -100 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeSalary.updateMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/salary/employees/emp-1')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/salary/:id/components', () => {
    const updatePayload = {
      components: [
        {
          componentTypeId: '11111111-1111-1111-1111-111111111111',
          amount: 5000,
          calculationType: 'FIXED',
        },
        {
          componentTypeId: '22222222-2222-2222-2222-222222222222',
          amount: 1000,
          percentage: 20,
          calculationType: 'PERCENTAGE_OF_BASIC',
        },
      ],
    };

    it('should update salary components successfully', async () => {
      (mockPrisma.salaryComponent.deleteMany as jest.Mock).mockResolvedValueOnce({ count: 2 });
      (mockPrisma.employeeSalary.update as jest.Mock).mockResolvedValueOnce({
        id: 'sal-1',
        components: [
          { id: 'comp-1', amount: 5000, componentType: { name: 'Basic' } },
          { id: 'comp-2', amount: 1000, componentType: { name: 'HRA' } },
        ],
      });

      const response = await request(app)
        .put('/api/salary/sal-1/components')
        .set('Authorization', 'Bearer token')
        .send(updatePayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should delete existing components before creating new ones', async () => {
      (mockPrisma.salaryComponent.deleteMany as jest.Mock).mockResolvedValueOnce({ count: 1 });
      (mockPrisma.employeeSalary.update as jest.Mock).mockResolvedValueOnce({
        id: 'sal-1',
        components: [],
      });

      await request(app)
        .put('/api/salary/sal-1/components')
        .set('Authorization', 'Bearer token')
        .send(updatePayload);

      expect(mockPrisma.salaryComponent.deleteMany).toHaveBeenCalledWith({
        where: { employeeSalaryId: 'sal-1' },
      });
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .put('/api/salary/sal-1/components')
        .set('Authorization', 'Bearer token')
        .send({ components: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.salaryComponent.deleteMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/salary/sal-1/components')
        .set('Authorization', 'Bearer token')
        .send(updatePayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
