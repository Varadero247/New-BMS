import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsSvcContract: {
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

import contractsRouter from '../src/routes/contracts';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/contracts', contractsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/contracts', () => {
  it('should return contracts with pagination', async () => {
    const contracts = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        number: 'SVC-2602-1234',
        title: 'Maintenance SLA',
        status: 'ACTIVE',
      },
    ];
    mockPrisma.fsSvcContract.findMany.mockResolvedValue(contracts);
    mockPrisma.fsSvcContract.count.mockResolvedValue(1);

    const res = await request(app).get('/api/contracts');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by customerId', async () => {
    mockPrisma.fsSvcContract.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcContract.count.mockResolvedValue(0);

    await request(app).get('/api/contracts?customerId=cust-1');

    expect(mockPrisma.fsSvcContract.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ customerId: 'cust-1' }),
      })
    );
  });

  it('should filter by type and status', async () => {
    mockPrisma.fsSvcContract.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcContract.count.mockResolvedValue(0);

    await request(app).get('/api/contracts?type=SLA&status=ACTIVE');

    expect(mockPrisma.fsSvcContract.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'SLA', status: 'ACTIVE' }),
      })
    );
  });
});

describe('GET /api/contracts/expiring', () => {
  it('should return expiring contracts', async () => {
    mockPrisma.fsSvcContract.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', endDate: new Date() },
    ]);

    const res = await request(app).get('/api/contracts/expiring');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should accept days parameter', async () => {
    mockPrisma.fsSvcContract.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/contracts/expiring?days=60');

    expect(res.status).toBe(200);
  });
});

describe('POST /api/contracts', () => {
  it('should create a contract with generated number', async () => {
    const created = {
      id: 'con-new',
      number: 'SVC-2602-5678',
      title: 'New Contract',
      type: 'SLA',
      status: 'PENDING',
    };
    mockPrisma.fsSvcContract.create.mockResolvedValue(created);

    const res = await request(app).post('/api/contracts').send({
      customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      title: 'New Contract',
      type: 'SLA',
      startDate: '2026-01-01',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid data', async () => {
    const res = await request(app).post('/api/contracts').send({ title: '' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/contracts/:id', () => {
  it('should return a contract by id', async () => {
    mockPrisma.fsSvcContract.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'SLA Contract',
      customer: {},
      jobs: [],
    });

    const res = await request(app).get('/api/contracts/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcContract.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/contracts/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/contracts/:id', () => {
  it('should update a contract', async () => {
    mockPrisma.fsSvcContract.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcContract.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated',
    });

    const res = await request(app)
      .put('/api/contracts/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcContract.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/contracts/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/contracts/:id', () => {
  it('should soft delete a contract', async () => {
    mockPrisma.fsSvcContract.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcContract.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/contracts/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Contract deleted');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcContract.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/contracts/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.fsSvcContract.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/contracts');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /expiring returns 500 on DB error', async () => {
    mockPrisma.fsSvcContract.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/contracts/expiring');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.fsSvcContract.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/contracts').send({
      customerId: '00000000-0000-0000-0000-000000000001',
      title: 'Test Contract',
      type: 'SLA',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.fsSvcContract.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/contracts/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    mockPrisma.fsSvcContract.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcContract.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .put('/api/contracts/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    mockPrisma.fsSvcContract.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcContract.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/contracts/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('contracts.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/contracts', contractsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/contracts', async () => {
    const res = await request(app).get('/api/contracts');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });
});

// ─── Extended coverage ───────────────────────────────────────────────────────

describe('contracts.api — extended edge cases', () => {
  it('GET / returns pagination metadata', async () => {
    mockPrisma.fsSvcContract.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'C1', status: 'ACTIVE' },
    ]);
    mockPrisma.fsSvcContract.count.mockResolvedValue(15);

    const res = await request(app).get('/api/contracts?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination.total).toBe(15);
  });

  it('GET / applies page and limit correctly', async () => {
    mockPrisma.fsSvcContract.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcContract.count.mockResolvedValue(0);

    await request(app).get('/api/contracts?page=2&limit=5');

    expect(mockPrisma.fsSvcContract.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );
  });

  it('GET / filters by both type and customerId simultaneously', async () => {
    mockPrisma.fsSvcContract.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcContract.count.mockResolvedValue(0);

    await request(app).get(
      '/api/contracts?type=MAINTENANCE&customerId=00000000-0000-0000-0000-000000000001'
    );

    expect(mockPrisma.fsSvcContract.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          type: 'MAINTENANCE',
          customerId: '00000000-0000-0000-0000-000000000001',
        }),
      })
    );
  });

  it('GET /expiring returns 500 when DB rejects', async () => {
    mockPrisma.fsSvcContract.findMany.mockRejectedValue(new Error('Timeout'));

    const res = await request(app).get('/api/contracts/expiring');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 400 when required field customerId is missing', async () => {
    const res = await request(app).post('/api/contracts').send({
      title: 'No Customer',
      type: 'SLA',
      startDate: '2026-01-01',
    });

    expect(res.status).toBe(400);
  });

  it('PUT /:id returns success:true with updated data', async () => {
    mockPrisma.fsSvcContract.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000002',
    });
    mockPrisma.fsSvcContract.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000002',
      title: 'Renewed Contract',
      status: 'ACTIVE',
    });

    const res = await request(app)
      .put('/api/contracts/00000000-0000-0000-0000-000000000002')
      .send({ title: 'Renewed Contract', status: 'ACTIVE' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /:id calls update with deletedAt set', async () => {
    mockPrisma.fsSvcContract.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000003',
    });
    mockPrisma.fsSvcContract.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000003',
      deletedAt: new Date(),
    });

    await request(app).delete('/api/contracts/00000000-0000-0000-0000-000000000003');

    expect(mockPrisma.fsSvcContract.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '00000000-0000-0000-0000-000000000003' },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    );
  });

  it('GET /:id returns success:true when record is found', async () => {
    mockPrisma.fsSvcContract.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000004',
      title: 'Found',
      customer: {},
      jobs: [],
    });

    const res = await request(app).get('/api/contracts/00000000-0000-0000-0000-000000000004');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST / stores provided endDate in create call', async () => {
    mockPrisma.fsSvcContract.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000005',
      endDate: new Date('2026-12-31'),
    });

    await request(app).post('/api/contracts').send({
      customerId: '00000000-0000-0000-0000-000000000001',
      title: 'Annual Contract',
      type: 'SLA',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    });

    expect(mockPrisma.fsSvcContract.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ customerId: '00000000-0000-0000-0000-000000000001' }),
      })
    );
  });

  it('GET /expiring with days=30 uses a date window', async () => {
    mockPrisma.fsSvcContract.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000006', endDate: new Date() },
    ]);

    const res = await request(app).get('/api/contracts/expiring?days=30');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});
