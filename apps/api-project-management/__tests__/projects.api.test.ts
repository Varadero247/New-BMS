import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    project: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

import { prisma } from '../src/prisma';
import projectsRouter from '../src/routes/projects';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const mockProject = {
  id: '44000000-0000-4000-a000-000000000001',
  projectCode: 'PRJ0001',
  projectName: 'Test Project Alpha',
  projectDescription: 'A test project for unit testing',
  projectType: 'INTERNAL',
  status: 'PLANNING',
  healthStatus: 'GREEN',
  priority: 'HIGH',
  methodology: 'AGILE',
  progressPercentage: 25,
  plannedBudget: 100000,
  actualCost: 30000,
  contingencyReserve: 5000,
  managementReserve: 3000,
  plannedValue: 50000,
  earnedValue: 45000,
  costPerformanceIndex: 1.5,
  schedulePerformanceIndex: 0.9,
  estimateAtCompletion: 66667,
  estimateToComplete: 36667,
  varianceAtCompletion: 33333,
  startDate: '2025-01-01T00:00:00.000Z',
  plannedEndDate: '2025-12-31T00:00:00.000Z',
  actualEndDate: null,
  closedAt: null,
  closedBy: null,
  createdBy: '20000000-0000-4000-a000-000000000123',
  updatedBy: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-06-01T00:00:00.000Z',
  _count: { tasks: 10, risks: 3, issues: 2, milestones: 5 },
};

const mockDashboardProject = {
  ...mockProject,
  tasks: [
    { id: 't1', status: 'NOT_STARTED' },
    { id: 't2', status: 'IN_PROGRESS' },
    { id: 't3', status: 'COMPLETED' },
    { id: 't4', status: 'BLOCKED' },
    { id: 't5', status: 'CANCELLED' },
  ],
  milestones: [
    { id: 'm1', status: 'UPCOMING', plannedDate: '2026-12-01T00:00:00.000Z' },
    { id: 'm2', status: 'ACHIEVED', plannedDate: '2025-03-01T00:00:00.000Z' },
    { id: 'm3', status: 'MISSED', plannedDate: '2025-02-01T00:00:00.000Z' },
    { id: 'm4', status: 'UPCOMING', plannedDate: '2024-01-01T00:00:00.000Z' },
  ],
  risks: [
    { id: 'r1', status: 'IDENTIFIED', riskLevel: 'CRITICAL' },
    { id: 'r2', status: 'MITIGATING', riskLevel: 'HIGH' },
    { id: 'r3', status: 'CLOSED', riskLevel: 'MEDIUM' },
    { id: 'r4', status: 'IDENTIFIED', riskLevel: 'LOW' },
  ],
  issues: [
    { id: 'i1', status: 'OPEN' },
    { id: 'i2', status: 'IN_PROGRESS' },
    { id: 'i3', status: 'RESOLVED' },
    { id: 'i4', status: 'CLOSED' },
  ],
  resources: [
    { id: 'res1', plannedHours: 100, actualHours: 80 },
    { id: 'res2', plannedHours: 200, actualHours: 150 },
  ],
  timesheets: [{ id: 'ts1', hours: 8 }],
};

