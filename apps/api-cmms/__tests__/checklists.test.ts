import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    cmmsChecklist: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    cmmsChecklistResult: { findMany: jest.fn(), create: jest.fn() },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
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
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/api/checklists', checklistsRouter);

const mockChecklist = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Daily Equipment Check',
  description: 'Daily safety and operational check',
  assetType: 'EQUIPMENT',
  items: [
    { label: 'Check oil level', type: 'boolean' },
    { label: 'Check temperature', type: 'number' },
  ],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
};

const mockResult = {
  id: 'result-1',
  checklistId: 'cl-1',
  workOrderId: null,
  assetId: 'asset-1',
  completedBy: 'John Smith',
  completedAt: new Date(),
  results: [
    { label: 'Check oil level', value: true },
    { label: 'Check temperature', value: 72 },
  ],
  overallResult: 'PASS',
  notes: 'All checks passed',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
  asset: { id: 'asset-1', name: 'CNC Machine', code: 'ASSET-1001' },
};

describe('Checklists Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/checklists', () => {
    it('should return paginated checklists', async () => {
      prisma.cmmsChecklist.findMany.mockResolvedValue([mockChecklist]);
      prisma.cmmsChecklist.count.mockResolvedValue(1);

      const res = await request(app).get('/api/checklists');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should filter by assetType', async () => {
      prisma.cmmsChecklist.findMany.mockResolvedValue([]);
      prisma.cmmsChecklist.count.mockResolvedValue(0);

      const res = await request(app).get('/api/checklists?assetType=EQUIPMENT');
      expect(res.status).toBe(200);
    });

    it('should filter by isActive', async () => {
      prisma.cmmsChecklist.findMany.mockResolvedValue([]);
      prisma.cmmsChecklist.count.mockResolvedValue(0);

      const res = await request(app).get('/api/checklists?isActive=true');
      expect(res.status).toBe(200);
    });

    it('should handle errors', async () => {
      prisma.cmmsChecklist.findMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/checklists');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/checklists', () => {
    it('should create a checklist', async () => {
      prisma.cmmsChecklist.create.mockResolvedValue(mockChecklist);

      const res = await request(app)
        .post('/api/checklists')
        .send({
          name: 'Daily Equipment Check',
          items: [{ label: 'Check oil level', type: 'boolean' }],
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app).post('/api/checklists').send({});
      expect(res.status).toBe(400);
    });

    it('should handle creation errors', async () => {
      prisma.cmmsChecklist.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/checklists').send({
        name: 'Daily Equipment Check',
        items: [],
      });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/checklists/:id', () => {
    it('should return a checklist by ID', async () => {
      prisma.cmmsChecklist.findFirst.mockResolvedValue(mockChecklist);

      const res = await request(app).get('/api/checklists/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 for non-existent checklist', async () => {
      prisma.cmmsChecklist.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/checklists/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/checklists/:id', () => {
    it('should update a checklist', async () => {
      prisma.cmmsChecklist.findFirst.mockResolvedValue(mockChecklist);
      prisma.cmmsChecklist.update.mockResolvedValue({ ...mockChecklist, name: 'Updated' });

      const res = await request(app)
        .put('/api/checklists/00000000-0000-0000-0000-000000000001')
        .send({ name: 'Updated' });
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent checklist', async () => {
      prisma.cmmsChecklist.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/checklists/00000000-0000-0000-0000-000000000099')
        .send({ name: 'Updated' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/checklists/:id', () => {
    it('should soft delete a checklist', async () => {
      prisma.cmmsChecklist.findFirst.mockResolvedValue(mockChecklist);
      prisma.cmmsChecklist.update.mockResolvedValue({ ...mockChecklist, deletedAt: new Date() });

      const res = await request(app).delete('/api/checklists/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent checklist', async () => {
      prisma.cmmsChecklist.findFirst.mockResolvedValue(null);

      const res = await request(app).delete('/api/checklists/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/checklists/:id/results', () => {
    it('should submit checklist results', async () => {
      prisma.cmmsChecklist.findFirst.mockResolvedValue(mockChecklist);
      prisma.cmmsChecklistResult.create.mockResolvedValue(mockResult);

      const res = await request(app)
        .post('/api/checklists/00000000-0000-0000-0000-000000000001/results')
        .send({
          assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          completedBy: 'John Smith',
          completedAt: '2026-02-13T10:00:00Z',
          results: [{ label: 'Check oil level', value: true }],
          overallResult: 'PASS',
        });
      expect(res.status).toBe(201);
    });

    it('should return 404 for non-existent checklist', async () => {
      prisma.cmmsChecklist.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/checklists/00000000-0000-0000-0000-000000000099/results')
        .send({
          assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          completedBy: 'John Smith',
          completedAt: '2026-02-13T10:00:00Z',
          results: [],
          overallResult: 'PASS',
        });
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid data', async () => {
      const res = await request(app)
        .post('/api/checklists/00000000-0000-0000-0000-000000000001/results')
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/checklists/:id/results', () => {
    it('should return checklist results', async () => {
      prisma.cmmsChecklist.findFirst.mockResolvedValue(mockChecklist);
      prisma.cmmsChecklistResult.findMany.mockResolvedValue([mockResult]);

      const res = await request(app).get(
        '/api/checklists/00000000-0000-0000-0000-000000000001/results'
      );
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should return 404 for non-existent checklist', async () => {
      prisma.cmmsChecklist.findFirst.mockResolvedValue(null);

      const res = await request(app).get(
        '/api/checklists/00000000-0000-0000-0000-000000000099/results'
      );
      expect(res.status).toBe(404);
    });
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    prisma.cmmsChecklist.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/checklists');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id/results returns 500 on DB error', async () => {
    prisma.cmmsChecklist.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    prisma.cmmsChecklistResult.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/checklists/00000000-0000-0000-0000-000000000001/results');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 on DB error', async () => {
    prisma.cmmsChecklist.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    prisma.cmmsChecklist.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/checklists/00000000-0000-0000-0000-000000000001').send({ name: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
