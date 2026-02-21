import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { suppSupplier: { findFirst: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN', email: 'supplier@example.com' };
    next();
  }),
}));
jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/portal';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/portal', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/portal/profile', () => {
  it('should return the supplier profile', async () => {
    mockPrisma.suppSupplier.findFirst.mockResolvedValue({
      id: '1',
      name: 'Acme Corp',
      email: 'supplier@example.com',
    });
    const res = await request(app).get('/api/portal/profile');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('1');
  });

  it('should return 404 if supplier profile not found', async () => {
    mockPrisma.suppSupplier.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/portal/profile');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on DB error', async () => {
    mockPrisma.suppSupplier.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/portal/profile');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('findFirst called once per request', async () => {
    mockPrisma.suppSupplier.findFirst.mockResolvedValue({ id: '1', name: 'Acme', email: 'supplier@example.com' });
    await request(app).get('/api/portal/profile');
    expect(mockPrisma.suppSupplier.findFirst).toHaveBeenCalledTimes(1);
  });

  it('profile response contains name field', async () => {
    mockPrisma.suppSupplier.findFirst.mockResolvedValue({ id: '1', name: 'Acme Corp', email: 'supplier@example.com' });
    const res = await request(app).get('/api/portal/profile');
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Acme Corp');
  });

  it('profile response contains email field', async () => {
    mockPrisma.suppSupplier.findFirst.mockResolvedValue({ id: '2', name: 'BetaCo', email: 'supplier@example.com' });
    const res = await request(app).get('/api/portal/profile');
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('supplier@example.com');
  });

  it('data id matches the mock supplier id', async () => {
    mockPrisma.suppSupplier.findFirst.mockResolvedValue({ id: '42', name: 'Test', email: 'supplier@example.com' });
    const res = await request(app).get('/api/portal/profile');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('42');
  });
});
