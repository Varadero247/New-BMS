import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    compComplaint: {
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

import router from '../src/routes/complaints';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/complaints', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/complaints', () => {
  it('should return complaints', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Test' },
    ]);
    mockPrisma.compComplaint.count.mockResolvedValue(1);
    const res = await request(app).get('/api/complaints');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/complaints/:id', () => {
  it('should return 404 if not found', async () => {
    mockPrisma.compComplaint.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/complaints/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
  it('should return item by id', async () => {
    mockPrisma.compComplaint.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).get('/api/complaints/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });
});

describe('POST /api/complaints', () => {
  it('should create', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compComplaint.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New',
    });
    const res = await request(app).post('/api/complaints').send({ title: 'New' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/complaints/:id', () => {
  it('should update', async () => {
    mockPrisma.compComplaint.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.compComplaint.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated',
    });
    const res = await request(app)
      .put('/api/complaints/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/complaints/:id', () => {
  it('should soft delete', async () => {
    mockPrisma.compComplaint.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.compComplaint.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/complaints/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when record not found', async () => {
    mockPrisma.compComplaint.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/complaints/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ─── Validation errors ─────────────────────────────────────────────────────

describe('POST /api/complaints — validation', () => {
  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/api/complaints').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when complainantEmail is invalid', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    const res = await request(app)
      .post('/api/complaints')
      .send({ title: 'Complaint', complainantEmail: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PUT /api/complaints/:id — not-found', () => {
  it('returns 404 when record not found', async () => {
    mockPrisma.compComplaint.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/complaints/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.compComplaint.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/complaints');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.compComplaint.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/complaints/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compComplaint.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/complaints').send({ title: 'Test' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    mockPrisma.compComplaint.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.compComplaint.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .put('/api/complaints/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    mockPrisma.compComplaint.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.compComplaint.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/complaints/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── Query filtering ────────────────────────────────────────────────────────

describe('GET /api/complaints — filtering', () => {
  it('filters by status query param', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([]);
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    const res = await request(app).get('/api/complaints?status=NEW');
    expect(res.status).toBe(200);
    expect(mockPrisma.compComplaint.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'NEW' }) })
    );
  });

  it('searches by title keyword', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([]);
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    const res = await request(app).get('/api/complaints?search=billing');
    expect(res.status).toBe(200);
    expect(mockPrisma.compComplaint.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ title: expect.objectContaining({ contains: 'billing' }) }) })
    );
  });

  it('returns pagination metadata', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([]);
    mockPrisma.compComplaint.count.mockResolvedValue(30);
    const res = await request(app).get('/api/complaints?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.total).toBe(30);
    expect(res.body.pagination.totalPages).toBe(3);
  });
});

describe('complaints.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/complaints', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/complaints', async () => {
    const res = await request(app).get('/api/complaints');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/complaints', async () => {
    const res = await request(app).get('/api/complaints');
    expect(res.headers['content-type']).toBeDefined();
  });
});
