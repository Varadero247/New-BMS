import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    aeroFodIncident: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    aeroFodInspection: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
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
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock('@ims/service-auth', () => ({
  scopeToUser: (_req: any, _res: any, next: any) => next(),
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
  parsePagination: (query: Record<string, any>, opts?: { defaultLimit?: number }) => {
    const defaultLimit = opts?.defaultLimit ?? 20;
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || defaultLimit), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  },
}));

import router from '../src/routes/fod';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/fod', router);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Aerospace FOD (Foreign Object Debris) API', () => {
  // =============================================
  // GET / - List FOD incidents
  // =============================================
  describe('GET /api/fod', () => {
    it('should return paginated list of FOD incidents', async () => {
      mockPrisma.aeroFodIncident.findMany.mockResolvedValueOnce([
        {
          id: '00000000-0000-0000-0000-000000000001',
          refNumber: 'AERO-FOD-2026-001',
          title: 'Metal Shaving Found',
          severity: 'MINOR',
          status: 'OPEN',
        },
      ]);
      mockPrisma.aeroFodIncident.count.mockResolvedValueOnce(1);

      const res = await request(app).get('/api/fod').set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta).toMatchObject({ page: 1, limit: 20, total: 1, totalPages: 1 });
    });

    it('should filter by status', async () => {
      mockPrisma.aeroFodIncident.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroFodIncident.count.mockResolvedValueOnce(0);

      await request(app).get('/api/fod?status=CLOSED').set('Authorization', 'Bearer token');
      expect(mockPrisma.aeroFodIncident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'CLOSED' }) })
      );
    });

    it('should filter by severity', async () => {
      mockPrisma.aeroFodIncident.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroFodIncident.count.mockResolvedValueOnce(0);

      await request(app).get('/api/fod?severity=CRITICAL').set('Authorization', 'Bearer token');
      expect(mockPrisma.aeroFodIncident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ severity: 'CRITICAL' }) })
      );
    });

    it('should filter by fodType', async () => {
      mockPrisma.aeroFodIncident.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroFodIncident.count.mockResolvedValueOnce(0);

      await request(app).get('/api/fod?fodType=METALLIC').set('Authorization', 'Bearer token');
      expect(mockPrisma.aeroFodIncident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ fodType: 'METALLIC' }) })
      );
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroFodIncident.findMany.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/fod').set('Authorization', 'Bearer token');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // GET /:id
  // =============================================
  describe('GET /api/fod/:id', () => {
    it('should return a single FOD incident', async () => {
      mockPrisma.aeroFodIncident.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        refNumber: 'AERO-FOD-2026-001',
        title: 'Metal Shaving',
        deletedAt: null,
      });

      const res = await request(app)
        .get('/api/fod/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroFodIncident.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .get('/api/fod/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when soft-deleted', async () => {
      mockPrisma.aeroFodIncident.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: new Date(),
      });

      const res = await request(app)
        .get('/api/fod/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // =============================================
  // POST / - Report FOD incident
  // =============================================
  describe('POST /api/fod', () => {
    const validPayload = {
      title: 'Loose Bolt in Assembly Bay',
      description: 'Found M8 bolt under wing assembly fixture',
      location: 'Assembly Bay 3',
      dateFound: '2026-02-10',
    };

    it('should create a FOD incident successfully', async () => {
      mockPrisma.aeroFodIncident.count.mockResolvedValueOnce(0);
      mockPrisma.aeroFodIncident.create.mockResolvedValueOnce({
        id: 'f-new',
        refNumber: 'AERO-FOD-2026-001',
        ...validPayload,
        status: 'OPEN',
      });

      const res = await request(app)
        .post('/api/fod')
        .set('Authorization', 'Bearer token')
        .send(validPayload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('OPEN');
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/fod')
        .set('Authorization', 'Bearer token')
        .send({ description: 'desc', location: 'Bay 1', dateFound: '2026-01-01' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when description is missing', async () => {
      const res = await request(app)
        .post('/api/fod')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Test', location: 'Bay 1', dateFound: '2026-01-01' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when location is missing', async () => {
      const res = await request(app)
        .post('/api/fod')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Test', description: 'desc', dateFound: '2026-01-01' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when dateFound is missing', async () => {
      const res = await request(app)
        .post('/api/fod')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Test', description: 'desc', location: 'Bay 1' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroFodIncident.count.mockResolvedValueOnce(0);
      mockPrisma.aeroFodIncident.create.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .post('/api/fod')
        .set('Authorization', 'Bearer token')
        .send(validPayload);
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // PUT /:id - Update FOD incident
  // =============================================
  describe('PUT /api/fod/:id', () => {
    const existing = {
      id: '00000000-0000-0000-0000-000000000001',
      closedDate: null,
      deletedAt: null,
    };

    it('should update a FOD incident successfully', async () => {
      mockPrisma.aeroFodIncident.findUnique.mockResolvedValueOnce(existing);
      mockPrisma.aeroFodIncident.update.mockResolvedValueOnce({
        ...existing,
        status: 'INVESTIGATING',
      });

      const res = await request(app)
        .put('/api/fod/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVESTIGATING', rootCause: 'Tooling not retrieved' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroFodIncident.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/fod/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token')
        .send({ status: 'CLOSED' });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status', async () => {
      mockPrisma.aeroFodIncident.findUnique.mockResolvedValueOnce(existing);

      const res = await request(app)
        .put('/api/fod/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // =============================================
  // DELETE /:id
  // =============================================
  describe('DELETE /api/fod/:id', () => {
    it('should soft-delete a FOD incident', async () => {
      mockPrisma.aeroFodIncident.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      mockPrisma.aeroFodIncident.update.mockResolvedValueOnce({});

      const res = await request(app)
        .delete('/api/fod/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(204);
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroFodIncident.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .delete('/api/fod/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // =============================================
  // GET /inspections
  // =============================================
  describe('GET /api/fod/inspections', () => {
    it('should list FOD inspections', async () => {
      mockPrisma.aeroFodInspection.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroFodInspection.count.mockResolvedValueOnce(0);
      const res = await request(app)
        .get('/api/fod/inspections')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // =============================================
  // POST /inspections
  // =============================================
  describe('POST /api/fod/inspections', () => {
    const validPayload = {
      title: 'Morning FOD Walk',
      area: 'Assembly Bay 3',
      scheduledDate: '2026-02-15',
      inspector: 'Mike Johnson',
    };

    it('should schedule a FOD inspection', async () => {
      mockPrisma.aeroFodInspection.count.mockResolvedValueOnce(0);
      mockPrisma.aeroFodInspection.create.mockResolvedValueOnce({
        id: 'fi-new',
        refNumber: 'AERO-FODI-2026-001',
        ...validPayload,
        status: 'SCHEDULED',
      });

      const res = await request(app)
        .post('/api/fod/inspections')
        .set('Authorization', 'Bearer token')
        .send(validPayload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('SCHEDULED');
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/fod/inspections')
        .set('Authorization', 'Bearer token')
        .send({ area: 'Bay 3', scheduledDate: '2026-01-01', inspector: 'Smith' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when inspector is missing', async () => {
      const res = await request(app)
        .post('/api/fod/inspections')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Walk', area: 'Bay 3', scheduledDate: '2026-01-01' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // =============================================
  // PUT /inspections/:id/complete
  // =============================================
  describe('PUT /api/fod/inspections/:id/complete', () => {
    const existingInspection = {
      id: '00000000-0000-0000-0000-000000000001',
      status: 'SCHEDULED',
      notes: null,
      deletedAt: null,
    };

    it('should complete a FOD inspection', async () => {
      mockPrisma.aeroFodInspection.findUnique.mockResolvedValueOnce(existingInspection);
      mockPrisma.aeroFodInspection.update.mockResolvedValueOnce({
        ...existingInspection,
        status: 'COMPLETED',
        result: 'PASS',
      });

      const res = await request(app)
        .put('/api/fod/inspections/00000000-0000-0000-0000-000000000001/complete')
        .set('Authorization', 'Bearer token')
        .send({ result: 'PASS', fodFound: false });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when inspection not found', async () => {
      mockPrisma.aeroFodInspection.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/fod/inspections/00000000-0000-0000-0000-000000000099/complete')
        .set('Authorization', 'Bearer token')
        .send({ result: 'PASS' });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when result is missing', async () => {
      mockPrisma.aeroFodInspection.findUnique.mockResolvedValueOnce(existingInspection);

      const res = await request(app)
        .put('/api/fod/inspections/00000000-0000-0000-0000-000000000001/complete')
        .set('Authorization', 'Bearer token')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid result enum', async () => {
      mockPrisma.aeroFodInspection.findUnique.mockResolvedValueOnce(existingInspection);

      const res = await request(app)
        .put('/api/fod/inspections/00000000-0000-0000-0000-000000000001/complete')
        .set('Authorization', 'Bearer token')
        .send({ result: 'INVALID' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroFodInspection.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .put('/api/fod/inspections/00000000-0000-0000-0000-000000000001/complete')
        .set('Authorization', 'Bearer token')
        .send({ result: 'PASS' });
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('Aerospace FOD API — additional coverage', () => {
  it('GET /api/fod returns correct totalPages for multi-page result', async () => {
    mockPrisma.aeroFodIncident.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroFodIncident.count.mockResolvedValueOnce(45);

    const res = await request(app)
      .get('/api/fod?page=1&limit=20')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBe(3);
    expect(res.body.meta.total).toBe(45);
  });

  it('GET /api/fod page 2 limit 10 computes skip=10', async () => {
    mockPrisma.aeroFodIncident.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroFodIncident.count.mockResolvedValueOnce(0);

    await request(app)
      .get('/api/fod?page=2&limit=10')
      .set('Authorization', 'Bearer token');
    expect(mockPrisma.aeroFodIncident.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it('GET /api/fod response shape has success:true and meta block', async () => {
    mockPrisma.aeroFodIncident.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroFodIncident.count.mockResolvedValueOnce(0);

    const res = await request(app).get('/api/fod').set('Authorization', 'Bearer token');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
  });

  it('PUT /api/fod/:id returns 500 when update throws', async () => {
    mockPrisma.aeroFodIncident.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      closedDate: null,
      deletedAt: null,
    });
    mockPrisma.aeroFodIncident.update.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .put('/api/fod/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ status: 'INVESTIGATING' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /api/fod/:id returns 500 when update throws', async () => {
    mockPrisma.aeroFodIncident.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: null,
    });
    mockPrisma.aeroFodIncident.update.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .delete('/api/fod/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/fod/:id returns 500 on db error', async () => {
    mockPrisma.aeroFodIncident.findUnique.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .get('/api/fod/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/fod/inspections returns 500 on db error', async () => {
    mockPrisma.aeroFodInspection.findMany.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .get('/api/fod/inspections')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /api/fod/inspections returns 500 on db error', async () => {
    mockPrisma.aeroFodInspection.count.mockResolvedValueOnce(0);
    mockPrisma.aeroFodInspection.create.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .post('/api/fod/inspections')
      .set('Authorization', 'Bearer token')
      .send({
        title: 'Morning Walk',
        area: 'Bay 3',
        scheduledDate: '2026-02-15',
        inspector: 'Mike Johnson',
      });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Aerospace FOD API — extra coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('DELETE /api/fod/:id already deleted returns 404', async () => {
    mockPrisma.aeroFodIncident.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });
    const res = await request(app)
      .delete('/api/fod/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('PUT /api/fod/inspections/:id/complete returns 500 when update throws', async () => {
    mockPrisma.aeroFodInspection.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'SCHEDULED',
      notes: null,
      deletedAt: null,
    });
    mockPrisma.aeroFodInspection.update.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app)
      .put('/api/fod/inspections/00000000-0000-0000-0000-000000000001/complete')
      .set('Authorization', 'Bearer token')
      .send({ result: 'PASS', fodFound: false });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/fod response shape has success:true and meta block', async () => {
    mockPrisma.aeroFodIncident.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroFodIncident.count.mockResolvedValueOnce(0);
    const res = await request(app).get('/api/fod').set('Authorization', 'Bearer token');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
  });

  it('POST /api/fod/inspections returns 400 when area is missing', async () => {
    const res = await request(app)
      .post('/api/fod/inspections')
      .set('Authorization', 'Bearer token')
      .send({ title: 'Walk', scheduledDate: '2026-02-15', inspector: 'Smith' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('Aerospace FOD API — phase28 coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/fod with page=2 limit=5 returns correct meta', async () => {
    mockPrisma.aeroFodIncident.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroFodIncident.count.mockResolvedValueOnce(15);
    const res = await request(app).get('/api/fod?page=2&limit=5').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBe(2);
    expect(res.body.meta.limit).toBe(5);
  });

  it('GET /api/fod data items have area field', async () => {
    mockPrisma.aeroFodIncident.findMany.mockResolvedValueOnce([
      { id: '00000000-0000-0000-0000-000000000001', refNumber: 'AERO-FOD-2026-001', area: 'Bay 1', status: 'OPEN' },
    ]);
    mockPrisma.aeroFodIncident.count.mockResolvedValueOnce(1);
    const res = await request(app).get('/api/fod').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('area');
  });

  it('GET /api/fod/:id data has refNumber field', async () => {
    mockPrisma.aeroFodIncident.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000002',
      refNumber: 'AERO-FOD-2026-002',
      area: 'Bay 2',
      deletedAt: null,
    });
    const res = await request(app)
      .get('/api/fod/00000000-0000-0000-0000-000000000002')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('refNumber');
  });

  it('GET /api/fod/inspections with default pagination returns 200', async () => {
    mockPrisma.aeroFodInspection.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroFodInspection.count.mockResolvedValueOnce(0);
    const res = await request(app).get('/api/fod/inspections').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.meta.page).toBe(1);
  });

  it('DELETE /api/fod/:id returns 500 when update throws', async () => {
    mockPrisma.aeroFodIncident.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000003',
      deletedAt: null,
    });
    mockPrisma.aeroFodIncident.update.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app)
      .delete('/api/fod/00000000-0000-0000-0000-000000000003')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
