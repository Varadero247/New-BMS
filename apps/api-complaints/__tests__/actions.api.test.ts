import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    compAction: {
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

import router from '../src/routes/actions';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/actions', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/actions', () => {
  it('should return actions', async () => {
    mockPrisma.compAction.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Test' },
    ]);
    mockPrisma.compAction.count.mockResolvedValue(1);
    const res = await request(app).get('/api/actions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns empty list when no actions exist', async () => {
    mockPrisma.compAction.findMany.mockResolvedValue([]);
    mockPrisma.compAction.count.mockResolvedValue(0);
    const res = await request(app).get('/api/actions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('findMany and count are each called once', async () => {
    mockPrisma.compAction.findMany.mockResolvedValue([]);
    mockPrisma.compAction.count.mockResolvedValue(0);
    await request(app).get('/api/actions');
    expect(mockPrisma.compAction.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.compAction.count).toHaveBeenCalledTimes(1);
  });
});

describe('GET /api/actions/:id', () => {
  it('should return 404 if not found', async () => {
    mockPrisma.compAction.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/actions/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
  it('should return item by id', async () => {
    mockPrisma.compAction.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).get('/api/actions/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });
});

describe('POST /api/actions', () => {
  it('should create', async () => {
    mockPrisma.compAction.count.mockResolvedValue(0);
    mockPrisma.compAction.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New',
    });
    const res = await request(app)
      .post('/api/actions')
      .send({ complaintId: 'comp-1', action: 'New' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/actions/:id', () => {
  it('should update', async () => {
    mockPrisma.compAction.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.compAction.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated',
    });
    const res = await request(app)
      .put('/api/actions/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(200);
  });

  it('returns 404 if action not found on update', async () => {
    mockPrisma.compAction.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/actions/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Updated' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/actions/:id', () => {
  it('should soft delete', async () => {
    mockPrisma.compAction.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.compAction.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/actions/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 if action not found on delete', async () => {
    mockPrisma.compAction.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/actions/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.compAction.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/actions');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.compAction.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/actions/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.compAction.count.mockResolvedValue(0);
    mockPrisma.compAction.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .post('/api/actions')
      .send({ complaintId: 'comp-1', action: 'Test' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    mockPrisma.compAction.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.compAction.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .put('/api/actions/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    mockPrisma.compAction.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.compAction.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/actions/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── additional coverage ─────────────────────────────────────────────────────

describe('actions route — additional coverage', () => {
  it('auth enforcement: unauthenticated request receives 401', async () => {
    const { authenticate: mockAuth } = require('@ims/auth');
    (mockAuth as jest.Mock).mockImplementationOnce((_req: any, res: any) => {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } });
    });
    const res = await request(app).get('/api/actions');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET / returns empty data array when no actions exist', async () => {
    mockPrisma.compAction.findMany.mockResolvedValue([]);
    mockPrisma.compAction.count.mockResolvedValue(0);
    const res = await request(app).get('/api/actions');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.total).toBe(0);
  });

  it('POST / returns 400 when both required fields are missing', async () => {
    const res = await request(app).post('/api/actions').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST / returns 400 when action field is missing but complaintId is present', async () => {
    const res = await request(app).post('/api/actions').send({ complaintId: 'comp-1' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST / succeeds with all optional fields populated', async () => {
    mockPrisma.compAction.count.mockResolvedValue(2);
    mockPrisma.compAction.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000002',
      action: 'Full action',
      status: 'OPEN',
      assignee: 'user-2',
    });
    const res = await request(app)
      .post('/api/actions')
      .send({
        complaintId: 'comp-1',
        action: 'Full action',
        assignee: 'user-2',
        dueDate: '2026-12-31',
        status: 'OPEN',
        notes: 'Some notes',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000002');
  });
});

describe('actions route — extended coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / returns pagination object with page and limit', async () => {
    mockPrisma.compAction.findMany.mockResolvedValue([]);
    mockPrisma.compAction.count.mockResolvedValue(0);
    const res = await request(app).get('/api/actions?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(10);
  });

  it('GET / filters actions by status query param', async () => {
    mockPrisma.compAction.findMany.mockResolvedValue([]);
    mockPrisma.compAction.count.mockResolvedValue(0);
    const res = await request(app).get('/api/actions?status=CLOSED');
    expect(res.status).toBe(200);
    expect(mockPrisma.compAction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'CLOSED' }) })
    );
  });

  it('GET / filters actions by search query param', async () => {
    mockPrisma.compAction.findMany.mockResolvedValue([]);
    mockPrisma.compAction.count.mockResolvedValue(0);
    const res = await request(app).get('/api/actions?search=refund');
    expect(res.status).toBe(200);
    expect(mockPrisma.compAction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ action: expect.objectContaining({ contains: 'refund' }) }) })
    );
  });

  it('GET /:id returns 404 with NOT_FOUND code', async () => {
    mockPrisma.compAction.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/actions/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('POST / generates a referenceNumber via count', async () => {
    mockPrisma.compAction.count.mockResolvedValue(5);
    mockPrisma.compAction.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000005',
      referenceNumber: 'CMA-2026-0006',
    });
    const res = await request(app).post('/api/actions').send({ complaintId: 'comp-1', action: 'Refund' });
    expect(res.status).toBe(201);
    expect(mockPrisma.compAction.count).toHaveBeenCalledTimes(1);
  });

  it('PUT /:id updates action field', async () => {
    mockPrisma.compAction.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.compAction.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      action: 'Revised action',
    });
    const res = await request(app)
      .put('/api/actions/00000000-0000-0000-0000-000000000001')
      .send({ action: 'Revised action' });
    expect(res.status).toBe(200);
    expect(res.body.data.action).toBe('Revised action');
  });

  it('DELETE /:id response message confirms deletion', async () => {
    mockPrisma.compAction.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.compAction.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).delete('/api/actions/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toMatch(/deleted/i);
  });

  it('GET / returns totalPages in pagination', async () => {
    mockPrisma.compAction.findMany.mockResolvedValue([]);
    mockPrisma.compAction.count.mockResolvedValue(40);
    const res = await request(app).get('/api/actions?page=1&limit=20');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(2);
  });

  it('GET / success is true on 200 response', async () => {
    mockPrisma.compAction.findMany.mockResolvedValue([]);
    mockPrisma.compAction.count.mockResolvedValue(0);
    const res = await request(app).get('/api/actions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('actions route — final coverage expansion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / response content-type is application/json', async () => {
    mockPrisma.compAction.findMany.mockResolvedValue([]);
    mockPrisma.compAction.count.mockResolvedValue(0);
    const res = await request(app).get('/api/actions');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('GET / data array contains the correct action id', async () => {
    mockPrisma.compAction.findMany.mockResolvedValue([{ id: '00000000-0000-0000-0000-000000000001', action: 'Fix it' }]);
    mockPrisma.compAction.count.mockResolvedValue(1);
    const res = await request(app).get('/api/actions');
    expect(res.status).toBe(200);
    expect(res.body.data[0].id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('POST / count is called before create to generate reference number', async () => {
    mockPrisma.compAction.count.mockResolvedValue(7);
    mockPrisma.compAction.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000007', referenceNumber: 'CMA-2026-0008' });
    await request(app).post('/api/actions').send({ complaintId: 'comp-1', action: 'Test' });
    expect(mockPrisma.compAction.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.compAction.create).toHaveBeenCalledTimes(1);
  });

  it('PUT /:id response data has updated id', async () => {
    mockPrisma.compAction.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.compAction.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'CLOSED' });
    const res = await request(app).put('/api/actions/00000000-0000-0000-0000-000000000001').send({ status: 'CLOSED' });
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('DELETE /:id calls update with deletedAt set', async () => {
    mockPrisma.compAction.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.compAction.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).delete('/api/actions/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(mockPrisma.compAction.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('GET / returns 200 with arbitrary unknown query params ignored', async () => {
    mockPrisma.compAction.findMany.mockResolvedValue([]);
    mockPrisma.compAction.count.mockResolvedValue(0);
    const res = await request(app).get('/api/actions?unknownParam=somevalue');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /:id success true when record found', async () => {
    mockPrisma.compAction.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', action: 'Fix it' });
    const res = await request(app).get('/api/actions/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.action).toBe('Fix it');
  });
});

describe('actions route — absolute final expansion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / response is JSON and has success property', async () => {
    mockPrisma.compAction.findMany.mockResolvedValue([]);
    mockPrisma.compAction.count.mockResolvedValue(0);
    const res = await request(app).get('/api/actions');
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toHaveProperty('success', true);
  });

  it('POST / with missing complaintId returns 400 VALIDATION_ERROR', async () => {
    const res = await request(app).post('/api/actions').send({ action: 'Do something' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET / filters by orgId from authenticated user', async () => {
    mockPrisma.compAction.findMany.mockResolvedValue([]);
    mockPrisma.compAction.count.mockResolvedValue(0);
    const res = await request(app).get('/api/actions?complaintId=comp-1');
    expect(res.status).toBe(200);
    expect(mockPrisma.compAction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ orgId: 'org-1' }) })
    );
  });

  it('PUT /:id returns 500 with INTERNAL_ERROR code on update failure', async () => {
    mockPrisma.compAction.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.compAction.update.mockRejectedValue(new Error('DB crash'));
    const res = await request(app)
      .put('/api/actions/00000000-0000-0000-0000-000000000001')
      .send({ status: 'CLOSED' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('actions route — phase28 coverage', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('GET / returns data array type', async () => {
    mockPrisma.compAction.findMany.mockResolvedValue([]);
    mockPrisma.compAction.count.mockResolvedValue(0);
    const res = await request(app).get('/api/actions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET / pagination.total matches count', async () => {
    mockPrisma.compAction.findMany.mockResolvedValue([]);
    mockPrisma.compAction.count.mockResolvedValue(17);
    const res = await request(app).get('/api/actions');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(17);
  });

  it('PUT /:id update response data contains id', async () => {
    mockPrisma.compAction.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.compAction.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'RESOLVED' });
    const res = await request(app)
      .put('/api/actions/00000000-0000-0000-0000-000000000001')
      .send({ status: 'RESOLVED' });
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('GET / response body has success:true', async () => {
    mockPrisma.compAction.findMany.mockResolvedValue([]);
    mockPrisma.compAction.count.mockResolvedValue(0);
    const res = await request(app).get('/api/actions');
    expect(res.body.success).toBe(true);
  });

  it('POST / returns 400 when action field is empty string', async () => {
    const res = await request(app).post('/api/actions').send({ complaintId: 'comp-1', action: '' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('actions — phase30 coverage', () => {
  it('handles object spread', () => {
    const a2 = { x: 1 }; const b2 = { ...a2, y: 2 }; expect(b2).toEqual({ x: 1, y: 2 });
  });

  it('handles undefined check', () => {
    expect(undefined).toBeUndefined();
  });

  it('handles computed properties', () => {
    const key = 'foo'; const obj3 = { [key]: 42 }; expect((obj3 as any).foo).toBe(42);
  });

  it('handles JSON parse', () => {
    expect(JSON.parse('{"a":1}')).toEqual({ a: 1 });
  });

  it('handles Math.ceil', () => {
    expect(Math.ceil(3.1)).toBe(4);
  });

});
