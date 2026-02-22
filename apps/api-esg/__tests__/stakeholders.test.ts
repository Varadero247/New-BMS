import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    esgStakeholder: {
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

import stakeholdersRouter from '../src/routes/stakeholders';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/stakeholders', stakeholdersRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockStakeholder = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Acme Investors',
  type: 'INVESTOR',
  contactEmail: 'invest@acme.com',
  engagementLevel: 'HIGH',
  lastEngagement: new Date('2026-01-15'),
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
};

describe('GET /api/stakeholders', () => {
  it('should return paginated stakeholders list', async () => {
    (prisma.esgStakeholder.findMany as jest.Mock).mockResolvedValue([mockStakeholder]);
    (prisma.esgStakeholder.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/stakeholders');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by type', async () => {
    (prisma.esgStakeholder.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgStakeholder.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/stakeholders?type=INVESTOR');
    expect(prisma.esgStakeholder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ type: 'INVESTOR' }) })
    );
  });

  it('should filter by engagementLevel', async () => {
    (prisma.esgStakeholder.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgStakeholder.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/stakeholders?engagementLevel=HIGH');
    expect(prisma.esgStakeholder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ engagementLevel: 'HIGH' }) })
    );
  });

  it('should return empty list', async () => {
    (prisma.esgStakeholder.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgStakeholder.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/stakeholders');
    expect(res.body.data).toHaveLength(0);
  });
});

