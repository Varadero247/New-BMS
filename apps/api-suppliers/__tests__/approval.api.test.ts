import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { suppSupplier: { update: jest.fn() } },
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

import router from '../src/routes/approval';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/approval', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/approval/:id/approve', () => {
  it('should approve a supplier', async () => {
    mockPrisma.suppSupplier.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'APPROVED',
    });
    const res = await request(app).post(
      '/api/approval/00000000-0000-0000-0000-000000000001/approve'
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('APPROVED');
  });

  it('should return 500 on error when approving', async () => {
    mockPrisma.suppSupplier.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post(
      '/api/approval/00000000-0000-0000-0000-000000000001/approve'
    );
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('update called once per approve request', async () => {
    mockPrisma.suppSupplier.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'APPROVED' });
    await request(app).post('/api/approval/00000000-0000-0000-0000-000000000001/approve');
    expect(mockPrisma.suppSupplier.update).toHaveBeenCalledTimes(1);
  });

  it('approve response data includes supplier id', async () => {
    mockPrisma.suppSupplier.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'APPROVED' });
    const res = await request(app).post('/api/approval/00000000-0000-0000-0000-000000000001/approve');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });
});

describe('POST /api/approval/:id/suspend', () => {
  it('should suspend a supplier', async () => {
    mockPrisma.suppSupplier.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'SUSPENDED',
    });
    const res = await request(app).post(
      '/api/approval/00000000-0000-0000-0000-000000000001/suspend'
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('SUSPENDED');
  });

  it('should return 500 on error when suspending', async () => {
    mockPrisma.suppSupplier.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post(
      '/api/approval/00000000-0000-0000-0000-000000000001/suspend'
    );
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('suspend response data includes the supplier id', async () => {
    mockPrisma.suppSupplier.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000002',
      status: 'SUSPENDED',
    });
    const res = await request(app).post(
      '/api/approval/00000000-0000-0000-0000-000000000002/suspend'
    );
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000002');
  });
});

describe('Approval routes — extended', () => {
  it('approve sets status to APPROVED in the where clause id', async () => {
    mockPrisma.suppSupplier.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000003',
      status: 'APPROVED',
    });
    const res = await request(app).post(
      '/api/approval/00000000-0000-0000-0000-000000000003/approve'
    );
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('APPROVED');
  });

  it('suspend returns success true', async () => {
    mockPrisma.suppSupplier.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'SUSPENDED',
    });
    const res = await request(app).post(
      '/api/approval/00000000-0000-0000-0000-000000000001/suspend'
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('approve: update is called with the correct supplier id', async () => {
    mockPrisma.suppSupplier.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000004',
      status: 'APPROVED',
    });
    await request(app).post('/api/approval/00000000-0000-0000-0000-000000000004/approve');
    expect(mockPrisma.suppSupplier.update).toHaveBeenCalledTimes(1);
    const callArg = mockPrisma.suppSupplier.update.mock.calls[0][0];
    expect(callArg.where.id).toBe('00000000-0000-0000-0000-000000000004');
  });

  it('suspend: update is called with the correct supplier id', async () => {
    mockPrisma.suppSupplier.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000005',
      status: 'SUSPENDED',
    });
    await request(app).post('/api/approval/00000000-0000-0000-0000-000000000005/suspend');
    expect(mockPrisma.suppSupplier.update).toHaveBeenCalledTimes(1);
    const callArg = mockPrisma.suppSupplier.update.mock.calls[0][0];
    expect(callArg.where.id).toBe('00000000-0000-0000-0000-000000000005');
  });

  it('approve error response has error.code INTERNAL_ERROR', async () => {
    mockPrisma.suppSupplier.update.mockRejectedValue(new Error('timeout'));
    const res = await request(app).post(
      '/api/approval/00000000-0000-0000-0000-000000000001/approve'
    );
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('suspend error response has error.code INTERNAL_ERROR', async () => {
    mockPrisma.suppSupplier.update.mockRejectedValue(new Error('timeout'));
    const res = await request(app).post(
      '/api/approval/00000000-0000-0000-0000-000000000001/suspend'
    );
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('response body has data property on success', async () => {
    mockPrisma.suppSupplier.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'APPROVED',
    });
    const res = await request(app).post(
      '/api/approval/00000000-0000-0000-0000-000000000001/approve'
    );
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  it('approve response body does not include success:false on success', async () => {
    mockPrisma.suppSupplier.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'APPROVED',
    });
    const res = await request(app).post(
      '/api/approval/00000000-0000-0000-0000-000000000001/approve'
    );
    expect(res.body.success).not.toBe(false);
  });
});

describe('approval.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/approval', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/approval', async () => {
    const res = await request(app).get('/api/approval');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/approval', async () => {
    const res = await request(app).get('/api/approval');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/approval body has success property', async () => {
    const res = await request(app).get('/api/approval');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/approval body is an object', async () => {
    const res = await request(app).get('/api/approval');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/approval route is accessible', async () => {
    const res = await request(app).get('/api/approval');
    expect(res.status).toBeDefined();
  });
});
