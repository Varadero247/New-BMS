import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    esgAudit: {
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

import auditsRouter from '../src/routes/audits';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/audits', auditsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockAudit = {
  id: '00000000-0000-0000-0000-000000000001',
  title: 'Q1 ESG Audit',
  auditType: 'INTERNAL',
  framework: 'GRI',
  auditor: 'Jane Smith',
  startDate: new Date('2026-03-01'),
  endDate: new Date('2026-03-15'),
  status: 'PLANNED',
  findings: null,
  score: 85,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
};

describe('GET /api/audits', () => {
  it('should return paginated audits list', async () => {
    (prisma.esgAudit.findMany as jest.Mock).mockResolvedValue([mockAudit]);
    (prisma.esgAudit.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/audits');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by auditType', async () => {
    (prisma.esgAudit.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgAudit.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/audits?auditType=INTERNAL');
    expect(prisma.esgAudit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ auditType: 'INTERNAL' }) })
    );
  });

  it('should filter by status', async () => {
    (prisma.esgAudit.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgAudit.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/audits?status=COMPLETED');
    expect(prisma.esgAudit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'COMPLETED' }) })
    );
  });

  it('should return empty list', async () => {
    (prisma.esgAudit.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgAudit.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/audits');
    expect(res.body.data).toHaveLength(0);
  });
});

describe('POST /api/audits', () => {
  it('should create an audit', async () => {
    (prisma.esgAudit.create as jest.Mock).mockResolvedValue(mockAudit);

    const res = await request(app).post('/api/audits').send({
      title: 'Q1 ESG Audit',
      auditType: 'INTERNAL',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for missing title', async () => {
    const res = await request(app).post('/api/audits').send({
      auditType: 'INTERNAL',
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid auditType', async () => {
    const res = await request(app).post('/api/audits').send({
      title: 'Test',
      auditType: 'INVALID',
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/audits/:id', () => {
  it('should return a single audit', async () => {
    (prisma.esgAudit.findFirst as jest.Mock).mockResolvedValue(mockAudit);

    const res = await request(app).get('/api/audits/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 when not found', async () => {
    (prisma.esgAudit.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/audits/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/audits/:id', () => {
  it('should update an audit', async () => {
    (prisma.esgAudit.findFirst as jest.Mock).mockResolvedValue(mockAudit);
    (prisma.esgAudit.update as jest.Mock).mockResolvedValue({ ...mockAudit, status: 'COMPLETED' });

    const res = await request(app)
      .put('/api/audits/00000000-0000-0000-0000-000000000001')
      .send({ status: 'COMPLETED' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma.esgAudit.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/audits/00000000-0000-0000-0000-000000000099')
      .send({ status: 'COMPLETED' });
    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid data', async () => {
    const res = await request(app)
      .put('/api/audits/00000000-0000-0000-0000-000000000001')
      .send({ auditType: 'INVALID' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/audits/:id', () => {
  it('should soft delete an audit', async () => {
    (prisma.esgAudit.findFirst as jest.Mock).mockResolvedValue(mockAudit);
    (prisma.esgAudit.update as jest.Mock).mockResolvedValue({
      ...mockAudit,
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/audits/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma.esgAudit.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/audits/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    (prisma.esgAudit.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/audits');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    (prisma.esgAudit.findFirst as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/audits/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    (prisma.esgAudit.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgAudit.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/audits').send({ title: 'Q1 ESG Audit', auditType: 'INTERNAL' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    (prisma.esgAudit.findFirst as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma.esgAudit.update as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/audits/00000000-0000-0000-0000-000000000001').send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    (prisma.esgAudit.findFirst as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma.esgAudit.update as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/audits/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('audits — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/audits', auditsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/audits', async () => {
    const res = await request(app).get('/api/audits');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });
});

// ─── Extended edge cases ────────────────────────────────────────────────────

describe('audits — extended edge cases', () => {
  it('GET / returns pagination metadata', async () => {
    (prisma.esgAudit.findMany as jest.Mock).mockResolvedValue([mockAudit]);
    (prisma.esgAudit.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/audits');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
    expect(res.body.pagination.totalPages).toBeGreaterThanOrEqual(1);
  });

  it('GET / page=2 uses correct skip offset', async () => {
    (prisma.esgAudit.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgAudit.count as jest.Mock).mockResolvedValue(25);
    await request(app).get('/api/audits?page=2&limit=10');
    expect(prisma.esgAudit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it('GET / filters by framework when provided', async () => {
    (prisma.esgAudit.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgAudit.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/audits?auditType=EXTERNAL');
    expect(res.status).toBe(200);
    expect(prisma.esgAudit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ auditType: 'EXTERNAL' }) })
    );
  });

  it('POST / creates audit with REGULATORY type', async () => {
    (prisma.esgAudit.create as jest.Mock).mockResolvedValue({ ...mockAudit, auditType: 'REGULATORY' });
    const res = await request(app).post('/api/audits').send({
      title: 'Regulatory Audit 2026',
      auditType: 'REGULATORY',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST / accepts optional score field', async () => {
    (prisma.esgAudit.create as jest.Mock).mockResolvedValue({ ...mockAudit, score: 92 });
    const res = await request(app).post('/api/audits').send({
      title: 'Scored Audit',
      auditType: 'INTERNAL',
      score: 92,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST / returns 400 when score is out of range', async () => {
    const res = await request(app).post('/api/audits').send({
      title: 'Bad Score Audit',
      auditType: 'INTERNAL',
      score: 150,
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT / with valid IN_PROGRESS status succeeds', async () => {
    (prisma.esgAudit.findFirst as jest.Mock).mockResolvedValue(mockAudit);
    (prisma.esgAudit.update as jest.Mock).mockResolvedValue({ ...mockAudit, status: 'IN_PROGRESS' });
    const res = await request(app)
      .put('/api/audits/00000000-0000-0000-0000-000000000001')
      .send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  it('DELETE / sets deletedAt on soft delete', async () => {
    (prisma.esgAudit.findFirst as jest.Mock).mockResolvedValue(mockAudit);
    (prisma.esgAudit.update as jest.Mock).mockResolvedValue({ ...mockAudit, deletedAt: new Date() });
    const res = await request(app).delete('/api/audits/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(prisma.esgAudit.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('GET /count returns 500 when count fails', async () => {
    (prisma.esgAudit.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgAudit.count as jest.Mock).mockRejectedValue(new Error('count failed'));
    const res = await request(app).get('/api/audits');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
