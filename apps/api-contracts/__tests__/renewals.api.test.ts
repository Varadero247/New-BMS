import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { contContract: { findMany: jest.fn() } },
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

import router from '../src/routes/renewals';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/renewals', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/renewals', () => {
  const futureDate15 = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

  it('should return contracts with upcoming renewals within 30 days', async () => {
    mockPrisma.contContract.findMany.mockResolvedValue([
      { id: '1', title: 'Contract A', renewalDate: futureDate15, status: 'ACTIVE' },
      { id: '2', title: 'Contract B', renewalDate: futureDate15, status: 'ACTIVE' },
    ]);
    const res = await request(app).get('/api/renewals');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('should return an empty array when no contracts are due', async () => {
    mockPrisma.contContract.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/renewals');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on db error', async () => {
    mockPrisma.contContract.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/renewals');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('returns contracts with all expected fields', async () => {
    mockPrisma.contContract.findMany.mockResolvedValue([
      {
        id: '00000000-0000-0000-0000-000000000001',
        title: 'Software License Agreement',
        renewalDate: futureDate15,
        status: 'ACTIVE',
        contractValue: 50000,
        counterpartyName: 'Vendor Corp',
      },
    ]);
    const res = await request(app).get('/api/renewals');
    expect(res.status).toBe(200);
    expect(res.body.data[0].title).toBe('Software License Agreement');
  });

  it('returns a single contract when only one matches', async () => {
    mockPrisma.contContract.findMany.mockResolvedValue([
      { id: '1', title: 'Solo Contract', renewalDate: futureDate15, status: 'ACTIVE' },
    ]);
    const res = await request(app).get('/api/renewals');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('calls findMany once per request', async () => {
    mockPrisma.contContract.findMany.mockResolvedValue([]);
    await request(app).get('/api/renewals');
    expect(mockPrisma.contContract.findMany).toHaveBeenCalledTimes(1);
  });

  it('data is an array', async () => {
    mockPrisma.contContract.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/renewals');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('each contract has a title property', async () => {
    mockPrisma.contContract.findMany.mockResolvedValue([
      { id: '1', title: 'Lease Agreement', renewalDate: futureDate15, status: 'ACTIVE' },
    ]);
    const res = await request(app).get('/api/renewals');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('title');
  });

  it('success is true on 200 response', async () => {
    mockPrisma.contContract.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/renewals');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Contract Renewals — extended', () => {
  it('data length matches number of contracts returned', async () => {
    const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    mockPrisma.contContract.findMany.mockResolvedValue([
      { id: '1', title: 'Lease A', renewalDate: futureDate, status: 'ACTIVE' },
      { id: '2', title: 'Lease B', renewalDate: futureDate, status: 'ACTIVE' },
    ]);
    const res = await request(app).get('/api/renewals');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('each contract has a renewalDate property', async () => {
    const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    mockPrisma.contContract.findMany.mockResolvedValue([
      { id: '1', title: 'Contract X', renewalDate: futureDate, status: 'ACTIVE' },
    ]);
    const res = await request(app).get('/api/renewals');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('renewalDate');
  });

  it('success is false on 500', async () => {
    mockPrisma.contContract.findMany.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/renewals');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
