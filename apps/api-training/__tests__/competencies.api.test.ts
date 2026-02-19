import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    trainCompetency: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
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
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/competencies';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/competencies', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/competencies', () => {
  it('should return competencies', async () => {
    mockPrisma.trainCompetency.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', name: 'Safety Awareness' },
    ]);
    mockPrisma.trainCompetency.count.mockResolvedValue(1);
    const res = await request(app).get('/api/competencies');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should support status and search filters', async () => {
    mockPrisma.trainCompetency.findMany.mockResolvedValue([]);
    mockPrisma.trainCompetency.count.mockResolvedValue(0);
    const res = await request(app).get(
      '/api/competencies?status=ACTIVE&search=safety&page=2&limit=5'
    );
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(5);
  });

  it('should return 500 on error', async () => {
    mockPrisma.trainCompetency.findMany.mockRejectedValue(new Error('DB error'));
    mockPrisma.trainCompetency.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/competencies');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/competencies/:id', () => {
  it('should return competency by id', async () => {
    mockPrisma.trainCompetency.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Safety Awareness',
    });
    const res = await request(app).get('/api/competencies/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 if not found', async () => {
    mockPrisma.trainCompetency.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/competencies/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on error', async () => {
    mockPrisma.trainCompetency.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/competencies/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/competencies', () => {
  it('should create a competency', async () => {
    mockPrisma.trainCompetency.count.mockResolvedValue(0);
    mockPrisma.trainCompetency.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'New Competency',
    });
    const res = await request(app).post('/api/competencies').send({ name: 'New Competency' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should create with all optional fields', async () => {
    mockPrisma.trainCompetency.count.mockResolvedValue(0);
    mockPrisma.trainCompetency.create.mockResolvedValue({ id: '2', name: 'Full Competency' });
    const res = await request(app).post('/api/competencies').send({
      name: 'Full Competency',
      description: 'A test competency',
      department: 'Operations',
      role: 'Manager',
      requiredLevel: 'COMPETENT',
      assessmentMethod: 'Practical',
      isActive: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 if name is missing', async () => {
    const res = await request(app).post('/api/competencies').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if requiredLevel is invalid', async () => {
    const res = await request(app)
      .post('/api/competencies')
      .send({ name: 'Test', requiredLevel: 'INVALID_LEVEL' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on create error', async () => {
    mockPrisma.trainCompetency.count.mockResolvedValue(0);
    mockPrisma.trainCompetency.create.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/api/competencies').send({ name: 'New' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/competencies/:id', () => {
  it('should update a competency', async () => {
    mockPrisma.trainCompetency.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Old',
    });
    mockPrisma.trainCompetency.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Updated',
    });
    const res = await request(app)
      .put('/api/competencies/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if not found', async () => {
    mockPrisma.trainCompetency.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/competencies/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 on invalid requiredLevel', async () => {
    const res = await request(app)
      .put('/api/competencies/00000000-0000-0000-0000-000000000001')
      .send({ requiredLevel: 'INVALID' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on update error', async () => {
    mockPrisma.trainCompetency.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainCompetency.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put('/api/competencies/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/competencies/:id', () => {
  it('should soft delete a competency', async () => {
    mockPrisma.trainCompetency.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainCompetency.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/competencies/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toContain('deleted');
  });

  it('should return 404 if not found', async () => {
    mockPrisma.trainCompetency.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/competencies/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on delete error', async () => {
    mockPrisma.trainCompetency.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainCompetency.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/competencies/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
