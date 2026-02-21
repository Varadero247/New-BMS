import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    riskCapa: {
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

import router from '../src/routes/capa';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/capa', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/capa', () => {
  it('should return CAPAs', async () => {
    mockPrisma.riskCapa.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Test' },
    ]);
    mockPrisma.riskCapa.count.mockResolvedValue(1);
    const res = await request(app).get('/api/capa');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/capa/:id', () => {
  it('should return 404 if not found', async () => {
    mockPrisma.riskCapa.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/capa/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
  it('should return item by id', async () => {
    mockPrisma.riskCapa.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).get('/api/capa/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });
});

describe('POST /api/capa', () => {
  it('should create', async () => {
    mockPrisma.riskCapa.count.mockResolvedValue(0);
    mockPrisma.riskCapa.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New',
    });
    const res = await request(app).post('/api/capa').send({ title: 'New', type: 'CORRECTIVE' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/capa/:id', () => {
  it('should update', async () => {
    mockPrisma.riskCapa.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.riskCapa.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated',
    });
    const res = await request(app)
      .put('/api/capa/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/capa/:id', () => {
  it('should soft delete', async () => {
    mockPrisma.riskCapa.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.riskCapa.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/capa/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when record not found', async () => {
    mockPrisma.riskCapa.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/capa/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ─── Validation errors ─────────────────────────────────────────────────────

describe('POST /api/capa — validation', () => {
  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/api/capa').send({ type: 'CORRECTIVE' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when type is missing', async () => {
    const res = await request(app).post('/api/capa').send({ title: 'Fix leak' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when type is invalid', async () => {
    const res = await request(app).post('/api/capa').send({ title: 'Fix', type: 'INVALID' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PUT /api/capa/:id — not-found', () => {
  it('returns 404 when record not found', async () => {
    mockPrisma.riskCapa.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/capa/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.riskCapa.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/capa');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.riskCapa.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/capa/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.riskCapa.count.mockResolvedValue(0);
    mockPrisma.riskCapa.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/capa').send({ title: 'Fix', type: 'CORRECTIVE' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    mockPrisma.riskCapa.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.riskCapa.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .put('/api/capa/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    mockPrisma.riskCapa.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.riskCapa.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/capa/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── Query filtering ────────────────────────────────────────────────────────

describe('GET /api/capa — filtering', () => {
  it('filters by status query param', async () => {
    mockPrisma.riskCapa.findMany.mockResolvedValue([]);
    mockPrisma.riskCapa.count.mockResolvedValue(0);
    const res = await request(app).get('/api/capa?status=OPEN');
    expect(res.status).toBe(200);
    expect(mockPrisma.riskCapa.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'OPEN' }) })
    );
  });

  it('searches by title keyword', async () => {
    mockPrisma.riskCapa.findMany.mockResolvedValue([]);
    mockPrisma.riskCapa.count.mockResolvedValue(0);
    const res = await request(app).get('/api/capa?search=leak');
    expect(res.status).toBe(200);
    expect(mockPrisma.riskCapa.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ title: expect.objectContaining({ contains: 'leak' }) }) })
    );
  });
});
