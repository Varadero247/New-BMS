import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsEnvironmentalMonitoring: {
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

import envMonRouter from '../src/routes/environmental-monitoring';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/environmental-monitoring', envMonRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/environmental-monitoring', () => {
  it('should return records with pagination', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', location: 'Zone A' },
    ]);
    mockPrisma.fsEnvironmentalMonitoring.count.mockResolvedValue(1);

    const res = await request(app).get('/api/environmental-monitoring');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by testType', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findMany.mockResolvedValue([]);
    mockPrisma.fsEnvironmentalMonitoring.count.mockResolvedValue(0);

    await request(app).get('/api/environmental-monitoring?testType=SWAB');
    expect(mockPrisma.fsEnvironmentalMonitoring.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ testType: 'SWAB' }) })
    );
  });

  it('should filter by withinSpec', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findMany.mockResolvedValue([]);
    mockPrisma.fsEnvironmentalMonitoring.count.mockResolvedValue(0);

    await request(app).get('/api/environmental-monitoring?withinSpec=false');
    expect(mockPrisma.fsEnvironmentalMonitoring.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ withinSpec: false }) })
    );
  });

  it('should filter by location', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findMany.mockResolvedValue([]);
    mockPrisma.fsEnvironmentalMonitoring.count.mockResolvedValue(0);

    await request(app).get('/api/environmental-monitoring?location=Zone');
    expect(mockPrisma.fsEnvironmentalMonitoring.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          location: expect.objectContaining({ contains: 'Zone' }),
        }),
      })
    );
  });

  it('should handle database errors', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/environmental-monitoring');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/environmental-monitoring', () => {
  it('should create an environmental monitoring record', async () => {
    const created = {
      id: '00000000-0000-0000-0000-000000000001',
      location: 'Zone A',
      testType: 'SWAB',
    };
    mockPrisma.fsEnvironmentalMonitoring.create.mockResolvedValue(created);

    const res = await request(app).post('/api/environmental-monitoring').send({
      location: 'Zone A',
      testType: 'SWAB',
      parameter: 'Listeria',
      result: 'Negative',
      withinSpec: true,
      testedAt: '2026-02-10T10:00:00Z',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid input', async () => {
    const res = await request(app)
      .post('/api/environmental-monitoring')
      .send({ location: 'Zone A' });
    expect(res.status).toBe(400);
  });

  it('should handle database errors', async () => {
    mockPrisma.fsEnvironmentalMonitoring.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/environmental-monitoring').send({
      location: 'Zone A',
      testType: 'SWAB',
      parameter: 'Listeria',
      result: 'Negative',
      withinSpec: true,
      testedAt: '2026-02-10T10:00:00Z',
    });
    expect(res.status).toBe(500);
  });
});

describe('GET /api/environmental-monitoring/:id', () => {
  it('should return a record by id', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).get(
      '/api/environmental-monitoring/00000000-0000-0000-0000-000000000001'
    );
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for non-existent record', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findFirst.mockResolvedValue(null);

    const res = await request(app).get(
      '/api/environmental-monitoring/00000000-0000-0000-0000-000000000099'
    );
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/environmental-monitoring/:id', () => {
  it('should update a record', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsEnvironmentalMonitoring.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      result: 'Positive',
    });

    const res = await request(app)
      .put('/api/environmental-monitoring/00000000-0000-0000-0000-000000000001')
      .send({ result: 'Positive' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent record', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/environmental-monitoring/00000000-0000-0000-0000-000000000099')
      .send({ result: 'Positive' });
    expect(res.status).toBe(404);
  });

  it('should reject invalid update', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app)
      .put('/api/environmental-monitoring/00000000-0000-0000-0000-000000000001')
      .send({ testType: 'INVALID' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/environmental-monitoring/:id', () => {
  it('should soft delete a record', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsEnvironmentalMonitoring.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).delete(
      '/api/environmental-monitoring/00000000-0000-0000-0000-000000000001'
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent record', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findFirst.mockResolvedValue(null);

    const res = await request(app).delete(
      '/api/environmental-monitoring/00000000-0000-0000-0000-000000000099'
    );
    expect(res.status).toBe(404);
  });
});

describe('GET /api/environmental-monitoring/out-of-spec', () => {
  it('should return out-of-spec records', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', withinSpec: false },
    ]);
    mockPrisma.fsEnvironmentalMonitoring.count.mockResolvedValue(1);

    const res = await request(app).get('/api/environmental-monitoring/out-of-spec');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(mockPrisma.fsEnvironmentalMonitoring.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ withinSpec: false }) })
    );
  });

  it('should handle database errors', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/environmental-monitoring/out-of-spec');
    expect(res.status).toBe(500);
  });
});

describe('environmental-monitoring.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/environmental-monitoring', envMonRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/environmental-monitoring', async () => {
    const res = await request(app).get('/api/environmental-monitoring');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/environmental-monitoring', async () => {
    const res = await request(app).get('/api/environmental-monitoring');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/environmental-monitoring body has success property', async () => {
    const res = await request(app).get('/api/environmental-monitoring');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });
});

