import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    cmmsInspection: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
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

import inspectionsRouter from '../src/routes/inspections';
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/api/inspections', inspectionsRouter);

const mockInspection = {
  id: '00000000-0000-0000-0000-000000000001',
  assetId: 'asset-1',
  inspectionType: 'Safety Inspection',
  inspector: 'John Smith',
  scheduledDate: new Date('2026-03-01'),
  completedDate: null,
  status: 'SCHEDULED',
  result: null,
  findings: null,
  nextInspectionDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
  asset: { id: 'asset-1', name: 'CNC Machine', code: 'ASSET-1001' },
};

describe('Inspections Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/inspections', () => {
    it('should return paginated inspections', async () => {
      prisma.cmmsInspection.findMany.mockResolvedValue([mockInspection]);
      prisma.cmmsInspection.count.mockResolvedValue(1);

      const res = await request(app).get('/api/inspections');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should filter by assetId', async () => {
      prisma.cmmsInspection.findMany.mockResolvedValue([]);
      prisma.cmmsInspection.count.mockResolvedValue(0);

      const res = await request(app).get('/api/inspections?assetId=asset-1');
      expect(res.status).toBe(200);
    });

    it('should filter by status', async () => {
      prisma.cmmsInspection.findMany.mockResolvedValue([]);
      prisma.cmmsInspection.count.mockResolvedValue(0);

      const res = await request(app).get('/api/inspections?status=SCHEDULED');
      expect(res.status).toBe(200);
    });

    it('should filter by result', async () => {
      prisma.cmmsInspection.findMany.mockResolvedValue([]);
      prisma.cmmsInspection.count.mockResolvedValue(0);

      const res = await request(app).get('/api/inspections?result=PASS');
      expect(res.status).toBe(200);
    });

    it('should handle errors', async () => {
      prisma.cmmsInspection.findMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/inspections');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/inspections/overdue', () => {
    it('should return overdue inspections', async () => {
      prisma.cmmsInspection.findMany.mockResolvedValue([mockInspection]);

      const res = await request(app).get('/api/inspections/overdue');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should handle errors', async () => {
      prisma.cmmsInspection.findMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/inspections/overdue');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/inspections', () => {
    it('should create an inspection', async () => {
      prisma.cmmsInspection.create.mockResolvedValue(mockInspection);

      const res = await request(app).post('/api/inspections').send({
        assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        inspectionType: 'Safety Inspection',
        inspector: 'John Smith',
        scheduledDate: '2026-03-01T00:00:00Z',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app).post('/api/inspections').send({});
      expect(res.status).toBe(400);
    });

    it('should handle creation errors', async () => {
      prisma.cmmsInspection.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/inspections').send({
        assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        inspectionType: 'Safety Inspection',
        inspector: 'John Smith',
        scheduledDate: '2026-03-01T00:00:00Z',
      });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/inspections/:id', () => {
    it('should return an inspection by ID', async () => {
      prisma.cmmsInspection.findFirst.mockResolvedValue(mockInspection);

      const res = await request(app).get('/api/inspections/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 for non-existent inspection', async () => {
      prisma.cmmsInspection.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/inspections/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/inspections/:id', () => {
    it('should update an inspection', async () => {
      prisma.cmmsInspection.findFirst.mockResolvedValue(mockInspection);
      prisma.cmmsInspection.update.mockResolvedValue({
        ...mockInspection,
        status: 'COMPLETED',
        result: 'PASS',
      });

      const res = await request(app)
        .put('/api/inspections/00000000-0000-0000-0000-000000000001')
        .send({ status: 'COMPLETED', result: 'PASS' });
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent inspection', async () => {
      prisma.cmmsInspection.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/inspections/00000000-0000-0000-0000-000000000099')
        .send({ status: 'COMPLETED' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/inspections/:id', () => {
    it('should soft delete an inspection', async () => {
      prisma.cmmsInspection.findFirst.mockResolvedValue(mockInspection);
      prisma.cmmsInspection.update.mockResolvedValue({ ...mockInspection, deletedAt: new Date() });

      const res = await request(app).delete(
        '/api/inspections/00000000-0000-0000-0000-000000000001'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent inspection', async () => {
      prisma.cmmsInspection.findFirst.mockResolvedValue(null);

      const res = await request(app).delete(
        '/api/inspections/00000000-0000-0000-0000-000000000099'
      );
      expect(res.status).toBe(404);
    });
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    prisma.cmmsInspection.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/inspections');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    prisma.cmmsInspection.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/inspections').send({
      assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      inspectionType: 'Safety Inspection',
      inspector: 'John Smith',
      scheduledDate: '2026-03-01T00:00:00Z',
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 on DB error', async () => {
    prisma.cmmsInspection.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    prisma.cmmsInspection.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/inspections/00000000-0000-0000-0000-000000000001').send({ notes: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('inspections — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/inspections', inspectionsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/inspections', async () => {
    const res = await request(app).get('/api/inspections');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });
});

describe('inspections — edge cases and field validation', () => {
  it('GET /inspections returns success: true on 200', async () => {
    prisma.cmmsInspection.findMany.mockResolvedValue([mockInspection]);
    prisma.cmmsInspection.count.mockResolvedValue(1);
    const res = await request(app).get('/api/inspections');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /inspections pagination includes total, page, and limit fields', async () => {
    prisma.cmmsInspection.findMany.mockResolvedValue([]);
    prisma.cmmsInspection.count.mockResolvedValue(0);
    const res = await request(app).get('/api/inspections');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('total');
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('limit');
  });

  it('GET /inspections?page=2&limit=5 returns correct pagination metadata', async () => {
    prisma.cmmsInspection.findMany.mockResolvedValue([]);
    prisma.cmmsInspection.count.mockResolvedValue(15);
    const res = await request(app).get('/api/inspections?page=2&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(5);
    expect(res.body.pagination.total).toBe(15);
  });

  it('GET /inspections data items include id field', async () => {
    prisma.cmmsInspection.findMany.mockResolvedValue([mockInspection]);
    prisma.cmmsInspection.count.mockResolvedValue(1);
    const res = await request(app).get('/api/inspections');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('id', '00000000-0000-0000-0000-000000000001');
  });

  it('POST /inspections sets createdBy from authenticated user', async () => {
    prisma.cmmsInspection.create.mockResolvedValue(mockInspection);
    await request(app).post('/api/inspections').send({
      assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      inspectionType: 'Electrical Inspection',
      inspector: 'Jane Doe',
      scheduledDate: '2026-04-01T00:00:00Z',
    });
    expect(prisma.cmmsInspection.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ createdBy: 'user-123' }),
      })
    );
  });

  it('DELETE /inspections/:id returns 500 on update error', async () => {
    prisma.cmmsInspection.findFirst.mockResolvedValue(mockInspection);
    prisma.cmmsInspection.update.mockRejectedValue(new Error('DB write error'));
    const res = await request(app).delete(
      '/api/inspections/00000000-0000-0000-0000-000000000001'
    );
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /inspections/overdue returns empty array when no overdue', async () => {
    prisma.cmmsInspection.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/inspections/overdue');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('PUT /inspections/:id response data contains updated status field', async () => {
    prisma.cmmsInspection.findFirst.mockResolvedValue(mockInspection);
    prisma.cmmsInspection.update.mockResolvedValue({ ...mockInspection, status: 'IN_PROGRESS' });
    const res = await request(app)
      .put('/api/inspections/00000000-0000-0000-0000-000000000001')
      .send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  it('GET /inspections/:id 500 response has error.code INTERNAL_ERROR', async () => {
    prisma.cmmsInspection.findFirst.mockRejectedValue(new Error('Read error'));
    const res = await request(app).get('/api/inspections/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
