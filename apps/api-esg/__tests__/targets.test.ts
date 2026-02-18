import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    esgTarget: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
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

import targetsRouter from '../src/routes/targets';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/targets', targetsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockTarget = {
  id: '00000000-0000-0000-0000-000000000001',
  metricId: '00000000-0000-0000-0000-000000000001',
  year: 2026,
  targetValue: 5000,
  actualValue: 3200,
  baselineYear: 2024,
  baselineValue: 8000,
  status: 'ON_TRACK',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
  metric: { id: 'met-1', name: 'Total CO2', code: 'E-001' },
};

describe('GET /api/targets', () => {
  it('should return paginated targets list', async () => {
    (prisma.esgTarget.findMany as jest.Mock).mockResolvedValue([mockTarget]);
    (prisma.esgTarget.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/targets');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should filter by year', async () => {
    (prisma.esgTarget.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgTarget.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/targets?year=2026');
    expect(res.status).toBe(200);
    expect(prisma.esgTarget.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ year: 2026 }) })
    );
  });

  it('should filter by status', async () => {
    (prisma.esgTarget.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgTarget.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/targets?status=ON_TRACK');
    expect(res.status).toBe(200);
    expect(prisma.esgTarget.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'ON_TRACK' }) })
    );
  });

  it('should return empty data when no targets exist', async () => {
    (prisma.esgTarget.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgTarget.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/targets');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('POST /api/targets', () => {
  it('should create a target', async () => {
    (prisma.esgTarget.create as jest.Mock).mockResolvedValue(mockTarget);

    const res = await request(app).post('/api/targets').send({
      metricId: '00000000-0000-0000-0000-000000000001',
      year: 2026,
      targetValue: 5000,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 400 for missing required fields', async () => {
    const res = await request(app).post('/api/targets').send({
      year: 2026,
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for invalid year', async () => {
    const res = await request(app).post('/api/targets').send({
      metricId: '00000000-0000-0000-0000-000000000001',
      year: 1999,
      targetValue: 5000,
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/targets/:id', () => {
  it('should return a single target', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockResolvedValue(mockTarget);

    const res = await request(app).get('/api/targets/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 when target not found', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/targets/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/targets/:id', () => {
  it('should update a target', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockResolvedValue(mockTarget);
    (prisma.esgTarget.update as jest.Mock).mockResolvedValue({ ...mockTarget, status: 'ACHIEVED' });

    const res = await request(app).put('/api/targets/00000000-0000-0000-0000-000000000001').send({ status: 'ACHIEVED' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when updating non-existent target', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put('/api/targets/00000000-0000-0000-0000-000000000099').send({ status: 'ACHIEVED' });
    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid update data', async () => {
    const res = await request(app).put('/api/targets/00000000-0000-0000-0000-000000000001').send({ status: 'INVALID' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/targets/:id', () => {
  it('should soft delete a target', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockResolvedValue(mockTarget);
    (prisma.esgTarget.update as jest.Mock).mockResolvedValue({ ...mockTarget, deletedAt: new Date() });

    const res = await request(app).delete('/api/targets/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when deleting non-existent target', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/targets/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/targets/:id/trajectory', () => {
  it('should return target trajectory data', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockResolvedValue({
      ...mockTarget,
      metric: {
        ...mockTarget.metric,
        dataPoints: [
          { periodStart: new Date('2026-01-01'), value: 1000 },
          { periodStart: new Date('2026-02-01'), value: 900 },
        ],
      },
    });

    const res = await request(app).get('/api/targets/00000000-0000-0000-0000-000000000001/trajectory');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.target).toBeDefined();
    expect(res.body.data.trajectory).toHaveLength(2);
  });

  it('should return 404 for non-existent target trajectory', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/targets/00000000-0000-0000-0000-000000000099/trajectory');
    expect(res.status).toBe(404);
  });
});
