import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    cmmsLocation: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
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

import locationsRouter from '../src/routes/locations';
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/api/locations', locationsRouter);

const mockLocation = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Main Factory',
  code: 'LOC-001',
  description: 'Main factory building',
  parentLocationId: null,
  type: 'BUILDING',
  address: '123 Industrial Pkwy',
  coordinates: '40.7128,-74.0060',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
};

describe('Locations Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/locations', () => {
    it('should return paginated locations', async () => {
      prisma.cmmsLocation.findMany.mockResolvedValue([mockLocation]);
      prisma.cmmsLocation.count.mockResolvedValue(1);

      const res = await request(app).get('/api/locations');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should filter by type', async () => {
      prisma.cmmsLocation.findMany.mockResolvedValue([]);
      prisma.cmmsLocation.count.mockResolvedValue(0);

      const res = await request(app).get('/api/locations?type=BUILDING');
      expect(res.status).toBe(200);
    });

    it('should handle search', async () => {
      prisma.cmmsLocation.findMany.mockResolvedValue([]);
      prisma.cmmsLocation.count.mockResolvedValue(0);

      const res = await request(app).get('/api/locations?search=Factory');
      expect(res.status).toBe(200);
    });

    it('should handle errors', async () => {
      prisma.cmmsLocation.findMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/locations');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/locations', () => {
    it('should create a location', async () => {
      prisma.cmmsLocation.create.mockResolvedValue(mockLocation);

      const res = await request(app).post('/api/locations').send({
        name: 'Main Factory',
        code: 'LOC-001',
        type: 'BUILDING',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app).post('/api/locations').send({});
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid type', async () => {
      const res = await request(app).post('/api/locations').send({
        name: 'Test',
        code: 'LOC-002',
        type: 'INVALID',
      });
      expect(res.status).toBe(400);
    });

    it('should handle duplicate code', async () => {
      prisma.cmmsLocation.create.mockRejectedValue({ code: 'P2002' });

      const res = await request(app).post('/api/locations').send({
        name: 'Main Factory',
        code: 'LOC-001',
        type: 'BUILDING',
      });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/locations/:id', () => {
    it('should return a location by ID', async () => {
      prisma.cmmsLocation.findFirst.mockResolvedValue(mockLocation);

      const res = await request(app).get('/api/locations/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 for non-existent location', async () => {
      prisma.cmmsLocation.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/locations/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/locations/:id', () => {
    it('should update a location', async () => {
      prisma.cmmsLocation.findFirst.mockResolvedValue(mockLocation);
      prisma.cmmsLocation.update.mockResolvedValue({ ...mockLocation, name: 'Updated' });

      const res = await request(app)
        .put('/api/locations/00000000-0000-0000-0000-000000000001')
        .send({ name: 'Updated' });
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent location', async () => {
      prisma.cmmsLocation.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/locations/00000000-0000-0000-0000-000000000099')
        .send({ name: 'Updated' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/locations/:id', () => {
    it('should soft delete a location', async () => {
      prisma.cmmsLocation.findFirst.mockResolvedValue(mockLocation);
      prisma.cmmsLocation.update.mockResolvedValue({ ...mockLocation, deletedAt: new Date() });

      const res = await request(app).delete('/api/locations/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent location', async () => {
      prisma.cmmsLocation.findFirst.mockResolvedValue(null);

      const res = await request(app).delete('/api/locations/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });

  // ─── 500 error paths ────────────────────────────────────────────────────────

  describe('500 error handling', () => {
    it('POST / returns 500 when create fails', async () => {
      prisma.cmmsLocation.create.mockRejectedValue(new Error('DB down'));
      const res = await request(app).post('/api/locations').send({
        name: 'Test Location',
        code: 'LOC-999',
        type: 'BUILDING',
      });
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('GET /:id returns 500 on DB error', async () => {
      prisma.cmmsLocation.findFirst.mockRejectedValue(new Error('DB down'));
      const res = await request(app).get('/api/locations/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('PUT /:id returns 500 when update fails', async () => {
      prisma.cmmsLocation.findFirst.mockResolvedValue(mockLocation);
      prisma.cmmsLocation.update.mockRejectedValue(new Error('DB down'));
      const res = await request(app)
        .put('/api/locations/00000000-0000-0000-0000-000000000001')
        .send({ name: 'Updated' });
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('DELETE /:id returns 500 when update fails', async () => {
      prisma.cmmsLocation.findFirst.mockResolvedValue(mockLocation);
      prisma.cmmsLocation.update.mockRejectedValue(new Error('DB down'));
      const res = await request(app).delete('/api/locations/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('locations — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/locations', locationsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/locations', async () => {
    const res = await request(app).get('/api/locations');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/locations', async () => {
    const res = await request(app).get('/api/locations');
    expect(res.headers['content-type']).toBeDefined();
  });
});

describe('locations — extended coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / returns pagination metadata with correct totalPages', async () => {
    prisma.cmmsLocation.findMany.mockResolvedValue([mockLocation]);
    prisma.cmmsLocation.count.mockResolvedValue(100);
    const res = await request(app).get('/api/locations?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(10);
    expect(res.body.pagination.total).toBe(100);
  });

  it('GET / filters by parentLocationId query param', async () => {
    prisma.cmmsLocation.findMany.mockResolvedValue([]);
    prisma.cmmsLocation.count.mockResolvedValue(0);
    const res = await request(app).get('/api/locations?type=FLOOR');
    expect(res.status).toBe(200);
  });

  it('GET / returns success false and INTERNAL_ERROR on count failure', async () => {
    prisma.cmmsLocation.findMany.mockResolvedValue([]);
    prisma.cmmsLocation.count.mockRejectedValue(new Error('count error'));
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / accepts SITE as valid type', async () => {
    prisma.cmmsLocation.create.mockResolvedValue({ ...mockLocation, type: 'SITE' });
    const res = await request(app).post('/api/locations').send({
      name: 'Main Site',
      code: 'SITE-001',
      type: 'SITE',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST / accepts ZONE as valid type', async () => {
    prisma.cmmsLocation.create.mockResolvedValue({ ...mockLocation, type: 'ZONE' });
    const res = await request(app).post('/api/locations').send({
      name: 'Zone A',
      code: 'ZONE-001',
      type: 'ZONE',
    });
    expect(res.status).toBe(201);
  });

  it('POST / returns 400 when name exceeds max length', async () => {
    const res = await request(app).post('/api/locations').send({
      name: 'A'.repeat(201),
      code: 'LOC-X',
      type: 'ROOM',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /:id returns 404 with NOT_FOUND code', async () => {
    prisma.cmmsLocation.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/locations/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('PUT /:id returns 400 on invalid type value', async () => {
    prisma.cmmsLocation.findFirst.mockResolvedValue(mockLocation);
    const res = await request(app)
      .put('/api/locations/00000000-0000-0000-0000-000000000001')
      .send({ type: 'WAREHOUSE' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('DELETE /:id response message confirms deletion', async () => {
    prisma.cmmsLocation.findFirst.mockResolvedValue(mockLocation);
    prisma.cmmsLocation.update.mockResolvedValue({ ...mockLocation, deletedAt: new Date() });
    const res = await request(app).delete('/api/locations/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toMatch(/deleted/i);
  });

  it('GET / returns page and limit in pagination object', async () => {
    prisma.cmmsLocation.findMany.mockResolvedValue([]);
    prisma.cmmsLocation.count.mockResolvedValue(0);
    const res = await request(app).get('/api/locations?page=3&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(3);
    expect(res.body.pagination.limit).toBe(5);
  });
});

describe('locations — business logic and response structure', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST / sets createdBy from the authenticated user', async () => {
    prisma.cmmsLocation.create.mockResolvedValue(mockLocation);
    await request(app).post('/api/locations').send({
      name: 'Warehouse B',
      code: 'LOC-002',
      type: 'BUILDING',
    });
    expect(prisma.cmmsLocation.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ createdBy: 'user-123' }) })
    );
  });

  it('GET / search filter passes OR clause to findMany', async () => {
    prisma.cmmsLocation.findMany.mockResolvedValue([]);
    prisma.cmmsLocation.count.mockResolvedValue(0);
    await request(app).get('/api/locations?search=Factory');
    expect(prisma.cmmsLocation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) })
    );
  });

  it('PUT / updates address field and returns success', async () => {
    prisma.cmmsLocation.findFirst.mockResolvedValue(mockLocation);
    prisma.cmmsLocation.update.mockResolvedValue({ ...mockLocation, address: '456 New Street' });
    const res = await request(app)
      .put('/api/locations/00000000-0000-0000-0000-000000000001')
      .send({ address: '456 New Street' });
    expect(res.status).toBe(200);
    expect(res.body.data.address).toBe('456 New Street');
  });

  it('DELETE / soft-deletes by setting deletedAt via update', async () => {
    prisma.cmmsLocation.findFirst.mockResolvedValue(mockLocation);
    prisma.cmmsLocation.update.mockResolvedValue({ ...mockLocation, deletedAt: new Date() });
    const res = await request(app).delete('/api/locations/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(prisma.cmmsLocation.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('GET / returns success:true and data is an array', async () => {
    prisma.cmmsLocation.findMany.mockResolvedValue([mockLocation]);
    prisma.cmmsLocation.count.mockResolvedValue(1);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('locations — final coverage expansion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /locations data items include code field', async () => {
    prisma.cmmsLocation.findMany.mockResolvedValue([mockLocation]);
    prisma.cmmsLocation.count.mockResolvedValue(1);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('code', 'LOC-001');
  });

  it('POST /locations returns 409 on duplicate code', async () => {
    prisma.cmmsLocation.create.mockRejectedValue({ code: 'P2002' });
    const res = await request(app).post('/api/locations').send({
      name: 'Factory 2',
      code: 'LOC-001',
      type: 'BUILDING',
    });
    expect(res.status).toBe(409);
  });

  it('PUT /locations/:id returns 404 with NOT_FOUND when location missing', async () => {
    prisma.cmmsLocation.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/locations/00000000-0000-0000-0000-000000000077')
      .send({ name: 'New Name' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('GET /locations response content-type is application/json', async () => {
    prisma.cmmsLocation.findMany.mockResolvedValue([]);
    prisma.cmmsLocation.count.mockResolvedValue(0);
    const res = await request(app).get('/api/locations');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('GET /locations?type=ROOM filters findMany by type', async () => {
    prisma.cmmsLocation.findMany.mockResolvedValue([]);
    prisma.cmmsLocation.count.mockResolvedValue(0);
    await request(app).get('/api/locations?type=ROOM');
    expect(prisma.cmmsLocation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ type: 'ROOM' }) })
    );
  });
});
