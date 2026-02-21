import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    esgInitiative: {
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

import initiativesRouter from '../src/routes/initiatives';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/initiatives', initiativesRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockInitiative = {
  id: '00000000-0000-0000-0000-000000000001',
  title: 'Solar Panel Installation',
  description: 'Install solar panels on HQ',
  category: 'ENVIRONMENTAL',
  status: 'PLANNED',
  startDate: new Date('2026-03-01'),
  endDate: new Date('2026-09-30'),
  budget: 150000,
  actualCost: null,
  owner: 'John Doe',
  impact: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
};

describe('GET /api/initiatives', () => {
  it('should return paginated initiatives list', async () => {
    (prisma.esgInitiative.findMany as jest.Mock).mockResolvedValue([mockInitiative]);
    (prisma.esgInitiative.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/initiatives');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by category', async () => {
    (prisma.esgInitiative.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgInitiative.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/initiatives?category=ENVIRONMENTAL');
    expect(prisma.esgInitiative.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ category: 'ENVIRONMENTAL' }) })
    );
  });

  it('should filter by status', async () => {
    (prisma.esgInitiative.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgInitiative.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/initiatives?status=PLANNED');
    expect(prisma.esgInitiative.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'PLANNED' }) })
    );
  });

  it('should return empty list', async () => {
    (prisma.esgInitiative.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgInitiative.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/initiatives');
    expect(res.body.data).toHaveLength(0);
  });
});

describe('POST /api/initiatives', () => {
  it('should create an initiative', async () => {
    (prisma.esgInitiative.create as jest.Mock).mockResolvedValue(mockInitiative);

    const res = await request(app).post('/api/initiatives').send({
      title: 'Solar Panel Installation',
      category: 'ENVIRONMENTAL',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for missing title', async () => {
    const res = await request(app).post('/api/initiatives').send({
      category: 'ENVIRONMENTAL',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for invalid category', async () => {
    const res = await request(app).post('/api/initiatives').send({
      title: 'Test',
      category: 'INVALID',
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/initiatives/:id', () => {
  it('should return a single initiative', async () => {
    (prisma.esgInitiative.findFirst as jest.Mock).mockResolvedValue(mockInitiative);

    const res = await request(app).get('/api/initiatives/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 when not found', async () => {
    (prisma.esgInitiative.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/initiatives/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/initiatives/:id', () => {
  it('should update an initiative', async () => {
    (prisma.esgInitiative.findFirst as jest.Mock).mockResolvedValue(mockInitiative);
    (prisma.esgInitiative.update as jest.Mock).mockResolvedValue({
      ...mockInitiative,
      status: 'IN_PROGRESS',
    });

    const res = await request(app)
      .put('/api/initiatives/00000000-0000-0000-0000-000000000001')
      .send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma.esgInitiative.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/initiatives/00000000-0000-0000-0000-000000000099')
      .send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid status', async () => {
    const res = await request(app)
      .put('/api/initiatives/00000000-0000-0000-0000-000000000001')
      .send({ status: 'BAD' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/initiatives/:id', () => {
  it('should soft delete an initiative', async () => {
    (prisma.esgInitiative.findFirst as jest.Mock).mockResolvedValue(mockInitiative);
    (prisma.esgInitiative.update as jest.Mock).mockResolvedValue({
      ...mockInitiative,
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/initiatives/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma.esgInitiative.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/initiatives/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    (prisma.esgInitiative.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/initiatives');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    (prisma.esgInitiative.findFirst as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/initiatives/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    (prisma.esgInitiative.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgInitiative.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/initiatives').send({ title: 'Solar Panel Installation', category: 'ENVIRONMENTAL' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    (prisma.esgInitiative.findFirst as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma.esgInitiative.update as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/initiatives/00000000-0000-0000-0000-000000000001').send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    (prisma.esgInitiative.findFirst as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma.esgInitiative.update as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/initiatives/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
