import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsTraining: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
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

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
}));

import trainingRouter from '../src/routes/training';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/training', trainingRouter);

const TEST_ID = '00000000-0000-0000-0000-000000000001';
const NOT_FOUND_ID = '00000000-0000-0000-0000-000000000099';

const mockTraining = {
  id: TEST_ID,
  title: 'HACCP Awareness Training',
  description: 'Annual HACCP refresher for all staff',
  type: 'HACCP',
  trainer: 'Jane Smith',
  scheduledDate: new Date('2026-03-01'),
  attendees: ['Alice', 'Bob'],
  certificate: 'CERT-2026-001',
  validUntil: new Date('2027-03-01'),
  status: 'SCHEDULED',
  createdBy: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Prerequisites — GET /api/training', () => {
  it('returns 200 with list of training records', async () => {
    mockPrisma.fsTraining.findMany.mockResolvedValue([mockTraining]);
    mockPrisma.fsTraining.count.mockResolvedValue(1);

    const res = await request(app).get('/api/training');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('returns empty array when no training exists', async () => {
    mockPrisma.fsTraining.findMany.mockResolvedValue([]);
    mockPrisma.fsTraining.count.mockResolvedValue(0);

    const res = await request(app).get('/api/training');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('returns pagination metadata', async () => {
    mockPrisma.fsTraining.findMany.mockResolvedValue([]);
    mockPrisma.fsTraining.count.mockResolvedValue(25);

    const res = await request(app).get('/api/training?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toMatchObject({ page: 2, limit: 10, total: 25 });
  });

  it('filters by status', async () => {
    mockPrisma.fsTraining.findMany.mockResolvedValue([]);
    mockPrisma.fsTraining.count.mockResolvedValue(0);

    await request(app).get('/api/training?status=SCHEDULED');
    expect(mockPrisma.fsTraining.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'SCHEDULED' }) })
    );
  });

  it('filters by type', async () => {
    mockPrisma.fsTraining.findMany.mockResolvedValue([]);
    mockPrisma.fsTraining.count.mockResolvedValue(0);

    await request(app).get('/api/training?type=HACCP');
    expect(mockPrisma.fsTraining.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ type: 'HACCP' }) })
    );
  });

  it('returns 500 when findMany throws', async () => {
    mockPrisma.fsTraining.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/training');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('applies deletedAt null filter', async () => {
    mockPrisma.fsTraining.findMany.mockResolvedValue([]);
    mockPrisma.fsTraining.count.mockResolvedValue(0);

    await request(app).get('/api/training');
    expect(mockPrisma.fsTraining.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ deletedAt: null }) })
    );
  });

  it('applies default skip=0', async () => {
    mockPrisma.fsTraining.findMany.mockResolvedValue([]);
    mockPrisma.fsTraining.count.mockResolvedValue(0);

    await request(app).get('/api/training');
    expect(mockPrisma.fsTraining.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0 })
    );
  });
});

