import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    trainTNA: {
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

import router from '../src/routes/tna';
import { prisma } from '../src/prisma';
const app = express();
app.use(express.json());
app.use('/api/tna', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/tna', () => {
  it('should return TNAs', async () => {
    (prisma as any).trainTNA.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Leadership Training Gap' },
    ]);
    (prisma as any).trainTNA.count.mockResolvedValue(1);
    const res = await request(app).get('/api/tna');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should support status and search filters', async () => {
    (prisma as any).trainTNA.findMany.mockResolvedValue([]);
    (prisma as any).trainTNA.count.mockResolvedValue(0);
    const res = await request(app).get(
      '/api/tna?status=IN_PROGRESS&search=leadership&page=1&limit=10'
    );
    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(10);
  });

  it('should return 500 on error', async () => {
    (prisma as any).trainTNA.findMany.mockRejectedValue(new Error('DB error'));
    (prisma as any).trainTNA.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/tna');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/tna/:id', () => {
  it('should return TNA by id', async () => {
    (prisma as any).trainTNA.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Leadership Training Gap',
    });
    const res = await request(app).get('/api/tna/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 if not found', async () => {
    (prisma as any).trainTNA.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/tna/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on error', async () => {
    (prisma as any).trainTNA.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/tna/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/tna', () => {
  it('should create a TNA', async () => {
    (prisma as any).trainTNA.count.mockResolvedValue(0);
    (prisma as any).trainTNA.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New TNA',
      referenceNumber: 'TNA-2026-0001',
    });
    const res = await request(app).post('/api/tna').send({ title: 'New TNA' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should create with all optional fields', async () => {
    (prisma as any).trainTNA.count.mockResolvedValue(2);
    (prisma as any).trainTNA.create.mockResolvedValue({
      id: '2',
      title: 'Full TNA',
      referenceNumber: 'TNA-2026-0003',
    });
    const res = await request(app).post('/api/tna').send({
      title: 'Full TNA',
      department: 'HR',
      role: 'Manager',
      priority: 'HIGH',
      identifiedGap: 'Leadership skills',
      recommendedTraining: 'Leadership course',
      targetDate: '2026-06-01T00:00:00.000Z',
      status: 'SCHEDULED',
      assignee: 'user-2',
      assigneeName: 'Jane Smith',
      budget: 5000,
      approvedBy: 'user-1',
      notes: 'Urgent requirement',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 if title is missing', async () => {
    const res = await request(app).post('/api/tna').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if priority is invalid', async () => {
    const res = await request(app).post('/api/tna').send({ title: 'Test', priority: 'EXTREME' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 if status is invalid', async () => {
    const res = await request(app)
      .post('/api/tna')
      .send({ title: 'Test', status: 'INVALID_STATUS' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on create error', async () => {
    (prisma as any).trainTNA.count.mockResolvedValue(0);
    (prisma as any).trainTNA.create.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/api/tna').send({ title: 'New TNA' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/tna/:id', () => {
  it('should update a TNA', async () => {
    (prisma as any).trainTNA.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Old TNA',
    });
    (prisma as any).trainTNA.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated TNA',
    });
    const res = await request(app)
      .put('/api/tna/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated TNA' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should update status', async () => {
    (prisma as any).trainTNA.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma as any).trainTNA.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'COMPLETED',
    });
    const res = await request(app)
      .put('/api/tna/00000000-0000-0000-0000-000000000001')
      .send({ status: 'COMPLETED' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if not found', async () => {
    (prisma as any).trainTNA.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/tna/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 on invalid priority', async () => {
    const res = await request(app)
      .put('/api/tna/00000000-0000-0000-0000-000000000001')
      .send({ priority: 'INVALID' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on update error', async () => {
    (prisma as any).trainTNA.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma as any).trainTNA.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put('/api/tna/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/tna/:id', () => {
  it('should soft delete a TNA', async () => {
    (prisma as any).trainTNA.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma as any).trainTNA.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/tna/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toContain('deleted');
  });

  it('should return 404 if not found', async () => {
    (prisma as any).trainTNA.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/tna/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on delete error', async () => {
    (prisma as any).trainTNA.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma as any).trainTNA.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/tna/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