describe('Projects API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/projects', projectsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== GET / ==========

  describe('GET /api/projects', () => {
    it('should list projects with pagination defaults', async () => {
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValueOnce([mockProject]);
      (mockPrisma.project.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get('/api/projects');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].projectCode).toBe('PRJ0001');
      expect(res.body.meta).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
    });

    it('should filter by status, priority, and methodology', async () => {
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValueOnce([mockProject]);
      (mockPrisma.project.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get(
        '/api/projects?status=PLANNING&priority=HIGH&methodology=AGILE'
      );

      expect(res.status).toBe(200);
      expect(mockPrisma.project.findMany as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PLANNING',
            priority: 'HIGH',
            methodology: 'AGILE',
          }),
        })
      );
    });

    it('should filter by search term across name, description, and code', async () => {
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValueOnce([mockProject]);
      (mockPrisma.project.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get('/api/projects?search=Alpha');

      expect(res.status).toBe(200);
      expect(mockPrisma.project.findMany as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { projectName: { contains: 'Alpha', mode: 'insensitive' } },
              { projectDescription: { contains: 'Alpha', mode: 'insensitive' } },
              { projectCode: { contains: 'Alpha', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.project.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB failure'));
      (mockPrisma.project.count as jest.Mock).mockRejectedValueOnce(new Error('DB failure'));

      const res = await request(app).get('/api/projects');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ========== GET /:id ==========

  describe('GET /api/projects/:id', () => {
    it('should return a single project with all relations', async () => {
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);

      const res = await request(app).get('/api/projects/44000000-0000-4000-a000-000000000001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('44000000-0000-4000-a000-000000000001');
      expect(mockPrisma.project.findUnique as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '44000000-0000-4000-a000-000000000001' },
          include: expect.objectContaining({
            tasks: true,
            milestones: true,
            risks: true,
            issues: true,
          }),
        })
      );
    });

    it('should return 404 if project not found', async () => {
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get('/api/projects/00000000-0000-4000-a000-ffffffffffff');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.project.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB failure'));

      const res = await request(app).get('/api/projects/44000000-0000-4000-a000-000000000001');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ========== GET /:id/dashboard ==========

  describe('GET /api/projects/:id/dashboard', () => {
    it('should return dashboard metrics for a project', async () => {
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockDashboardProject);

      const res = await request(app).get(
        '/api/projects/44000000-0000-4000-a000-000000000001/dashboard'
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const data = res.body.data;
      expect(data.overview.projectName).toBe('Test Project Alpha');
      expect(data.overview.status).toBe('PLANNING');
      expect(data.taskBreakdown.total).toBe(5);
      expect(data.taskBreakdown.notStarted).toBe(1);
      expect(data.taskBreakdown.inProgress).toBe(1);
      expect(data.taskBreakdown.completed).toBe(1);
      expect(data.taskBreakdown.blocked).toBe(1);
      expect(data.taskBreakdown.cancelled).toBe(1);
      expect(data.milestoneStats.total).toBe(4);
      expect(data.milestoneStats.achieved).toBe(1);
      expect(data.milestoneStats.missed).toBe(1);
      expect(data.riskStats.total).toBe(4);
      expect(data.riskStats.byLevel.critical).toBe(1);
      expect(data.issueStats.total).toBe(4);
      expect(data.issueStats.open).toBe(1);
      expect(data.resourceUtilization.totalResources).toBe(2);
      expect(data.resourceUtilization.totalPlannedHours).toBe(300);
      expect(data.resourceUtilization.totalActualHours).toBe(230);
      expect(data.budget.plannedBudget).toBe(100000);
      expect(data.evm.plannedValue).toBe(50000);
    });

    it('should return 404 if project not found', async () => {
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get(
        '/api/projects/00000000-0000-4000-a000-ffffffffffff/dashboard'
      );

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.project.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB failure'));

      const res = await request(app).get(
        '/api/projects/44000000-0000-4000-a000-000000000001/dashboard'
      );

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ========== POST / ==========

  describe('POST /api/projects', () => {
    it('should create a project with auto-generated code', async () => {
      (mockPrisma.project.findFirst as jest.Mock).mockResolvedValueOnce({ projectCode: 'PRJ0005' });
      (mockPrisma.project.create as jest.Mock).mockResolvedValueOnce({
        ...mockProject,
        projectCode: 'PRJ0006',
      });

      const res = await request(app).post('/api/projects').send({
        projectName: 'New Project',
        projectType: 'INTERNAL',
        plannedEndDate: '2025-12-31',
        methodology: 'AGILE',
        priority: 'HIGH',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.projectCode).toBe('PRJ0006');
      expect(mockPrisma.project.findFirst as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
          select: { projectCode: true },
        })
      );
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app).post('/api/projects').send({
        projectName: 'Missing Fields',
        // missing projectType, plannedEndDate, methodology, priority
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details).toBeDefined();
    });

    it('should return 500 on database error during create', async () => {
      (mockPrisma.project.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.project.create as jest.Mock).mockRejectedValueOnce(new Error('DB failure'));

      const res = await request(app).post('/api/projects').send({
        projectName: 'New Project',
        projectType: 'INTERNAL',
        plannedEndDate: '2025-12-31',
        methodology: 'AGILE',
        priority: 'HIGH',
      });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ========== PUT /:id ==========

  describe('PUT /api/projects/:id', () => {
    it('should update project successfully', async () => {
      const existingProject = {
        ...mockProject,
        plannedValue: 50000,
        earnedValue: 45000,
        actualCost: 30000,
        plannedBudget: 100000,
      };
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValueOnce(existingProject);
      (mockPrisma.project.update as jest.Mock).mockResolvedValueOnce({
        ...existingProject,
        projectName: 'Updated Name',
      });

      const res = await request(app)
        .put('/api/projects/44000000-0000-4000-a000-000000000001')
        .send({
          projectName: 'Updated Name',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.projectName).toBe('Updated Name');
    });

    it('should return 404 if project not found', async () => {
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/projects/00000000-0000-4000-a000-ffffffffffff')
        .send({
          projectName: 'Updated Name',
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should auto-calculate EVM metrics when EVM values provided', async () => {
      const existingProject = {
        ...mockProject,
        plannedValue: 50000,
        earnedValue: 40000,
        actualCost: 30000,
        plannedBudget: 100000,
      };
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValueOnce(existingProject);
      (mockPrisma.project.update as jest.Mock).mockResolvedValueOnce({
        ...existingProject,
        earnedValue: 60000,
        costPerformanceIndex: 2.0,
        schedulePerformanceIndex: 1.2,
      });

      const res = await request(app)
        .put('/api/projects/44000000-0000-4000-a000-000000000001')
        .send({
          earnedValue: 60000,
        });

      expect(res.status).toBe(200);
      // Verify the update was called with auto-calculated EVM fields
      const updateCall = (mockPrisma.project.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.costPerformanceIndex).toBeDefined();
      expect(updateCall.data.schedulePerformanceIndex).toBeDefined();
      expect(updateCall.data.estimateAtCompletion).toBeDefined();
      expect(updateCall.data.estimateToComplete).toBeDefined();
      expect(updateCall.data.varianceAtCompletion).toBeDefined();
    });

    it('should auto-set closedAt when status changed to CLOSED', async () => {
      const existingProject = { ...mockProject, status: 'ACTIVE' };
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValueOnce(existingProject);
      (mockPrisma.project.update as jest.Mock).mockResolvedValueOnce({
        ...existingProject,
        status: 'CLOSED',
      });

      const res = await request(app)
        .put('/api/projects/44000000-0000-4000-a000-000000000001')
        .send({
          status: 'CLOSED',
        });

      expect(res.status).toBe(200);
      const updateCall = (mockPrisma.project.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.closedAt).toBeInstanceOf(Date);
      expect(updateCall.data.closedBy).toBe('20000000-0000-4000-a000-000000000123');
    });

    it('should return 500 on database error during update', async () => {
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.project.update as jest.Mock).mockRejectedValueOnce(new Error('DB failure'));

      const res = await request(app)
        .put('/api/projects/44000000-0000-4000-a000-000000000001')
        .send({
          projectName: 'Updated Name',
        });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ========== DELETE /:id ==========

  describe('DELETE /api/projects/:id', () => {
    it('should delete a project successfully', async () => {
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.project.update as jest.Mock).mockResolvedValueOnce(mockProject);

      const res = await request(app).delete('/api/projects/44000000-0000-4000-a000-000000000001');

      expect(res.status).toBe(204);
    });

    it('should return 404 if project not found', async () => {
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).delete('/api/projects/00000000-0000-4000-a000-ffffffffffff');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on database error during delete', async () => {
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.project.update as jest.Mock).mockRejectedValueOnce(new Error('DB failure'));

      const res = await request(app).delete('/api/projects/44000000-0000-4000-a000-000000000001');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('Projects API — extended coverage', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/projects', projectsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / returns correct totalPages for multi-page result', async () => {
    (mockPrisma.project.findMany as jest.Mock).mockResolvedValueOnce([mockProject]);
    (mockPrisma.project.count as jest.Mock).mockResolvedValueOnce(45);

    const res = await request(app).get('/api/projects?page=2&limit=20');

    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBe(2);
    expect(res.body.meta.totalPages).toBe(3);
    expect(res.body.meta.total).toBe(45);
  });

  it('GET / passes skip/take to Prisma for page 3', async () => {
    (mockPrisma.project.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.project.count as jest.Mock).mockResolvedValueOnce(60);

    await request(app).get('/api/projects?page=3&limit=10');

    expect(mockPrisma.project.findMany as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    );
  });

  it('GET / filters by methodology wired into where clause', async () => {
    (mockPrisma.project.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.project.count as jest.Mock).mockResolvedValueOnce(0);

    await request(app).get('/api/projects?methodology=WATERFALL');

    expect(mockPrisma.project.findMany as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ methodology: 'WATERFALL' }),
      })
    );
  });

  it('GET / filters by priority wired into where clause', async () => {
    (mockPrisma.project.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.project.count as jest.Mock).mockResolvedValueOnce(0);

    await request(app).get('/api/projects?priority=LOW');

    expect(mockPrisma.project.findMany as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ priority: 'LOW' }),
      })
    );
  });

  it('POST / returns 400 for invalid projectType enum', async () => {
    const res = await request(app).post('/api/projects').send({
      projectName: 'Bad Enum Project',
      projectType: 'INVALID_TYPE',
      plannedEndDate: '2025-12-31',
      methodology: 'AGILE',
      priority: 'HIGH',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST / returns 400 for invalid priority enum', async () => {
    const res = await request(app).post('/api/projects').send({
      projectName: 'Bad Priority Project',
      projectType: 'INTERNAL',
      plannedEndDate: '2025-12-31',
      methodology: 'AGILE',
      priority: 'NOT_A_PRIORITY',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /:id/dashboard returns 500 on count/findUnique failure', async () => {
    (mockPrisma.project.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB crash'));

    const res = await request(app).get(
      '/api/projects/44000000-0000-4000-a000-000000000001/dashboard'
    );

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET / response shape contains success:true and meta object', async () => {
    (mockPrisma.project.findMany as jest.Mock).mockResolvedValueOnce([mockProject]);
    (mockPrisma.project.count as jest.Mock).mockResolvedValueOnce(1);

    const res = await request(app).get('/api/projects');

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toHaveProperty('page');
    expect(res.body.meta).toHaveProperty('limit');
    expect(res.body.meta).toHaveProperty('total');
    expect(res.body.meta).toHaveProperty('totalPages');
  });
});

describe('projects.api — final extended coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/projects', projectsRouter);
    jest.clearAllMocks();
  });

  it('DELETE /api/projects/:id does not call update when not found', async () => {
    (mockPrisma.project.findUnique as jest.Mock).mockResolvedValueOnce(null);
    await request(app).delete('/api/projects/00000000-0000-4000-a000-ffffffffffff');
    expect(mockPrisma.project.update).not.toHaveBeenCalled();
  });

  it('PUT /api/projects/:id does not call update when not found', async () => {
    (mockPrisma.project.findUnique as jest.Mock).mockResolvedValueOnce(null);
    await request(app)
      .put('/api/projects/00000000-0000-4000-a000-ffffffffffff')
      .send({ projectName: 'Never updated' });
    expect(mockPrisma.project.update).not.toHaveBeenCalled();
  });

  it('GET /api/projects returns data as array', async () => {
    (mockPrisma.project.findMany as jest.Mock).mockResolvedValueOnce([mockProject]);
    (mockPrisma.project.count as jest.Mock).mockResolvedValueOnce(1);
    const res = await request(app).get('/api/projects');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/projects/:id returns 200 when project exists', async () => {
    (mockPrisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
    const res = await request(app).get('/api/projects/44000000-0000-4000-a000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.projectCode).toBe('PRJ0001');
  });

  it('POST /api/projects generates PRJ0001 when no previous project exists', async () => {
    (mockPrisma.project.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (mockPrisma.project.create as jest.Mock).mockResolvedValueOnce({
      ...mockProject,
      projectCode: 'PRJ0001',
    });
    const res = await request(app).post('/api/projects').send({
      projectName: 'First Project',
      projectType: 'INTERNAL',
      plannedEndDate: '2025-12-31',
      methodology: 'AGILE',
      priority: 'HIGH',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.projectCode).toBe('PRJ0001');
  });

  it('DELETE /api/projects/:id performs soft-delete with deletedAt', async () => {
    (mockPrisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
    (mockPrisma.project.update as jest.Mock).mockResolvedValueOnce({
      ...mockProject,
      deletedAt: new Date(),
    });
    const res = await request(app).delete('/api/projects/44000000-0000-4000-a000-000000000001');
    expect(res.status).toBe(204);
    expect(mockPrisma.project.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '44000000-0000-4000-a000-000000000001' },
      })
    );
  });
});

describe('projects.api — boundary and extra coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/projects', projectsRouter);
    jest.clearAllMocks();
  });

  it('GET /api/projects: findMany called once per request', async () => {
    (mockPrisma.project.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.project.count as jest.Mock).mockResolvedValueOnce(0);
    await request(app).get('/api/projects');
    expect(mockPrisma.project.findMany).toHaveBeenCalledTimes(1);
  });

  it('GET /api/projects: meta total matches count mock value', async () => {
    (mockPrisma.project.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.project.count as jest.Mock).mockResolvedValueOnce(13);
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(13);
  });

  it('POST /api/projects: create called once on valid submission', async () => {
    (mockPrisma.project.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (mockPrisma.project.create as jest.Mock).mockResolvedValueOnce({ ...mockProject, projectCode: 'PRJ0001' });
    await request(app).post('/api/projects').send({
      projectName: 'Once Project',
      projectType: 'INTERNAL',
      plannedEndDate: '2025-12-31',
      methodology: 'AGILE',
      priority: 'MEDIUM',
    });
    expect(mockPrisma.project.create).toHaveBeenCalledTimes(1);
  });

  it('GET /api/projects/:id: success true when project found', async () => {
    (mockPrisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
    const res = await request(app).get('/api/projects/44000000-0000-4000-a000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('PUT /api/projects/:id: success true in response body on update', async () => {
    (mockPrisma.project.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
    (mockPrisma.project.update as jest.Mock).mockResolvedValueOnce({ ...mockProject, projectName: 'Renamed' });
    const res = await request(app)
      .put('/api/projects/44000000-0000-4000-a000-000000000001')
      .send({ projectName: 'Renamed' });
    expect(res.body.success).toBe(true);
  });
});
