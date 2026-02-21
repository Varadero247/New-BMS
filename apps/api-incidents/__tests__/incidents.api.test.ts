import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    incIncident: {
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

import router from '../src/routes/incidents';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/incidents', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/incidents', () => {
  it('should return incidents', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Test' },
    ]);
    mockPrisma.incIncident.count.mockResolvedValue(1);
    const res = await request(app).get('/api/incidents');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns empty list when no incidents exist', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    mockPrisma.incIncident.count.mockResolvedValue(0);
    const res = await request(app).get('/api/incidents');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('findMany and count are each called once', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    mockPrisma.incIncident.count.mockResolvedValue(0);
    await request(app).get('/api/incidents');
    expect(mockPrisma.incIncident.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.incIncident.count).toHaveBeenCalledTimes(1);
  });
});

describe('GET /api/incidents/:id', () => {
  it('should return 404 if not found', async () => {
    mockPrisma.incIncident.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/incidents/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
  it('should return item by id', async () => {
    mockPrisma.incIncident.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).get('/api/incidents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });
});

describe('POST /api/incidents', () => {
  it('should create', async () => {
    mockPrisma.incIncident.count.mockResolvedValue(0);
    mockPrisma.incIncident.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New',
    });
    const res = await request(app)
      .post('/api/incidents')
      .send({ title: 'New', dateOccurred: '2026-01-15T10:00:00Z' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/incidents/:id', () => {
  it('should update', async () => {
    mockPrisma.incIncident.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.incIncident.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated',
    });
    const res = await request(app)
      .put('/api/incidents/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(200);
  });

  it('returns 404 if incident not found on update', async () => {
    mockPrisma.incIncident.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/incidents/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Updated' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/incidents/:id', () => {
  it('should soft delete', async () => {
    mockPrisma.incIncident.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.incIncident.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/incidents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 if incident not found on delete', async () => {
    mockPrisma.incIncident.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/incidents/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.incIncident.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/incidents');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.incIncident.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/incidents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.incIncident.count.mockResolvedValue(0);
    mockPrisma.incIncident.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/incidents').send({ title: 'Test Incident', dateOccurred: '2026-02-21', severity: 'MINOR' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    mockPrisma.incIncident.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.incIncident.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/incidents/00000000-0000-0000-0000-000000000001').send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    mockPrisma.incIncident.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.incIncident.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/incidents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
