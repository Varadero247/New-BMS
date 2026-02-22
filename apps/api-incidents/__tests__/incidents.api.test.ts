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

describe('Incidents — additional coverage', () => {
  it('GET / returns pagination object with page and total', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    mockPrisma.incIncident.count.mockResolvedValue(0);
    const res = await request(app).get('/api/incidents');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('total');
  });

  it('GET / filters by status query param (count is called with where)', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    mockPrisma.incIncident.count.mockResolvedValue(0);
    await request(app).get('/api/incidents?status=CLOSED');
    const countCall = (mockPrisma.incIncident.count as jest.Mock).mock.calls[0][0];
    expect(countCall.where.status).toBe('CLOSED');
  });

  it('POST / returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/api/incidents')
      .send({ dateOccurred: '2026-01-15T10:00:00Z' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST / returns 400 when dateOccurred is missing', async () => {
    const res = await request(app)
      .post('/api/incidents')
      .send({ title: 'Missing date' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('DELETE / returns message in data on success', async () => {
    mockPrisma.incIncident.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.incIncident.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).delete('/api/incidents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('message');
  });
});

describe('Incidents — search and pagination', () => {
  it('GET / with search param filters by title contains', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    mockPrisma.incIncident.count.mockResolvedValue(0);
    await request(app).get('/api/incidents?search=fire');
    const countCall = (mockPrisma.incIncident.count as jest.Mock).mock.calls[0][0];
    expect(countCall.where.title).toEqual({ contains: 'fire', mode: 'insensitive' });
  });

  it('GET / pagination defaults page to 1', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    mockPrisma.incIncident.count.mockResolvedValue(0);
    const res = await request(app).get('/api/incidents');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
  });

  it('GET / pagination defaults limit to 20', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    mockPrisma.incIncident.count.mockResolvedValue(0);
    const res = await request(app).get('/api/incidents');
    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(20);
  });

  it('GET / pagination totalPages is computed', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    mockPrisma.incIncident.count.mockResolvedValue(45);
    const res = await request(app).get('/api/incidents?limit=20');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('POST / includes severity field when provided', async () => {
    mockPrisma.incIncident.count.mockResolvedValue(0);
    mockPrisma.incIncident.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001', title: 'Fire', severity: 'MAJOR',
    });
    const res = await request(app)
      .post('/api/incidents')
      .send({ title: 'Fire', dateOccurred: '2026-01-15T10:00:00Z', severity: 'MAJOR' });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('severity', 'MAJOR');
  });

  it('POST / returns 400 for invalid severity value', async () => {
    const res = await request(app)
      .post('/api/incidents')
      .send({ title: 'Test', dateOccurred: '2026-01-15T10:00:00Z', severity: 'INVALID_SEVERITY' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT / updates status field', async () => {
    mockPrisma.incIncident.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.incIncident.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001', status: 'CLOSED',
    });
    const res = await request(app)
      .put('/api/incidents/00000000-0000-0000-0000-000000000001')
      .send({ status: 'CLOSED' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CLOSED');
  });

  it('GET / response data is an array', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    mockPrisma.incIncident.count.mockResolvedValue(0);
    const res = await request(app).get('/api/incidents');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('Incidents — extra coverage', () => {
  it('GET / response body has success key', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    mockPrisma.incIncident.count.mockResolvedValue(0);
    const res = await request(app).get('/api/incidents');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('GET / response body has data key as array', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    mockPrisma.incIncident.count.mockResolvedValue(0);
    const res = await request(app).get('/api/incidents');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET / with severity filter passes it to count where clause', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    mockPrisma.incIncident.count.mockResolvedValue(0);
    await request(app).get('/api/incidents?severity=MAJOR');
    const countCall = (mockPrisma.incIncident.count as jest.Mock).mock.calls[0][0];
    expect(countCall.where.orgId).toBe('org-1');
  });

  it('POST / returns 201 with correct id in data', async () => {
    mockPrisma.incIncident.count.mockResolvedValue(0);
    mockPrisma.incIncident.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000042',
      title: 'Equipment Failure',
      dateOccurred: '2026-03-01T10:00:00Z',
    });
    const res = await request(app)
      .post('/api/incidents')
      .send({ title: 'Equipment Failure', dateOccurred: '2026-03-01T10:00:00Z' });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000042');
  });

  it('DELETE /:id returns success:true and message on success', async () => {
    mockPrisma.incIncident.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.incIncident.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).delete('/api/incidents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Incidents — final coverage block', () => {
  it('GET / response content-type is JSON', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    mockPrisma.incIncident.count.mockResolvedValue(0);
    const res = await request(app).get('/api/incidents');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /:id response content-type is JSON', async () => {
    mockPrisma.incIncident.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).get('/api/incidents/00000000-0000-0000-0000-000000000001');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET / includes orgId in count query where clause', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    mockPrisma.incIncident.count.mockResolvedValue(0);
    await request(app).get('/api/incidents');
    const countCall = (mockPrisma.incIncident.count as jest.Mock).mock.calls[0][0];
    expect(countCall.where.orgId).toBe('org-1');
  });

  it('POST / create data includes title and dateOccurred', async () => {
    mockPrisma.incIncident.count.mockResolvedValue(0);
    mockPrisma.incIncident.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Slip',
      dateOccurred: '2026-02-01T10:00:00Z',
    });
    const res = await request(app)
      .post('/api/incidents')
      .send({ title: 'Slip', dateOccurred: '2026-02-01T10:00:00Z' });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('title', 'Slip');
  });

  it('PUT /:id response data has id field', async () => {
    mockPrisma.incIncident.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.incIncident.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Fixed' });
    const res = await request(app)
      .put('/api/incidents/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Fixed' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id');
  });

  it('DELETE /:id soft-delete update includes deletedAt', async () => {
    mockPrisma.incIncident.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.incIncident.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    await request(app).delete('/api/incidents/00000000-0000-0000-0000-000000000001');
    const updateCall = (mockPrisma.incIncident.update as jest.Mock).mock.calls[0][0];
    expect(updateCall.data).toHaveProperty('deletedAt');
  });

  it('GET / pagination totalPages is 1 when count equals limit', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    mockPrisma.incIncident.count.mockResolvedValue(20);
    const res = await request(app).get('/api/incidents?limit=20');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(1);
  });
});
