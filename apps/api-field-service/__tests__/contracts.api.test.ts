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

const app = express();
app.use(express.json());
app.use('/api/contracts', contractsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/contracts', () => {
  it('should return contracts with pagination', async () => {
    const contracts = [{ id: '00000000-0000-0000-0000-000000000001', number: 'SVC-2602-1234', title: 'Maintenance SLA', status: 'ACTIVE' }];
    (prisma as any).fsSvcContract.findMany.mockResolvedValue(contracts);
    (prisma as any).fsSvcContract.count.mockResolvedValue(1);

    const res = await request(app).get('/api/contracts');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by customerId', async () => {
    (prisma as any).fsSvcContract.findMany.mockResolvedValue([]);
    (prisma as any).fsSvcContract.count.mockResolvedValue(0);

    await request(app).get('/api/contracts?customerId=cust-1');

    expect((prisma as any).fsSvcContract.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ customerId: 'cust-1' }),
      })
    );
  });

  it('should filter by type and status', async () => {
    (prisma as any).fsSvcContract.findMany.mockResolvedValue([]);
    (prisma as any).fsSvcContract.count.mockResolvedValue(0);

    await request(app).get('/api/contracts?type=SLA&status=ACTIVE');

    expect((prisma as any).fsSvcContract.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'SLA', status: 'ACTIVE' }),
      })
    );
  });
});

describe('GET /api/contracts/expiring', () => {
  it('should return expiring contracts', async () => {
    (prisma as any).fsSvcContract.findMany.mockResolvedValue([{ id: '00000000-0000-0000-0000-000000000001', endDate: new Date() }]);

    const res = await request(app).get('/api/contracts/expiring');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should accept days parameter', async () => {
    (prisma as any).fsSvcContract.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/contracts/expiring?days=60');

    expect(res.status).toBe(200);
  });
});

describe('POST /api/contracts', () => {
  it('should create a contract with generated number', async () => {
    const created = { id: 'con-new', number: 'SVC-2602-5678', title: 'New Contract', type: 'SLA', status: 'PENDING' };
    (prisma as any).fsSvcContract.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/contracts')
      .send({
        customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        title: 'New Contract',
        type: 'SLA',
        startDate: '2026-01-01',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid data', async () => {
    const res = await request(app)
      .post('/api/contracts')
      .send({ title: '' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/contracts/:id', () => {
  it('should return a contract by id', async () => {
    (prisma as any).fsSvcContract.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'SLA Contract', customer: {}, jobs: [] });

    const res = await request(app).get('/api/contracts/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcContract.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/contracts/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/contracts/:id', () => {
  it('should update a contract', async () => {
    (prisma as any).fsSvcContract.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).fsSvcContract.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Updated' });

    const res = await request(app)
      .put('/api/contracts/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcContract.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/contracts/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/contracts/:id', () => {
  it('should soft delete a contract', async () => {
    (prisma as any).fsSvcContract.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).fsSvcContract.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', deletedAt: new Date() });

    const res = await request(app).delete('/api/contracts/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Contract deleted');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcContract.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/contracts/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});
