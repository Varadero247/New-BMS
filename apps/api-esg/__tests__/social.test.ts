import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    esgSocialMetric: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
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

import socialRouter from '../src/routes/social';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/social', socialRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockSocial = {
  id: '00000000-0000-0000-0000-000000000001',
  category: 'DIVERSITY',
  metric: 'Gender Diversity Ratio',
  value: 0.45,
  unit: 'ratio',
  periodStart: new Date('2026-01-01'),
  periodEnd: new Date('2026-03-31'),
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
};

describe('GET /api/social', () => {
  it('should return paginated social metrics list', async () => {
    (prisma.esgSocialMetric.findMany as jest.Mock).mockResolvedValue([mockSocial]);
    (prisma.esgSocialMetric.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/social');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by category', async () => {
    (prisma.esgSocialMetric.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgSocialMetric.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/social?category=DIVERSITY');
    expect(prisma.esgSocialMetric.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ category: 'DIVERSITY' }) })
    );
  });

  it('should handle pagination', async () => {
    (prisma.esgSocialMetric.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgSocialMetric.count as jest.Mock).mockResolvedValue(100);

    const res = await request(app).get('/api/social?page=3&limit=10');
    expect(prisma.esgSocialMetric.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    );
  });

  it('should return empty list', async () => {
    (prisma.esgSocialMetric.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgSocialMetric.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/social');
    expect(res.body.data).toHaveLength(0);
  });
});

describe('POST /api/social', () => {
  it('should create a social metric', async () => {
    (prisma.esgSocialMetric.create as jest.Mock).mockResolvedValue(mockSocial);

    const res = await request(app).post('/api/social').send({
      category: 'DIVERSITY',
      metric: 'Gender Diversity Ratio',
      value: 0.45,
      periodStart: '2026-01-01',
      periodEnd: '2026-03-31',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for missing required fields', async () => {
    const res = await request(app).post('/api/social').send({
      category: 'DIVERSITY',
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid category', async () => {
    const res = await request(app).post('/api/social').send({
      category: 'INVALID',
      metric: 'Test',
      value: 1,
      periodStart: '2026-01-01',
      periodEnd: '2026-03-31',
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/social/:id', () => {
  it('should return a single social metric', async () => {
    (prisma.esgSocialMetric.findFirst as jest.Mock).mockResolvedValue(mockSocial);

    const res = await request(app).get('/api/social/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 when not found', async () => {
    (prisma.esgSocialMetric.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/social/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/social/:id', () => {
  it('should update a social metric', async () => {
    (prisma.esgSocialMetric.findFirst as jest.Mock).mockResolvedValue(mockSocial);
    (prisma.esgSocialMetric.update as jest.Mock).mockResolvedValue({ ...mockSocial, value: 0.5 });

    const res = await request(app).put('/api/social/00000000-0000-0000-0000-000000000001').send({ value: 0.5 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma.esgSocialMetric.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put('/api/social/00000000-0000-0000-0000-000000000099').send({ value: 0.5 });
    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid data', async () => {
    const res = await request(app).put('/api/social/00000000-0000-0000-0000-000000000001').send({ category: 'INVALID' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/social/:id', () => {
  it('should soft delete a social metric', async () => {
    (prisma.esgSocialMetric.findFirst as jest.Mock).mockResolvedValue(mockSocial);
    (prisma.esgSocialMetric.update as jest.Mock).mockResolvedValue({ ...mockSocial, deletedAt: new Date() });

    const res = await request(app).delete('/api/social/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma.esgSocialMetric.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/social/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/social/workforce', () => {
  it('should return workforce summary', async () => {
    (prisma.esgSocialMetric.findMany as jest.Mock).mockResolvedValue([
      { ...mockSocial, category: 'DIVERSITY', metric: 'Gender Ratio', value: 0.45 },
      { ...mockSocial, category: 'LABOR', metric: 'Headcount', value: 500 },
    ]);

    const res = await request(app).get('/api/social/workforce');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.diversity).toBeDefined();
    expect(res.body.data.labor).toBeDefined();
  });
});

describe('GET /api/social/safety', () => {
  it('should return safety metrics summary', async () => {
    (prisma.esgSocialMetric.findMany as jest.Mock).mockResolvedValue([
      { ...mockSocial, category: 'HEALTH_SAFETY', metric: 'Lost Time Injury Rate', value: 0.5 },
    ]);

    const res = await request(app).get('/api/social/safety');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
