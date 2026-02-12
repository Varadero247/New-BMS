import express from 'express';
import request from 'supertest';

// Mock dependencies - routes import from ../prisma (re-exports from @ims/database/hr)
jest.mock('../src/prisma', () => ({
  prisma: {
    hRDepartment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    employee: {
      count: jest.fn(),
    },
    position: {
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

import { prisma } from '../src/prisma';
import departmentsRoutes from '../src/routes/departments';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('HR Departments API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/departments', departmentsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/departments', () => {
    const mockDepartments = [
      {
        id: '2b000000-0000-4000-a000-000000000001',
        code: 'ENG',
        name: 'Engineering',
        isActive: true,
        parentId: null,
        parent: null,
        _count: { employees: 15, children: 2, positions: 5 },
      },
      {
        id: 'dept-2',
        code: 'MKT',
        name: 'Marketing',
        isActive: true,
        parentId: null,
        parent: null,
        _count: { employees: 8, children: 0, positions: 3 },
      },
    ];

    it('should return list of active departments', async () => {
      (mockPrisma.hRDepartment.findMany as jest.Mock).mockResolvedValueOnce(mockDepartments);

      const response = await request(app).get('/api/departments');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter active departments by default', async () => {
      (mockPrisma.hRDepartment.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/departments');

      expect(mockPrisma.hRDepartment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
        })
      );
    });

    it('should include inactive departments when includeInactive=true', async () => {
      (mockPrisma.hRDepartment.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/departments?includeInactive=true');

      expect(mockPrisma.hRDepartment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        })
      );
    });

    it('should return tree structure when tree=true', async () => {
      const treeDepartments = [
        { id: '2b000000-0000-4000-a000-000000000001', name: 'Root', parentId: null, _count: { employees: 5, children: 1, positions: 2 }, parent: null },
        { id: 'dept-2', name: 'Child', parentId: '2b000000-0000-4000-a000-000000000001', _count: { employees: 3, children: 0, positions: 1 }, parent: { id: '2b000000-0000-4000-a000-000000000001', name: 'Root', code: 'ROOT' } },
      ];
      (mockPrisma.hRDepartment.findMany as jest.Mock).mockResolvedValueOnce(treeDepartments);

      const response = await request(app).get('/api/departments?tree=true');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1); // Only root level
      expect(response.body.data[0].children).toHaveLength(1);
    });

    it('should include parent and counts', async () => {
      (mockPrisma.hRDepartment.findMany as jest.Mock).mockResolvedValueOnce(mockDepartments);

      await request(app).get('/api/departments');

      expect(mockPrisma.hRDepartment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            parent: expect.any(Object),
            _count: expect.any(Object),
          }),
        })
      );
    });

    it('should order by sortOrder then name', async () => {
      (mockPrisma.hRDepartment.findMany as jest.Mock).mockResolvedValueOnce(mockDepartments);

      await request(app).get('/api/departments');

      expect(mockPrisma.hRDepartment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.hRDepartment.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/departments');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/departments/:id', () => {
    const mockDepartment = {
      id: '2b000000-0000-4000-a000-000000000001',
      code: 'ENG',
      name: 'Engineering',
      parent: null,
      children: [],
      employees: [
        { id: '2a000000-0000-4000-a000-000000000001', firstName: 'John', lastName: 'Doe', jobTitle: 'Developer', employeeNumber: 'EMP001' },
      ],
      positions: [],
      _count: { employees: 1, children: 0, positions: 0 },
    };

    it('should return single department with details', async () => {
      (mockPrisma.hRDepartment.findUnique as jest.Mock).mockResolvedValueOnce(mockDepartment);

      const response = await request(app).get('/api/departments/2b000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('2b000000-0000-4000-a000-000000000001');
      expect(response.body.data.employees).toHaveLength(1);
    });

    it('should include related data (parent, children, employees, positions)', async () => {
      (mockPrisma.hRDepartment.findUnique as jest.Mock).mockResolvedValueOnce(mockDepartment);

      await request(app).get('/api/departments/2b000000-0000-4000-a000-000000000001');

      expect(mockPrisma.hRDepartment.findUnique).toHaveBeenCalledWith({
        where: { id: '2b000000-0000-4000-a000-000000000001' },
        include: expect.objectContaining({
          parent: true,
          children: true,
          employees: expect.any(Object),
          positions: true,
          _count: expect.any(Object),
        }),
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff department', async () => {
      (mockPrisma.hRDepartment.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app).get('/api/departments/00000000-0000-4000-a000-ffffffffffff');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.hRDepartment.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/departments/2b000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/departments', () => {
    const createPayload = {
      code: 'FIN',
      name: 'Finance',
      description: 'Finance department',
    };

    it('should create department successfully', async () => {
      (mockPrisma.hRDepartment.create as jest.Mock).mockResolvedValueOnce({
        id: 'dept-new',
        ...createPayload,
        parent: null,
      });

      const response = await request(app)
        .post('/api/departments')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Finance');
    });

    it('should return 400 for missing code', async () => {
      const response = await request(app)
        .post('/api/departments')
        .send({ name: 'Finance' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/departments')
        .send({ code: 'FIN' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.hRDepartment.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/departments')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/departments/:id', () => {
    it('should update department successfully', async () => {
      (mockPrisma.hRDepartment.update as jest.Mock).mockResolvedValueOnce({
        id: '2b000000-0000-4000-a000-000000000001',
        name: 'Updated Engineering',
        parent: null,
      });

      const response = await request(app)
        .put('/api/departments/2b000000-0000-4000-a000-000000000001')
        .send({ name: 'Updated Engineering' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should allow partial updates', async () => {
      (mockPrisma.hRDepartment.update as jest.Mock).mockResolvedValueOnce({
        id: '2b000000-0000-4000-a000-000000000001',
        description: 'Updated description',
        parent: null,
      });

      const response = await request(app)
        .put('/api/departments/2b000000-0000-4000-a000-000000000001')
        .send({ description: 'Updated description' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle database errors', async () => {
      (mockPrisma.hRDepartment.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/departments/2b000000-0000-4000-a000-000000000001')
        .send({ name: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/departments/:id', () => {
    it('should soft delete (deactivate) department', async () => {
      (mockPrisma.employee.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.hRDepartment.update as jest.Mock).mockResolvedValueOnce({
        id: '2b000000-0000-4000-a000-000000000001',
        isActive: false,
      });

      const response = await request(app).delete('/api/departments/2b000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(204);
      expect(mockPrisma.hRDepartment.update).toHaveBeenCalledWith({
        where: { id: '2b000000-0000-4000-a000-000000000001' },
        data: { isActive: false },
      });
    });

    it('should return 400 if department has active employees', async () => {
      (mockPrisma.employee.count as jest.Mock).mockResolvedValueOnce(5);

      const response = await request(app).delete('/api/departments/2b000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('HAS_EMPLOYEES');
    });

    it('should handle database errors', async () => {
      (mockPrisma.employee.count as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).delete('/api/departments/2b000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/departments/positions/all', () => {
    const mockPositions = [
      {
        id: 'pos-1',
        code: 'SWE',
        title: 'Software Engineer',
        isActive: true,
        department: { id: '2b000000-0000-4000-a000-000000000001', name: 'Engineering' },
        _count: { employees: 5 },
      },
    ];

    it('should return list of active positions', async () => {
      (mockPrisma.position.findMany as jest.Mock).mockResolvedValueOnce(mockPositions);

      const response = await request(app).get('/api/departments/positions/all');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should filter by departmentId', async () => {
      (mockPrisma.position.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/departments/positions/all?departmentId=2b000000-0000-4000-a000-000000000001');

      expect(mockPrisma.position.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            departmentId: '2b000000-0000-4000-a000-000000000001',
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.position.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/departments/positions/all');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/departments/positions', () => {
    const positionPayload = {
      code: 'SWE',
      title: 'Software Engineer',
      departmentId: '11111111-1111-1111-1111-111111111111',
    };

    it('should create position successfully', async () => {
      (mockPrisma.position.create as jest.Mock).mockResolvedValueOnce({
        id: 'pos-new',
        ...positionPayload,
        department: { id: positionPayload.departmentId, name: 'Engineering' },
      });

      const response = await request(app)
        .post('/api/departments/positions')
        .send(positionPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Software Engineer');
    });

    it('should return 400 for missing code', async () => {
      const response = await request(app)
        .post('/api/departments/positions')
        .send({ title: 'Engineer', departmentId: '11111111-1111-1111-1111-111111111111' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/departments/positions')
        .send({ code: 'SWE', departmentId: '11111111-1111-1111-1111-111111111111' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid departmentId format', async () => {
      const response = await request(app)
        .post('/api/departments/positions')
        .send({ code: 'SWE', title: 'Engineer', departmentId: 'not-a-uuid' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.position.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/departments/positions')
        .send(positionPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