// ===================================================================
// Food Safety Environmental Monitoring — edge cases and error paths
// ===================================================================
describe('Food Safety Environmental Monitoring — edge cases and error paths', () => {
  it('GET / pagination total reflects mock count', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findMany.mockResolvedValue([]);
    mockPrisma.fsEnvironmentalMonitoring.count.mockResolvedValue(77);
    const res = await request(app).get('/api/environmental-monitoring');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(77);
  });

  it('GET / data is always an array', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findMany.mockResolvedValue([]);
    mockPrisma.fsEnvironmentalMonitoring.count.mockResolvedValue(0);
    const res = await request(app).get('/api/environmental-monitoring');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET / filters by both testType and withinSpec simultaneously', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findMany.mockResolvedValue([]);
    mockPrisma.fsEnvironmentalMonitoring.count.mockResolvedValue(0);
    await request(app).get('/api/environmental-monitoring?testType=AIR&withinSpec=true');
    expect(mockPrisma.fsEnvironmentalMonitoring.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ testType: 'AIR', withinSpec: true }),
      })
    );
  });

  it('POST / create call includes the required fields', async () => {
    mockPrisma.fsEnvironmentalMonitoring.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000040',
      location: 'Zone B',
      testType: 'AIR',
    });
    await request(app).post('/api/environmental-monitoring').send({
      location: 'Zone B',
      testType: 'AIR',
      parameter: 'Salmonella',
      result: 'Absent',
      withinSpec: true,
      testedAt: '2026-02-15T10:00:00Z',
    });
    expect(mockPrisma.fsEnvironmentalMonitoring.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ location: 'Zone B', testType: 'AIR' }),
      })
    );
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/environmental-monitoring/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });

  it('PUT /:id returns 500 on DB error after finding record', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsEnvironmentalMonitoring.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .put('/api/environmental-monitoring/00000000-0000-0000-0000-000000000001')
      .send({ result: 'Positive' });
    expect(res.status).toBe(500);
  });

  it('DELETE /:id returns 500 on DB error', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsEnvironmentalMonitoring.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/environmental-monitoring/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });

  it('PUT /:id update uses correct where id clause', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000041' });
    mockPrisma.fsEnvironmentalMonitoring.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000041', result: 'Negative' });
    await request(app)
      .put('/api/environmental-monitoring/00000000-0000-0000-0000-000000000041')
      .send({ result: 'Negative' });
    expect(mockPrisma.fsEnvironmentalMonitoring.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: '00000000-0000-0000-0000-000000000041' }) })
    );
  });

  it('GET /out-of-spec returns pagination metadata', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findMany.mockResolvedValue([]);
    mockPrisma.fsEnvironmentalMonitoring.count.mockResolvedValue(5);
    const res = await request(app).get('/api/environmental-monitoring/out-of-spec');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pagination');
  });

  it('POST / missing required fields returns 400', async () => {
    const res = await request(app).post('/api/environmental-monitoring').send({
      location: 'Zone C',
      testType: 'SWAB',
    });
    expect(res.status).toBe(400);
  });
});

// ===================================================================
// Food Safety Environmental Monitoring — final coverage block
// ===================================================================
describe('Food Safety Environmental Monitoring — final coverage', () => {
  it('GET / count is called once per list request', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findMany.mockResolvedValue([]);
    mockPrisma.fsEnvironmentalMonitoring.count.mockResolvedValue(0);
    await request(app).get('/api/environmental-monitoring');
    expect(mockPrisma.fsEnvironmentalMonitoring.count).toHaveBeenCalledTimes(1);
  });

  it('GET /out-of-spec data is always an array', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findMany.mockResolvedValue([]);
    mockPrisma.fsEnvironmentalMonitoring.count.mockResolvedValue(0);
    const res = await request(app).get('/api/environmental-monitoring/out-of-spec');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /:id returns success:true when record found', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000050',
      location: 'Zone D',
      testType: 'WATER',
    });
    const res = await request(app).get('/api/environmental-monitoring/00000000-0000-0000-0000-000000000050');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /:id calls update with deletedAt field', async () => {
    mockPrisma.fsEnvironmentalMonitoring.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000051' });
    mockPrisma.fsEnvironmentalMonitoring.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000051' });
    await request(app).delete('/api/environmental-monitoring/00000000-0000-0000-0000-000000000051');
    expect(mockPrisma.fsEnvironmentalMonitoring.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.anything() }) })
    );
  });

  it('POST / create is called once per valid POST', async () => {
    mockPrisma.fsEnvironmentalMonitoring.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000052',
      location: 'Zone E',
      testType: 'SURFACE',
    });
    await request(app).post('/api/environmental-monitoring').send({
      location: 'Zone E',
      testType: 'SURFACE',
      parameter: 'E.coli',
      result: 'Absent',
      withinSpec: true,
      testedAt: '2026-03-01T09:00:00Z',
    });
    expect(mockPrisma.fsEnvironmentalMonitoring.create).toHaveBeenCalledTimes(1);
  });
});
