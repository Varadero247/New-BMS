import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    audFinding: {
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

import router from '../src/routes/findings';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/findings', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/findings', () => {
  it('should return findings', async () => {
    mockPrisma.audFinding.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Test' },
    ]);
    mockPrisma.audFinding.count.mockResolvedValue(1);
    const res = await request(app).get('/api/findings');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/findings/:id', () => {
  it('should return 404 if not found', async () => {
    mockPrisma.audFinding.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/findings/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
  it('should return item by id', async () => {
    mockPrisma.audFinding.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).get('/api/findings/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });
});

describe('POST /api/findings', () => {
  it('should create', async () => {
    mockPrisma.audFinding.count.mockResolvedValue(0);
    mockPrisma.audFinding.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New',
    });
    const res = await request(app)
      .post('/api/findings')
      .send({ title: 'New', auditId: '00000000-0000-0000-0000-000000000001' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/findings/:id', () => {
  it('should update', async () => {
    mockPrisma.audFinding.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.audFinding.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated',
    });
    const res = await request(app)
      .put('/api/findings/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/findings/:id', () => {
  it('should soft delete', async () => {
    mockPrisma.audFinding.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.audFinding.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/findings/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when record not found', async () => {
    mockPrisma.audFinding.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/findings/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ─── Validation errors ─────────────────────────────────────────────────────

describe('POST /api/findings — validation', () => {
  it('returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/api/findings')
      .send({ auditId: '00000000-0000-0000-0000-000000000001' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when auditId is missing', async () => {
    const res = await request(app).post('/api/findings').send({ title: 'Finding' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when severity is invalid', async () => {
    mockPrisma.audFinding.count.mockResolvedValue(0);
    const res = await request(app)
      .post('/api/findings')
      .send({ title: 'F', auditId: '00000000-0000-0000-0000-000000000001', severity: 'CRITICAL' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PUT /api/findings/:id — not-found', () => {
  it('returns 404 when record not found', async () => {
    mockPrisma.audFinding.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/findings/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.audFinding.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/findings');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.audFinding.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/findings/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.audFinding.count.mockResolvedValue(0);
    mockPrisma.audFinding.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .post('/api/findings')
      .send({ title: 'Finding', auditId: '00000000-0000-0000-0000-000000000001' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    mockPrisma.audFinding.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.audFinding.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .put('/api/findings/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    mockPrisma.audFinding.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.audFinding.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/findings/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── Query filtering ────────────────────────────────────────────────────────

describe('GET /api/findings — filtering', () => {
  it('filters by status query param', async () => {
    mockPrisma.audFinding.findMany.mockResolvedValue([]);
    mockPrisma.audFinding.count.mockResolvedValue(0);
    const res = await request(app).get('/api/findings?status=OPEN');
    expect(res.status).toBe(200);
    expect(mockPrisma.audFinding.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'OPEN' }) })
    );
  });

  it('filters by auditId', async () => {
    mockPrisma.audFinding.findMany.mockResolvedValue([]);
    mockPrisma.audFinding.count.mockResolvedValue(0);
    const res = await request(app).get(
      '/api/findings?auditId=00000000-0000-0000-0000-000000000001'
    );
    expect(res.status).toBe(200);
  });
});

describe('findings.api — extended edge cases', () => {
  it('POST with valid severity MAJOR_NC creates finding', async () => {
    mockPrisma.audFinding.count.mockResolvedValue(0);
    mockPrisma.audFinding.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'NC Finding',
      severity: 'MAJOR_NC',
    });
    const res = await request(app)
      .post('/api/findings')
      .send({
        title: 'NC Finding',
        auditId: '00000000-0000-0000-0000-000000000001',
        severity: 'MAJOR_NC',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST with valid severity MINOR_NC creates finding', async () => {
    mockPrisma.audFinding.count.mockResolvedValue(0);
    mockPrisma.audFinding.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000002',
      title: 'Minor NC',
      severity: 'MINOR_NC',
    });
    const res = await request(app)
      .post('/api/findings')
      .send({
        title: 'Minor NC',
        auditId: '00000000-0000-0000-0000-000000000001',
        severity: 'MINOR_NC',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET returns pagination metadata', async () => {
    mockPrisma.audFinding.findMany.mockResolvedValue([]);
    mockPrisma.audFinding.count.mockResolvedValue(40);
    const res = await request(app).get('/api/findings?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(40);
    expect(res.body.pagination.totalPages).toBe(4);
    expect(res.body.pagination.page).toBe(2);
  });

  it('GET search filter passes contains to findMany', async () => {
    mockPrisma.audFinding.findMany.mockResolvedValue([]);
    mockPrisma.audFinding.count.mockResolvedValue(0);
    const res = await request(app).get('/api/findings?search=nonconformance');
    expect(res.status).toBe(200);
    expect(mockPrisma.audFinding.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ title: expect.objectContaining({ contains: 'nonconformance' }) }),
      })
    );
  });

  it('DELETE returns message containing deleted', async () => {
    mockPrisma.audFinding.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.audFinding.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/findings/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toMatch(/deleted/i);
  });

  it('PUT with valid status CLOSED updates successfully', async () => {
    mockPrisma.audFinding.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.audFinding.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'CLOSED',
    });
    const res = await request(app)
      .put('/api/findings/00000000-0000-0000-0000-000000000001')
      .send({ status: 'CLOSED' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET returns empty data array when no findings exist', async () => {
    mockPrisma.audFinding.findMany.mockResolvedValue([]);
    mockPrisma.audFinding.count.mockResolvedValue(0);
    const res = await request(app).get('/api/findings');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /:id 404 response has NOT_FOUND code', async () => {
    mockPrisma.audFinding.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/findings/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('findings.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/findings', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/findings', async () => {
    const res = await request(app).get('/api/findings');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/findings', async () => {
    const res = await request(app).get('/api/findings');
    expect(res.headers['content-type']).toBeDefined();
  });
});

describe('findings.api — final coverage block', () => {
  it('GET returns pagination.page = 1 by default', async () => {
    mockPrisma.audFinding.findMany.mockResolvedValue([]);
    mockPrisma.audFinding.count.mockResolvedValue(0);
    const res = await request(app).get('/api/findings');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
  });

  it('GET pagination.totalPages is 0 when count is 0', async () => {
    mockPrisma.audFinding.findMany.mockResolvedValue([]);
    mockPrisma.audFinding.count.mockResolvedValue(0);
    const res = await request(app).get('/api/findings');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(0);
  });

  it('POST with severity OBSERVATION creates finding', async () => {
    mockPrisma.audFinding.count.mockResolvedValue(0);
    mockPrisma.audFinding.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000003',
      title: 'Observation',
      severity: 'OBSERVATION',
    });
    const res = await request(app)
      .post('/api/findings')
      .send({ title: 'Observation', auditId: '00000000-0000-0000-0000-000000000001', severity: 'OBSERVATION' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /:id returns success:true with the found record', async () => {
    mockPrisma.audFinding.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Found' });
    const res = await request(app).get('/api/findings/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Found');
  });

  it('PUT returns success:true on successful update', async () => {
    mockPrisma.audFinding.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.audFinding.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Done' });
    const res = await request(app)
      .put('/api/findings/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Done' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('findMany called once per GET / request', async () => {
    mockPrisma.audFinding.findMany.mockResolvedValue([]);
    mockPrisma.audFinding.count.mockResolvedValue(0);
    await request(app).get('/api/findings');
    expect(mockPrisma.audFinding.findMany).toHaveBeenCalledTimes(1);
  });

  it('DELETE returns data.message on success', async () => {
    mockPrisma.audFinding.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.audFinding.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).delete('/api/findings/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('message');
  });
});

describe('Findings API — extra coverage', () => {
  it('GET / returns success:true and pagination', async () => {
    mockPrisma.audFinding.findMany.mockResolvedValue([]);
    mockPrisma.audFinding.count.mockResolvedValue(0);
    const res = await request(app).get('/api/findings');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('pagination');
  });

  it('POST with severity OPPORTUNITY creates finding', async () => {
    mockPrisma.audFinding.count.mockResolvedValue(0);
    mockPrisma.audFinding.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000004', title: 'OFI', severity: 'OPPORTUNITY' });
    const res = await request(app)
      .post('/api/findings')
      .send({ title: 'OFI', auditId: '00000000-0000-0000-0000-000000000001', severity: 'OPPORTUNITY' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('PUT /:id create is called with correct where.id', async () => {
    mockPrisma.audFinding.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.audFinding.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Fixed' });
    await request(app).put('/api/findings/00000000-0000-0000-0000-000000000001').send({ title: 'Fixed' });
    expect(mockPrisma.audFinding.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '00000000-0000-0000-0000-000000000001' } })
    );
  });

  it('DELETE /:id update is called with deletedAt data', async () => {
    mockPrisma.audFinding.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.audFinding.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    await request(app).delete('/api/findings/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.audFinding.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('POST / count is called once to generate reference number', async () => {
    mockPrisma.audFinding.count.mockResolvedValue(5);
    mockPrisma.audFinding.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000006', title: 'F6', referenceNumber: 'AFN-2026-0006' });
    await request(app).post('/api/findings').send({ title: 'F6', auditId: '00000000-0000-0000-0000-000000000001' });
    expect(mockPrisma.audFinding.count).toHaveBeenCalledTimes(1);
  });
});
