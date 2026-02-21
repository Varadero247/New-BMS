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
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/sites', sitesRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/sites', () => {
  it('should return a list of sites with pagination', async () => {
    const sites = [
      { id: '00000000-0000-0000-0000-000000000001', name: 'HQ', customer: { name: 'Acme' } },
    ];
    mockPrisma.fsSvcSite.findMany.mockResolvedValue(sites);
    mockPrisma.fsSvcSite.count.mockResolvedValue(1);

    const res = await request(app).get('/api/sites');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by customerId', async () => {
    mockPrisma.fsSvcSite.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcSite.count.mockResolvedValue(0);

    await request(app).get('/api/sites?customerId=cust-1');

    expect(mockPrisma.fsSvcSite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ customerId: 'cust-1' }),
      })
    );
  });

  it('should handle server errors', async () => {
    mockPrisma.fsSvcSite.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/sites');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/sites', () => {
  it('should create a site', async () => {
    const created = {
      id: 'site-new',
      name: 'New Site',
      customerId: 'cust-1',
      address: { city: 'Manchester' },
    };
    mockPrisma.fsSvcSite.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/sites')
      .send({
        customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'New Site',
        address: { city: 'Manchester' },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid data', async () => {
    const res = await request(app).post('/api/sites').send({ name: '' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/sites/:id', () => {
  it('should return a site by id', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'HQ',
      customer: {},
    });

    const res = await request(app).get('/api/sites/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/sites/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/sites/:id', () => {
  it('should update a site', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcSite.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Updated',
    });

    const res = await request(app)
      .put('/api/sites/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/sites/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/sites/:id', () => {
  it('should soft delete a site', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcSite.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/sites/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Site deleted');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/sites/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.fsSvcSite.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/sites');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.fsSvcSite.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/sites').send({
      customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'New Site',
      address: { city: 'Manchester' },
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 on DB error', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcSite.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/sites/00000000-0000-0000-0000-000000000001').send({ name: 'Updated Site' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Field Service Sites — extended', () => {
  it('DELETE /:id returns message "Site deleted" on success', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcSite.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/sites/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Site deleted');
  });
});
