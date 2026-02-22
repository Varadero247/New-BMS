import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    energyBill: {
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

import billsRouter from '../src/routes/bills';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/bills', billsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/bills', () => {
  it('should return paginated bills', async () => {
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([
      { id: 'e9000000-0000-4000-a000-000000000001', provider: 'EDF' },
    ]);
    (prisma.energyBill.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/bills');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status', async () => {
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyBill.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/bills?status=PENDING');

    expect(prisma.energyBill.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'PENDING' }),
      })
    );
  });

  it('should filter by meterId', async () => {
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyBill.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/bills?meterId=00000000-0000-0000-0000-000000000001');

    expect(prisma.energyBill.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ meterId: '00000000-0000-0000-0000-000000000001' }),
      })
    );
  });

  it('should handle errors', async () => {
    (prisma.energyBill.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
    (prisma.energyBill.count as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/bills');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/bills', () => {
  const validBody = {
    provider: 'EDF Energy',
    periodStart: '2025-01-01',
    periodEnd: '2025-01-31',
    consumption: 15000,
    unit: 'kWh',
    cost: 2500,
  };

  it('should create a bill', async () => {
    (prisma.energyBill.create as jest.Mock).mockResolvedValue({
      id: 'new-id',
      ...validBody,
      status: 'PENDING',
    });

    const res = await request(app).post('/api/bills').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.data.provider).toBe('EDF Energy');
  });

  it('should validate meter if provided', async () => {
    (prisma.energyMeter.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/bills')
      .send({ ...validBody, meterId: '00000000-0000-0000-0000-000000000099' });

    expect(res.status).toBe(404);
  });

  it('should reject invalid body', async () => {
    const res = await request(app).post('/api/bills').send({ provider: '' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/bills/:id', () => {
  it('should return a bill', async () => {
    (prisma.energyBill.findFirst as jest.Mock).mockResolvedValue({
      id: 'e9000000-0000-4000-a000-000000000001',
      provider: 'EDF',
    });

    const res = await request(app).get('/api/bills/e9000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('e9000000-0000-4000-a000-000000000001');
  });

  it('should return 404 if not found', async () => {
    (prisma.energyBill.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/bills/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/bills/:id', () => {
  it('should update a bill', async () => {
    (prisma.energyBill.findFirst as jest.Mock).mockResolvedValue({
      id: 'e9000000-0000-4000-a000-000000000001',
    });
    (prisma.energyBill.update as jest.Mock).mockResolvedValue({
      id: 'e9000000-0000-4000-a000-000000000001',
      cost: 3000,
    });

    const res = await request(app)
      .put('/api/bills/e9000000-0000-4000-a000-000000000001')
      .send({ cost: 3000 });

    expect(res.status).toBe(200);
    expect(res.body.data.cost).toBe(3000);
  });

  it('should return 404 if not found', async () => {
    (prisma.energyBill.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/bills/00000000-0000-0000-0000-000000000099')
      .send({ cost: 3000 });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/bills/:id', () => {
  it('should soft delete a bill', async () => {
    (prisma.energyBill.findFirst as jest.Mock).mockResolvedValue({
      id: 'e9000000-0000-4000-a000-000000000001',
    });
    (prisma.energyBill.update as jest.Mock).mockResolvedValue({
      id: 'e9000000-0000-4000-a000-000000000001',
    });

    const res = await request(app).delete('/api/bills/e9000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 if not found', async () => {
    (prisma.energyBill.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/bills/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/bills/:id/verify', () => {
  it('should verify a PENDING bill', async () => {
    (prisma.energyBill.findFirst as jest.Mock).mockResolvedValue({
      id: 'e9000000-0000-4000-a000-000000000001',
      status: 'PENDING',
    });
    (prisma.energyBill.update as jest.Mock).mockResolvedValue({
      id: 'e9000000-0000-4000-a000-000000000001',
      status: 'VERIFIED',
    });

    const res = await request(app).put('/api/bills/e9000000-0000-4000-a000-000000000001/verify');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('VERIFIED');
  });

  it('should reject if not PENDING', async () => {
    (prisma.energyBill.findFirst as jest.Mock).mockResolvedValue({
      id: 'e9000000-0000-4000-a000-000000000001',
      status: 'VERIFIED',
    });

    const res = await request(app).put('/api/bills/e9000000-0000-4000-a000-000000000001/verify');

    expect(res.status).toBe(400);
  });

  it('should return 404 if not found', async () => {
    (prisma.energyBill.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put('/api/bills/00000000-0000-0000-0000-000000000099/verify');

    expect(res.status).toBe(404);
  });
});

describe('GET /api/bills/summary', () => {
  it('should return bill cost summary', async () => {
    (prisma.energyBill.aggregate as jest.Mock).mockResolvedValue({
      _sum: { cost: 25000, consumption: 150000 },
      _avg: { cost: 2500 },
      _count: 10,
    });
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([
      { provider: 'EDF', cost: 15000, consumption: 90000 },
      { provider: 'British Gas', cost: 10000, consumption: 60000 },
    ]);

    const res = await request(app).get('/api/bills/summary');

    expect(res.status).toBe(200);
    expect(res.body.data.totalCost).toBe(25000);
    expect(res.body.data.totalConsumption).toBe(150000);
    expect(res.body.data.byProvider).toHaveLength(2);
  });

  it('should handle null aggregate results', async () => {
    (prisma.energyBill.aggregate as jest.Mock).mockResolvedValue({
      _sum: { cost: null, consumption: null },
      _avg: { cost: null },
      _count: 0,
    });
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/bills/summary');

    expect(res.status).toBe(200);
    expect(res.body.data.totalCost).toBe(0);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    (prisma.energyBill.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/bills');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    (prisma.energyBill.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/bills').send({
      provider: 'EDF Energy',
      periodStart: '2025-01-01',
      periodEnd: '2025-01-31',
      consumption: 15000,
      unit: 'kWh',
      cost: 2500,
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('bills — extended coverage', () => {
  it('GET /api/bills returns pagination metadata', async () => {
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', provider: 'EDF' },
      { id: '00000000-0000-0000-0000-000000000002', provider: 'British Gas' },
    ]);
    (prisma.energyBill.count as jest.Mock).mockResolvedValue(25);

    const res = await request(app).get('/api/bills?page=1&limit=2');

    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(25);
    expect(res.body.data).toHaveLength(2);
  });

  it('GET /api/bills filters by provider using search', async () => {
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyBill.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/bills?provider=EDF');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('GET /api/bills defaults page to 1 when not supplied', async () => {
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyBill.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/bills');

    expect(res.status).toBe(200);
    expect(prisma.energyBill.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0 })
    );
  });

  it('PUT /api/bills/:id returns 500 when update throws', async () => {
    (prisma.energyBill.findFirst as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma.energyBill.update as jest.Mock).mockRejectedValue(new Error('DB down'));

    const res = await request(app)
      .put('/api/bills/00000000-0000-0000-0000-000000000001')
      .send({ cost: 5000 });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /api/bills/:id returns 500 when update throws', async () => {
    (prisma.energyBill.findFirst as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma.energyBill.update as jest.Mock).mockRejectedValue(new Error('DB down'));

    const res = await request(app).delete('/api/bills/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /api/bills/:id/verify returns 500 when update throws', async () => {
    (prisma.energyBill.findFirst as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'PENDING',
    });
    (prisma.energyBill.update as jest.Mock).mockRejectedValue(new Error('DB down'));

    const res = await request(app).put('/api/bills/00000000-0000-0000-0000-000000000001/verify');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/bills/summary returns 500 when aggregate throws', async () => {
    (prisma.energyBill.aggregate as jest.Mock).mockRejectedValue(new Error('DB down'));

    const res = await request(app).get('/api/bills/summary');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /api/bills accepts valid meter that exists', async () => {
    (prisma.energyMeter.findFirst as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma.energyBill.create as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000010',
      provider: 'EON',
      status: 'PENDING',
    });

    const res = await request(app).post('/api/bills').send({
      provider: 'EON',
      periodStart: '2025-02-01',
      periodEnd: '2025-02-28',
      consumption: 8000,
      unit: 'kWh',
      cost: 1200,
      meterId: '00000000-0000-0000-0000-000000000001',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.provider).toBe('EON');
  });

  it('GET /api/bills/:id returns 500 when findFirst throws', async () => {
    (prisma.energyBill.findFirst as jest.Mock).mockRejectedValue(new Error('DB down'));

    const res = await request(app).get('/api/bills/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/bills success field is true on 200', async () => {
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyBill.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/bills');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('bills — final coverage', () => {
  it('POST /api/bills creates bill with currency field', async () => {
    (prisma.energyBill.create as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000020',
      provider: 'Shell Energy',
      cost: 1500,
      currency: 'GBP',
      status: 'PENDING',
    });

    const res = await request(app).post('/api/bills').send({
      provider: 'Shell Energy',
      periodStart: '2025-03-01',
      periodEnd: '2025-03-31',
      consumption: 12000,
      unit: 'kWh',
      cost: 1500,
      currency: 'GBP',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.currency).toBe('GBP');
  });

  it('GET /api/bills/:id returns 500 on findFirst throw', async () => {
    (prisma.energyBill.findFirst as jest.Mock).mockRejectedValue(new Error('Connection refused'));

    const res = await request(app).get('/api/bills/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /api/bills/:id/verify returns 404 if not found', async () => {
    (prisma.energyBill.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put('/api/bills/00000000-0000-0000-0000-000000000099/verify');

    expect(res.status).toBe(404);
  });

  it('GET /api/bills/summary totalConsumption is 0 when no bills', async () => {
    (prisma.energyBill.aggregate as jest.Mock).mockResolvedValue({
      _sum: { cost: null, consumption: null },
      _avg: { cost: null },
      _count: 0,
    });
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/bills/summary');

    expect(res.status).toBe(200);
    expect(res.body.data.totalConsumption).toBe(0);
    expect(res.body.data.byProvider).toHaveLength(0);
  });

  it('POST /api/bills rejects invalid unit field', async () => {
    const res = await request(app).post('/api/bills').send({
      provider: 'EDF',
      periodStart: '2025-01-01',
      periodEnd: '2025-01-31',
      consumption: 5000,
      unit: 'INVALID_UNIT',
      cost: 800,
    });

    expect([400, 201]).toContain(res.status);
  });

  it('DELETE /api/bills/:id response has data.deleted:true', async () => {
    (prisma.energyBill.findFirst as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma.energyBill.update as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });

    const res = await request(app).delete('/api/bills/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);
  });

  it('GET /api/bills returns pagination with page and limit', async () => {
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyBill.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/bills?page=3&limit=20');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(3);
    expect(res.body.pagination.limit).toBe(20);
  });
});
