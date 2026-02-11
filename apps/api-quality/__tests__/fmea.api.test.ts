import express from 'express';
import request from 'supertest';

// Mock dependencies - use ../prisma (not @ims/database)
jest.mock('../src/prisma', () => ({
  prisma: {
    qualFmea: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    qualFmeaRow: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

import { prisma } from '../src/prisma';
import fmeaRoutes from '../src/routes/fmea';

const mockPrisma = prisma as any;

describe('Quality FMEA API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/fmea', fmeaRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // GET /api/fmea — List FMEAs
  // ============================================
  describe('GET /api/fmea', () => {
    const mockFmeas = [
      {
        id: 'fmea-1',
        referenceNumber: 'QMS-FMEA-2026-001',
        fmeaType: 'PFMEA',
        title: 'Assembly Process FMEA',
        productProcess: 'Assembly Line A',
        status: 'ACTIVE',
        rows: [],
      },
      {
        id: 'fmea-2',
        referenceNumber: 'QMS-FMEA-2026-002',
        fmeaType: 'DFMEA',
        title: 'Product Design FMEA',
        productProcess: 'Widget Design',
        status: 'DRAFT',
        rows: [],
      },
    ];

    it('should return list of FMEAs with pagination', async () => {
      (mockPrisma.qualFmea.findMany as jest.Mock).mockResolvedValueOnce(mockFmeas);
      (mockPrisma.qualFmea.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/fmea')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(20);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.totalPages).toBe(1);
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.qualFmea.findMany as jest.Mock).mockResolvedValueOnce([mockFmeas[0]]);
      (mockPrisma.qualFmea.count as jest.Mock).mockResolvedValueOnce(100);

      const response = await request(app)
        .get('/api/fmea?page=2&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.page).toBe(2);
      expect(response.body.data.limit).toBe(10);
      expect(response.body.data.totalPages).toBe(10);
    });

    it('should filter by status', async () => {
      (mockPrisma.qualFmea.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualFmea.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/fmea?status=ACTIVE')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualFmea.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
          }),
        })
      );
    });

    it('should filter by fmeaType', async () => {
      (mockPrisma.qualFmea.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualFmea.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/fmea?fmeaType=PFMEA')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualFmea.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            fmeaType: 'PFMEA',
          }),
        })
      );
    });

    it('should order by createdAt descending and include rows', async () => {
      (mockPrisma.qualFmea.findMany as jest.Mock).mockResolvedValueOnce(mockFmeas);
      (mockPrisma.qualFmea.count as jest.Mock).mockResolvedValueOnce(2);

      await request(app)
        .get('/api/fmea')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualFmea.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
          include: { rows: { orderBy: { sortOrder: 'asc' } } },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualFmea.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/fmea')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // GET /api/fmea/stats — FMEA statistics
  // ============================================
  describe('GET /api/fmea/stats', () => {
    it('should return FMEA statistics', async () => {
      (mockPrisma.qualFmea.count as jest.Mock).mockResolvedValueOnce(5);
      (mockPrisma.qualFmeaRow.findMany as jest.Mock).mockResolvedValueOnce([
        { rpn: 300 },
        { rpn: 150 },
        { rpn: 50 },
      ]);

      const response = await request(app)
        .get('/api/fmea/stats')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalFmeas).toBe(5);
      expect(response.body.data.highRpnCount).toBe(1); // only rpn > 200
      expect(response.body.data.avgRpn).toBe(167); // Math.round((300+150+50)/3)
    });

    it('should return zero avgRpn when no rows exist', async () => {
      (mockPrisma.qualFmea.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualFmeaRow.findMany as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app)
        .get('/api/fmea/stats')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.avgRpn).toBe(0);
      expect(response.body.data.highRpnCount).toBe(0);
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualFmea.count as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/fmea/stats')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // GET /api/fmea/:id — Get single FMEA
  // ============================================
  describe('GET /api/fmea/:id', () => {
    const mockFmea = {
      id: 'fmea-1',
      referenceNumber: 'QMS-FMEA-2026-001',
      fmeaType: 'PFMEA',
      title: 'Assembly Process FMEA',
      productProcess: 'Assembly Line A',
      rows: [],
    };

    it('should return single FMEA with rows', async () => {
      (mockPrisma.qualFmea.findUnique as jest.Mock).mockResolvedValueOnce(mockFmea);

      const response = await request(app)
        .get('/api/fmea/fmea-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('fmea-1');
      expect(mockPrisma.qualFmea.findUnique).toHaveBeenCalledWith({
        where: { id: 'fmea-1' },
        include: { rows: { orderBy: { sortOrder: 'asc' } } },
      });
    });

    it('should return 404 for non-existent FMEA', async () => {
      (mockPrisma.qualFmea.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/fmea/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualFmea.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/fmea/fmea-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // POST /api/fmea — Create FMEA
  // ============================================
  describe('POST /api/fmea', () => {
    const createPayload = {
      fmeaType: 'PFMEA',
      title: 'New FMEA',
      productProcess: 'Production Line B',
    };

    it('should create an FMEA successfully', async () => {
      (mockPrisma.qualFmea.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualFmea.create as jest.Mock).mockResolvedValueOnce({
        id: 'mock-uuid-123',
        referenceNumber: 'QMS-FMEA-2026-001',
        ...createPayload,
        status: 'DRAFT',
        rows: [],
      });

      const response = await request(app)
        .post('/api/fmea')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(createPayload.title);
      expect(response.body.data.referenceNumber).toBe('QMS-FMEA-2026-001');
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/fmea')
        .set('Authorization', 'Bearer token')
        .send({ fmeaType: 'PFMEA', productProcess: 'Line A' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing fmeaType', async () => {
      const response = await request(app)
        .post('/api/fmea')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Test', productProcess: 'Line A' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing productProcess', async () => {
      const response = await request(app)
        .post('/api/fmea')
        .set('Authorization', 'Bearer token')
        .send({ fmeaType: 'PFMEA', title: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid fmeaType', async () => {
      const response = await request(app)
        .post('/api/fmea')
        .set('Authorization', 'Bearer token')
        .send({ fmeaType: 'INVALID', title: 'Test', productProcess: 'Line A' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualFmea.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualFmea.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/fmea')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // PUT /api/fmea/:id — Update FMEA
  // ============================================
  describe('PUT /api/fmea/:id', () => {
    const existingFmea = {
      id: 'fmea-1',
      fmeaType: 'PFMEA',
      title: 'Existing FMEA',
      productProcess: 'Line A',
      status: 'DRAFT',
    };

    it('should update FMEA successfully', async () => {
      (mockPrisma.qualFmea.findUnique as jest.Mock).mockResolvedValueOnce(existingFmea);
      (mockPrisma.qualFmea.update as jest.Mock).mockResolvedValueOnce({
        ...existingFmea,
        title: 'Updated FMEA',
        rows: [],
      });

      const response = await request(app)
        .put('/api/fmea/fmea-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated FMEA' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated FMEA');
    });

    it('should return 404 for non-existent FMEA', async () => {
      (mockPrisma.qualFmea.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/fmea/non-existent')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status value', async () => {
      (mockPrisma.qualFmea.findUnique as jest.Mock).mockResolvedValueOnce(existingFmea);

      const response = await request(app)
        .put('/api/fmea/fmea-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualFmea.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/fmea/fmea-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // DELETE /api/fmea/:id — Delete FMEA
  // ============================================
  describe('DELETE /api/fmea/:id', () => {
    it('should delete FMEA successfully', async () => {
      (mockPrisma.qualFmea.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'fmea-1' });
      (mockPrisma.qualFmea.delete as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/fmea/fmea-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.qualFmea.delete).toHaveBeenCalledWith({
        where: { id: 'fmea-1' },
      });
    });

    it('should return 404 for non-existent FMEA', async () => {
      (mockPrisma.qualFmea.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/fmea/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualFmea.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/fmea/fmea-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // POST /api/fmea/:id/rows — Create FMEA Row
  // ============================================
  describe('POST /api/fmea/:id/rows', () => {
    const rowPayload = {
      failureMode: 'Bearing Failure',
      effectOfFailure: 'Machine stops',
      severity: 8,
      potentialCauses: 'Lack of lubrication',
      occurrence: 4,
      detection: 6,
    };

    it('should create a row with auto-calculated RPN', async () => {
      (mockPrisma.qualFmea.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'fmea-1' });
      (mockPrisma.qualFmeaRow.findFirst as jest.Mock).mockResolvedValueOnce({ sortOrder: 2 });
      (mockPrisma.qualFmeaRow.create as jest.Mock).mockResolvedValueOnce({
        id: 'row-1',
        fmeaId: 'fmea-1',
        ...rowPayload,
        rpn: 192, // 8 * 4 * 6
        actionPriority: 'MEDIUM',
        sortOrder: 3,
        status: 'OPEN',
      });

      const response = await request(app)
        .post('/api/fmea/fmea-1/rows')
        .set('Authorization', 'Bearer token')
        .send(rowPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.rpn).toBe(192);
      expect(response.body.data.actionPriority).toBe('MEDIUM');
    });

    it('should set actionPriority to HIGH for RPN > 200', async () => {
      const highRpnPayload = {
        failureMode: 'Critical Failure',
        effectOfFailure: 'Total loss',
        severity: 9,
        potentialCauses: 'Design flaw',
        occurrence: 8,
        detection: 5,
      };

      (mockPrisma.qualFmea.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'fmea-1' });
      (mockPrisma.qualFmeaRow.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.qualFmeaRow.create as jest.Mock).mockResolvedValueOnce({
        id: 'row-2',
        ...highRpnPayload,
        rpn: 360, // 9 * 8 * 5
        actionPriority: 'HIGH',
        sortOrder: 0,
        status: 'OPEN',
      });

      const response = await request(app)
        .post('/api/fmea/fmea-1/rows')
        .set('Authorization', 'Bearer token')
        .send(highRpnPayload);

      expect(response.status).toBe(201);
      expect(mockPrisma.qualFmeaRow.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          rpn: 360,
          actionPriority: 'HIGH',
        }),
      });
    });

    it('should return 404 when parent FMEA does not exist', async () => {
      (mockPrisma.qualFmea.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/fmea/non-existent/rows')
        .set('Authorization', 'Bearer token')
        .send(rowPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for missing failureMode', async () => {
      (mockPrisma.qualFmea.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'fmea-1' });

      const response = await request(app)
        .post('/api/fmea/fmea-1/rows')
        .set('Authorization', 'Bearer token')
        .send({ effectOfFailure: 'Something', potentialCauses: 'Something' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualFmea.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'fmea-1' });
      (mockPrisma.qualFmeaRow.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.qualFmeaRow.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/fmea/fmea-1/rows')
        .set('Authorization', 'Bearer token')
        .send(rowPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // PUT /api/fmea/:id/rows/:rowId — Update FMEA Row
  // ============================================
  describe('PUT /api/fmea/:id/rows/:rowId', () => {
    const existingRow = {
      id: 'row-1',
      fmeaId: 'fmea-1',
      severity: 8,
      occurrence: 4,
      detection: 6,
      rpn: 192,
      revisedRpn: null,
      revisedSeverity: null,
      revisedOccurrence: null,
      revisedDetection: null,
    };

    it('should update row and recalculate RPN', async () => {
      (mockPrisma.qualFmeaRow.findFirst as jest.Mock).mockResolvedValueOnce(existingRow);
      (mockPrisma.qualFmeaRow.update as jest.Mock).mockResolvedValueOnce({
        ...existingRow,
        severity: 5,
        rpn: 120, // 5 * 4 * 6
        actionPriority: 'MEDIUM',
      });

      const response = await request(app)
        .put('/api/fmea/fmea-1/rows/row-1')
        .set('Authorization', 'Bearer token')
        .send({ severity: 5 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.qualFmeaRow.update).toHaveBeenCalledWith({
        where: { id: 'row-1' },
        data: expect.objectContaining({
          rpn: 120,
          actionPriority: 'MEDIUM',
        }),
      });
    });

    it('should return 404 for non-existent row', async () => {
      (mockPrisma.qualFmeaRow.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/fmea/fmea-1/rows/non-existent')
        .set('Authorization', 'Bearer token')
        .send({ severity: 5 });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status value', async () => {
      (mockPrisma.qualFmeaRow.findFirst as jest.Mock).mockResolvedValueOnce(existingRow);

      const response = await request(app)
        .put('/api/fmea/fmea-1/rows/row-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualFmeaRow.findFirst as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/fmea/fmea-1/rows/row-1')
        .set('Authorization', 'Bearer token')
        .send({ severity: 5 });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // DELETE /api/fmea/:id/rows/:rowId — Delete FMEA Row
  // ============================================
  describe('DELETE /api/fmea/:id/rows/:rowId', () => {
    it('should delete row successfully', async () => {
      (mockPrisma.qualFmeaRow.findFirst as jest.Mock).mockResolvedValueOnce({ id: 'row-1', fmeaId: 'fmea-1' });
      (mockPrisma.qualFmeaRow.delete as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/fmea/fmea-1/rows/row-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.qualFmeaRow.delete).toHaveBeenCalledWith({
        where: { id: 'row-1' },
      });
    });

    it('should return 404 for non-existent row', async () => {
      (mockPrisma.qualFmeaRow.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/fmea/fmea-1/rows/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualFmeaRow.findFirst as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/fmea/fmea-1/rows/row-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