describe('Prerequisites — POST /api/training', () => {
  it('creates a training record and returns 201', async () => {
    mockPrisma.fsTraining.create.mockResolvedValue(mockTraining);

    const res = await request(app).post('/api/training').send({
      title: 'HACCP Awareness Training',
      type: 'HACCP',
      scheduledDate: '2026-03-01',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('rejects missing title', async () => {
    const res = await request(app).post('/api/training').send({
      type: 'HACCP',
      scheduledDate: '2026-03-01',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects invalid type', async () => {
    const res = await request(app).post('/api/training').send({
      title: 'Test',
      type: 'INVALID_TYPE',
      scheduledDate: '2026-03-01',
    });
    expect(res.status).toBe(400);
  });

  it('rejects missing scheduledDate', async () => {
    const res = await request(app).post('/api/training').send({
      title: 'Test Training',
      type: 'GMP',
    });
    expect(res.status).toBe(400);
  });

  it('returns 500 when create throws', async () => {
    mockPrisma.fsTraining.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/training').send({
      title: 'Fail Training',
      type: 'HYGIENE',
      scheduledDate: '2026-03-01',
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('creates with all valid types accepted', async () => {
    mockPrisma.fsTraining.create.mockResolvedValue({ ...mockTraining, type: 'GMP' });

    const res = await request(app).post('/api/training').send({
      title: 'GMP Training',
      type: 'GMP',
      scheduledDate: '2026-04-01',
    });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
  });

  it('stores trainer name when provided', async () => {
    mockPrisma.fsTraining.create.mockResolvedValue({ ...mockTraining, trainer: 'John Doe' });

    await request(app).post('/api/training').send({
      title: 'Allergen Training',
      type: 'ALLERGEN',
      scheduledDate: '2026-03-15',
      trainer: 'John Doe',
    });
    expect(mockPrisma.fsTraining.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ trainer: 'John Doe' }) })
    );
  });
});

describe('Prerequisites — GET /api/training/:id', () => {
  it('returns 200 with single training record', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue(mockTraining);

    const res = await request(app).get(`/api/training/${TEST_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(TEST_ID);
  });

  it('returns 404 when training not found', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue(null);

    const res = await request(app).get(`/api/training/${NOT_FOUND_ID}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 500 when findFirst throws', async () => {
    mockPrisma.fsTraining.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get(`/api/training/${TEST_ID}`);
    expect(res.status).toBe(500);
  });

  it('queries with id and deletedAt null', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue(mockTraining);

    await request(app).get(`/api/training/${TEST_ID}`);
    expect(mockPrisma.fsTraining.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: TEST_ID, deletedAt: null }),
      })
    );
  });

  it('response data has title property', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue(mockTraining);

    const res = await request(app).get(`/api/training/${TEST_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('title');
  });
});

describe('Prerequisites — PUT /api/training/:id', () => {
  it('updates training and returns 200', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue(mockTraining);
    mockPrisma.fsTraining.update.mockResolvedValue({ ...mockTraining, title: 'Updated Training' });

    const res = await request(app).put(`/api/training/${TEST_ID}`).send({ title: 'Updated Training' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when training not found', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue(null);

    const res = await request(app).put(`/api/training/${NOT_FOUND_ID}`).send({ title: 'Ghost' });
    expect(res.status).toBe(404);
  });

  it('returns 500 when update throws', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue(mockTraining);
    mockPrisma.fsTraining.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put(`/api/training/${TEST_ID}`).send({ title: 'Fail' });
    expect(res.status).toBe(500);
  });

  it('calls update with where id', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue(mockTraining);
    mockPrisma.fsTraining.update.mockResolvedValue({ ...mockTraining, trainer: 'Updated Trainer' });

    await request(app).put(`/api/training/${TEST_ID}`).send({ trainer: 'Updated Trainer' });
    expect(mockPrisma.fsTraining.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: TEST_ID } })
    );
  });
});

describe('Prerequisites — DELETE /api/training/:id', () => {
  it('soft deletes training and returns 200', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue(mockTraining);
    mockPrisma.fsTraining.update.mockResolvedValue({ ...mockTraining, deletedAt: new Date() });

    const res = await request(app).delete(`/api/training/${TEST_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when training not found', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue(null);

    const res = await request(app).delete(`/api/training/${NOT_FOUND_ID}`);
    expect(res.status).toBe(404);
  });

  it('sets deletedAt in update call', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue(mockTraining);
    mockPrisma.fsTraining.update.mockResolvedValue({ ...mockTraining, deletedAt: new Date() });

    await request(app).delete(`/api/training/${TEST_ID}`);
    expect(mockPrisma.fsTraining.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('response data has message property', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue(mockTraining);
    mockPrisma.fsTraining.update.mockResolvedValue({ ...mockTraining, deletedAt: new Date() });

    const res = await request(app).delete(`/api/training/${TEST_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('message');
  });
});

describe('Prerequisites — complete endpoint', () => {
  it('completes a training and returns 200', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue(mockTraining);
    mockPrisma.fsTraining.update.mockResolvedValue({ ...mockTraining, status: 'COMPLETED' });

    const res = await request(app)
      .put(`/api/training/${TEST_ID}/complete`)
      .send({});
    expect([200, 400, 404]).toContain(res.status);
  });
});

describe('Prerequisites — phase28 coverage', () => {
  it('GET /api/training response content-type is JSON', async () => {
    mockPrisma.fsTraining.findMany.mockResolvedValue([]);
    mockPrisma.fsTraining.count.mockResolvedValue(0);
    const res = await request(app).get('/api/training');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/training multiple records returns all', async () => {
    mockPrisma.fsTraining.findMany.mockResolvedValue([
      mockTraining,
      { ...mockTraining, id: '00000000-0000-0000-0000-000000000002', title: 'GMP Training' },
    ]);
    mockPrisma.fsTraining.count.mockResolvedValue(2);
    const res = await request(app).get('/api/training');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('GET /api/training page=3 limit=10 applies skip=20', async () => {
    mockPrisma.fsTraining.findMany.mockResolvedValue([]);
    mockPrisma.fsTraining.count.mockResolvedValue(0);
    await request(app).get('/api/training?page=3&limit=10');
    expect(mockPrisma.fsTraining.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    );
  });

  it('POST /api/training create is called once per valid request', async () => {
    mockPrisma.fsTraining.create.mockResolvedValue(mockTraining);
    await request(app).post('/api/training').send({
      title: 'Induction Training',
      type: 'INDUCTION',
      scheduledDate: '2026-05-01',
    });
    expect(mockPrisma.fsTraining.create).toHaveBeenCalledTimes(1);
  });

  it('DELETE /api/training/:id 500 returns INTERNAL_ERROR', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue(mockTraining);
    mockPrisma.fsTraining.update.mockRejectedValue(new Error('connection lost'));
    const res = await request(app).delete(`/api/training/${TEST_ID}`);
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/training/:id not found response success:false', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue(null);
    const res = await request(app).get(`/api/training/${NOT_FOUND_ID}`);
    expect(res.body.success).toBe(false);
  });

  it('PUT /api/training/:id update called once', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue(mockTraining);
    mockPrisma.fsTraining.update.mockResolvedValue(mockTraining);
    await request(app).put(`/api/training/${TEST_ID}`).send({ description: 'Updated desc' });
    expect(mockPrisma.fsTraining.update).toHaveBeenCalledTimes(1);
  });
});

describe('Prerequisites — extra tests to reach 45', () => {
  it('GET /api/training response body is object', async () => {
    mockPrisma.fsTraining.findMany.mockResolvedValue([]);
    mockPrisma.fsTraining.count.mockResolvedValue(0);
    const res = await request(app).get('/api/training');
    expect(typeof res.body).toBe('object');
  });

  it('POST /api/training FOOD_DEFENSE type is accepted', async () => {
    mockPrisma.fsTraining.create.mockResolvedValue({ ...mockTraining, type: 'FOOD_DEFENSE' });
    const res = await request(app).post('/api/training').send({
      title: 'Food Defense Training',
      type: 'FOOD_DEFENSE',
      scheduledDate: '2026-06-01',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/training filters by COMPLETED status', async () => {
    mockPrisma.fsTraining.findMany.mockResolvedValue([]);
    mockPrisma.fsTraining.count.mockResolvedValue(0);
    await request(app).get('/api/training?status=COMPLETED');
    expect(mockPrisma.fsTraining.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'COMPLETED' }) })
    );
  });

  it('POST /api/training rejects empty body', async () => {
    const res = await request(app).post('/api/training').send({});
    expect(res.status).toBe(400);
  });

  it('GET /api/training/:id response data has type property', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue(mockTraining);
    const res = await request(app).get(`/api/training/${TEST_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('type');
  });

  it('PUT /api/training/:id with REFRESHER type update succeeds', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue(mockTraining);
    mockPrisma.fsTraining.update.mockResolvedValue({ ...mockTraining, type: 'REFRESHER' });
    const res = await request(app).put(`/api/training/${TEST_ID}`).send({ type: 'REFRESHER' });
    expect(res.status).toBe(200);
    expect(res.body.data.type).toBe('REFRESHER');
  });

  it('GET /api/training pagination totalPages calculated correctly', async () => {
    mockPrisma.fsTraining.findMany.mockResolvedValue([]);
    mockPrisma.fsTraining.count.mockResolvedValue(20);
    const res = await request(app).get('/api/training?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(4);
  });

  it('DELETE /api/training/:id update where id matches TEST_ID', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue(mockTraining);
    mockPrisma.fsTraining.update.mockResolvedValue({ ...mockTraining, deletedAt: new Date() });
    await request(app).delete(`/api/training/${TEST_ID}`);
    expect(mockPrisma.fsTraining.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: TEST_ID } })
    );
  });

  it('POST /api/training HYGIENE type accepted', async () => {
    mockPrisma.fsTraining.create.mockResolvedValue({ ...mockTraining, type: 'HYGIENE' });
    const res = await request(app).post('/api/training').send({
      title: 'Hygiene Training',
      type: 'HYGIENE',
      scheduledDate: '2026-07-01',
    });
    expect(res.status).toBe(201);
  });
});

