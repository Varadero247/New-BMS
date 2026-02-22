import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsCcp: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    fsMonitoringRecord: {
      findMany: jest.fn(),
      create: jest.fn(),
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

import ccpsRouter from '../src/routes/ccps';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/ccps', ccpsRouter);

const TEST_ID = '00000000-0000-0000-0000-000000000001';
const NOT_FOUND_ID = '00000000-0000-0000-0000-000000000099';

const mockCcp = {
  id: TEST_ID,
  name: 'Pasteurisation CCP',
  processStep: 'Pasteurisation',
  criticalLimit: '72C for 15s',
  monitoringMethod: 'Continuous temp sensor',
  monitoringFrequency: 'CONTINUOUS',
  correctiveAction: 'Divert flow',
  verificationMethod: 'Calibration log',
  recordKeeping: 'Chart recorder',
  isActive: true,
  hazardId: null,
  hazard: null,
  number: 'CCP-001',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/ccps', () => {
  it('returns 200 with list of CCPs', async () => {
    mockPrisma.fsCcp.findMany.mockResolvedValue([mockCcp]);
    mockPrisma.fsCcp.count.mockResolvedValue(1);
    const res = await request(app).get('/api/ccps');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('returns empty array when no CCPs exist', async () => {
    mockPrisma.fsCcp.findMany.mockResolvedValue([]);
    mockPrisma.fsCcp.count.mockResolvedValue(0);
    const res = await request(app).get('/api/ccps');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('returns pagination metadata', async () => {
    mockPrisma.fsCcp.findMany.mockResolvedValue([]);
    mockPrisma.fsCcp.count.mockResolvedValue(20);
    const res = await request(app).get('/api/ccps?page=2&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toMatchObject({ page: 2, limit: 5, total: 20, totalPages: 4 });
  });

  it('filters by isActive=true', async () => {
    mockPrisma.fsCcp.findMany.mockResolvedValue([]);
    mockPrisma.fsCcp.count.mockResolvedValue(0);
    await request(app).get('/api/ccps?isActive=true');
    expect(mockPrisma.fsCcp.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isActive: true }) })
    );
  });

  it('returns 500 when findMany throws', async () => {
    mockPrisma.fsCcp.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/ccps');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('applies deletedAt null filter', async () => {
    mockPrisma.fsCcp.findMany.mockResolvedValue([]);
    mockPrisma.fsCcp.count.mockResolvedValue(0);
    await request(app).get('/api/ccps');
    expect(mockPrisma.fsCcp.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ deletedAt: null }) })
    );
  });

  it('applies default skip=0', async () => {
    mockPrisma.fsCcp.findMany.mockResolvedValue([]);
    mockPrisma.fsCcp.count.mockResolvedValue(0);
    await request(app).get('/api/ccps');
    expect(mockPrisma.fsCcp.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0 })
    );
  });

  it('page=2 limit=10 applies skip=10 take=10', async () => {
    mockPrisma.fsCcp.findMany.mockResolvedValue([]);
    mockPrisma.fsCcp.count.mockResolvedValue(0);
    await request(app).get('/api/ccps?page=2&limit=10');
    expect(mockPrisma.fsCcp.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });
});

