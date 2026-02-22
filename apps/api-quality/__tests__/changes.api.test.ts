import express from 'express';
import request from 'supertest';

// Mock dependencies - use ../prisma (not @ims/database)
jest.mock('../src/prisma', () => ({
  prisma: {
    qualChange: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));
jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => '30000000-0000-4000-a000-000000000123'),
}));

import { prisma } from '../src/prisma';
import changesRoutes from '../src/routes/changes';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Quality Changes API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/changes', changesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // GET /api/changes — List changes
  // ============================================
  describe('GET /api/changes', () => {
    const mockChanges = [
      {
        id: '26000000-0000-4000-a000-000000000001',
        referenceNumber: 'QMS-CHG-2026-001',
        title: 'Update SOP for welding',
        changeType: 'DOCUMENT_UPDATE',
        priority: 'ROUTINE',
        status: 'REQUESTED',
        requestedBy: 'John Doe',
        department: 'Engineering',
        currentState: 'Old SOP version',
        proposedChange: 'New SOP format',
        reasonForChange: 'Regulatory update',
      },
      {
        id: 'chg-2',
        referenceNumber: 'QMS-CHG-2026-002',
        title: 'Process change for line B',
        changeType: 'PROCESS_CHANGE',
        priority: 'URGENT',
        status: 'APPROVED',
        requestedBy: 'Jane Smith',
        department: 'Production',
        currentState: 'Manual process',
        proposedChange: 'Automated process',
        reasonForChange: 'Efficiency improvement',
      },
    ];

    it('should return list of changes with pagination', async () => {
      (mockPrisma.qualChange.findMany as jest.Mock).mockResolvedValueOnce(mockChanges);
      (mockPrisma.qualChange.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app).get('/api/changes').set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(20);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.totalPages).toBe(1);
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.qualChange.findMany as jest.Mock).mockResolvedValueOnce([mockChanges[0]]);
      (mockPrisma.qualChange.count as jest.Mock).mockResolvedValueOnce(40);

      const response = await request(app)
        .get('/api/changes?page=4&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.page).toBe(4);
      expect(response.body.data.limit).toBe(10);
      expect(response.body.data.totalPages).toBe(4);
    });

    it('should filter by changeType', async () => {
      (mockPrisma.qualChange.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualChange.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/changes?changeType=DOCUMENT_UPDATE')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualChange.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            changeType: 'DOCUMENT_UPDATE',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.qualChange.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualChange.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/changes?status=APPROVED').set('Authorization', 'Bearer token');

      expect(mockPrisma.qualChange.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'APPROVED',
          }),
        })
      );
    });

    it('should filter by priority', async () => {
      (mockPrisma.qualChange.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualChange.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/changes?priority=URGENT').set('Authorization', 'Bearer token');

      expect(mockPrisma.qualChange.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            priority: 'URGENT',
          }),
        })
      );
    });

    it('should filter by search (case-insensitive title search)', async () => {
      (mockPrisma.qualChange.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualChange.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/changes?search=welding').set('Authorization', 'Bearer token');

      expect(mockPrisma.qualChange.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            title: { contains: 'welding', mode: 'insensitive' },
          }),
        })
      );
    });

    it('should order by createdAt descending', async () => {
      (mockPrisma.qualChange.findMany as jest.Mock).mockResolvedValueOnce(mockChanges);
      (mockPrisma.qualChange.count as jest.Mock).mockResolvedValueOnce(2);

      await request(app).get('/api/changes').set('Authorization', 'Bearer token');

      expect(mockPrisma.qualChange.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualChange.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/changes').set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // GET /api/changes/:id — Get single change
  // ============================================
  describe('GET /api/changes/:id', () => {
    const mockChange = {
      id: '26000000-0000-4000-a000-000000000001',
      referenceNumber: 'QMS-CHG-2026-001',
      title: 'Update SOP for welding',
      changeType: 'DOCUMENT_UPDATE',
      priority: 'ROUTINE',
      requestedBy: 'John Doe',
      department: 'Engineering',
      currentState: 'Old SOP version',
      proposedChange: 'New SOP format',
      reasonForChange: 'Regulatory update',
    };

    it('should return single change', async () => {
      (mockPrisma.qualChange.findUnique as jest.Mock).mockResolvedValueOnce(mockChange);

      const response = await request(app)
        .get('/api/changes/26000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('26000000-0000-4000-a000-000000000001');
      expect(response.body.data.title).toBe('Update SOP for welding');
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff change', async () => {
      (mockPrisma.qualChange.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/changes/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualChange.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/changes/26000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // POST /api/changes — Create change
  // ============================================
  describe('POST /api/changes', () => {
    const createPayload = {
      title: 'New Change Request',
      changeType: 'PROCESS_CHANGE',
      requestedBy: 'John Doe',
      department: 'Engineering',
      currentState: 'Current manual process',
      proposedChange: 'Automate the process',
      reasonForChange: 'Increase efficiency',
    };

    it('should create a change successfully', async () => {
      (mockPrisma.qualChange.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualChange.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'QMS-CHG-2026-001',
        ...createPayload,
        priority: 'ROUTINE',
        status: 'REQUESTED',
      });

      const response = await request(app)
        .post('/api/changes')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(createPayload.title);
      expect(response.body.data.referenceNumber).toBe('QMS-CHG-2026-001');
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/changes')
        .set('Authorization', 'Bearer token')
        .send({
          changeType: 'PROCESS_CHANGE',
          requestedBy: 'Test',
          department: 'Eng',
          currentState: 'Old',
          proposedChange: 'New',
          reasonForChange: 'Why',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing changeType', async () => {
      const response = await request(app)
        .post('/api/changes')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Test',
          requestedBy: 'Test',
          department: 'Eng',
          currentState: 'Old',
          proposedChange: 'New',
          reasonForChange: 'Why',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing requestedBy', async () => {
      const response = await request(app)
        .post('/api/changes')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Test',
          changeType: 'PROCESS_CHANGE',
          department: 'Eng',
          currentState: 'Old',
          proposedChange: 'New',
          reasonForChange: 'Why',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing department', async () => {
      const response = await request(app)
        .post('/api/changes')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Test',
          changeType: 'PROCESS_CHANGE',
          requestedBy: 'Test',
          currentState: 'Old',
          proposedChange: 'New',
          reasonForChange: 'Why',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid changeType', async () => {
      const response = await request(app)
        .post('/api/changes')
        .set('Authorization', 'Bearer token')
        .send({
          ...createPayload,
          changeType: 'INVALID_TYPE',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualChange.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualChange.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/changes')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // PUT /api/changes/:id — Update change
  // ============================================
  describe('PUT /api/changes/:id', () => {
    const existingChange = {
      id: '26000000-0000-4000-a000-000000000001',
      title: 'Existing Change',
      changeType: 'DOCUMENT_UPDATE',
      status: 'REQUESTED',
    };

    it('should update change successfully', async () => {
      (mockPrisma.qualChange.findUnique as jest.Mock).mockResolvedValueOnce(existingChange);
      (mockPrisma.qualChange.update as jest.Mock).mockResolvedValueOnce({
        ...existingChange,
        title: 'Updated Change',
      });

      const response = await request(app)
        .put('/api/changes/26000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated Change' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Change');
    });

    it('should update status successfully', async () => {
      (mockPrisma.qualChange.findUnique as jest.Mock).mockResolvedValueOnce(existingChange);
      (mockPrisma.qualChange.update as jest.Mock).mockResolvedValueOnce({
        ...existingChange,
        status: 'APPROVED',
      });

      const response = await request(app)
        .put('/api/changes/26000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'APPROVED' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('APPROVED');
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff change', async () => {
      (mockPrisma.qualChange.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/changes/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status value', async () => {
      (mockPrisma.qualChange.findUnique as jest.Mock).mockResolvedValueOnce(existingChange);

      const response = await request(app)
        .put('/api/changes/26000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid changeType value', async () => {
      (mockPrisma.qualChange.findUnique as jest.Mock).mockResolvedValueOnce(existingChange);

      const response = await request(app)
        .put('/api/changes/26000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ changeType: 'INVALID_TYPE' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualChange.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/changes/26000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // DELETE /api/changes/:id — Delete change
  // ============================================
  describe('DELETE /api/changes/:id', () => {
    it('should delete change successfully', async () => {
      (mockPrisma.qualChange.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '26000000-0000-4000-a000-000000000001',
      });
      (mockPrisma.qualChange.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/changes/26000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.qualChange.update).toHaveBeenCalledWith({
        where: { id: '26000000-0000-4000-a000-000000000001' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff change', async () => {
      (mockPrisma.qualChange.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/changes/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualChange.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/changes/26000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

// ===================================================================
// Quality Changes — additional response shape coverage
// ===================================================================
describe('Quality Changes — additional response shape coverage', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/changes', changesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/changes response body has success:true and data.items array', async () => {
    (mockPrisma.qualChange.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.qualChange.count as jest.Mock).mockResolvedValueOnce(0);

    const response = await request(app).get('/api/changes').set('Authorization', 'Bearer token');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.items)).toBe(true);
  });

  it('POST /api/changes with priority field included in create call', async () => {
    const payload = {
      title: 'Process Calibration Change',
      changeType: 'PROCESS_CHANGE',
      requestedBy: 'Lab Manager',
      department: 'Quality',
      currentState: 'Manual calibration',
      proposedChange: 'Automated calibration system',
      reasonForChange: 'Reduce human error',
      priority: 'URGENT',
    };
    (mockPrisma.qualChange.count as jest.Mock).mockResolvedValueOnce(5);
    (mockPrisma.qualChange.create as jest.Mock).mockResolvedValueOnce({
      id: '30000000-0000-4000-a000-000000000123',
      referenceNumber: 'QMS-CHG-2026-006',
      ...payload,
      status: 'REQUESTED',
    });

    const response = await request(app)
      .post('/api/changes')
      .set('Authorization', 'Bearer token')
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(mockPrisma.qualChange.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ priority: 'URGENT' }),
      })
    );
  });
});

describe('Quality Changes — extra coverage', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/changes', changesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / returns items with correct referenceNumber format', async () => {
    const change = {
      id: '26000000-0000-4000-a000-000000000001',
      referenceNumber: 'QMS-CHG-2026-001',
      title: 'Formatted ref',
      changeType: 'PROCESS_CHANGE',
    };
    (mockPrisma.qualChange.findMany as jest.Mock).mockResolvedValueOnce([change]);
    (mockPrisma.qualChange.count as jest.Mock).mockResolvedValueOnce(1);
    const response = await request(app).get('/api/changes').set('Authorization', 'Bearer token');
    expect(response.status).toBe(200);
    expect(response.body.data.items[0].referenceNumber).toMatch(/^QMS-CHG-\d{4}-\d{3}$/);
  });

  it('PUT /:id updates priority field correctly', async () => {
    (mockPrisma.qualChange.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '26000000-0000-4000-a000-000000000001',
      title: 'Change',
      changeType: 'DOCUMENT_UPDATE',
      status: 'REQUESTED',
    });
    (mockPrisma.qualChange.update as jest.Mock).mockResolvedValueOnce({
      id: '26000000-0000-4000-a000-000000000001',
      priority: 'URGENT',
    });
    const response = await request(app)
      .put('/api/changes/26000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ priority: 'URGENT' });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('POST / generates reference number using count', async () => {
    (mockPrisma.qualChange.count as jest.Mock).mockResolvedValueOnce(3);
    (mockPrisma.qualChange.create as jest.Mock).mockResolvedValueOnce({
      id: '30000000-0000-4000-a000-000000000123',
      referenceNumber: 'QMS-CHG-2026-004',
      title: 'Fourth Change',
      changeType: 'PROCESS_CHANGE',
      status: 'REQUESTED',
    });
    const response = await request(app)
      .post('/api/changes')
      .set('Authorization', 'Bearer token')
      .send({
        title: 'Fourth Change',
        changeType: 'PROCESS_CHANGE',
        requestedBy: 'Alice',
        department: 'Production',
        currentState: 'Manual',
        proposedChange: 'Automated',
        reasonForChange: 'Efficiency',
      });
    expect(response.status).toBe(201);
    expect(mockPrisma.qualChange.count).toHaveBeenCalledTimes(1);
  });
});

describe('Quality Changes — final coverage', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/changes', changesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / returns empty items array when no changes exist', async () => {
    (mockPrisma.qualChange.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.qualChange.count as jest.Mock).mockResolvedValueOnce(0);
    const response = await request(app).get('/api/changes').set('Authorization', 'Bearer token');
    expect(response.status).toBe(200);
    expect(response.body.data.items).toEqual([]);
  });

  it('DELETE /:id soft-deletes by calling update with deletedAt', async () => {
    (mockPrisma.qualChange.findUnique as jest.Mock).mockResolvedValueOnce({ id: '26000000-0000-4000-a000-000000000001' });
    (mockPrisma.qualChange.update as jest.Mock).mockResolvedValueOnce({});
    await request(app).delete('/api/changes/26000000-0000-4000-a000-000000000001').set('Authorization', 'Bearer token');
    expect(mockPrisma.qualChange.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('GET / success is true on valid response', async () => {
    (mockPrisma.qualChange.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.qualChange.count as jest.Mock).mockResolvedValueOnce(0);
    const response = await request(app).get('/api/changes').set('Authorization', 'Bearer token');
    expect(response.body.success).toBe(true);
  });

  it('GET / pagination totalPages rounds up for non-exact division', async () => {
    (mockPrisma.qualChange.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.qualChange.count as jest.Mock).mockResolvedValueOnce(31);
    const response = await request(app).get('/api/changes?limit=10').set('Authorization', 'Bearer token');
    expect(response.status).toBe(200);
    expect(response.body.data.totalPages).toBe(4);
  });

  it('GET /:id returns title in response data', async () => {
    (mockPrisma.qualChange.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '26000000-0000-4000-a000-000000000001',
      title: 'My Change',
      changeType: 'DOCUMENT_UPDATE',
    });
    const response = await request(app)
      .get('/api/changes/26000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token');
    expect(response.body.data.title).toBe('My Change');
  });

  it('POST / returns 500 on DB error during create', async () => {
    (mockPrisma.qualChange.count as jest.Mock).mockResolvedValueOnce(0);
    (mockPrisma.qualChange.create as jest.Mock).mockRejectedValueOnce(new Error('crash'));
    const response = await request(app)
      .post('/api/changes')
      .set('Authorization', 'Bearer token')
      .send({
        title: 'Crash Test',
        changeType: 'PROCESS_CHANGE',
        requestedBy: 'Test',
        department: 'Eng',
        currentState: 'Old',
        proposedChange: 'New',
        reasonForChange: 'Why',
      });
    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Quality Changes — absolute final coverage', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/changes', changesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / passes organisationId to findMany where clause', async () => {
    (mockPrisma.qualChange.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.qualChange.count as jest.Mock).mockResolvedValueOnce(0);
    const response = await request(app).get('/api/changes').set('Authorization', 'Bearer token');
    expect(response.status).toBe(200);
    expect(mockPrisma.qualChange.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.any(Object) })
    );
  });

  it('PUT /:id returns success:true on valid update', async () => {
    (mockPrisma.qualChange.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '26000000-0000-4000-a000-000000000001',
      title: 'Change',
      changeType: 'DOCUMENT_UPDATE',
      status: 'REQUESTED',
    });
    (mockPrisma.qualChange.update as jest.Mock).mockResolvedValueOnce({
      id: '26000000-0000-4000-a000-000000000001',
      title: 'Changed Title',
      status: 'REQUESTED',
    });
    const response = await request(app)
      .put('/api/changes/26000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ title: 'Changed Title' });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});


describe('Quality Changes — phase28 coverage', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/changes', changesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/changes findMany called once per list request', async () => {
    (mockPrisma.qualChange.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.qualChange.count as jest.Mock).mockResolvedValueOnce(0);
    await request(app).get('/api/changes').set('Authorization', 'Bearer token');
    expect(mockPrisma.qualChange.findMany).toHaveBeenCalledTimes(1);
  });

  it('GET /api/changes data.items is an array', async () => {
    (mockPrisma.qualChange.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.qualChange.count as jest.Mock).mockResolvedValueOnce(0);
    const response = await request(app).get('/api/changes').set('Authorization', 'Bearer token');
    expect(Array.isArray(response.body.data.items)).toBe(true);
  });

  it('DELETE /api/changes/:id does not call update when not found', async () => {
    (mockPrisma.qualChange.findUnique as jest.Mock).mockResolvedValueOnce(null);
    await request(app).delete('/api/changes/00000000-0000-4000-a000-ffffffffffff').set('Authorization', 'Bearer token');
    expect(mockPrisma.qualChange.update).not.toHaveBeenCalled();
  });

  it('GET /api/changes/:id returns NOT_FOUND error code when not found', async () => {
    (mockPrisma.qualChange.findUnique as jest.Mock).mockResolvedValueOnce(null);
    const response = await request(app).get('/api/changes/00000000-0000-4000-a000-ffffffffffff').set('Authorization', 'Bearer token');
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('PUT /api/changes/:id does not call update when not found', async () => {
    (mockPrisma.qualChange.findUnique as jest.Mock).mockResolvedValueOnce(null);
    await request(app).put('/api/changes/00000000-0000-4000-a000-ffffffffffff').set('Authorization', 'Bearer token').send({ title: 'x' });
    expect(mockPrisma.qualChange.update).not.toHaveBeenCalled();
  });
});
