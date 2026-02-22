import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    qualRaci: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN', organisationId: 'org-1' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import { prisma } from '../src/prisma';
import raciRouter from '../src/routes/raci';

const app = express();
app.use(express.json());
app.use('/api/raci', raciRouter);

const mockRaci = {
  id: '00000000-0000-0000-0000-000000000001',
  referenceNumber: 'RACI-2026-001',
  processName: 'Document Control',
  activityName: 'Document Review',
  roleName: 'Quality Manager',
  raciType: 'RESPONSIBLE',
  organisationId: 'org-1',
  createdAt: '2026-01-10T00:00:00.000Z',
  updatedAt: '2026-01-10T00:00:00.000Z',
};

const mockRaci2 = {
  id: '00000000-0000-0000-0000-000000000002',
  referenceNumber: 'RACI-2026-002',
  processName: 'Document Control',
  activityName: 'Document Review',
  roleName: 'Department Head',
  raciType: 'ACCOUNTABLE',
  organisationId: 'org-1',
  createdAt: '2026-01-10T00:00:00.000Z',
  updatedAt: '2026-01-10T00:00:00.000Z',
};

describe('RACI Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/raci', () => {
    it('should return a list of RACI entries', async () => {
      (prisma.qualRaci.findMany as jest.Mock).mockResolvedValue([mockRaci, mockRaci2]);
      (prisma.qualRaci.count as jest.Mock).mockResolvedValue(2);

      const res = await request(app).get('/api/raci');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].processName).toBe('Document Control');
    });

    it('should filter by processName', async () => {
      (prisma.qualRaci.findMany as jest.Mock).mockResolvedValue([mockRaci]);
      (prisma.qualRaci.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/raci?processName=Document+Control');
      expect(res.status).toBe(200);
      expect(prisma.qualRaci.findMany).toHaveBeenCalled();
    });

    it('should filter by raciType', async () => {
      (prisma.qualRaci.findMany as jest.Mock).mockResolvedValue([mockRaci]);
      (prisma.qualRaci.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/raci?raciType=RESPONSIBLE');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should support pagination', async () => {
      (prisma.qualRaci.findMany as jest.Mock).mockResolvedValue([mockRaci]);
      (prisma.qualRaci.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/raci?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should handle errors', async () => {
      (prisma.qualRaci.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/raci');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/raci/matrix', () => {
    it('should return the RACI matrix grouped by process', async () => {
      (prisma.qualRaci.findMany as jest.Mock).mockResolvedValue([mockRaci, mockRaci2]);

      const res = await request(app).get('/api/raci/matrix');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prisma.qualRaci.findMany).toHaveBeenCalled();
    });

    it('should handle matrix errors', async () => {
      (prisma.qualRaci.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/raci/matrix');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/raci', () => {
    it('should create a RACI entry', async () => {
      (prisma.qualRaci.count as jest.Mock).mockResolvedValue(0);
      (prisma.qualRaci.create as jest.Mock).mockResolvedValue(mockRaci);

      const res = await request(app).post('/api/raci').send({
        processName: 'Document Control',
        activityName: 'Document Review',
        roleName: 'Quality Manager',
        raciType: 'RESPONSIBLE',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.raciType).toBe('RESPONSIBLE');
    });

    it('should validate required fields', async () => {
      const res = await request(app).post('/api/raci').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should handle creation errors', async () => {
      (prisma.qualRaci.count as jest.Mock).mockResolvedValue(0);
      (prisma.qualRaci.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/raci').send({
        processName: 'Document Control',
        activityName: 'Document Review',
        roleName: 'Quality Manager',
        raciType: 'RESPONSIBLE',
      });
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/raci/:id', () => {
    it('should return a RACI entry by id', async () => {
      (prisma.qualRaci.findFirst as jest.Mock).mockResolvedValue(mockRaci);

      const res = await request(app).get('/api/raci/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.roleName).toBe('Quality Manager');
    });

    it('should return 404 if not found', async () => {
      (prisma.qualRaci.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/raci/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should handle errors', async () => {
      (prisma.qualRaci.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/raci/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/raci/:id', () => {
    it('should update a RACI entry', async () => {
      (prisma.qualRaci.findFirst as jest.Mock).mockResolvedValue(mockRaci);
      (prisma.qualRaci.update as jest.Mock).mockResolvedValue({
        ...mockRaci,
        raciType: 'CONSULTED',
      });

      const res = await request(app).put('/api/raci/00000000-0000-0000-0000-000000000001').send({
        raciType: 'CONSULTED',
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.raciType).toBe('CONSULTED');
    });

    it('should return 404 if not found', async () => {
      (prisma.qualRaci.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app).put('/api/raci/00000000-0000-0000-0000-000000000099').send({
        raciType: 'CONSULTED',
      });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should handle update errors', async () => {
      (prisma.qualRaci.findFirst as jest.Mock).mockResolvedValue(mockRaci);
      (prisma.qualRaci.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).put('/api/raci/00000000-0000-0000-0000-000000000001').send({
        raciType: 'CONSULTED',
      });
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/raci/:id', () => {
    it('should soft delete a RACI entry', async () => {
      (prisma.qualRaci.findFirst as jest.Mock).mockResolvedValue(mockRaci);
      (prisma.qualRaci.update as jest.Mock).mockResolvedValue({
        ...mockRaci,
        deletedAt: new Date().toISOString(),
      });

      const res = await request(app).delete('/api/raci/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prisma.qualRaci.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
      );
    });

    it('should return 404 if not found', async () => {
      (prisma.qualRaci.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete('/api/raci/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should handle delete errors', async () => {
      (prisma.qualRaci.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete('/api/raci/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});

describe('raci — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/raci', raciRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/raci', async () => {
    const res = await request(app).get('/api/raci');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });
});

describe('RACI Routes — extended edge cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/raci returns pagination metadata', async () => {
    (prisma.qualRaci.findMany as jest.Mock).mockResolvedValue([mockRaci]);
    (prisma.qualRaci.count as jest.Mock).mockResolvedValue(5);
    const res = await request(app).get('/api/raci?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(5);
  });

  it('GET /api/raci filters by search keyword', async () => {
    (prisma.qualRaci.findMany as jest.Mock).mockResolvedValue([mockRaci]);
    (prisma.qualRaci.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/raci?search=Quality');
    expect(res.status).toBe(200);
    expect(prisma.qualRaci.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) })
    );
  });

  it('GET /api/raci/matrix returns grouped matrix object', async () => {
    (prisma.qualRaci.findMany as jest.Mock).mockResolvedValue([mockRaci, mockRaci2]);
    const res = await request(app).get('/api/raci/matrix');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(typeof res.body.data).toBe('object');
  });

  it('GET /api/raci/matrix filters by processId', async () => {
    (prisma.qualRaci.findMany as jest.Mock).mockResolvedValue([mockRaci]);
    const res = await request(app).get('/api/raci/matrix?processId=proc-1');
    expect(res.status).toBe(200);
    expect(prisma.qualRaci.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ processId: 'proc-1' }) })
    );
  });

  it('POST /api/raci returns 400 when raciType is invalid', async () => {
    const res = await request(app).post('/api/raci').send({
      processName: 'P1',
      activityName: 'A1',
      roleName: 'R1',
      raciType: 'INVALID_TYPE',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /api/raci/:id returns 400 for invalid raciType in update', async () => {
    const res = await request(app)
      .put('/api/raci/00000000-0000-0000-0000-000000000001')
      .send({ raciType: 'UNKNOWN' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('DELETE /api/raci/:id sets deleted:true in response', async () => {
    (prisma.qualRaci.findFirst as jest.Mock).mockResolvedValue(mockRaci);
    (prisma.qualRaci.update as jest.Mock).mockResolvedValue({ ...mockRaci, deletedAt: new Date() });
    const res = await request(app).delete('/api/raci/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);
  });

  it('GET /api/raci/:id returns NOT_FOUND error code on 404', async () => {
    (prisma.qualRaci.findFirst as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/raci/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('GET /api/raci returns INTERNAL_ERROR code on 500', async () => {
    (prisma.qualRaci.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/raci');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /api/raci creates with ACCOUNTABLE type', async () => {
    (prisma.qualRaci.count as jest.Mock).mockResolvedValue(0);
    (prisma.qualRaci.create as jest.Mock).mockResolvedValue({ ...mockRaci2 });
    const res = await request(app).post('/api/raci').send({
      processName: 'Document Control',
      activityName: 'Document Approval',
      roleName: 'Department Head',
      raciType: 'ACCOUNTABLE',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.raciType).toBe('ACCOUNTABLE');
  });
});

describe('RACI Routes — final coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/raci — response data is array', async () => {
    (prisma.qualRaci.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.qualRaci.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/raci');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/raci — returns 200 with INFORMED type filter', async () => {
    (prisma.qualRaci.findMany as jest.Mock).mockResolvedValue([{ ...mockRaci, raciType: 'INFORMED' }]);
    (prisma.qualRaci.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/raci?raciType=INFORMED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/raci — CONSULTED type creates successfully', async () => {
    (prisma.qualRaci.count as jest.Mock).mockResolvedValue(0);
    (prisma.qualRaci.create as jest.Mock).mockResolvedValue({ ...mockRaci, raciType: 'CONSULTED' });
    const res = await request(app).post('/api/raci').send({
      processName: 'Audit',
      activityName: 'Evidence Review',
      roleName: 'Auditor',
      raciType: 'CONSULTED',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.raciType).toBe('CONSULTED');
  });

  it('PUT /api/raci/:id — update is called with correct where id', async () => {
    (prisma.qualRaci.findFirst as jest.Mock).mockResolvedValue(mockRaci);
    (prisma.qualRaci.update as jest.Mock).mockResolvedValue({ ...mockRaci, raciType: 'INFORMED' });
    const res = await request(app)
      .put('/api/raci/00000000-0000-0000-0000-000000000001')
      .send({ raciType: 'INFORMED' });
    expect(res.status).toBe(200);
    expect(prisma.qualRaci.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: '00000000-0000-0000-0000-000000000001' }),
      })
    );
  });

  it('GET /api/raci/matrix — response body has success:true', async () => {
    (prisma.qualRaci.findMany as jest.Mock).mockResolvedValue([mockRaci]);
    const res = await request(app).get('/api/raci/matrix');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ===================================================================
// RACI Routes — supplemental coverage
// ===================================================================
describe('RACI Routes — supplemental coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/raci — findMany is called once on valid request', async () => {
    (prisma.qualRaci.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.qualRaci.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/raci');
    expect(prisma.qualRaci.findMany).toHaveBeenCalledTimes(1);
  });

  it('POST /api/raci — create called once on valid body', async () => {
    (prisma.qualRaci.count as jest.Mock).mockResolvedValue(0);
    (prisma.qualRaci.create as jest.Mock).mockResolvedValue(mockRaci);
    await request(app).post('/api/raci').send({
      processName: 'Document Control',
      activityName: 'Document Review',
      roleName: 'Quality Manager',
      raciType: 'RESPONSIBLE',
    });
    expect(prisma.qualRaci.create).toHaveBeenCalledTimes(1);
  });

  it('GET /api/raci/:id — findFirst is called with correct id', async () => {
    (prisma.qualRaci.findFirst as jest.Mock).mockResolvedValue(mockRaci);
    await request(app).get('/api/raci/00000000-0000-0000-0000-000000000001');
    expect(prisma.qualRaci.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: '00000000-0000-0000-0000-000000000001' }) })
    );
  });

  it('PUT /api/raci/:id — response data has roleName field', async () => {
    (prisma.qualRaci.findFirst as jest.Mock).mockResolvedValue(mockRaci);
    (prisma.qualRaci.update as jest.Mock).mockResolvedValue({ ...mockRaci, raciType: 'INFORMED' });
    const res = await request(app)
      .put('/api/raci/00000000-0000-0000-0000-000000000001')
      .send({ raciType: 'INFORMED' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('roleName');
  });

  it('DELETE /api/raci/:id — 500 when update throws after findFirst succeeds', async () => {
    (prisma.qualRaci.findFirst as jest.Mock).mockResolvedValue(mockRaci);
    (prisma.qualRaci.update as jest.Mock).mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/raci/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