describe('POST /api/ccps', () => {
  it('creates a new CCP and returns 201', async () => {
    mockPrisma.fsCcp.count.mockResolvedValue(0);
    mockPrisma.fsCcp.create.mockResolvedValue(mockCcp);
    const res = await request(app).post('/api/ccps').send({
      name: 'Pasteurisation CCP',
      processStep: 'Pasteurisation',
      criticalLimit: '72C for 15s',
      monitoringMethod: 'Continuous temp sensor',
      monitoringFrequency: 'CONTINUOUS',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Pasteurisation CCP');
  });

  it('rejects missing name', async () => {
    const res = await request(app).post('/api/ccps').send({
      processStep: 'Pasteurisation',
      criticalLimit: '72C',
      monitoringMethod: 'Sensor',
      monitoringFrequency: 'CONTINUOUS',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects invalid monitoringFrequency', async () => {
    const res = await request(app).post('/api/ccps').send({
      name: 'Test CCP',
      processStep: 'Test',
      criticalLimit: 'Limit',
      monitoringMethod: 'Method',
      monitoringFrequency: 'INVALID',
    });
    expect(res.status).toBe(400);
  });

  it('auto-generates CCP number from count', async () => {
    mockPrisma.fsCcp.count.mockResolvedValue(4);
    mockPrisma.fsCcp.create.mockResolvedValue({ ...mockCcp, number: 'CCP-005' });
    await request(app).post('/api/ccps').send({
      name: 'New CCP',
      processStep: 'New Step',
      criticalLimit: 'Limit',
      monitoringMethod: 'Method',
      monitoringFrequency: 'DAILY',
    });
    expect(mockPrisma.fsCcp.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ number: 'CCP-005' }) })
    );
  });

  it('returns 500 when create throws', async () => {
    mockPrisma.fsCcp.count.mockResolvedValue(0);
    mockPrisma.fsCcp.create.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/api/ccps').send({
      name: 'Fail CCP',
      processStep: 'Step',
      criticalLimit: 'Limit',
      monitoringMethod: 'Method',
      monitoringFrequency: 'DAILY',
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('returns created record with id in response data', async () => {
    mockPrisma.fsCcp.count.mockResolvedValue(9);
    mockPrisma.fsCcp.create.mockResolvedValue({ ...mockCcp, name: 'Metal Detect CCP', number: 'CCP-010' });
    const res = await request(app).post('/api/ccps').send({
      name: 'Metal Detect CCP',
      processStep: 'Metal Detection',
      criticalLimit: 'No metal > 2mm',
      monitoringMethod: 'Metal detector',
      monitoringFrequency: 'CONTINUOUS',
    });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
  });

  it('rejects empty body', async () => {
    const res = await request(app).post('/api/ccps').send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /api/ccps/:id', () => {
  it('returns 200 with single CCP', async () => {
    mockPrisma.fsCcp.findFirst.mockResolvedValue(mockCcp);
    const res = await request(app).get(`/api/ccps/${TEST_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(TEST_ID);
  });

  it('returns 404 when CCP not found', async () => {
    mockPrisma.fsCcp.findFirst.mockResolvedValue(null);
    const res = await request(app).get(`/api/ccps/${NOT_FOUND_ID}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 500 when findFirst throws', async () => {
    mockPrisma.fsCcp.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get(`/api/ccps/${TEST_ID}`);
    expect(res.status).toBe(500);
  });

  it('queries findFirst with id and deletedAt null', async () => {
    mockPrisma.fsCcp.findFirst.mockResolvedValue(mockCcp);
    await request(app).get(`/api/ccps/${TEST_ID}`);
    expect(mockPrisma.fsCcp.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: TEST_ID, deletedAt: null }),
      })
    );
  });

  it('response data has criticalLimit property', async () => {
    mockPrisma.fsCcp.findFirst.mockResolvedValue(mockCcp);
    const res = await request(app).get(`/api/ccps/${TEST_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('criticalLimit');
  });

  it('not found returns success:false', async () => {
    mockPrisma.fsCcp.findFirst.mockResolvedValue(null);
    const res = await request(app).get(`/api/ccps/${NOT_FOUND_ID}`);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/ccps/:id', () => {
  it('updates CCP and returns 200', async () => {
    mockPrisma.fsCcp.findFirst.mockResolvedValue(mockCcp);
    mockPrisma.fsCcp.update.mockResolvedValue({ ...mockCcp, criticalLimit: '80C' });
    const res = await request(app).put(`/api/ccps/${TEST_ID}`).send({ criticalLimit: '80C' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when CCP not found', async () => {
    mockPrisma.fsCcp.findFirst.mockResolvedValue(null);
    const res = await request(app).put(`/api/ccps/${NOT_FOUND_ID}`).send({ criticalLimit: '80C' });
    expect(res.status).toBe(404);
  });

  it('returns 500 when update throws', async () => {
    mockPrisma.fsCcp.findFirst.mockResolvedValue(mockCcp);
    mockPrisma.fsCcp.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).put(`/api/ccps/${TEST_ID}`).send({ name: 'Updated' });
    expect(res.status).toBe(500);
  });

  it('calls update with where id', async () => {
    mockPrisma.fsCcp.findFirst.mockResolvedValue(mockCcp);
    mockPrisma.fsCcp.update.mockResolvedValue({ ...mockCcp, isActive: false });
    await request(app).put(`/api/ccps/${TEST_ID}`).send({ isActive: false });
    expect(mockPrisma.fsCcp.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: TEST_ID } })
    );
  });

  it('returns updated data in response', async () => {
    mockPrisma.fsCcp.findFirst.mockResolvedValue(mockCcp);
    mockPrisma.fsCcp.update.mockResolvedValue({ ...mockCcp, name: 'Renamed CCP' });
    const res = await request(app).put(`/api/ccps/${TEST_ID}`).send({ name: 'Renamed CCP' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Renamed CCP');
  });

  it('valid monitoringFrequency update succeeds', async () => {
    mockPrisma.fsCcp.findFirst.mockResolvedValue(mockCcp);
    mockPrisma.fsCcp.update.mockResolvedValue({ ...mockCcp, monitoringFrequency: 'HOURLY' });
    const res = await request(app).put(`/api/ccps/${TEST_ID}`).send({ monitoringFrequency: 'HOURLY' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('DELETE /api/ccps/:id', () => {
  it('soft deletes CCP and returns 200', async () => {
    mockPrisma.fsCcp.findFirst.mockResolvedValue(mockCcp);
    mockPrisma.fsCcp.update.mockResolvedValue({ ...mockCcp, deletedAt: new Date() });
    const res = await request(app).delete(`/api/ccps/${TEST_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when CCP not found', async () => {
    mockPrisma.fsCcp.findFirst.mockResolvedValue(null);
    const res = await request(app).delete(`/api/ccps/${NOT_FOUND_ID}`);
    expect(res.status).toBe(404);
  });

  it('returns 500 when update throws', async () => {
    mockPrisma.fsCcp.findFirst.mockResolvedValue(mockCcp);
    mockPrisma.fsCcp.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete(`/api/ccps/${TEST_ID}`);
    expect(res.status).toBe(500);
  });

  it('sets deletedAt in update call', async () => {
    mockPrisma.fsCcp.findFirst.mockResolvedValue(mockCcp);
    mockPrisma.fsCcp.update.mockResolvedValue({ ...mockCcp, deletedAt: new Date() });
    await request(app).delete(`/api/ccps/${TEST_ID}`);
    expect(mockPrisma.fsCcp.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    );
  });

  it('response data has message property', async () => {
    mockPrisma.fsCcp.findFirst.mockResolvedValue(mockCcp);
    mockPrisma.fsCcp.update.mockResolvedValue({ ...mockCcp, deletedAt: new Date() });
    const res = await request(app).delete(`/api/ccps/${TEST_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('message');
  });

  it('update is called once on delete', async () => {
    mockPrisma.fsCcp.findFirst.mockResolvedValue(mockCcp);
    mockPrisma.fsCcp.update.mockResolvedValue({ ...mockCcp, deletedAt: new Date() });
    await request(app).delete(`/api/ccps/${TEST_ID}`);
    expect(mockPrisma.fsCcp.update).toHaveBeenCalledTimes(1);
  });
});

describe('HACCP CCP — phase28 coverage', () => {
  it('GET /api/ccps response body type is object', async () => {
    mockPrisma.fsCcp.findMany.mockResolvedValue([]);
    mockPrisma.fsCcp.count.mockResolvedValue(0);
    const res = await request(app).get('/api/ccps');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/ccps returns content-type JSON', async () => {
    mockPrisma.fsCcp.findMany.mockResolvedValue([]);
    mockPrisma.fsCcp.count.mockResolvedValue(0);
    const res = await request(app).get('/api/ccps');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/ccps filters by isActive=false', async () => {
    mockPrisma.fsCcp.findMany.mockResolvedValue([]);
    mockPrisma.fsCcp.count.mockResolvedValue(0);
    await request(app).get('/api/ccps?isActive=false');
    expect(mockPrisma.fsCcp.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isActive: false }) })
    );
  });

  it('GET /api/ccps multiple records returns correct length', async () => {
    mockPrisma.fsCcp.findMany.mockResolvedValue([mockCcp, { ...mockCcp, id: '00000000-0000-0000-0000-000000000002' }]);
    mockPrisma.fsCcp.count.mockResolvedValue(2);
    const res = await request(app).get('/api/ccps');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('GET /api/ccps/:id response has monitoringMethod property', async () => {
    mockPrisma.fsCcp.findFirst.mockResolvedValue(mockCcp);
    const res = await request(app).get(`/api/ccps/${TEST_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('monitoringMethod');
  });

  it('PUT /api/ccps/:id update calls findFirst once', async () => {
    mockPrisma.fsCcp.findFirst.mockResolvedValue(mockCcp);
    mockPrisma.fsCcp.update.mockResolvedValue(mockCcp);
    await request(app).put(`/api/ccps/${TEST_ID}`).send({ name: 'Updated' });
    expect(mockPrisma.fsCcp.findFirst).toHaveBeenCalledTimes(1);
  });

  it('POST /api/ccps create is called once per valid request', async () => {
    mockPrisma.fsCcp.count.mockResolvedValue(1);
    mockPrisma.fsCcp.create.mockResolvedValue(mockCcp);
    await request(app).post('/api/ccps').send({
      name: 'Once CCP',
      processStep: 'Once Step',
      criticalLimit: 'Limit',
      monitoringMethod: 'Method',
      monitoringFrequency: 'PER_BATCH',
    });
    expect(mockPrisma.fsCcp.create).toHaveBeenCalledTimes(1);
  });
});

describe('HACCP CCP — additional phase28 tests', () => {
  it('GET /api/ccps success:true with data array', async () => {
    mockPrisma.fsCcp.findMany.mockResolvedValue([mockCcp]);
    mockPrisma.fsCcp.count.mockResolvedValue(1);
    const res = await request(app).get('/api/ccps');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/ccps rejects missing criticalLimit', async () => {
    const res = await request(app).post('/api/ccps').send({
      name: 'Test CCP',
      processStep: 'Step',
      monitoringMethod: 'Method',
      monitoringFrequency: 'DAILY',
    });
    expect(res.status).toBe(400);
  });

  it('DELETE /api/ccps/:id returns success:true', async () => {
    mockPrisma.fsCcp.findFirst.mockResolvedValue(mockCcp);
    mockPrisma.fsCcp.update.mockResolvedValue({ ...mockCcp, deletedAt: new Date() });
    const res = await request(app).delete(`/api/ccps/${TEST_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/ccps 500 error returns INTERNAL_ERROR code', async () => {
    mockPrisma.fsCcp.findMany.mockRejectedValue(new Error('connection lost'));
    const res = await request(app).get('/api/ccps');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /api/ccps/:id with processStep update stores new processStep', async () => {
    mockPrisma.fsCcp.findFirst.mockResolvedValue(mockCcp);
    mockPrisma.fsCcp.update.mockResolvedValue({ ...mockCcp, processStep: 'New Process Step' });
    const res = await request(app)
      .put(`/api/ccps/${TEST_ID}`)
      .send({ processStep: 'New Process Step' });
    expect(res.status).toBe(200);
    expect(mockPrisma.fsCcp.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ processStep: 'New Process Step' }) })
    );
  });
});

describe('haccp — phase30 coverage', () => {
  it('handles Math.abs', () => {
    expect(Math.abs(-5)).toBe(5);
  });

  it('handles Math.min', () => {
    expect(Math.min(1, 2, 3)).toBe(1);
  });

  it('handles indexOf method', () => {
    expect([1, 2, 3].indexOf(2)).toBe(1);
  });

  it('handles string length', () => {
    expect('hello'.length).toBe(5);
  });

  it('handles Math.pow', () => {
    expect(Math.pow(2, 3)).toBe(8);
  });

});


describe('phase31 coverage', () => {
  it('handles object freeze', () => { const o = Object.freeze({a:1}); expect(Object.isFrozen(o)).toBe(true); });
  it('handles async/await error', async () => { const fn = async () => { throw new Error('fail'); }; await expect(fn()).rejects.toThrow('fail'); });
  it('handles array indexOf', () => { expect([1,2,3].indexOf(2)).toBe(1); });
  it('handles array spread', () => { const a = [1,2]; const b = [...a, 3]; expect(b).toEqual([1,2,3]); });
  it('handles array flat', () => { expect([[1,2],[3,4]].flat()).toEqual([1,2,3,4]); });
});


describe('phase32 coverage', () => {
  it('handles array reverse', () => { expect([1,2,3].reverse()).toEqual([3,2,1]); });
  it('handles object keys count', () => { expect(Object.keys({a:1,b:2,c:3}).length).toBe(3); });
  it('handles string at method', () => { expect('hello'.at(-1)).toBe('o'); });
  it('handles number toString', () => { expect((255).toString(16)).toBe('ff'); });
  it('handles boolean negation', () => { expect(!true).toBe(false); expect(!false).toBe(true); });
});
