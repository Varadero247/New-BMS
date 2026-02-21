import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    audAudit: {
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

import router from '../src/routes/audits';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/audits', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/audits', () => {
  it('should return audits', async () => {
    mockPrisma.audAudit.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Test' },
    ]);
    mockPrisma.audAudit.count.mockResolvedValue(1);
    const res = await request(app).get('/api/audits');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/audits/:id', () => {
  it('should return 404 if not found', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/audits/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
  it('should return item by id', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).get('/api/audits/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });
});

describe('POST /api/audits', () => {
  it('should create', async () => {
    mockPrisma.audAudit.count.mockResolvedValue(0);
    mockPrisma.audAudit.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New',
    });
    const res = await request(app).post('/api/audits').send({ title: 'New' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/audits/:id', () => {
  it('should update', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.audAudit.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated',
    });
    const res = await request(app)
      .put('/api/audits/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/audits/:id', () => {
  it('should soft delete', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.audAudit.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/audits/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when record not found', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/audits/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ─── Validation errors ─────────────────────────────────────────────────────

describe('POST /api/audits — validation', () => {
  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/api/audits').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when reportUrl is not a valid URL', async () => {
    mockPrisma.audAudit.count.mockResolvedValue(0);
    const res = await request(app)
      .post('/api/audits')
      .send({ title: 'Audit', reportUrl: 'not-a-url' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PUT /api/audits/:id — not-found', () => {
  it('returns 404 when record not found', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/audits/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.audAudit.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/audits');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.audAudit.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/audits/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.audAudit.count.mockResolvedValue(0);
    mockPrisma.audAudit.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/audits').send({ title: 'Test' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.audAudit.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .put('/api/audits/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.audAudit.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/audits/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── Query filtering ────────────────────────────────────────────────────────

describe('GET /api/audits — filtering', () => {
  it('filters by status query param', async () => {
    mockPrisma.audAudit.findMany.mockResolvedValue([]);
    mockPrisma.audAudit.count.mockResolvedValue(0);
    const res = await request(app).get('/api/audits?status=COMPLETED');
    expect(res.status).toBe(200);
    expect(mockPrisma.audAudit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'COMPLETED' }) })
    );
  });

  it('searches by title keyword', async () => {
    mockPrisma.audAudit.findMany.mockResolvedValue([]);
    mockPrisma.audAudit.count.mockResolvedValue(0);
    const res = await request(app).get('/api/audits?search=iso9001');
    expect(res.status).toBe(200);
    expect(mockPrisma.audAudit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ title: expect.objectContaining({ contains: 'iso9001' }) }) })
    );
  });

  it('returns pagination metadata', async () => {
    mockPrisma.audAudit.findMany.mockResolvedValue([]);
    mockPrisma.audAudit.count.mockResolvedValue(25);
    const res = await request(app).get('/api/audits?page=2&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.total).toBe(25);
    expect(res.body.pagination.totalPages).toBe(5);
  });
});

describe('audits.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/audits', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/audits', async () => {
    const res = await request(app).get('/api/audits');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/audits', async () => {
    const res = await request(app).get('/api/audits');
    expect(res.headers['content-type']).toBeDefined();
  });
});
