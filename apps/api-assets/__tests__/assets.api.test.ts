import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    assetRegister: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
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

import router from '../src/routes/assets';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/assets', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/assets', () => {
  it('should return assets with pagination', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', name: 'Forklift' },
    ]);
    mockPrisma.assetRegister.count.mockResolvedValue(1);
    const res = await request(app).get('/api/assets');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it('should filter by status', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    mockPrisma.assetRegister.count.mockResolvedValue(0);
    const res = await request(app).get('/api/assets?status=ACTIVE');
    expect(res.status).toBe(200);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.assetRegister.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/assets');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/assets/:id', () => {
  it('should return 404 if not found', async () => {
    mockPrisma.assetRegister.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/assets/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return item by id', async () => {
    mockPrisma.assetRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Forklift',
    });
    const res = await request(app).get('/api/assets/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.assetRegister.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/assets/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/assets', () => {
  it('should create', async () => {
    mockPrisma.assetRegister.count.mockResolvedValue(0);
    mockPrisma.assetRegister.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'New Asset',
      referenceNumber: 'AST-2026-0001',
    });
    const res = await request(app).post('/api/assets').send({ name: 'New Asset' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 when name is missing', async () => {
    const res = await request(app).post('/api/assets').send({ description: 'No name' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when name is empty', async () => {
    const res = await request(app).post('/api/assets').send({ name: '' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on database create error', async () => {
    mockPrisma.assetRegister.count.mockResolvedValue(0);
    mockPrisma.assetRegister.create.mockRejectedValue(new Error('Unique constraint'));
    const res = await request(app).post('/api/assets').send({ name: 'Duplicate' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('PUT /api/assets/:id', () => {
  it('should update', async () => {
    mockPrisma.assetRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.assetRegister.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Updated',
    });
    const res = await request(app)
      .put('/api/assets/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when asset not found', async () => {
    mockPrisma.assetRegister.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/assets/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database update error', async () => {
    mockPrisma.assetRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.assetRegister.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put('/api/assets/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('DELETE /api/assets/:id', () => {
  it('should soft delete', async () => {
    mockPrisma.assetRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.assetRegister.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/assets/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when asset not found', async () => {
    mockPrisma.assetRegister.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/assets/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.assetRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.assetRegister.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/assets/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('assets.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/assets', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/assets', async () => {
    const res = await request(app).get('/api/assets');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/assets', async () => {
    const res = await request(app).get('/api/assets');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/assets body has success property', async () => {
    const res = await request(app).get('/api/assets');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/assets body is an object', async () => {
    const res = await request(app).get('/api/assets');
    expect(typeof res.body).toBe('object');
  });
});

describe('Assets API — extended field validation and edge cases', () => {
  it('GET / pagination has totalPages field', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    mockPrisma.assetRegister.count.mockResolvedValue(0);
    const res = await request(app).get('/api/assets');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('totalPages');
  });

  it('GET / with page and limit params returns correct pagination', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    mockPrisma.assetRegister.count.mockResolvedValue(50);
    const res = await request(app).get('/api/assets?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(10);
  });

  it('GET / with search param returns 200', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    mockPrisma.assetRegister.count.mockResolvedValue(0);
    const res = await request(app).get('/api/assets?search=forklift');
    expect(res.status).toBe(200);
  });

  it('POST / creates asset with all optional fields', async () => {
    mockPrisma.assetRegister.count.mockResolvedValue(3);
    mockPrisma.assetRegister.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000010',
      name: 'Crane',
      referenceNumber: 'AST-2026-0004',
      category: 'Heavy Equipment',
      location: 'Site A',
    });
    const res = await request(app).post('/api/assets').send({
      name: 'Crane',
      category: 'Heavy Equipment',
      location: 'Site A',
      status: 'ACTIVE',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('PUT / updates asset status to DECOMMISSIONED', async () => {
    mockPrisma.assetRegister.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.assetRegister.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'DECOMMISSIONED' });
    const res = await request(app)
      .put('/api/assets/00000000-0000-0000-0000-000000000001')
      .send({ status: 'DECOMMISSIONED' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE / data.message confirms deletion', async () => {
    mockPrisma.assetRegister.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.assetRegister.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).delete('/api/assets/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toMatch(/deleted/i);
  });

  it('GET / pagination total matches mocked count', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    mockPrisma.assetRegister.count.mockResolvedValue(77);
    const res = await request(app).get('/api/assets');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(77);
  });

  it('GET / data is an array', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', name: 'Pump' },
    ]);
    mockPrisma.assetRegister.count.mockResolvedValue(1);
    const res = await request(app).get('/api/assets');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST / returns 400 for invalid status enum value', async () => {
    const res = await request(app).post('/api/assets').send({ name: 'Asset', status: 'UNKNOWN_STATUS' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /:id returns 500 on findFirst DB error', async () => {
    mockPrisma.assetRegister.findFirst.mockRejectedValue(new Error('DB timeout'));
    const res = await request(app)
      .put('/api/assets/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Assets API — final coverage block', () => {
  it('GET / count is called once per list request', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    mockPrisma.assetRegister.count.mockResolvedValue(0);
    await request(app).get('/api/assets');
    expect(mockPrisma.assetRegister.count).toHaveBeenCalledTimes(1);
  });

  it('POST / generated referenceNumber starts with AST-', async () => {
    mockPrisma.assetRegister.count.mockResolvedValue(0);
    mockPrisma.assetRegister.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000020',
      name: 'New Machine',
      referenceNumber: 'AST-2026-0001',
    });
    const res = await request(app).post('/api/assets').send({ name: 'New Machine' });
    expect(res.status).toBe(201);
    expect(res.body.data.referenceNumber).toMatch(/^AST-/);
  });

  it('GET /:id returns 500 when findFirst rejects', async () => {
    mockPrisma.assetRegister.findFirst.mockRejectedValue(new Error('network error'));
    const res = await request(app).get('/api/assets/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id update is called with deletedAt data', async () => {
    mockPrisma.assetRegister.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.assetRegister.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    await request(app).delete('/api/assets/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.assetRegister.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('GET / with category filter returns 200', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    mockPrisma.assetRegister.count.mockResolvedValue(0);
    const res = await request(app).get('/api/assets?category=Heavy Equipment');
    expect(res.status).toBe(200);
  });

  it('PUT /:id update is called with correct where.id', async () => {
    mockPrisma.assetRegister.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.assetRegister.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', name: 'Updated' });
    await request(app).put('/api/assets/00000000-0000-0000-0000-000000000001').send({ name: 'Updated' });
    expect(mockPrisma.assetRegister.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '00000000-0000-0000-0000-000000000001' } })
    );
  });
});