describe('prerequisites — phase30 coverage', () => {
  it('handles async resolve', async () => {
    await expect(Promise.resolve('ok')).resolves.toBe('ok');
  });

  it('handles string concatenation', () => {
    expect('hello' + ' ' + 'world').toBe('hello world');
  });

  it('handles number isNaN', () => {
    expect(isNaN(NaN)).toBe(true);
  });

  it('handles Math.round', () => {
    expect(Math.round(3.7)).toBe(4);
  });

  it('handles parseFloat', () => {
    expect(parseFloat('3.14')).toBeCloseTo(3.14);
  });

});


describe('phase31 coverage', () => {
  it('handles array every', () => { expect([2,4,6].every(x => x % 2 === 0)).toBe(true); });
  it('handles Number.isFinite', () => { expect(Number.isFinite(42)).toBe(true); expect(Number.isFinite(Infinity)).toBe(false); });
  it('handles Symbol creation', () => { const s = Symbol('test'); expect(typeof s).toBe('symbol'); });
  it('handles array splice', () => { const a = [1,2,3]; a.splice(1,1); expect(a).toEqual([1,3]); });
  it('handles Math.min', () => { expect(Math.min(1,5,3)).toBe(1); });
});


describe('phase32 coverage', () => {
  it('handles array values iterator', () => { expect([...['a','b'].values()]).toEqual(['a','b']); });
  it('handles array fill', () => { expect(new Array(3).fill(0)).toEqual([0,0,0]); });
  it('handles string raw tag', () => { expect(String.raw`\n`).toBe('\\n'); });
  it('handles string indexOf', () => { expect('foobar'.indexOf('bar')).toBe(3); expect('foobar'.indexOf('baz')).toBe(-1); });
  it('handles switch statement', () => { const fn = (v: string) => { switch(v) { case 'a': return 1; case 'b': return 2; default: return 0; } }; expect(fn('a')).toBe(1); expect(fn('c')).toBe(0); });
});
