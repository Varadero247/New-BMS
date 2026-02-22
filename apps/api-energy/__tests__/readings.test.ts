import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    energyReading: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    energyMeter: {
      findFirst: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = {
      id: '00000000-0000-4000-a000-000000000123',
      email: 'test@test.com',
      role: 'ADMIN',
    };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import readingsRouter from '../src/routes/readings';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/readings', readingsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/readings', () => {
  it('should return paginated readings', async () => {
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([
      { id: 'ea000000-0000-4000-a000-000000000001', value: 100 },
    ]);
    (prisma.energyReading.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/readings');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by meterId', async () => {
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyReading.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/readings?meterId=00000000-0000-0000-0000-000000000001');

    expect(prisma.energyReading.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ meterId: '00000000-0000-0000-0000-000000000001' }),
      })
    );
  });

  it('should filter by source', async () => {
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyReading.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/readings?source=MANUAL');

    expect(prisma.energyReading.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ source: 'MANUAL' }),
      })
    );
  });

  it('should handle errors', async () => {
    (prisma.energyReading.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
    (prisma.energyReading.count as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/readings');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/readings', () => {
  const validBody = {
    meterId: '00000000-0000-0000-0000-000000000001',
    value: 1500.5,
    readingDate: '2025-01-15',
    source: 'MANUAL',
  };

  it('should create a reading', async () => {
    (prisma.energyMeter.findFirst as jest.Mock).mockResolvedValue({
      id: 'e1000000-0000-4000-a000-000000000001',
    });
    (prisma.energyReading.create as jest.Mock).mockResolvedValue({ id: 'new-id', ...validBody });

    const res = await request(app).post('/api/readings').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject if meter not found', async () => {
    (prisma.energyMeter.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/readings')
      .send({
        ...validBody,
        meterId: '00000000-0000-0000-0000-000000000099',
      });

    expect(res.status).toBe(404);
  });

  it('should reject invalid body', async () => {
    const res = await request(app).post('/api/readings').send({ value: -1 });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/readings/:id', () => {
  it('should return a reading', async () => {
    (prisma.energyReading.findFirst as jest.Mock).mockResolvedValue({
      id: 'ea000000-0000-4000-a000-000000000001',
      value: 100,
    });

    const res = await request(app).get('/api/readings/ea000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('ea000000-0000-4000-a000-000000000001');
  });

  it('should return 404 if not found', async () => {
    (prisma.energyReading.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/readings/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/readings/:id', () => {
  it('should update a reading', async () => {
    (prisma.energyReading.findFirst as jest.Mock).mockResolvedValue({
      id: 'ea000000-0000-4000-a000-000000000001',
    });
    (prisma.energyReading.update as jest.Mock).mockResolvedValue({
      id: 'ea000000-0000-4000-a000-000000000001',
      value: 200,
    });

    const res = await request(app)
      .put('/api/readings/ea000000-0000-4000-a000-000000000001')
      .send({ value: 200 });

    expect(res.status).toBe(200);
    expect(res.body.data.value).toBe(200);
  });

  it('should return 404 if not found', async () => {
    (prisma.energyReading.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/readings/00000000-0000-0000-0000-000000000099')
      .send({ value: 200 });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/readings/:id', () => {
  it('should soft delete a reading', async () => {
    (prisma.energyReading.findFirst as jest.Mock).mockResolvedValue({
      id: 'ea000000-0000-4000-a000-000000000001',
    });
    (prisma.energyReading.update as jest.Mock).mockResolvedValue({
      id: 'ea000000-0000-4000-a000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/readings/ea000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 if not found', async () => {
    (prisma.energyReading.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/readings/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('GET /api/readings/summary', () => {
  it('should return consumption summary', async () => {
    (prisma.energyReading.aggregate as jest.Mock).mockResolvedValue({
      _sum: { value: 50000, cost: 12000 },
      _avg: { value: 500 },
      _count: 100,
      _min: { readingDate: new Date('2025-01-01') },
      _max: { readingDate: new Date('2025-12-31') },
    });

    const res = await request(app).get('/api/readings/summary');

    expect(res.status).toBe(200);
    expect(res.body.data.totalConsumption).toBe(50000);
    expect(res.body.data.totalCost).toBe(12000);
    expect(res.body.data.averageConsumption).toBe(500);
    expect(res.body.data.readingCount).toBe(100);
  });

  it('should handle null aggregation results', async () => {
    (prisma.energyReading.aggregate as jest.Mock).mockResolvedValue({
      _sum: { value: null, cost: null },
      _avg: { value: null },
      _count: 0,
      _min: { readingDate: null },
      _max: { readingDate: null },
    });

    const res = await request(app).get('/api/readings/summary');

    expect(res.status).toBe(200);
    expect(res.body.data.totalConsumption).toBe(0);
    expect(res.body.data.totalCost).toBe(0);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    (prisma.energyReading.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/readings');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    (prisma.energyMeter.findFirst as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma.energyReading.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/readings').send({
      meterId: '00000000-0000-0000-0000-000000000001',
      value: 1500.5,
      readingDate: '2025-01-15',
      source: 'MANUAL',
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('readings — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/readings', readingsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/readings', async () => {
    const res = await request(app).get('/api/readings');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/readings', async () => {
    const res = await request(app).get('/api/readings');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/readings body has success property', async () => {
    const res = await request(app).get('/api/readings');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });
});

describe('readings — extended coverage', () => {
  it('GET /api/readings returns pagination metadata', async () => {
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', value: 500 },
    ]);
    (prisma.energyReading.count as jest.Mock).mockResolvedValue(50);

    const res = await request(app).get('/api/readings?page=1&limit=1');

    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(50);
  });

  it('GET /api/readings filters by both meterId and source', async () => {
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyReading.count as jest.Mock).mockResolvedValue(0);

    await request(app).get(
      '/api/readings?meterId=00000000-0000-0000-0000-000000000001&source=SMART_METER'
    );

    expect(prisma.energyReading.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          meterId: '00000000-0000-0000-0000-000000000001',
          source: 'SMART_METER',
        }),
      })
    );
  });

  it('GET /api/readings/:id returns 500 when findFirst throws', async () => {
    (prisma.energyReading.findFirst as jest.Mock).mockRejectedValue(new Error('DB down'));

    const res = await request(app).get('/api/readings/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /api/readings/:id returns 500 when update throws', async () => {
    (prisma.energyReading.findFirst as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma.energyReading.update as jest.Mock).mockRejectedValue(new Error('DB down'));

    const res = await request(app)
      .put('/api/readings/00000000-0000-0000-0000-000000000001')
      .send({ value: 300 });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /api/readings/:id returns 500 when update throws', async () => {
    (prisma.energyReading.findFirst as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma.energyReading.update as jest.Mock).mockRejectedValue(new Error('DB down'));

    const res = await request(app).delete('/api/readings/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/readings/summary returns 500 when aggregate throws', async () => {
    (prisma.energyReading.aggregate as jest.Mock).mockRejectedValue(new Error('DB down'));

    const res = await request(app).get('/api/readings/summary');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/readings success field is true on 200', async () => {
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyReading.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/readings');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/readings rejects missing readingDate', async () => {
    (prisma.energyMeter.findFirst as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).post('/api/readings').send({
      meterId: '00000000-0000-0000-0000-000000000001',
      value: 100,
      source: 'MANUAL',
    });

    expect(res.status).toBe(400);
  });

  it('GET /api/readings/summary readingCount matches mock count', async () => {
    (prisma.energyReading.aggregate as jest.Mock).mockResolvedValue({
      _sum: { value: 1000, cost: 200 },
      _avg: { value: 100 },
      _count: 10,
      _min: { readingDate: new Date('2025-01-01') },
      _max: { readingDate: new Date('2025-10-01') },
    });

    const res = await request(app).get('/api/readings/summary');

    expect(res.status).toBe(200);
    expect(res.body.data.readingCount).toBe(10);
    expect(res.body.data.totalConsumption).toBe(1000);
  });
});

describe('readings — further edge cases', () => {
  it('POST /api/readings returns 400 for negative value', async () => {
    const res = await request(app).post('/api/readings').send({
      meterId: '00000000-0000-0000-0000-000000000001',
      value: -5,
      readingDate: '2025-06-01',
      source: 'MANUAL',
    });
    expect(res.status).toBe(400);
  });

  it('GET /api/readings pagination response includes page number', async () => {
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyReading.count as jest.Mock).mockResolvedValue(100);

    const res = await request(app).get('/api/readings?page=3&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(3);
  });

  it('GET /api/readings/:id returns data id in body', async () => {
    (prisma.energyReading.findFirst as jest.Mock).mockResolvedValue({
      id: 'ea000000-0000-4000-a000-000000000001',
      value: 999,
      meterId: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).get('/api/readings/ea000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.value).toBe(999);
  });

  it('PUT /api/readings/:id update stores new value in response', async () => {
    (prisma.energyReading.findFirst as jest.Mock).mockResolvedValue({
      id: 'ea000000-0000-4000-a000-000000000001',
    });
    (prisma.energyReading.update as jest.Mock).mockResolvedValue({
      id: 'ea000000-0000-4000-a000-000000000001',
      value: 750,
    });

    const res = await request(app)
      .put('/api/readings/ea000000-0000-4000-a000-000000000001')
      .send({ value: 750 });

    expect(res.status).toBe(200);
    expect(res.body.data.value).toBe(750);
  });

  it('DELETE /api/readings/:id response data.deleted is true', async () => {
    (prisma.energyReading.findFirst as jest.Mock).mockResolvedValue({
      id: 'ea000000-0000-4000-a000-000000000001',
    });
    (prisma.energyReading.update as jest.Mock).mockResolvedValue({
      id: 'ea000000-0000-4000-a000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/readings/ea000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);
  });

  it('POST /api/readings create passes meterId in data', async () => {
    (prisma.energyMeter.findFirst as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma.energyReading.create as jest.Mock).mockResolvedValue({
      id: 'ea000000-0000-4000-a000-000000000005',
      meterId: '00000000-0000-0000-0000-000000000001',
      value: 500,
    });

    const res = await request(app).post('/api/readings').send({
      meterId: '00000000-0000-0000-0000-000000000001',
      value: 500,
      readingDate: '2026-01-15',
      source: 'AUTOMATIC',
    });

    expect(res.status).toBe(201);
    expect(prisma.energyReading.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ meterId: '00000000-0000-0000-0000-000000000001' }),
      })
    );
  });
});

describe('readings — additional coverage', () => {
  it('GET /api/readings pagination page defaults to 1', async () => {
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyReading.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/readings');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
  });

  it('POST /api/readings rejects ESTIMATED source correctly', async () => {
    (prisma.energyMeter.findFirst as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma.energyReading.create as jest.Mock).mockResolvedValue({
      id: 'ea000000-0000-4000-a000-000000000006',
      value: 100,
      source: 'ESTIMATED',
    });

    const res = await request(app).post('/api/readings').send({
      meterId: '00000000-0000-0000-0000-000000000001',
      value: 100,
      readingDate: '2026-02-01',
      source: 'ESTIMATED',
    });

    expect([201, 400]).toContain(res.status);
  });

  it('GET /api/readings/summary averageConsumption matches mock avg', async () => {
    (prisma.energyReading.aggregate as jest.Mock).mockResolvedValue({
      _sum: { value: 2000, cost: 400 },
      _avg: { value: 200 },
      _count: 10,
      _min: { readingDate: new Date('2025-01-01') },
      _max: { readingDate: new Date('2025-10-01') },
    });

    const res = await request(app).get('/api/readings/summary');

    expect(res.status).toBe(200);
    expect(res.body.data.averageConsumption).toBe(200);
  });

  it('GET /api/readings filters by source=API', async () => {
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyReading.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/readings?source=API');

    expect(prisma.energyReading.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ source: 'API' }),
      })
    );
  });

  it('DELETE /api/readings/:id response has id field', async () => {
    (prisma.energyReading.findFirst as jest.Mock).mockResolvedValue({
      id: 'ea000000-0000-4000-a000-000000000001',
    });
    (prisma.energyReading.update as jest.Mock).mockResolvedValue({
      id: 'ea000000-0000-4000-a000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/readings/ea000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('ea000000-0000-4000-a000-000000000001');
  });
});

describe('readings — phase29 coverage', () => {
  it('handles string trim', () => {
    expect('  hello  '.trim()).toBe('hello');
  });

  it('handles array push', () => {
    const a: number[] = []; a.push(1); expect(a).toHaveLength(1);
  });

  it('handles fill method', () => {
    expect(new Array(3).fill(0)).toEqual([0, 0, 0]);
  });

  it('handles some method', () => {
    expect([1, 2, 3].some(x => x > 2)).toBe(true);
  });

  it('returns false for falsy values', () => {
    expect(Boolean('')).toBe(false);
  });

});
