import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    designVerification: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    designProject: {
      findUnique: jest.fn(),
    },
  },
  Prisma: {},
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
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

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
  parsePagination: (query: Record<string, any>, opts?: { defaultLimit?: number }) => {
    const defaultLimit = opts?.defaultLimit ?? 20;
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || defaultLimit), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  },
}));

jest.mock('@ims/service-auth', () => ({
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

import verificationRouter from '../src/routes/verification';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/verification', verificationRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Medical Design Verification API Routes', () => {
  const mockProject = {
    id: 'project-uuid-1',
    projectCode: 'PRJ-001',
    title: 'Device A Project',
    status: 'ACTIVE',
  };

  const mockVerification = {
    id: '00000000-0000-0000-0000-000000000001',
    projectId: 'project-uuid-1',
    title: 'Electrical Safety Verification',
    protocol: 'Protocol V1.0',
    testMethod: 'IEC 60601-1 dielectric strength test',
    acceptanceCriteria: 'No breakdown at 1500V for 1 min',
    results: null,
    pass: null,
    completedDate: null,
    completedBy: null,
    traceToInput: 'DI-001',
    traceToOutput: 'DO-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    project: mockProject,
  };

  describe('GET /api/verification', () => {
    it('should return list of design verifications with pagination', async () => {
      mockPrisma.designVerification.findMany.mockResolvedValue([mockVerification]);
      mockPrisma.designVerification.count.mockResolvedValue(1);

      const res = await request(app).get('/api/verification');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });

    it('should filter by projectId', async () => {
      mockPrisma.designVerification.findMany.mockResolvedValue([mockVerification]);
      mockPrisma.designVerification.count.mockResolvedValue(1);

      const res = await request(app).get('/api/verification?projectId=project-uuid-1');

      expect(res.status).toBe(200);
    });

    it('should filter by pass status', async () => {
      mockPrisma.designVerification.findMany.mockResolvedValue([]);
      mockPrisma.designVerification.count.mockResolvedValue(0);

      const res = await request(app).get('/api/verification?pass=false');

      expect(res.status).toBe(200);
    });

    it('should support search', async () => {
      mockPrisma.designVerification.findMany.mockResolvedValue([mockVerification]);
      mockPrisma.designVerification.count.mockResolvedValue(1);

      const res = await request(app).get('/api/verification?search=electrical');

      expect(res.status).toBe(200);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.designVerification.findMany.mockRejectedValue(new Error('DB error'));
      mockPrisma.designVerification.count.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/verification');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/verification/stats', () => {
    it('should return verification statistics', async () => {
      mockPrisma.designVerification.count
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(15)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2);

      const res = await request(app).get('/api/verification/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('passed');
      expect(res.body.data).toHaveProperty('failed');
      expect(res.body.data).toHaveProperty('pending');
      expect(res.body.data).toHaveProperty('passRate');
    });

    it('should compute passRate correctly', async () => {
      mockPrisma.designVerification.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(0);

      const res = await request(app).get('/api/verification/stats');

      expect(res.status).toBe(200);
      expect(res.body.data.passRate).toBe(80);
    });

    it('should return 0 passRate when no verifications', async () => {
      mockPrisma.designVerification.count.mockResolvedValue(0);

      const res = await request(app).get('/api/verification/stats');

      expect(res.status).toBe(200);
      expect(res.body.data.passRate).toBe(0);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.designVerification.count.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/verification/stats');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/verification/:id', () => {
    it('should return a single design verification', async () => {
      mockPrisma.designVerification.findUnique.mockResolvedValue(mockVerification);

      const res = await request(app).get('/api/verification/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 when verification not found', async () => {
      mockPrisma.designVerification.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/api/verification/00000000-0000-0000-0000-000000000099');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockPrisma.designVerification.findUnique.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/verification/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/verification', () => {
    const validBody = {
      projectId: 'project-uuid-1',
      title: 'Electrical Safety Verification',
      testMethod: 'IEC 60601-1 dielectric strength test',
      acceptanceCriteria: 'No breakdown at 1500V for 1 min',
    };

    it('should create a new design verification', async () => {
      mockPrisma.designProject.findUnique.mockResolvedValue(mockProject);
      mockPrisma.designVerification.create.mockResolvedValue(mockVerification);

      const res = await request(app).post('/api/verification').send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when project not found', async () => {
      mockPrisma.designProject.findUnique.mockResolvedValue(null);

      const res = await request(app).post('/api/verification').send(validBody);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/verification')
        .send({ projectId: 'project-uuid-1', title: 'Test' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on database error', async () => {
      mockPrisma.designProject.findUnique.mockResolvedValue(mockProject);
      mockPrisma.designVerification.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/verification').send(validBody);

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/verification/:id', () => {
    it('should update a design verification', async () => {
      mockPrisma.designVerification.findUnique.mockResolvedValue(mockVerification);
      const updated = { ...mockVerification, pass: true, results: 'Test passed successfully' };
      mockPrisma.designVerification.update.mockResolvedValue(updated);

      const res = await request(app)
        .put('/api/verification/00000000-0000-0000-0000-000000000001')
        .send({ pass: true, results: 'Test passed successfully' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when verification not found', async () => {
      mockPrisma.designVerification.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/verification/00000000-0000-0000-0000-000000000099')
        .send({ pass: true });

      expect(res.status).toBe(404);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.designVerification.findUnique.mockResolvedValue(mockVerification);
      mockPrisma.designVerification.update.mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .put('/api/verification/00000000-0000-0000-0000-000000000001')
        .send({ title: 'Updated' });

      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/verification/:id', () => {
    it('should delete a design verification', async () => {
      mockPrisma.designVerification.findUnique.mockResolvedValue(mockVerification);
      mockPrisma.designVerification.delete.mockResolvedValue(mockVerification);

      const res = await request(app).delete(
        '/api/verification/00000000-0000-0000-0000-000000000001'
      );

      expect(res.status).toBe(204);
    });

    it('should return 404 when verification not found', async () => {
      mockPrisma.designVerification.findUnique.mockResolvedValue(null);

      const res = await request(app).delete(
        '/api/verification/00000000-0000-0000-0000-000000000099'
      );

      expect(res.status).toBe(404);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.designVerification.findUnique.mockResolvedValue(mockVerification);
      mockPrisma.designVerification.delete.mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete(
        '/api/verification/00000000-0000-0000-0000-000000000001'
      );

      expect(res.status).toBe(500);
    });
  });
});

describe('Medical Design Verification API — additional coverage', () => {
  const mockVerification = {
    id: '00000000-0000-0000-0000-000000000001',
    projectId: 'project-uuid-1',
    title: 'Electrical Safety Verification',
    protocol: 'Protocol V1.0',
    testMethod: 'IEC 60601-1',
    acceptanceCriteria: 'Pass',
    results: null,
    pass: null,
    completedDate: null,
    completedBy: null,
    traceToInput: 'DI-001',
    traceToOutput: 'DO-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('GET / returns success:true in response body', async () => {
    mockPrisma.designVerification.findMany.mockResolvedValue([mockVerification]);
    mockPrisma.designVerification.count.mockResolvedValue(1);

    const res = await request(app).get('/api/verification');
    expect(res.body.success).toBe(true);
  });

  it('GET / computes totalPages for paginated result', async () => {
    mockPrisma.designVerification.findMany.mockResolvedValue([]);
    mockPrisma.designVerification.count.mockResolvedValue(45);

    const res = await request(app).get('/api/verification?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBe(5);
  });

  it('GET / with page=2&limit=5 has correct page in meta', async () => {
    mockPrisma.designVerification.findMany.mockResolvedValue([]);
    mockPrisma.designVerification.count.mockResolvedValue(50);

    const res = await request(app).get('/api/verification?page=2&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBe(2);
  });

  it('GET /stats returns 500 on db error', async () => {
    mockPrisma.designVerification.count.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/verification/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('POST / returns 500 when create throws', async () => {
    mockPrisma.designProject.findUnique.mockResolvedValue({
      id: 'project-uuid-1',
      status: 'ACTIVE',
    });
    mockPrisma.designVerification.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/verification').send({
      projectId: 'project-uuid-1',
      title: 'Test',
      testMethod: 'IEC 60601-1',
      acceptanceCriteria: 'Pass',
    });
    expect(res.status).toBe(500);
  });

  it('GET / returns empty data array when no records', async () => {
    mockPrisma.designVerification.findMany.mockResolvedValue([]);
    mockPrisma.designVerification.count.mockResolvedValue(0);

    const res = await request(app).get('/api/verification');
    expect(res.body.data).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });

  it('PUT /:id returns success:true on valid update', async () => {
    mockPrisma.designVerification.findUnique.mockResolvedValue(mockVerification);
    mockPrisma.designVerification.update.mockResolvedValue({
      ...mockVerification,
      title: 'Updated Title',
    });

    const res = await request(app)
      .put('/api/verification/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated Title' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET / filters combined projectId and search query', async () => {
    mockPrisma.designVerification.findMany.mockResolvedValue([mockVerification]);
    mockPrisma.designVerification.count.mockResolvedValue(1);

    const res = await request(app).get(
      '/api/verification?projectId=project-uuid-1&search=electrical'
    );
    expect(res.status).toBe(200);
  });
});

describe('Medical Design Verification API — pre-supplemental', () => {
  const mockVerification = {
    id: '00000000-0000-0000-0000-000000000001',
    projectId: 'project-uuid-1',
    title: 'Electrical Safety Verification',
    protocol: 'Protocol V1.0',
    testMethod: 'IEC 60601-1',
    acceptanceCriteria: 'Pass',
    results: null,
    pass: null,
    completedDate: null,
    completedBy: null,
    traceToInput: 'DI-001',
    traceToOutput: 'DO-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('GET / data is an array', async () => {
    mockPrisma.designVerification.findMany.mockResolvedValue([mockVerification]);
    mockPrisma.designVerification.count.mockResolvedValue(1);
    const res = await request(app).get('/api/verification');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('DELETE /:id delete called exactly once', async () => {
    mockPrisma.designVerification.findUnique.mockResolvedValue(mockVerification);
    mockPrisma.designVerification.delete.mockResolvedValue(mockVerification);
    await request(app).delete('/api/verification/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.designVerification.delete).toHaveBeenCalledTimes(1);
  });

  it('GET /stats passRate is 0 when total is 0', async () => {
    mockPrisma.designVerification.count.mockResolvedValue(0);
    const res = await request(app).get('/api/verification/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.passRate).toBe(0);
  });
});

describe('Medical Design Verification API — supplemental coverage', () => {
  const mockVerification = {
    id: '00000000-0000-0000-0000-000000000001',
    projectId: 'project-uuid-1',
    title: 'Electrical Safety Verification',
    protocol: 'Protocol V1.0',
    testMethod: 'IEC 60601-1',
    acceptanceCriteria: 'Pass at 1500V',
    results: null,
    pass: null,
    completedDate: null,
    completedBy: null,
    traceToInput: 'DI-001',
    traceToOutput: 'DO-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('GET / success:true and data array on 200', async () => {
    mockPrisma.designVerification.findMany.mockResolvedValue([mockVerification]);
    mockPrisma.designVerification.count.mockResolvedValue(1);
    const res = await request(app).get('/api/verification');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('PUT /:id update called with correct where id', async () => {
    mockPrisma.designVerification.findUnique.mockResolvedValue(mockVerification);
    mockPrisma.designVerification.update.mockResolvedValue({ ...mockVerification, results: 'OK' });
    await request(app)
      .put('/api/verification/00000000-0000-0000-0000-000000000001')
      .send({ results: 'OK' });
    expect(mockPrisma.designVerification.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '00000000-0000-0000-0000-000000000001' } })
    );
  });
});

describe('Medical Design Verification API — final coverage', () => {
  const mockVerification = {
    id: '00000000-0000-0000-0000-000000000001',
    projectId: 'project-uuid-1',
    title: 'Electrical Safety Verification',
    protocol: 'Protocol V1.0',
    testMethod: 'IEC 60601-1',
    acceptanceCriteria: 'Pass at 1500V',
    results: null,
    pass: null,
    completedDate: null,
    completedBy: null,
    traceToInput: 'DI-001',
    traceToOutput: 'DO-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('POST / returns 400 for missing acceptanceCriteria', async () => {
    mockPrisma.designProject.findUnique.mockResolvedValue({
      id: 'project-uuid-1',
      status: 'ACTIVE',
    });
    const res = await request(app).post('/api/verification').send({
      projectId: 'project-uuid-1',
      title: 'Test',
      testMethod: 'IEC 60601-1',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET / returns data array even when empty', async () => {
    mockPrisma.designVerification.findMany.mockResolvedValue([]);
    mockPrisma.designVerification.count.mockResolvedValue(0);
    const res = await request(app).get('/api/verification');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /:id returns 404 when not found with NOT_FOUND code', async () => {
    mockPrisma.designVerification.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/api/verification/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('DELETE /:id returns 500 on DB error', async () => {
    mockPrisma.designVerification.findUnique.mockResolvedValue(mockVerification);
    mockPrisma.designVerification.delete.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/verification/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('POST / returns created verification item in data field', async () => {
    mockPrisma.designProject.findUnique.mockResolvedValue({
      id: 'project-uuid-1',
      status: 'ACTIVE',
    });
    mockPrisma.designVerification.create.mockResolvedValue(mockVerification);
    const res = await request(app).post('/api/verification').send({
      projectId: 'project-uuid-1',
      title: 'Electrical Safety Verification',
      testMethod: 'IEC 60601-1',
      acceptanceCriteria: 'Pass at 1500V',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });
});
