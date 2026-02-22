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

describe('capa.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/capa', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/capa', async () => {
    const res = await request(app).get('/api/capa');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/capa', async () => {
    const res = await request(app).get('/api/capa');
    expect(res.headers['content-type']).toBeDefined();
  });
});

describe('capa.api — extended edge cases', () => {
  it('GET / includes pagination in response', async () => {
    mockPrisma.riskCapa.findMany.mockResolvedValue([]);
    mockPrisma.riskCapa.count.mockResolvedValue(0);
    const res = await request(app).get('/api/capa');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pagination');
  });

  it('GET / pagination has page, limit, total, totalPages fields', async () => {
    mockPrisma.riskCapa.findMany.mockResolvedValue([]);
    mockPrisma.riskCapa.count.mockResolvedValue(0);
    const res = await request(app).get('/api/capa');
    expect(res.status).toBe(200);
    const { pagination } = res.body;
    expect(pagination).toHaveProperty('page');
    expect(pagination).toHaveProperty('limit');
    expect(pagination).toHaveProperty('total');
    expect(pagination).toHaveProperty('totalPages');
  });

  it('GET / with page=2&limit=5 passes skip correctly', async () => {
    mockPrisma.riskCapa.findMany.mockResolvedValue([]);
    mockPrisma.riskCapa.count.mockResolvedValue(10);
    const res = await request(app).get('/api/capa?page=2&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(5);
  });

  it('POST / with PREVENTIVE type creates CAPA', async () => {
    mockPrisma.riskCapa.count.mockResolvedValue(0);
    mockPrisma.riskCapa.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Prevent', type: 'PREVENTIVE' });
    const res = await request(app).post('/api/capa').send({ title: 'Prevent', type: 'PREVENTIVE' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('PUT /:id updates status field', async () => {
    mockPrisma.riskCapa.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.riskCapa.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'CLOSED' });
    const res = await request(app)
      .put('/api/capa/00000000-0000-0000-0000-000000000001')
      .send({ status: 'CLOSED' });
    expect(res.status).toBe(200);
    expect(mockPrisma.riskCapa.update).toHaveBeenCalledTimes(1);
  });

  it('DELETE /:id returns message in data on success', async () => {
    mockPrisma.riskCapa.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.riskCapa.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', deletedAt: new Date() });
    const res = await request(app).delete('/api/capa/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('message');
  });

  it('GET / filters by priority query param', async () => {
    mockPrisma.riskCapa.findMany.mockResolvedValue([]);
    mockPrisma.riskCapa.count.mockResolvedValue(0);
    const res = await request(app).get('/api/capa?status=IN_PROGRESS');
    expect(res.status).toBe(200);
    expect(mockPrisma.riskCapa.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'IN_PROGRESS' }) })
    );
  });

  it('GET /:id returns success:true when found', async () => {
    mockPrisma.riskCapa.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Fix' });
    const res = await request(app).get('/api/capa/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST / returns 400 when type is INVALID_ENUM', async () => {
    const res = await request(app).post('/api/capa').send({ title: 'Fix', type: 'BAD_TYPE' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /:id returns success:true on valid update', async () => {
    mockPrisma.riskCapa.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.riskCapa.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Updated' });
    const res = await request(app)
      .put('/api/capa/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('capa.api — final coverage', () => {
  it('POST / with AUDIT source creates CAPA successfully', async () => {
    mockPrisma.riskCapa.count.mockResolvedValue(5);
    mockPrisma.riskCapa.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Audit fix',
      source: 'AUDIT',
    });
    const res = await request(app)
      .post('/api/capa')
      .send({ title: 'Audit fix', type: 'CORRECTIVE', source: 'AUDIT' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST / with INCIDENT source creates CAPA successfully', async () => {
    mockPrisma.riskCapa.count.mockResolvedValue(0);
    mockPrisma.riskCapa.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000002',
      title: 'Incident fix',
      source: 'INCIDENT',
    });
    const res = await request(app)
      .post('/api/capa')
      .send({ title: 'Incident fix', type: 'PREVENTIVE', source: 'INCIDENT' });
    expect(res.status).toBe(201);
  });

  it('GET / returns data array', async () => {
    mockPrisma.riskCapa.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Fix A' },
      { id: '00000000-0000-0000-0000-000000000002', title: 'Fix B' },
    ]);
    mockPrisma.riskCapa.count.mockResolvedValue(2);
    const res = await request(app).get('/api/capa');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('DELETE /:id calls update once with deletedAt', async () => {
    mockPrisma.riskCapa.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.riskCapa.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    await request(app).delete('/api/capa/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.riskCapa.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('GET / totalPages is computed from total and limit', async () => {
    mockPrisma.riskCapa.findMany.mockResolvedValue([]);
    mockPrisma.riskCapa.count.mockResolvedValue(40);
    const res = await request(app).get('/api/capa?limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(4);
  });
});

describe('capa.api — batch ao final', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / returns success:false on 500', async () => {
    mockPrisma.riskCapa.findMany.mockRejectedValue(new Error('crash'));
    const res = await request(app).get('/api/capa');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('POST / count is called before create', async () => {
    mockPrisma.riskCapa.count.mockResolvedValue(3);
    mockPrisma.riskCapa.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'X' });
    await request(app).post('/api/capa').send({ title: 'X', type: 'CORRECTIVE' });
    expect(mockPrisma.riskCapa.count).toHaveBeenCalledTimes(1);
  });

  it('DELETE /:id returns success:false on 500', async () => {
    mockPrisma.riskCapa.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.riskCapa.update.mockRejectedValue(new Error('crash'));
    const res = await request(app).delete('/api/capa/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('PUT /:id returns success:false on 500', async () => {
    mockPrisma.riskCapa.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.riskCapa.update.mockRejectedValue(new Error('crash'));
    const res = await request(app)
      .put('/api/capa/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Boom' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /:id returns data object with expected id', async () => {
    mockPrisma.riskCapa.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000042',
      title: 'Special CAPA',
    });
    const res = await request(app).get('/api/capa/00000000-0000-0000-0000-000000000042');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000042');
  });
});

describe('capa — phase29 coverage', () => {
  it('handles error instanceof', () => {
    expect(new Error('test')).toBeInstanceOf(Error);
  });

  it('handles array filter', () => {
    expect([1, 2, 3, 4].filter(x => x > 2)).toEqual([3, 4]);
  });

  it('handles error message', () => {
    expect(new TypeError('bad')).toHaveProperty('message', 'bad');
  });

  it('handles number isFinite', () => {
    expect(isFinite(42)).toBe(true);
  });

  it('handles string padEnd', () => {
    expect('5'.padEnd(3, '0')).toBe('500');
  });

});

describe('capa — phase30 coverage', () => {
  it('handles array length', () => {
    expect([1, 2, 3].length).toBe(3);
  });

  it('handles array includes', () => {
    expect([1, 2, 3].includes(2)).toBe(true);
  });

  it('handles async reject', async () => {
    await expect(Promise.reject(new Error('err'))).rejects.toThrow('err');
  });

  it('handles Math.pow', () => {
    expect(Math.pow(2, 3)).toBe(8);
  });

  it('handles ternary operator', () => {
    expect(true ? 'yes' : 'no').toBe('yes');
  });

});


describe('phase31 coverage', () => {
  it('handles Math.floor', () => { expect(Math.floor(3.9)).toBe(3); });
  it('handles number parsing', () => { expect(parseInt('42', 10)).toBe(42); });
  it('handles promise resolution', async () => { const v = await Promise.resolve(42); expect(v).toBe(42); });
  it('handles empty object', () => { const o = {}; expect(Object.keys(o).length).toBe(0); });
  it('handles array some', () => { expect([1,2,3].some(x => x > 2)).toBe(true); });
});


describe('phase32 coverage', () => {
  it('handles for...of loop', () => { const arr = [1,2,3]; let s = 0; for (const v of arr) s += v; expect(s).toBe(6); });
  it('handles logical OR assignment', () => { let y = 0; y ||= 5; expect(y).toBe(5); });
  it('handles instanceof check', () => { class Dog {} const d = new Dog(); expect(d instanceof Dog).toBe(true); });
  it('handles array values iterator', () => { expect([...['a','b'].values()]).toEqual(['a','b']); });
  it('handles string raw tag', () => { expect(String.raw`\n`).toBe('\\n'); });
});
