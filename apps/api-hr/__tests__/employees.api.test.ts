import express from 'express';
import request from 'supertest';

// Mock dependencies - routes import from ../prisma (re-exports from @ims/database/hr)
jest.mock('../src/prisma', () => ({
  prisma: {
    employee: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    hRDepartment: {
      findMany: jest.fn(),
    },
    employeeSalary: {
      aggregate: jest.fn(),
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
import employeesRoutes from '../src/routes/employees';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('HR Employees API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/employees', employeesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/employees', () => {
    const mockEmployees = [
      {
        id: '2a000000-0000-4000-a000-000000000001',
        employeeNumber: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        workEmail: 'john@company.com',
        jobTitle: 'Developer',
        employmentStatus: 'ACTIVE',
        department: { id: '2b000000-0000-4000-a000-000000000001', name: 'Engineering' },
        position: { id: '2b100000-0000-4000-a000-000000000001', title: 'Software Developer' },
        manager: { id: '53000000-0000-4000-a000-000000000001', firstName: 'Jane', lastName: 'Manager', employeeNumber: 'MGR001' },
        _count: { subordinates: 0 },
      },
      {
        id: '2a000000-0000-4000-a000-000000000002',
        employeeNumber: 'EMP002',
        firstName: 'Alice',
        lastName: 'Smith',
        workEmail: 'alice@company.com',
        jobTitle: 'Designer',
        employmentStatus: 'ACTIVE',
        department: { id: '2b000000-0000-4000-a000-000000000002', name: 'Design' },
        position: { id: '2b100000-0000-4000-a000-000000000002', title: 'UI Designer' },
        manager: null,
        _count: { subordinates: 2 },
      },
    ];

    it('should return list of employees with pagination', async () => {
      mockPrisma.employee.findMany.mockResolvedValueOnce(mockEmployees as any);
      mockPrisma.employee.count.mockResolvedValueOnce(2);

      const response = await request(app).get('/api/employees');

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
      mockPrisma.employee.findMany.mockResolvedValueOnce([mockEmployees[0]] as any);
      mockPrisma.employee.count.mockResolvedValueOnce(100);

      const response = await request(app).get('/api/employees?page=2&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.totalPages).toBe(10);
    });

    it('should filter by department', async () => {
      mockPrisma.employee.findMany.mockResolvedValueOnce([]);
      mockPrisma.employee.count.mockResolvedValueOnce(0);

      await request(app).get('/api/employees?department=2b000000-0000-4000-a000-000000000001');

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            departmentId: '2b000000-0000-4000-a000-000000000001',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      mockPrisma.employee.findMany.mockResolvedValueOnce([]);
      mockPrisma.employee.count.mockResolvedValueOnce(0);

      await request(app).get('/api/employees?status=ACTIVE');

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            employmentStatus: 'ACTIVE',
          }),
        })
      );
    });

    it('should filter by managerId', async () => {
      mockPrisma.employee.findMany.mockResolvedValueOnce([]);
      mockPrisma.employee.count.mockResolvedValueOnce(0);

      await request(app).get('/api/employees?managerId=53000000-0000-4000-a000-000000000001');

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            managerId: '53000000-0000-4000-a000-000000000001',
          }),
        })
      );
    });

    it('should filter by employmentType', async () => {
      mockPrisma.employee.findMany.mockResolvedValueOnce([]);
      mockPrisma.employee.count.mockResolvedValueOnce(0);

      await request(app).get('/api/employees?employmentType=FULL_TIME');

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            employmentType: 'FULL_TIME',
          }),
        })
      );
    });

    it('should support search by name, email, or employee number', async () => {
      mockPrisma.employee.findMany.mockResolvedValueOnce([]);
      mockPrisma.employee.count.mockResolvedValueOnce(0);

      await request(app).get('/api/employees?search=john');

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            OR: expect.arrayContaining([
              expect.objectContaining({ firstName: expect.any(Object) }),
              expect.objectContaining({ lastName: expect.any(Object) }),
              expect.objectContaining({ workEmail: expect.any(Object) }),
              expect.objectContaining({ employeeNumber: expect.any(Object) }),
            ]),
          }),
        })
      );
    });

    it('should include department, position, and manager info', async () => {
      mockPrisma.employee.findMany.mockResolvedValueOnce(mockEmployees as any);
      mockPrisma.employee.count.mockResolvedValueOnce(2);

      await request(app).get('/api/employees');

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            department: true,
            position: true,
            manager: expect.any(Object),
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      mockPrisma.employee.findMany.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/employees');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/employees/org-chart', () => {
    const mockOrgEmployees = [
      { id: '53000000-0000-4000-a000-000000000010', firstName: 'CEO', lastName: 'Boss', jobTitle: 'CEO', departmentId: '2b000000-0000-4000-a000-000000000010', managerId: null, department: { name: 'Executive' } },
      { id: '53000000-0000-4000-a000-000000000011', firstName: 'VP', lastName: 'Sales', jobTitle: 'VP Sales', departmentId: '2b000000-0000-4000-a000-000000000011', managerId: '53000000-0000-4000-a000-000000000010', department: { name: 'Sales' } },
      { id: '53000000-0000-4000-a000-000000000001', firstName: 'Manager', lastName: 'One', jobTitle: 'Sales Manager', departmentId: '2b000000-0000-4000-a000-000000000011', managerId: '53000000-0000-4000-a000-000000000011', department: { name: 'Sales' } },
    ];

    it('should return hierarchical org chart', async () => {
      mockPrisma.employee.findMany.mockResolvedValueOnce(mockOrgEmployees as any);

      const response = await request(app).get('/api/employees/org-chart');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1); // Only CEO at root level
      expect(response.body.data[0].id).toBe('53000000-0000-4000-a000-000000000010');
      expect(response.body.data[0].children).toHaveLength(1);
    });

    it('should only include active employees', async () => {
      mockPrisma.employee.findMany.mockResolvedValueOnce([]);

      await request(app).get('/api/employees/org-chart');

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith({
        where: { employmentStatus: 'ACTIVE', deletedAt: null },
        select: expect.any(Object),
        take: 500,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.employee.findMany.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/employees/org-chart');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/employees/stats', () => {
    beforeEach(() => {
      mockPrisma.employee.count.mockResolvedValue(10);
      mockPrisma.employee.groupBy.mockResolvedValue([{ departmentId: 'd1', _count: { id: 5 } }] as any);
      mockPrisma.hRDepartment.findMany.mockResolvedValue([{ id: 'd1', name: 'Engineering' }] as any);
      mockPrisma.employeeSalary.aggregate.mockResolvedValue({ _avg: { baseSalary: 50000 }, _sum: { baseSalary: 500000 } } as any);
    });

    it('should return employee statistics', async () => {
      const response = await request(app).get('/api/employees/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('active');
      expect(response.body.data).toHaveProperty('onLeave');
      expect(response.body.data).toHaveProperty('byDepartment');
      expect(response.body.data).toHaveProperty('byEmploymentType');
    });

    it('should include salary data', async () => {
      const response = await request(app).get('/api/employees/stats');

      expect(response.body.data).toHaveProperty('avgSalary');
      expect(response.body.data).toHaveProperty('totalSalaryExpense');
    });

    it('should handle database errors', async () => {
      mockPrisma.employee.count.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/employees/stats');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/employees/:id', () => {
    const mockEmployee = {
      id: '2a000000-0000-4000-a000-000000000001',
      employeeNumber: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      workEmail: 'john@company.com',
      department: { id: '2b000000-0000-4000-a000-000000000001', name: 'Engineering' },
      position: { id: '2b100000-0000-4000-a000-000000000001', title: 'Developer' },
      manager: { id: '53000000-0000-4000-a000-000000000001', firstName: 'Jane', lastName: 'Manager' },
      subordinates: [],
      leaveBalances: [],
      documents: [],
      qualifications: [],
      certifications: [],
      assets: [],
    };

    it('should return single employee with full details', async () => {
      mockPrisma.employee.findUnique.mockResolvedValueOnce(mockEmployee as any);

      const response = await request(app).get('/api/employees/2a000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('2a000000-0000-4000-a000-000000000001');
    });

    it('should include related data', async () => {
      mockPrisma.employee.findUnique.mockResolvedValueOnce(mockEmployee as any);

      await request(app).get('/api/employees/2a000000-0000-4000-a000-000000000001');

      expect(mockPrisma.employee.findUnique).toHaveBeenCalledWith({
        where: { id: '2a000000-0000-4000-a000-000000000001' },
        include: expect.objectContaining({
          department: true,
          position: true,
          manager: expect.any(Object),
          subordinates: expect.any(Object),
          leaveBalances: expect.any(Object),
          documents: expect.any(Object),
          qualifications: true,
          certifications: true,
          assets: true,
        }),
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff employee', async () => {
      mockPrisma.employee.findUnique.mockResolvedValueOnce(null);

      const response = await request(app).get('/api/employees/00000000-0000-4000-a000-ffffffffffff');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.employee.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/employees/2a000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/employees', () => {
    const createPayload = {
      employeeNumber: 'EMP003',
      firstName: 'New',
      lastName: 'Employee',
      workEmail: 'new@company.com',
      departmentId: '11111111-1111-1111-1111-111111111111',
      hireDate: '2024-01-15',
      jobTitle: 'Developer',
    };

    it('should create an employee successfully', async () => {
      mockPrisma.employee.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        ...createPayload,
        department: { id: createPayload.departmentId, name: 'Engineering' },
        position: null,
      } as any);

      const response = await request(app)
        .post('/api/employees')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('New');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/employees')
        .send({ firstName: 'Incomplete' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/employees')
        .send({ ...createPayload, workEmail: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid departmentId format', async () => {
      const response = await request(app)
        .post('/api/employees')
        .send({ ...createPayload, departmentId: 'not-a-uuid' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept optional fields', async () => {
      mockPrisma.employee.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        ...createPayload,
        middleName: 'Middle',
        phone: '+1234567890',
        gender: 'MALE',
      } as any);

      const response = await request(app)
        .post('/api/employees')
        .send({
          ...createPayload,
          middleName: 'Middle',
          phone: '+1234567890',
          gender: 'MALE',
        });

      expect(response.status).toBe(201);
    });

    it('should handle database errors', async () => {
      mockPrisma.employee.create.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/employees')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/employees/:id', () => {
    it('should update employee successfully', async () => {
      mockPrisma.employee.update.mockResolvedValueOnce({
        id: '2a000000-0000-4000-a000-000000000001',
        firstName: 'Updated',
        department: { id: 'd1', name: 'Engineering' },
        position: null,
      } as any);

      const response = await request(app)
        .put('/api/employees/2a000000-0000-4000-a000-000000000001')
        .send({ firstName: 'Updated' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .put('/api/employees/2a000000-0000-4000-a000-000000000001')
        .send({ workEmail: 'not-an-email' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      mockPrisma.employee.update.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/employees/2a000000-0000-4000-a000-000000000001')
        .send({ firstName: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/employees/:id', () => {
    it('should soft delete (terminate) employee', async () => {
      mockPrisma.employee.update.mockResolvedValueOnce({
        id: '2a000000-0000-4000-a000-000000000001',
        employmentStatus: 'TERMINATED',
        terminationDate: new Date(),
      } as any);

      const response = await request(app).delete('/api/employees/2a000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(204);
      expect(mockPrisma.employee.update).toHaveBeenCalledWith({
        where: { id: '2a000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          employmentStatus: 'TERMINATED',
          terminationDate: expect.any(Date),
        }),
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.employee.update.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).delete('/api/employees/2a000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/employees/:id/subordinates', () => {
    const mockSubordinates = [
      {
        id: '2a000000-0000-4000-a000-000000000003',
        firstName: 'Sub',
        lastName: 'One',
        department: { name: 'Engineering' },
        position: { title: 'Developer' },
        _count: { subordinates: 0 },
      },
    ];

    it('should return direct reports', async () => {
      mockPrisma.employee.findMany.mockResolvedValueOnce(mockSubordinates as any);

      const response = await request(app).get('/api/employees/53000000-0000-4000-a000-000000000001/subordinates');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should only return active subordinates', async () => {
      mockPrisma.employee.findMany.mockResolvedValueOnce([]);

      await request(app).get('/api/employees/53000000-0000-4000-a000-000000000001/subordinates');

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith({
        where: { managerId: '53000000-0000-4000-a000-000000000001', employmentStatus: 'ACTIVE', deletedAt: null },
        include: expect.any(Object),
        take: 100,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.employee.findMany.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/employees/53000000-0000-4000-a000-000000000001/subordinates');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