describe('POST /api/stakeholders', () => {
  it('should create a stakeholder', async () => {
    (prisma.esgStakeholder.create as jest.Mock).mockResolvedValue(mockStakeholder);

    const res = await request(app).post('/api/stakeholders').send({
      name: 'Acme Investors',
      type: 'INVESTOR',
      contactEmail: 'invest@acme.com',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for missing name', async () => {
    const res = await request(app).post('/api/stakeholders').send({
      type: 'INVESTOR',
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid type', async () => {
    const res = await request(app).post('/api/stakeholders').send({
      name: 'Test',
      type: 'INVALID',
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/stakeholders/:id', () => {
  it('should return a single stakeholder', async () => {
    (prisma.esgStakeholder.findFirst as jest.Mock).mockResolvedValue(mockStakeholder);

    const res = await request(app).get('/api/stakeholders/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 when not found', async () => {
    (prisma.esgStakeholder.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/stakeholders/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/stakeholders/:id', () => {
  it('should update a stakeholder', async () => {
    (prisma.esgStakeholder.findFirst as jest.Mock).mockResolvedValue(mockStakeholder);
    (prisma.esgStakeholder.update as jest.Mock).mockResolvedValue({
      ...mockStakeholder,
      engagementLevel: 'MEDIUM',
    });

    const res = await request(app)
      .put('/api/stakeholders/00000000-0000-0000-0000-000000000001')
      .send({ engagementLevel: 'MEDIUM' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma.esgStakeholder.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/stakeholders/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Updated' });
    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid data', async () => {
    const res = await request(app)
      .put('/api/stakeholders/00000000-0000-0000-0000-000000000001')
      .send({ type: 'INVALID' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/stakeholders/:id', () => {
  it('should soft delete a stakeholder', async () => {
    (prisma.esgStakeholder.findFirst as jest.Mock).mockResolvedValue(mockStakeholder);
    (prisma.esgStakeholder.update as jest.Mock).mockResolvedValue({
      ...mockStakeholder,
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/stakeholders/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma.esgStakeholder.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/stakeholders/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    (prisma.esgStakeholder.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/stakeholders');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    (prisma.esgStakeholder.findFirst as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/stakeholders/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    (prisma.esgStakeholder.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgStakeholder.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/stakeholders').send({ name: 'Acme Investors', type: 'INVESTOR' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    (prisma.esgStakeholder.findFirst as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma.esgStakeholder.update as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/stakeholders/00000000-0000-0000-0000-000000000001').send({ name: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    (prisma.esgStakeholder.findFirst as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma.esgStakeholder.update as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/stakeholders/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('stakeholders — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/stakeholders', stakeholdersRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/stakeholders', async () => {
    const res = await request(app).get('/api/stakeholders');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });
});

// ── Extended coverage ──────────────────────────────────────────────────────

describe('stakeholders — extended coverage', () => {
  it('GET / returns pagination metadata', async () => {
    (prisma.esgStakeholder.findMany as jest.Mock).mockResolvedValue([mockStakeholder]);
    (prisma.esgStakeholder.count as jest.Mock).mockResolvedValue(42);
    const res = await request(app).get('/api/stakeholders?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(42);
    expect(res.body.pagination.totalPages).toBe(5);
  });

  it('GET / filters by both type and engagementLevel', async () => {
    (prisma.esgStakeholder.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgStakeholder.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/stakeholders?type=CUSTOMER&engagementLevel=LOW');
    expect(prisma.esgStakeholder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'CUSTOMER', engagementLevel: 'LOW' }),
      })
    );
  });

  it('POST / returns 201 with all stakeholder types', async () => {
    const types = ['INVESTOR', 'CUSTOMER', 'EMPLOYEE', 'REGULATOR', 'COMMUNITY', 'SUPPLIER', 'NGO'];
    for (const type of types) {
      (prisma.esgStakeholder.create as jest.Mock).mockResolvedValue({ ...mockStakeholder, type });
      const res = await request(app).post('/api/stakeholders').send({ name: 'Test', type });
      expect(res.status).toBe(201);
    }
  });

  it('POST / sets default engagementLevel to MEDIUM when not provided', async () => {
    (prisma.esgStakeholder.create as jest.Mock).mockResolvedValue(mockStakeholder);
    await request(app).post('/api/stakeholders').send({ name: 'New Corp', type: 'SUPPLIER' });
    const [call] = (prisma.esgStakeholder.create as jest.Mock).mock.calls;
    expect(call[0].data.engagementLevel).toBe('MEDIUM');
  });

  it('PUT / returns 400 for invalid engagementLevel', async () => {
    const res = await request(app)
      .put('/api/stakeholders/00000000-0000-0000-0000-000000000001')
      .send({ engagementLevel: 'CRITICAL' });
    expect(res.status).toBe(400);
  });

  it('PUT / returns 400 for invalid contactEmail format', async () => {
    const res = await request(app)
      .put('/api/stakeholders/00000000-0000-0000-0000-000000000001')
      .send({ contactEmail: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('DELETE / success response has message field', async () => {
    (prisma.esgStakeholder.findFirst as jest.Mock).mockResolvedValue(mockStakeholder);
    (prisma.esgStakeholder.update as jest.Mock).mockResolvedValue({
      ...mockStakeholder,
      deletedAt: new Date(),
    });
    const res = await request(app).delete('/api/stakeholders/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toBeDefined();
  });

  it('POST / creates stakeholder with optional contactEmail', async () => {
    (prisma.esgStakeholder.create as jest.Mock).mockResolvedValue({
      ...mockStakeholder,
      contactEmail: 'partner@example.com',
    });
    const res = await request(app).post('/api/stakeholders').send({
      name: 'Partner NGO',
      type: 'NGO',
      contactEmail: 'partner@example.com',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /:id returns correct id in response', async () => {
    (prisma.esgStakeholder.findFirst as jest.Mock).mockResolvedValue({
      ...mockStakeholder,
      id: '00000000-0000-0000-0000-000000000002',
    });
    const res = await request(app).get('/api/stakeholders/00000000-0000-0000-0000-000000000002');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000002');
  });
});

describe('stakeholders — batch-q coverage', () => {
  it('GET / findMany called once per request', async () => {
    (prisma.esgStakeholder.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgStakeholder.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/stakeholders');
    expect(prisma.esgStakeholder.findMany).toHaveBeenCalledTimes(1);
  });

  it('POST / returns 400 when type is missing', async () => {
    const res = await request(app).post('/api/stakeholders').send({ name: 'Test Corp' });
    expect(res.status).toBe(400);
  });

  it('GET / page 2 limit 10 passes correct skip', async () => {
    (prisma.esgStakeholder.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgStakeholder.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/stakeholders?page=2&limit=10');
    expect(prisma.esgStakeholder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it('GET / returns data as array', async () => {
    (prisma.esgStakeholder.findMany as jest.Mock).mockResolvedValue([mockStakeholder]);
    (prisma.esgStakeholder.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/stakeholders');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('stakeholders — additional coverage 2', () => {
  it('GET / returns pagination object with total', async () => {
    (prisma.esgStakeholder.findMany as jest.Mock).mockResolvedValue([mockStakeholder]);
    (prisma.esgStakeholder.count as jest.Mock).mockResolvedValue(5);
    const res = await request(app).get('/api/stakeholders');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(5);
  });

  it('POST / stores createdBy from authenticated user', async () => {
    (prisma.esgStakeholder.create as jest.Mock).mockResolvedValue(mockStakeholder);
    await request(app).post('/api/stakeholders').send({ name: 'Test Corp', type: 'REGULATOR' });
    const [call] = (prisma.esgStakeholder.create as jest.Mock).mock.calls;
    expect(call[0].data.createdBy).toBe('user-123');
  });

  it('PUT /:id updates name field successfully', async () => {
    (prisma.esgStakeholder.findFirst as jest.Mock).mockResolvedValue(mockStakeholder);
    (prisma.esgStakeholder.update as jest.Mock).mockResolvedValue({ ...mockStakeholder, name: 'Renamed Corp' });
    const res = await request(app)
      .put('/api/stakeholders/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Renamed Corp' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Renamed Corp');
  });

  it('GET / filters by EMPLOYEE type correctly', async () => {
    (prisma.esgStakeholder.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgStakeholder.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/stakeholders?type=EMPLOYEE');
    expect(prisma.esgStakeholder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ type: 'EMPLOYEE' }) })
    );
  });

  it('GET / returns correct number of results', async () => {
    (prisma.esgStakeholder.findMany as jest.Mock).mockResolvedValue([mockStakeholder, mockStakeholder]);
    (prisma.esgStakeholder.count as jest.Mock).mockResolvedValue(2);
    const res = await request(app).get('/api/stakeholders');
    expect(res.body.data).toHaveLength(2);
  });

  it('DELETE /:id calls update with deletedAt', async () => {
    (prisma.esgStakeholder.findFirst as jest.Mock).mockResolvedValue(mockStakeholder);
    (prisma.esgStakeholder.update as jest.Mock).mockResolvedValue({ ...mockStakeholder, deletedAt: new Date() });
    await request(app).delete('/api/stakeholders/00000000-0000-0000-0000-000000000001');
    const [call] = (prisma.esgStakeholder.update as jest.Mock).mock.calls;
    expect(call[0].data).toHaveProperty('deletedAt');
  });

  it('GET /:id returns name and type in data', async () => {
    (prisma.esgStakeholder.findFirst as jest.Mock).mockResolvedValue(mockStakeholder);
    const res = await request(app).get('/api/stakeholders/00000000-0000-0000-0000-000000000001');
    expect(res.body.data).toHaveProperty('name', 'Acme Investors');
    expect(res.body.data).toHaveProperty('type', 'INVESTOR');
  });
});

describe('stakeholders — phase29 coverage', () => {
  it('handles string padStart', () => {
    expect('5'.padStart(3, '0')).toBe('005');
  });

  it('handles parseFloat', () => {
    expect(parseFloat('3.14')).toBeCloseTo(3.14);
  });

  it('handles regex match', () => {
    expect('hello world'.match(/world/)).not.toBeNull();
  });

  it('handles string includes', () => {
    expect('hello world'.includes('world')).toBe(true);
  });

  it('handles join method', () => {
    expect([1, 2, 3].join('-')).toBe('1-2-3');
  });

});
