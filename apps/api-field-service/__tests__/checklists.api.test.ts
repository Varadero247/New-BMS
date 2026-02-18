import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsSvcChecklist: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    fsSvcChecklistResult: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import checklistsRouter from '../src/routes/checklists';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/checklists', checklistsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/checklists', () => {
  it('should return checklists with pagination', async () => {
    const checklists = [{ id: '00000000-0000-0000-0000-000000000001', name: 'Safety Checklist', category: 'safety', items: [] }];
    (prisma as any).fsSvcChecklist.findMany.mockResolvedValue(checklists);
    (prisma as any).fsSvcChecklist.count.mockResolvedValue(1);

    const res = await request(app).get('/api/checklists');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by category', async () => {
    (prisma as any).fsSvcChecklist.findMany.mockResolvedValue([]);
    (prisma as any).fsSvcChecklist.count.mockResolvedValue(0);

    await request(app).get('/api/checklists?category=safety');

    expect((prisma as any).fsSvcChecklist.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ category: 'safety' }),
      })
    );
  });

  it('should filter by isActive', async () => {
    (prisma as any).fsSvcChecklist.findMany.mockResolvedValue([]);
    (prisma as any).fsSvcChecklist.count.mockResolvedValue(0);

    await request(app).get('/api/checklists?isActive=true');

    expect((prisma as any).fsSvcChecklist.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: true }),
      })
    );
  });
});

describe('POST /api/checklists', () => {
  it('should create a checklist', async () => {
    const created = { id: 'cl-new', name: 'New Checklist', category: 'maintenance', items: [{ question: 'OK?' }] };
    (prisma as any).fsSvcChecklist.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/checklists')
      .send({ name: 'New Checklist', category: 'maintenance', items: [{ question: 'OK?' }] });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid data', async () => {
    const res = await request(app)
      .post('/api/checklists')
      .send({ name: '' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/checklists/:id', () => {
  it('should return a checklist', async () => {
    (prisma as any).fsSvcChecklist.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', name: 'Safety' });

    const res = await request(app).get('/api/checklists/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcChecklist.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/checklists/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/checklists/:id', () => {
  it('should update a checklist', async () => {
    (prisma as any).fsSvcChecklist.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).fsSvcChecklist.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', name: 'Updated' });

    const res = await request(app)
      .put('/api/checklists/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });

    expect(res.status).toBe(200);
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcChecklist.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/checklists/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/checklists/:id', () => {
  it('should soft delete a checklist', async () => {
    (prisma as any).fsSvcChecklist.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).fsSvcChecklist.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', deletedAt: new Date() });

    const res = await request(app).delete('/api/checklists/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Checklist deleted');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcChecklist.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/checklists/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/checklists/:id/results', () => {
  it('should submit checklist results', async () => {
    (prisma as any).fsSvcChecklist.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const created = { id: 'cr-new', checklistId: 'cl-1', overallResult: 'PASS' };
    (prisma as any).fsSvcChecklistResult.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/checklists/00000000-0000-0000-0000-000000000001/results')
      .send({
        jobId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        completedAt: '2026-02-13T10:00:00Z',
        results: [{ item: 'Check A', pass: true }],
        overallResult: 'PASS',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if checklist not found', async () => {
    (prisma as any).fsSvcChecklist.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/checklists/00000000-0000-0000-0000-000000000099/results')
      .send({
        jobId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        completedAt: '2026-02-13T10:00:00Z',
        results: [],
        overallResult: 'PASS',
      });

    expect(res.status).toBe(404);
  });

  it('should reject invalid data', async () => {
    (prisma as any).fsSvcChecklist.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });

    const res = await request(app)
      .post('/api/checklists/00000000-0000-0000-0000-000000000001/results')
      .send({ overallResult: 'INVALID' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/checklists/:id/results', () => {
  it('should return checklist results', async () => {
    (prisma as any).fsSvcChecklist.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).fsSvcChecklistResult.findMany.mockResolvedValue([{ id: 'cr-1', overallResult: 'PASS' }]);

    const res = await request(app).get('/api/checklists/00000000-0000-0000-0000-000000000001/results');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return 404 if checklist not found', async () => {
    (prisma as any).fsSvcChecklist.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/checklists/00000000-0000-0000-0000-000000000099/results');

    expect(res.status).toBe(404);
  });
});
