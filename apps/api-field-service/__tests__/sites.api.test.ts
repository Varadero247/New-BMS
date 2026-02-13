import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsSvcSite: {
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

import sitesRouter from '../src/routes/sites';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/sites', sitesRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/sites', () => {
  it('should return a list of sites with pagination', async () => {
    const sites = [{ id: 'site-1', name: 'HQ', customer: { name: 'Acme' } }];
    (prisma as any).fsSvcSite.findMany.mockResolvedValue(sites);
    (prisma as any).fsSvcSite.count.mockResolvedValue(1);

    const res = await request(app).get('/api/sites');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by customerId', async () => {
    (prisma as any).fsSvcSite.findMany.mockResolvedValue([]);
    (prisma as any).fsSvcSite.count.mockResolvedValue(0);

    await request(app).get('/api/sites?customerId=cust-1');

    expect((prisma as any).fsSvcSite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ customerId: 'cust-1' }),
      })
    );
  });

  it('should handle server errors', async () => {
    (prisma as any).fsSvcSite.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/sites');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/sites', () => {
  it('should create a site', async () => {
    const created = { id: 'site-new', name: 'New Site', customerId: 'cust-1', address: { city: 'Manchester' } };
    (prisma as any).fsSvcSite.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/sites')
      .send({ customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', name: 'New Site', address: { city: 'Manchester' } });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid data', async () => {
    const res = await request(app)
      .post('/api/sites')
      .send({ name: '' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/sites/:id', () => {
  it('should return a site by id', async () => {
    (prisma as any).fsSvcSite.findFirst.mockResolvedValue({ id: 'site-1', name: 'HQ', customer: {} });

    const res = await request(app).get('/api/sites/site-1');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('site-1');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcSite.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/sites/missing');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/sites/:id', () => {
  it('should update a site', async () => {
    (prisma as any).fsSvcSite.findFirst.mockResolvedValue({ id: 'site-1' });
    (prisma as any).fsSvcSite.update.mockResolvedValue({ id: 'site-1', name: 'Updated' });

    const res = await request(app)
      .put('/api/sites/site-1')
      .send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcSite.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/sites/missing')
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/sites/:id', () => {
  it('should soft delete a site', async () => {
    (prisma as any).fsSvcSite.findFirst.mockResolvedValue({ id: 'site-1' });
    (prisma as any).fsSvcSite.update.mockResolvedValue({ id: 'site-1', deletedAt: new Date() });

    const res = await request(app).delete('/api/sites/site-1');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Site deleted');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcSite.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/sites/missing');

    expect(res.status).toBe(404);
  });
});
